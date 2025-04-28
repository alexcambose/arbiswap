# [VIDEO DEMO](https://www.loom.com/share/d8384255058045ac85ef3c9f6dd74d66)

# Bungee Single-Chain Swap with EIP-5792 Smart Wallet Support

A web application that demonstrates token swapping (USDC to ETH) on Arbitrum using Bungee, with support for Safe wallets and EIP-5792 batching capabilities.

## Overview

This project implements the following:

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

## Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Form Handling**: Formik with Zod validation
- **Styling**: Tailwind CSS with DaisyUI

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/alexcambose/arbiswap.git
cd arbiswap
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Connect your wallet (EOA or Safe)
2. Enter the amount of USDC you want to swap
3. Review the transaction details
4. Approve the transaction
   - For EOA wallets: Approve and swap will be sequential
   - For Safe wallets: Transactions will be batched

## Project Structure

```
src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── app/           # Next.js app pages/api routes
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```
