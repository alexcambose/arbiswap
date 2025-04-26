import { arbitrum } from 'viem/chains';

export const assets: {
  [chainId: string]: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoUrl: string;
  }[];
} = {
  [arbitrum.id]: [
    {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoUrl: 'https://media.socket.tech/tokens/all/USDC',
    },
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      logoUrl: 'https://media.socket.tech/tokens/all/ETH',
    },
  ],
};
