import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
/**
 * Waits for a Safe transaction to be confirmed
 * @param safeSdk - The Safe SDK
 * @param safeTxHash - The hash of the Safe transaction
 * @returns The Safe transaction
 */
export const waitForSafeTx = async (
  safeSdk: ReturnType<typeof useSafeAppsSDK>['sdk'],
  safeTxHash: string
) => {
  let tx = await safeSdk.txs.getBySafeTxHash(safeTxHash);
  while (
    tx.txStatus === 'AWAITING_CONFIRMATIONS' ||
    tx.txStatus === 'AWAITING_EXECUTION'
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    tx = await safeSdk.txs.getBySafeTxHash(safeTxHash);
  }

  if (tx.txStatus === 'CANCELLED' || tx.txStatus === 'FAILED') {
    throw new Error(`Transaction failed with status: ${tx.txStatus}`);
  }

  return tx;
};
