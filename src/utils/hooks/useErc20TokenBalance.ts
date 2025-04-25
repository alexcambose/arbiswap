import { Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

const ERC20_DECIMALS = 6; // consider always using 6 decimals for erc20 tokens for simplicity

export function useErc20TokenBalance(tokenAddress: Address) {
  const { address } = useAccount();

  const enabled = !!address && !!tokenAddress;

  const { data, isLoading, error } = useReadContracts({
    allowFailure: false,
    query: {
      enabled,
    },
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address!],
      },
    ],
  });

  if (!enabled || !data) {
    return {
      balance: undefined,
      isLoading: false,
      error: null,
    };
  }
  const [rawBalance] = data;
  const balance = rawBalance
    ? formatUnits(rawBalance as bigint, ERC20_DECIMALS)
    : undefined;

  return {
    balance,
    isLoading,
    error,
  };
}
