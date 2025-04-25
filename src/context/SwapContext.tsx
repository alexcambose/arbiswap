import { Route } from '@/types/ApiTypes';
import { wagmiConfig } from '@/config/walletConfig';
import {
  checkAllowance,
  getApprovalTransactionData,
  getBridgeStatus,
} from '@/utils/swapUtils';
import { getGasPrice, sendTransaction, estimateGas } from '@wagmi/core';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAccount } from 'wagmi';
import { useFetchRoutes } from '@/utils/hooks/useFetchRoutes';

const FROM_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const TO_TOKEN_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

type SwapContextProps = {
  children: React.ReactNode;
};

type Context = {
  executeSwap: (route: Route) => Promise<void>;
  isSwapping: boolean;
  routes: Route[];
  isRoutesLoading: boolean;
  fetchRoutes: () => Promise<void>;
};

// Just find-replace "XContext" with whatever context name you like. (ie. DankContext)
const SwapContext = createContext<Context | null>(null);

export const SwapContextProvider = ({ children }: SwapContextProps) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [fromTokenAddress] = useState<string>(FROM_TOKEN_ADDRESS);
  const [toTokenAddress] = useState<string>(TO_TOKEN_ADDRESS);

  const { address, chainId } = useAccount();
  const { routes, isRoutesLoading, fetchRoutes } = useFetchRoutes();
  useEffect(() => {
    if (routes.length > 0) {
      setSelectedRoute(routes[0]);
    }
  }, [routes]);

  const executeSwap = useCallback(async () => {
    if (!address || !chainId) {
      throw new Error('No account found');
    }
    if (!selectedRoute) {
      throw new Error('No route selected');
    }
    console.log('Executing swap', selectedRoute);
    const tokenAddress = fromTokenAddress;
    const fromAmount = selectedRoute.fromAmount;
    // hardcoded chain ids
    const fromChainId = chainId;
    const toChainId = chainId;

    setIsSwapping(true);
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
      const allowanceCheckRawResponse = await checkAllowance({
        chainId: fromChainId,
        owner: address,
        allowanceTarget,
        tokenAddress,
      });

      const allowanceCheckStatus = await allowanceCheckRawResponse.json();
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

        const tx = await sendTransaction(wagmiConfig, {
          to: approvalTransactionData.result?.to,
          value: BigInt(0),
          data: approvalTransactionData.result?.data,
          gasPrice: gasPrice,
          gasLimit: gasEstimate,
        });

        // Initiates approval transaction on user's frontend which user has to sign
        const receipt = await tx.wait();

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

    const tx = await sendTransaction(wagmiConfig, {
      to: buildTxResponse.result.txTarget,
      data: buildTxResponse.result.txData,
      value: buildTxResponse.result.value,
      gasPrice: gasPrice,
      gasLimit: gasEstimate,
    });

    // Initiates swap/bridge transaction on user's frontend which user has to sign
    const receipt = await tx.wait();

    const txHash = receipt.transactionHash;

    console.log('Bridging Transaction : ', receipt.transactionHash);

    // Checks status of transaction every 20 secs
    const txStatus = setInterval(async () => {
      const status = await getBridgeStatus(txHash, fromChainId, toChainId);

      console.log(
        `SOURCE TX : ${status.result.sourceTxStatus}\nDEST TX : ${status.result.destinationTxStatus}`
      );

      if (status.result.destinationTxStatus == 'COMPLETED') {
        console.log('DEST TX HASH :', status.result.destinationTransactionHash);
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
