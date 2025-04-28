import { assets } from '@/config/assetsConfig';
import { wagmiConfig } from '@/config/walletConfig';
import { Route } from '@/types/BungeeApi';
import { useFetchRoutes } from '@/utils/hooks/useFetchRoutes';
import { useHasBatchingCapability } from '@/utils/hooks/useHasBatchingCapability';
import { waitForSafeTx } from '@/utils/safe';
import {
  buildTx,
  checkAllowance,
  getApprovalTransactionData,
} from '@/utils/swapUtils';
import {
  getGasPrice,
  sendTransaction,
  waitForTransactionReceipt,
} from '@wagmi/core';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Address } from 'viem';
import { arbitrum } from 'viem/chains';
import { useAccount, useAccountEffect } from 'wagmi';
import type { BaseTransaction } from '@safe-global/safe-apps-sdk';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';

// hardcoding for now
const FROM_TOKEN_ADDRESS = assets[arbitrum.id].find(
  (asset) => asset.symbol === 'USDC'
)!.address;
const TO_TOKEN_ADDRESS = assets[arbitrum.id].find(
  (asset) => asset.symbol === 'ETH'
)!.address;
type SwapContextProps = {
  children: React.ReactNode;
};

type Context = {
  executeSwap: () => Promise<string>;
  isSwapping: boolean;
  routes: Route[];
  isRoutesLoading: boolean;
  fetchRoutes: ReturnType<typeof useFetchRoutes>['fetchRoutes'];
  routesError: ReturnType<typeof useFetchRoutes>['routesError'];
  currentStatus: BridgeStatus;
  fromTokenAddress: Address;
  toTokenAddress: Address;
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route) => void;
  fromChainId: number;
  toChainId: number;
  reset: () => void;
};

export type BridgeStatus =
  | 'READY'
  | 'BUILDING_TX'
  | 'APPROVE_START'
  | 'APPROVE_PENDING'
  | 'APPROVE_COMPLETE'
  | 'BRIDGE_START'
  | 'BRIDGE_PENDING'
  | 'BRIDGE_COMPLETE';

const SwapContext = createContext<Context | null>(null);

export const SwapContextProvider = ({ children }: SwapContextProps) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [currentStatus, setCurrentStatus] = useState<BridgeStatus>('READY');
  const [fromTokenAddress] = useState(FROM_TOKEN_ADDRESS);
  const [toTokenAddress] = useState(TO_TOKEN_ADDRESS);
  // hardcoded chain ids
  const [fromChainId] = useState<number>(arbitrum.id);
  const [toChainId] = useState<number>(arbitrum.id);
  const hasBatchingCapability = useHasBatchingCapability();
  const { sdk } = useSafeAppsSDK();

  const account = useAccount();
  const { address, connector } = account;
  const { routes, isRoutesLoading, fetchRoutes, routesError, resetRoutes } =
    useFetchRoutes();

  const reset = useCallback(() => {
    setCurrentStatus('READY');
    setIsSwapping(false);
    setSelectedRoute(null);
    resetRoutes();
  }, [resetRoutes]);

  useAccountEffect({
    onDisconnect() {
      reset();
    },
  });

  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRoute(routes[0]);
    } else {
      setSelectedRoute(null);
    }
  }, [routes]);

  const executeSwap = useCallback(async () => {
    if (!address || !connector) {
      throw new Error('No account found. Please connect your wallet.');
    }
    if (!selectedRoute) {
      throw new Error('No route selected');
    }

    const tokenAddress = fromTokenAddress;
    const fromAmount = selectedRoute.fromAmount;

    setIsSwapping(true);
    setCurrentStatus('BUILDING_TX');
    try {
      const buildTxResponse = await buildTx(selectedRoute);
      const approvalData = buildTxResponse.result.approvalData;
      const gasPrice = await getGasPrice(wagmiConfig);
      let approveTxData = {};
      if (approvalData !== null) {
        const { allowanceTarget, minimumApprovalAmount } = approvalData;
        const allowanceCheckStatus = await checkAllowance({
          chainId: fromChainId,
          owner: address,
          allowanceTarget,
          tokenAddress,
        });

        const allowanceValue = allowanceCheckStatus.result?.value;

        if (minimumApprovalAmount > allowanceValue) {
          const approvalTransactionData = await getApprovalTransactionData({
            chainId: fromChainId,
            owner: address,
            allowanceTarget,
            tokenAddress,
            amount: fromAmount,
          });

          approveTxData = {
            to: approvalTransactionData.result?.to,
            value: BigInt(0).toString(),
            data: approvalTransactionData.result?.data,
            gasPrice,
          };
        }
      }

      const bridgeTxData = {
        to: buildTxResponse.result.txTarget,
        value: buildTxResponse.result.value.toString(),
        data: buildTxResponse.result.txData,
        gasPrice,
      };

      if (hasBatchingCapability && connector.type === 'safe') {
        setCurrentStatus('BRIDGE_START');

        const response = await sdk.txs.send({
          txs: (approveTxData
            ? [approveTxData, bridgeTxData]
            : [bridgeTxData]) as BaseTransaction[],
        });
        setCurrentStatus('BRIDGE_PENDING');

        const res = await waitForSafeTx(sdk, response.safeTxHash);

        setCurrentStatus('BRIDGE_COMPLETE');
        return res.txHash as string;
      } else {
        setCurrentStatus('APPROVE_START');

        if (approveTxData) {
          const txHashApprove = await sendTransaction(
            wagmiConfig,
            approveTxData
          );
          setCurrentStatus('APPROVE_PENDING');
          await waitForTransactionReceipt(wagmiConfig, {
            hash: txHashApprove,
          });
          setCurrentStatus('APPROVE_COMPLETE');
        }
        setCurrentStatus('BRIDGE_START');

        const txHashBridge = await sendTransaction(wagmiConfig, bridgeTxData);
        setCurrentStatus('BRIDGE_PENDING');
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHashBridge,
        });
        setCurrentStatus('BRIDGE_COMPLETE');
        return txHashBridge;
      }

      // await bridgeStatusResolver({
      //   txHash,
      //   fromChainId,
      //   toChainId,
      // });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setCurrentStatus('READY');
      setIsSwapping(false);
    }
  }, [
    address,
    connector,
    selectedRoute,
    hasBatchingCapability,
    fromTokenAddress,
    fromChainId,
    sdk,
  ]);

  return (
    <SwapContext.Provider
      value={{
        executeSwap,
        isSwapping,
        routes,
        isRoutesLoading,
        fetchRoutes,
        fromTokenAddress,
        toTokenAddress,
        routesError,
        currentStatus,
        selectedRoute,
        setSelectedRoute,
        fromChainId,
        toChainId,
        reset,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwapContext = () => {
  const context = useContext(SwapContext);

  if (!context) {
    throw new Error(
      'SwapContext must be called from within the SwapContextProvider'
    );
  }
  return context;
};
