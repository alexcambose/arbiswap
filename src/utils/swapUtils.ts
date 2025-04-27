import { Route } from '@/types/ApiTypes';

export async function getQuote(params: {
  fromChainId: number;
  fromTokenAddress: string;
  toChainId: number;
  toTokenAddress: string;
  fromAmount: string;
  userAddress: string;
  uniqueRoutesPerBridge: boolean;
  sort: string;
  singleTxOnly: boolean;
}) {
  const urlParams = new URLSearchParams({
    fromChainId: params.fromChainId.toString(),
    fromTokenAddress: params.fromTokenAddress,
    toChainId: params.toChainId.toString(),
    toTokenAddress: params.toTokenAddress,
    fromAmount: params.fromAmount,
    userAddress: params.userAddress,
  });
  const response = await fetch(`/api/quote?${urlParams.toString()}`);

  const json = await response.json();
  return json;
}

export const buildTx = async (route: Route) => {
  // Fetching transaction data for swap/bridge tx
  const buildTxRawResponse = await fetch(`/api/build-tx`, {
    method: 'POST',
    body: JSON.stringify({ route }),
  });
  return buildTxRawResponse.json();
};

/**
 * Fetches the status of a bridge transaction
 * @param transactionHash - The hash of the transaction to check
 * @param fromChainId - The ID of the chain the transaction was sent from
 * @param toChainId - The ID of the chain the transaction was sent to
 * @returns The status of the transaction
 */
export async function getBridgeStatus(
  transactionHash: string,
  fromChainId: number,
  toChainId: number
) {
  const response = await fetch(
    `/api/bridge-status?transactionHash=${transactionHash}&fromChainId=${fromChainId}&toChainId=${toChainId}`
  );

  const json = await response.json();
  return json;
}

// Fetches transaction data for token approval
export async function getApprovalTransactionData(params: {
  chainId: number;
  owner: string;
  allowanceTarget: string;
  tokenAddress: string;
  amount: string;
}) {
  const queryParams = new URLSearchParams({
    chainID: params.chainId.toString(),
    owner: params.owner,
    allowanceTarget: params.allowanceTarget,
    tokenAddress: params.tokenAddress,
    amount: params.amount,
  });
  const response = await fetch(
    `/api/approval-transaction-data?${queryParams.toString()}`
  );

  const json = await response.json();
  return json;
}

export async function checkAllowance(params: {
  chainId: number;
  owner: string;
  allowanceTarget: string;
  tokenAddress: string;
}) {
  const queryParams = new URLSearchParams({
    chainID: params.chainId.toString(),
    owner: params.owner,
    allowanceTarget: params.allowanceTarget,
    tokenAddress: params.tokenAddress,
  });
  const response = await fetch(
    `/api/check-allowance?${queryParams.toString()}`
  );

  const json = await response.json();
  return json;
}

export const bridgeStatusResolver = ({
  txHash,
  fromChainId,
  toChainId,
}: {
  txHash: string;
  fromChainId: number;
  toChainId: number;
}) => {
  return new Promise((resolve) => {
    const txStatus = setInterval(async () => {
      const status = await getBridgeStatus(txHash, fromChainId, toChainId);
      console.log(
        `SOURCE TX : ${status.result.sourceTxStatus}\nDEST TX : ${status.result.destinationTxStatus}`
      );

      if (status.result.destinationTxStatus == 'COMPLETED') {
        console.log('DEST TX HASH :', status.result.destinationTransactionHash);
        clearInterval(txStatus);
        resolve(status.result.destinationTransactionHash);
      }
    }, 20000);
  });
};
