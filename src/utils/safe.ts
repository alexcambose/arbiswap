// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const waitForSafeTx = async (safeSdk: any, safeTxHash: string) => {
  let tx = await safeSdk.txs.getBySafeTxHash(safeTxHash);
  if (
    tx.txStatus === 'AWAITING_EXECUTION' ||
    tx.txStatus === 'AWAITING_CONFIRMATIONS'
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    tx = await waitForSafeTx(safeSdk, safeTxHash);
  }
  return tx;
};
