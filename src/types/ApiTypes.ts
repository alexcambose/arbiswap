// Note that this could've been generated from the openapi spec,
// but I'm not sure how to do that with the bungee api

export interface GetQuoteRequestParams {
  fromChainId: string;
  fromTokenAddress: string;
  toChainId: string;
  toTokenAddress: string;
  fromAmount: string;
  userAddress: string;
  recipient?: string;
  uniqueRoutesPerBridge: boolean;
  disableSwapping?: boolean;
  includeDexes?: string[];
  excludeDexes?: string[];
  includeBridges?: string[];
  excludeBridges?: string[];
  sort: 'output' | 'gas' | 'time';
  maxUserTxs?: string;
  singleTxOnly?: boolean;
  isContractCall?: boolean;
  bridgeWithGas?: boolean;
  bridgeWithInsurance?: boolean;
  defaultBridgeSlippage?: string;
  defaultSwapSlippage?: string;
  destinationPayload?: string;
  destinationGasLimit?: string;
  feePercent?: string;
  feeTakerAddress?: string;
}

export interface GetQuoteResponse {
  success: boolean;
  result: {
    routes: Route[];
  };
}

export interface Route {
  routeId: string;
  isOnlySwapRoute: boolean;
  fromAmount: string;
  toAmount: string;
  chainGasBalances: Record<string, string>;
  minimumGasBalances: Record<string, string>;
  usedDexName: string; // usedBridgeNames: string[]; this seems to not be present in the response
  totalUserTx: number;
  totalGasFeesInUsd: number;
  recipient: string;
  sender: string;
  userTxs: Record<string, unknown>[];
  receivedValueInUsd?: number;
  inputValueInUsd?: number;
  outputValueInUsd?: number;
  serviceTime: number;
  maxServiceTime: number;
  integratorFee: Record<string, unknown>;
  t2bReceiverAddress?: string;
  extraData?: Record<string, unknown>;
  fromChainId: number;
  fromAsset: Token;
  toChainId: number;
  toAsset: Token;
  refuel?: Refuel;
}

export interface Token {
  name: string;
  address: string;
  icon: string;
  decimals: number;
  symbol: string;
  chainId: string;
  logoURI: string;
  chainAgnosticId: string;
}

export interface Refuel {
  fromAmount: string;
  toAmount: string;
  gasFees: Record<string, unknown>;
  recipient: string;
  serviceTime: number;
  fromAsset: Token;
  toAsset: Token;
  fromChainId: number;
  toChainId: number;
}
export interface BuildTxRequest {
  route: {
    routeId: string;
    isOnlySwapRoute: boolean;
    fromAmount: string;
    chainGasBalances: Record<string, string>;
    minimumGasBalances: Record<string, string>;
    toAmount: string;
    usedBridgeNames: string[];
    totalUserTx: number;
    totalGasFeesInUsd: number;
    recipient: string;
    sender: string;
    userTxs: Record<string, unknown>[];
    receivedValueInUsd: number;
    inputValueInUsd: number;
    outputValueInUsd: number;
    serviceTime: number;
    maxServiceTime: number;
    integratorFee: {
      feeTakerAddress: string;
      amount: string;
      asset: Token;
    };
    t2bReceiverAddress: string;
    extraData: Record<string, unknown>;
  };
  refuel: {
    fromAmount: string;
    toAmount: string;
    gasFees: {
      gasLimit: number;
      feesInUsd: number;
      gasAmount: string;
      asset: Token;
    };
    recipient: string;
    serviceTime: number;
    fromAsset: Token;
    toAsset: Token;
    fromChainId: number;
    toChainId: number;
  };
  destinationCallData: {
    destinationPayload: string;
    destinationGasLimit: string;
  };
  bridgeInsuranceData: {
    amount: string;
  };
}

export interface BuildTxResponse {
  status: boolean;
  result: {
    userTxType: 'approve' | 'fund-movr' | 'claim' | 'dex-swap' | 'sign';
    txTarget: string;
    chainId: string;
    txData: string;
    txType: 'eth_sendTransaction' | 'eth_signMessage';
    value: string;
    totalUserTx: number;
    approvalData: {
      minimumApprovalAmount: string;
      approvalTokenAddress: string;
      allowanceTarget: string;
      owner: string;
    };
  };
}
export interface CheckAllowanceRequest {
  chainID: string;
  owner: string;
  allowanceTarget: string;
  tokenAddress: string;
}
export interface CheckAllowanceResponse {
  success: boolean;
  result: {
    value: string;
    tokenAddress: string;
  };
}

export interface BuildApprovalTxRequest {
  chainID: string;
  owner: string;
  allowanceTarget: string;
  tokenAddress: string;
  amount: string;
}

export interface BuildApprovalTxResponse {
  success: boolean;
  result: {
    data: string;
    to: string;
    from: string;
  };
}

export interface GetBridgeStatusRequest {
  transactionHash: string;
  fromChainId: string;
  toChainId?: string;
  bridgeName?: string;
  isBridgeProtectionTx?: boolean;
}
export interface GetBridgeStatusResponse {
  success: boolean;
  result: {
    sourceTransactionHash: string;
    sourceTxStatus: 'PENDING' | 'COMPLETED';
    destinationTransactionHash?: string;
    destinationTxStatus: 'PENDING' | 'COMPLETED';
    fromChainId: number;
    toChainId: number;
    fromAsset: Token;
    toAsset: Token;
    srcTokenPrice: string;
    destTokenPrice: string;
    fromAmount: string;
    toAmount: string;
    sender: string;
    recipient: string;
    isSocketTx: boolean;
    bridgeName: string;
    refuel?: Refuel;
  };
}
