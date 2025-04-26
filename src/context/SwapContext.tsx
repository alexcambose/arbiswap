import { Route } from '@/types/ApiTypes';
import { wagmiConfig } from '@/config/walletConfig';
import {
  checkAllowance,
  getApprovalTransactionData,
  getBridgeStatus,
} from '@/utils/swapUtils';
import {
  getGasPrice,
  sendTransaction,
  estimateGas,
  waitForTransactionReceipt,
} from '@wagmi/core';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAccount } from 'wagmi';
import { useFetchRoutes } from '@/utils/hooks/useFetchRoutes';
import { assets } from '@/config/assets';
import { arbitrum } from 'viem/chains';

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

  const { address, connector, chainId } = useAccount();
  const { routes, isRoutesLoading, fetchRoutes, routesError } =
    useFetchRoutes();
  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRoute(routes[0]);
    } else {
      setSelectedRoute(null);
    }
  }, [routes]);
  console.log({ connector });
  const executeSwap = useCallback(async () => {
    if (!address) {
      throw new Error('No account found');
    }
    if (!selectedRoute) {
      throw new Error('No route selected');
    }
    console.log('Executing swap', selectedRoute);
    const tokenAddress = fromTokenAddress;
    const fromAmount = selectedRoute.fromAmount;

    setIsSwapping(true);
    setCurrentStatus('BUILDING_TX');
    // Fetching transaction data for swap/bridge tx
    const buildTxRawResponse = await fetch(`/api/build-tx`, {
      method: 'POST',
      body: JSON.stringify({ route: selectedRoute }),
    });
    const buildTxResponse = await buildTxRawResponse.json();
    // Used to check for ERC-20 approvals
    const approvalData = buildTxResponse.result.approvalData;
    // approvalData from apiReturnData is null for native tokens
    // Values are returned for ERC20 tokens but token allowance needs to be checked
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

        const gasPrice = await getGasPrice(wagmiConfig);

        const gasEstimate = await estimateGas(wagmiConfig, {
          to: approvalTransactionData.result?.to,
          value: BigInt(0),
          data: approvalTransactionData.result?.data,
          gasPrice: gasPrice,
        });
        setCurrentStatus('APPROVE_START');

        const txHash = await sendTransaction(wagmiConfig, {
          to: approvalTransactionData.result?.to,
          value: BigInt(0),
          data: approvalTransactionData.result?.data,
          gasPrice: gasPrice,
          gasLimit: gasEstimate,
        });
        setCurrentStatus('APPROVE_PENDING');
        // Initiates approval transaction on user's frontend which user has to sign
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
        });
        setCurrentStatus('APPROVE_COMPLETE');
        console.log('Approval Transaction Hash :', receipt.transactionHash);
      }
    }

    const gasPrice = await getGasPrice(wagmiConfig);

    const gasEstimate = await estimateGas(wagmiConfig, {
      to: buildTxResponse.result.txTarget,
      value: buildTxResponse.result.value,
      data: buildTxResponse.result.txData,
      gasPrice: gasPrice,
    });
    setCurrentStatus('BRIDGE_START');

    const txHash = await sendTransaction(wagmiConfig, {
      to: buildTxResponse.result.txTarget,
      data: buildTxResponse.result.txData,
      value: buildTxResponse.result.value,
      gasPrice: gasPrice,
      gasLimit: gasEstimate,
    });
    setCurrentStatus('BRIDGE_PENDING');
    console.log({ txHash });
    // Initiates swap/bridge transaction on user's frontend which user has to sign
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: txHash,
    });
    setCurrentStatus('BRIDGE_COMPLETE');
    console.log('Bridging Transaction : ', receipt.transactionHash);

    // Checks status of transaction every 20 secs
    const txStatus = setInterval(async () => {
      const status = await getBridgeStatus(txHash, fromChainId, toChainId);

      console.log(
        `SOURCE TX : ${status.result.sourceTxStatus}\nDEST TX : ${status.result.destinationTxStatus}`
      );

      if (status.result.destinationTxStatus == 'COMPLETED') {
        console.log('DEST TX HASH :', status.result.destinationTransactionHash);
        setCurrentStatus('BRIDGE_COMPLETE');
        clearInterval(txStatus);
      }
    }, 20000);
  }, [address, chainId, fromTokenAddress, selectedRoute]);

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
