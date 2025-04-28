'use client';
import { SwapContextProvider, useSwapContext } from '@/context/SwapContext';
import { SwapFormSchema } from '@/utils/server/api/schemas';
import { Formik, FormikHelpers } from 'formik';
import { useCallback, useState } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import AdditionalInfo from './SwapForm/AdditionalInfo';
import { SwapFormContent } from './SwapForm/SwapFormContent';
import { z } from 'zod';

const SwapForm = () => {
  const [successTxHash, setSuccessTxHash] = useState<string>('');

  const { executeSwap, reset } = useSwapContext();

  const handleSubmit = useCallback(
    async (
      _: z.infer<typeof SwapFormSchema>,
      { resetForm }: FormikHelpers<z.infer<typeof SwapFormSchema>>
    ) => {
      setSuccessTxHash('');
      try {
        const txHash = await executeSwap();
        reset();
        resetForm();
        setSuccessTxHash(txHash);
      } catch (error) {
        console.error(error);
      }
    },
    [executeSwap, reset]
  );

  return (
    <Formik
      initialValues={{ fromAmount: 0, toAmount: 0 }}
      validationSchema={toFormikValidationSchema(SwapFormSchema)}
      isInitialValid={false}
      onSubmit={handleSubmit}
    >
      <SwapFormContent successTxHash={successTxHash} />
    </Formik>
  );
};

const SwapCard = () => (
  <div className="flex justify-center items-center pt-10">
    <div className="flex flex-col gap-4 w-96">
      <AdditionalInfo />
      <div className="card bg-blue-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Swap Assets</h2>
          <SwapContextProvider>
            <SwapForm />
          </SwapContextProvider>
        </div>
      </div>
    </div>
  </div>
);

export default SwapCard;
