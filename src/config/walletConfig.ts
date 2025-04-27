import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet, safeWallet],
    },
  ],
  {
    appName: 'Arbiswap',
    projectId: 'YOUR_PROJECT_ID',
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
