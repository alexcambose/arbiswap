'use client';
import { SwapContextProvider, useSwapContext } from '@/context/SwapContext';
import { SwapFormSchema } from '@/utils/server/api/schemas';
import { Formik } from 'formik';
import { useCallback } from 'react';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import AdditionalInfo from './SwapForm/AdditionalInfo';
import { SwapFormContent } from './SwapForm/SwapFormContent';

const SwapForm = () => {
  const { executeSwap } = useSwapContext();
  const handleSubmit = useCallback(async () => {
    await executeSwap();
  }, [executeSwap]);

  return (
    <Formik
      initialValues={{ fromAmount: '', toAmount: '' }}
      validationSchema={toFormikValidationSchema(SwapFormSchema)}
      isInitialValid={false}
      onSubmit={handleSubmit}
    >
      <SwapFormContent />
    </Formik>
  );
};

const SwapCard = () => {
  return (
    <div className="flex justify-center items-center pt-10">
      <div className="flex flex-col gap-4 w-96">
        <AdditionalInfo />
        <div className="card bg-base-200 shadow-sm">
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Swap Assets</h2>
              <SwapContextProvider>
                <SwapForm />
              </SwapContextProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapCard;
