'use client';
import { SwapFormSchema } from '@/utils/schemas';
import { Field, Formik, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { arbitrum } from 'viem/chains';
import { useAccount } from 'wagmi';
import { estimateGas, getGasPrice, sendTransaction } from '@wagmi/core';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { wagmiConfig } from '@/config/walletConfig';
import {
  checkAllowance,
  getApprovalTransactionData,
  getBridgeStatus,
  getQuote,
} from '@/utils/swapUtils';

const FromField = () => {
  return (
    <div className="fieldset">
      <label className="fieldset-legend" htmlFor="fromAmount">
        From (USDC)
      </label>
      <Field
        id="fromAmount"
        name="fromAmount"
        className="input"
        placeholder="Type here"
        type="number"
        min="1"
      />
    </div>
  );
};

const ToField = () => {
  return (
    <div className="fieldset">
      <label className="fieldset-legend" htmlFor="toAmount">
        To (USDC)
      </label>
      <Field
        id="toAmount"
        name="toAmount"
        className="input"
        placeholder="Type here"
        type="number"
        min="1"
      />
    </div>
  );
};

const TO_CHAIN_ID = arbitrum.id;
const FROM_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const TO_TOKEN_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const FROM_AMOUNT = '1';

const SwapFormContent = () => {
  const { address, chainId } = useAccount();
  const [quote, setQuote] = useState<any>(null);
  const { values, submitForm } = useFormikContext();
  console.log({ address });
  const fetchQuote = async () => {
    if (!address || !chainId) {
      throw new Error('No account found');
    }
    const quote = await getQuote({
      fromChainId: chainId,
      fromTokenAddress: FROM_TOKEN_ADDRESS,
      toChainId: chainId,
      toTokenAddress: TO_TOKEN_ADDRESS,
      fromAmount: FROM_AMOUNT,
      userAddress: address,
      uniqueRoutesPerBridge: true,
      sort: 'asc',
      singleTxOnly: true,
    });

    // Choosing first route from the returned route results
    const route = quote.result.routes[0];
    console.log({ route });
    // Fetching transaction data for swap/bridge tx
    const buildTxRawResponse = await fetch(`/api/build-tx`, {
      method: 'POST',
      body: JSON.stringify({ route }),
    });
    const buildTxResponse = await buildTxRawResponse.json();

    // Used to check for ERC-20 approvals
    const approvalData = buildTxResponse.result.approvalData;
    console.log({ approvalData });
    // approvalData from apiReturnData is null for native tokens
    // Values are returned for ERC20 tokens but token allowance needs to be checked
    if (approvalData !== null) {
      const { allowanceTarget, minimumApprovalAmount } = approvalData;
      // Fetches token allowance given to Bungee contracts
      const allowanceCheckRawResponse = await checkAllowance({
        chainId,
        owner: address,
        allowanceTarget,
        tokenAddress: FROM_TOKEN_ADDRESS,
      });

      const allowanceCheckStatus = await allowanceCheckRawResponse.json();
      const allowanceValue = allowanceCheckStatus.result?.value;

      // If Bungee contracts don't have sufficient allowance
      if (minimumApprovalAmount > allowanceValue) {
        // Approval tx data fetched
        const approvalTransactionData = await getApprovalTransactionData({
          chainId,
          owner: address,
          allowanceTarget,
          tokenAddress: FROM_TOKEN_ADDRESS,
          amount: FROM_AMOUNT,
        });

        const gasPrice = await getGasPrice(wagmiConfig);

        const gasEstimate = await estimateGas(wagmiConfig, {
          to: approvalTransactionData.result?.to,
          value: BigInt(0),
          data: approvalTransactionData.result?.data,
          gasPrice: gasPrice,
        });

        const tx = await sendTransaction(wagmiConfig, {
          to: approvalTransactionData.result?.to,
          value: BigInt(0),
          data: approvalTransactionData.result?.data,
          gasPrice: gasPrice,
          gasLimit: gasEstimate,
        });

        // Initiates approval transaction on user's frontend which user has to sign
        const receipt = await tx.wait();

        console.log('Approval Transaction Hash :', receipt.transactionHash);
      }
    }

    const gasPrice = await getGasPrice(wagmiConfig);

    const gasEstimate = await estimateGas(wagmiConfig, {
      to: buildTxResponse.result.txTarget,
      value: buildTxResponse.result.value,
      data: buildTxResponse.result.txData,
      gasPrice: gasPrice,
    });

    const tx = await sendTransaction(wagmiConfig, {
      to: buildTxResponse.result.txTarget,
      data: buildTxResponse.result.txData,
      value: buildTxResponse.result.value,
      gasPrice: gasPrice,
      gasLimit: gasEstimate,
    });

    // Initiates swap/bridge transaction on user's frontend which user has to sign
    const receipt = await tx.wait();

    const txHash = receipt.transactionHash;

    console.log('Bridging Transaction : ', receipt.transactionHash);

    // Checks status of transaction every 20 secs
    const txStatus = setInterval(async () => {
      const status = await getBridgeStatus(txHash, chainId, TO_CHAIN_ID);

      console.log(
        `SOURCE TX : ${status.result.sourceTxStatus}\nDEST TX : ${status.result.destinationTxStatus}`
      );

      if (status.result.destinationTxStatus == 'COMPLETED') {
        console.log('DEST TX HASH :', status.result.destinationTransactionHash);
        clearInterval(txStatus);
      }
    }, 20000);
  };

  useEffect(() => {
    fetchQuote();
  }, [address]);

  return (
    <>
      <FromField />
      <ToField />
      <div className="card-actions justify-end">
        <button className="btn btn-primary w-full">Swap</button>
      </div>
    </>
  );
};

const SwapForm = () => {
  return (
    <Formik
      initialValues={{ fromAmount: '', toAmount: '' }}
      validationSchema={toFormikValidationSchema(SwapFormSchema)}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      <SwapFormContent />
    </Formik>
  );
};

const SwapCard = () => {
  return (
    <div className="flex justify-center items-center pt-10">
      <div className="card bg-base-100 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Swap Assets</h2>
          <SwapForm />
        </div>
      </div>
    </div>
  );
};

export default SwapCard;
