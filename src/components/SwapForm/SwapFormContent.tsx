import { assets } from '@/config/assetsConfig';
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
import Link from 'next/link';
import { useAccountEffect } from 'wagmi';

export const SwapFormContent = ({
  successTxHash,
}: {
  successTxHash: string;
}) => {
  const { values, isValid, setFieldValue, resetForm } =
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

  useAccountEffect({
    onDisconnect() {
      resetForm();
    },
  });

  const debouncedFetchRoutes = useCallback(debounce(fetchRoutes, 1000), [
    fetchRoutes,
  ]);

  useEffect(() => {
    const fromAsset = assets[fromChainId].find(
      (asset) => asset.address === fromTokenAddress
    );
    if (!fromAsset) return;
    const fromAmount = parseUnits(
      values.fromAmount.toString(),
      fromAsset.decimals
    ).toString();

    if (fromAmount === '0') return;

    debouncedFetchRoutes({
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
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
      {successTxHash && (
        <div
          role="alert"
          className="alert alert-success alert-soft flex justify-between"
        >
          Swap successful.{' '}
          <Link
            href={`https://arbiscan.io/tx/${successTxHash}`}
            target="_blank"
            className="link"
            rel="noopener noreferrer"
          >
            View on Arbiscan
          </Link>
        </div>
      )}
      <RoutesList />
      {routesError && (
        <div role="alert" className="alert alert-error">
          {routesError}
        </div>
      )}
    </>
  );
};
