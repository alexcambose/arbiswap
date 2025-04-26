import { getCapabilities } from '@wagmi/core/experimental';
import { wagmiConfig } from '@/config/walletConfig';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useState } from 'react';

export const useHasBatchingCapability = () => {
  const { chainId } = useAccount();
  const [hasBatchingCapability, setHasBatchingCapability] = useState(false);
  useEffect(() => {
    if (!chainId) {
      setHasBatchingCapability(false);
      return;
    }
    const checkBatchingCapability = async () => {
      const capabilities = await getCapabilities(wagmiConfig);
      setHasBatchingCapability(capabilities[chainId]?.atomicBatch?.supported);
    };
    checkBatchingCapability();
  }, [chainId]);
  return hasBatchingCapability;
};
