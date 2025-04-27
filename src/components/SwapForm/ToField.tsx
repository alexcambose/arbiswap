import { useSwapContext } from '@/context/SwapContext';
import { assets } from '@/config/assets';
import { useNativeTokenBalance } from '@/utils/hooks/useNativeTokenBalance';
import { Field } from 'formik';
import { useAccount } from 'wagmi';

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
      {balance} {assetInfo?.symbol}
    </div>
  );

  return (
    <label className="fieldset-legend" htmlFor="toAmount">
      To ({assetInfo?.symbol}){address ? balanceIndicator : null}
    </label>
  );
};

export const ToField = () => (
  <div className="fieldset">
    <ToFieldLabel />
    <Field
      id="toAmount"
      name="toAmount"
      className="input w-full"
      placeholder="Type here"
      type="number"
      min="1"
    />
  </div>
);
