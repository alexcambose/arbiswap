import { useAccount } from 'wagmi';

import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';

/**
 * Fetches the balance of the native token
 * @returns The balance of the native token
 */
export function useNativeTokenBalance() {
  const { address } = useAccount();

  const { data, isLoading, error } = useBalance({
    address,
  });

  const formatted =
    data?.value && data?.decimals
      ? formatUnits(data.value, data.decimals)
      : undefined;

  return {
    balance: formatted,
    symbol: data?.symbol,
    isLoading,
    error,
  };
}
