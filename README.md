# Bungee Single-Chain Swap with EIP-5792 Smart Wallet Support

A web application that demonstrates token swapping (USDC to ETH) on Arbitrum using Bungee, with support for Safe wallets and EIP-5792 batching capabilities.

## Overview

This project implements a minimal web application that enables users to:

- Swap USDC to ETH on Arbitrum using Bungee
- Support both standard EOA wallets and Safe smart wallets
- Implement EIP-5792 batching for Safe wallet transactions

## Features

- **Wallet Integration**

  - Support for both EOA and Safe smart wallets
  - Wallet connection via RainbowKit
  - Safe wallet detection and EIP-5792 batching support

- **Token Swapping**

  - Single-chain USDC to ETH swaps on Arbitrum
  - Integration with Bungee APIs
  - Transaction status monitoring
  - Safe signature collection progress tracking

- **Technical Features**
  - Type-safe development with TypeScript
  - Modern React with Next.js
  - Efficient transaction batching for Safe wallets
  - Clean and maintainable codebase

## Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Safe Integration**: Safe Apps SDK, EIP-5792
- **State Management**: React Query
- **Form Handling**: Formik with Zod validation
- **Styling**: Tailwind CSS with DaisyUI
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js
- npm
- A Safe wallet (for testing Safe integration) - https://app.safe.global/
- An Arbitrum wallet with USDC for testing

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/arbiswap.git
cd arbiswap
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Connect your wallet (EOA or Safe)
2. Enter the amount of USDC you want to swap
3. Review the transaction details
4. Approve the transaction
   - For EOA wallets: Approve and swap will be sequential
   - For Safe wallets: Transactions will be batched using EIP-5792

## Implementation Details

### EIP-5792 Integration

The application implements EIP-5792 for Safe wallets by:

- Detecting Safe wallet connections (https://app.safe.global/)
- Batching token approval and swap transactions
- Handling transaction status and signature collection

### Safe Integration

Safe wallet support includes:

- Transaction status monitoring
- Signature collection progress tracking
- Error handling for failed transactions

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Next.js pages
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```
