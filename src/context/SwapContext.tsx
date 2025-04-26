import { assets } from '@/config/assets';
import { wagmiConfig } from '@/config/walletConfig';
import { Route } from '@/types/ApiTypes';
import { useFetchRoutes } from '@/utils/hooks/useFetchRoutes';
import { useHasBatchingCapability } from '@/utils/hooks/useHasBatchingCapability';
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
import { sendCalls } from '@wagmi/core/experimental';
import { toSafeSmartAccount } from 'permissionless';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { arbitrum } from 'viem/chains';
import { useAccount } from 'wagmi';

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
  executeSwap: () => Promise<void>;
  isSwapping: boolean;
  routes: Route[];
  isRoutesLoading: boolean;
  fetchRoutes: ReturnType<typeof useFetchRoutes>['fetchRoutes'];
  routesError: ReturnType<typeof useFetchRoutes>['routesError'];
  currentStatus: BridgeStatus;
  fromTokenAddress: string;
  toTokenAddress: string;
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
  const [fromTokenAddress] = useState<string>(FROM_TOKEN_ADDRESS);
  const [toTokenAddress] = useState<string>(TO_TOKEN_ADDRESS);
  // hardcoded chain ids
  const [fromChainId] = useState<number>(arbitrum.id);
  const [toChainId] = useState<number>(arbitrum.id);
  const hasBatchingCapability = useHasBatchingCapability();

  const { address, connector } = useAccount();
  const { routes, isRoutesLoading, fetchRoutes, routesError } =
    useFetchRoutes();

  const reset = useCallback(() => {
    setCurrentStatus('READY');
    setIsSwapping(false);
    setSelectedRoute(null);
  }, []);

  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRoute(routes[0]);
    } else {
      setSelectedRoute(null);
    }
  }, [routes]);

  console.log({ connector });

  const executeSwap = useCallback(async () => {
    console.log('Executing swap', selectedRoute);
    if (!address) {
      throw new Error('No account found');
    }
    if (!selectedRoute) {
      throw new Error('No route selected');
    }

    console.log('Executing swap', selectedRoute, hasBatchingCapability);
    const tokenAddress = fromTokenAddress;
    const fromAmount = selectedRoute.fromAmount;

    setIsSwapping(true);
    setCurrentStatus('BUILDING_TX');
    try {
      // Fetching transaction data for swap/bridge tx
      const buildTxResponse = await buildTx(selectedRoute);
      // Used to check for ERC-20 approvals
      const approvalData = buildTxResponse.result.approvalData;
      // approvalData from apiReturnData is null for native tokens
      // Values are returned for ERC20 tokens but token allowance needs to be checked
      const gasPrice = await getGasPrice(wagmiConfig);
      let approveTxData = {};
      if (approvalData !== null) {
        const { allowanceTarget, minimumApprovalAmount } = approvalData;
        // Fetches token allowance given to Bungee contracts
        const allowanceCheckStatus = await checkAllowance({
          chainId: fromChainId,
          owner: address,
          allowanceTarget,
          tokenAddress,
        });

        const allowanceValue = allowanceCheckStatus.result?.value;

        // If Bungee contracts don't have sufficient allowance
        if (minimumApprovalAmount > allowanceValue) {
          // Approval tx data fetched
          const approvalTransactionData = await getApprovalTransactionData({
            chainId: fromChainId,
            owner: address,
            allowanceTarget,
            tokenAddress,
            amount: fromAmount,
          });

          approveTxData = {
            to: approvalTransactionData.result?.to,
            value: BigInt(0),
            data: approvalTransactionData.result?.data,
            gasPrice,
          };
        }
      }

      const bridgeTxData = {
        to: buildTxResponse.result.txTarget,
        value: buildTxResponse.result.value,
        data: buildTxResponse.result.txData,
        gasPrice,
      };

      if (hasBatchingCapability) {
        const txHash = await sendCalls(wagmiConfig, {
          calls: [approveTxData, bridgeTxData],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          chainId: fromChainId,
        });
        console.log({ txHash });
        // await waitForTransactionReceipt(wagmiConfig, {
        //   hash: txHash,
        // });
        setCurrentStatus('BRIDGE_COMPLETE');
      } else {
        setCurrentStatus('APPROVE_START');

        const txHashApprove = await sendTransaction(wagmiConfig, approveTxData);
        setCurrentStatus('APPROVE_PENDING');
        // Initiates approval transaction on user's frontend which user has to sign
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHashApprove,
        });
        setCurrentStatus('APPROVE_COMPLETE');
        setCurrentStatus('BRIDGE_START');

        const txHashBridge = await sendTransaction(wagmiConfig, bridgeTxData);
        setCurrentStatus('BRIDGE_PENDING');
        // Initiates swap/bridge transaction on user's frontend which user has to sign
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHashBridge,
        });
        setCurrentStatus('BRIDGE_COMPLETE');
      }

      // await bridgeStatusResolver({
      //   txHash,
      //   fromChainId,
      //   toChainId,
      // });
      setCurrentStatus('BRIDGE_COMPLETE');
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setCurrentStatus('READY');
      setIsSwapping(false);
    }
  }, [
    address,
    fromChainId,
    fromTokenAddress,
    selectedRoute,
    hasBatchingCapability,
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
