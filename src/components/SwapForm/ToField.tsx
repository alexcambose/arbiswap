import { useSwapContext } from '@/context/SwapContext';
import { assets } from '@/config/assets';
import { useNativeTokenBalance } from '@/utils/hooks/useNativeTokenBalance';
import { Field, useFormikContext } from 'formik';
import { useAccount } from 'wagmi';
import { SwapFormSchema } from '@/utils/server/api/schemas';
import { z } from 'zod';
import { formatDecimal } from '@/utils/format';

const ToFieldLabel = () => {
  const { address } = useAccount();
  const { toTokenAddress, toChainId } = useSwapContext();

  const { balance, isLoading } = useNativeTokenBalance();

  const assetInfo = assets[toChainId].find(
    (asset) => asset.address === toTokenAddress
  );

  const balanceIndicator = isLoading ? (
    <div className="skeleton h-4 w-32"></div>
  ) : (
    <div>
      {formatDecimal(balance ?? 0, 6)} {assetInfo?.symbol}
    </div>
  );

  return (
    <label className="fieldset-legend" htmlFor="toAmount">
      To ({assetInfo?.symbol}){address ? balanceIndicator : null}
    </label>
  );
};

export const ToField = () => {
  const { values } = useFormikContext<z.infer<typeof SwapFormSchema>>();
  return (
    <div className="fieldset">
      <ToFieldLabel />
      <Field
        id="toAmount"
        name="toAmount"
        className="input w-full"
        placeholder="Type here"
        type="text"
        min="1"
        value={formatDecimal(values.toAmount, 6)}
        disabled={true}
      />
    </div>
  );
};
