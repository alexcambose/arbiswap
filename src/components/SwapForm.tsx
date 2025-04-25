'use client';
import { SwapContextProvider, useSwapContext } from '@/context/SwapContext';
import { SwapFormSchema } from '@/utils/schemas';
import { Formik, useFormikContext } from 'formik';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { FromField } from './SwapForm/FromField';
import { SwapButton } from './SwapForm/SwapButton';
import { ToField } from './SwapForm/ToField';

const SwapFormContent = () => {
  const { address, chainId } = useAccount();
  const { values } = useFormikContext<z.infer<typeof SwapFormSchema>>();

  const {
    fetchRoutes,
    routes,
    isRoutesLoading,
    fromTokenAddress,
    toTokenAddress,
  } = useSwapContext();

  const debouncedFetchRoutes = useCallback(debounce(fetchRoutes, 1000), [
    fetchRoutes,
  ]);

  useEffect(() => {
    debouncedFetchRoutes({
      fromTokenAddress: fromTokenAddress,
      toTokenAddress: toTokenAddress,
      fromAmount: values.fromAmount,
    });
  }, [
    debouncedFetchRoutes,
    values.fromAmount,
    fromTokenAddress,
    toTokenAddress,
  ]);

  console.log({ address, routes });

  return (
    <>
      <FromField />
      <ToField />
      <SwapButton isLoading={isRoutesLoading} disabled={routes.length === 0} />
    </>
  );
};

const SwapForm = () => {
  const { executeSwap, routes } = useSwapContext();
  const handleSubmit = useCallback(async () => {
    await executeSwap();
  }, [executeSwap, routes]);

  return (
    <Formik
      initialValues={{ fromAmount: undefined }}
      validationSchema={toFormikValidationSchema(SwapFormSchema)}
      onSubmit={handleSubmit}
    >
      <SwapFormContent />
    </Formik>
  );
};

const SwapCard = () => {
  return (
    <div className="flex justify-center items-center pt-10">
      <div className="card bg-base-200 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Swap Assets</h2>
          <SwapContextProvider>
            <SwapForm />
          </SwapContextProvider>
        </div>
      </div>
    </div>
  );
};

export default SwapCard;
