import { useSwapContext } from '@/context/SwapContext';
import { assets } from '@/config/assets';
import { useErc20TokenBalance } from '@/utils/hooks/useErc20TokenBalance';
import { Field, useFormikContext } from 'formik';
import { useAccount } from 'wagmi';
import { SwapFormSchema } from '@/utils/server/api/schemas';
import { z } from 'zod';
import classNames from 'classnames';
const FromFieldLabel = () => {
  const { address } = useAccount();
  const { fromTokenAddress, fromChainId } = useSwapContext();
  const { balance, isLoading } = useErc20TokenBalance(fromTokenAddress);

  const assetInfo = assets[fromChainId].find(
    (asset) => asset.address === fromTokenAddress
  );

  const balanceIndicator = isLoading ? (
    <div className="skeleton h-4 w-32"></div>
  ) : (
    <div>
      {balance} {assetInfo?.symbol}
    </div>
  );

  return (
    <label className="fieldset-legend" htmlFor="fromAmount">
      From ({assetInfo?.symbol}) {address ? balanceIndicator : null}
    </label>
  );
};

export const FromField = () => {
  const { address } = useAccount();
  const { errors, touched } =
    useFormikContext<z.infer<typeof SwapFormSchema>>();

  return (
    <div className="fieldset">
      <FromFieldLabel />
      <Field
        disabled={!address}
        id="fromAmount"
        name="fromAmount"
        className={classNames('input w-full', {
          'border-red-500': errors.fromAmount && touched.fromAmount,
        })}
        placeholder="Type here"
        type="number"
        min="0.000001"
      />
      {errors.fromAmount && touched.fromAmount && (
        <div className="text-red-500 text-sm mt-1">{errors.fromAmount}</div>
      )}
    </div>
  );
};
