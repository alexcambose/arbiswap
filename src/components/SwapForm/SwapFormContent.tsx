import { assets } from '@/config/assets';
import { useSwapContext } from '@/context/SwapContext';
import { SwapFormSchema } from '@/utils/server/api/schemas';
import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { z } from 'zod';
import { FromField } from './FromField';
import RoutesList from './RoutesList';
import { SwapButton } from './SwapButton';
import { ToField } from './ToField';

export const SwapFormContent = () => {
  const { values, isValid, setFieldValue } =
    useFormikContext<z.infer<typeof SwapFormSchema>>();

  const {
    fetchRoutes,
    routesError,
    fromTokenAddress,
    toTokenAddress,
    fromChainId,
    selectedRoute,
    toChainId,
  } = useSwapContext();

  const debouncedFetchRoutes = useCallback(debounce(fetchRoutes, 1000), [
    fetchRoutes,
  ]);

  useEffect(() => {
    if (!isValid) return;
    const fromAsset = assets[fromChainId].find(
      (asset) => asset.address === fromTokenAddress
    );
    if (!fromAsset) return;
    const fromAmount = parseUnits(
      values.fromAmount.toString(),
      fromAsset.decimals
    );
    debouncedFetchRoutes({
      fromTokenAddress,
      toTokenAddress,
      fromAmount: fromAmount.toString(),
    });
  }, [
    isValid,
    debouncedFetchRoutes,
    values.fromAmount,
    fromTokenAddress,
    toTokenAddress,
    fromChainId,
  ]);

  useEffect(() => {
    if (!selectedRoute) return;
    const toAsset = assets[toChainId].find(
      (asset) => asset.address === toTokenAddress
    );
    if (!toAsset) return;
    const toAmount = formatUnits(
      BigInt(selectedRoute?.toAmount),
      toAsset.decimals
    );
    setFieldValue('toAmount', parseFloat(toAmount));
  }, [selectedRoute, setFieldValue, toChainId, toTokenAddress]);

  return (
    <>
      <FromField />
      <ToField />
      <SwapButton />
      <RoutesList />
      {routesError && (
        <div role="alert" className="alert alert-error">
          {routesError}
        </div>
      )}
    </>
  );
};
