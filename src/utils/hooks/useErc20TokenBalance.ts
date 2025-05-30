import { Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

const ERC20_DECIMALS = 6; // consider always using 6 decimals for erc20 tokens for simplicity

/**
 * Fetches the balance of an ERC20 token
 * @param tokenAddress - The address of the token
 * @returns The balance of the token
 */
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
  const balance =
    rawBalance > 0 ? formatUnits(rawBalance as bigint, ERC20_DECIMALS) : 0;

  return {
    balance,
    isLoading,
    error,
  };
}
