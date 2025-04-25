import { useState } from 'react';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getQuote } from '../swapUtils';

export const useFetchRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [isRoutesLoading, setIsRoutesLoading] = useState(false);
  const { address, chainId } = useAccount();

  const fetchRoutes = useCallback(
    async ({
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
    }: {
      fromTokenAddress: string;
      toTokenAddress: string;
      fromAmount: string;
    }) => {
      if (!address || !chainId) {
        throw new Error('No account found');
      }
      setRoutes([]);
      setIsRoutesLoading(true);
      try {
        const quote = await getQuote({
          fromChainId: chainId,
          fromTokenAddress: fromTokenAddress,
          toChainId: chainId,
          toTokenAddress: toTokenAddress,
          fromAmount: fromAmount,
          userAddress: address,
          uniqueRoutesPerBridge: true,
          sort: 'asc',
          singleTxOnly: true,
        });

        const routes = quote.result.routes;
        setRoutes(routes);
      } catch (error) {
        console.error(error);
      } finally {
        setIsRoutesLoading(false);
      }
    },
    [address, chainId]
  );

  return { routes, isRoutesLoading, fetchRoutes };
};
