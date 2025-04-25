import { useAccount } from 'wagmi';

import { formatUnits } from 'viem';
import { useBalance } from 'wagmi';

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
