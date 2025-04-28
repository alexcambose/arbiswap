import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet, safeWallet],
    },
  ],
  {
    appName: 'Arbiswap',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
  ssr: true,
});
