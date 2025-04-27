import { useSwapContext } from '@/context/SwapContext';
import { assets } from '@/config/assets';
import { useErc20TokenBalance } from '@/utils/hooks/useErc20TokenBalance';
import { Field } from 'formik';
import { useAccount } from 'wagmi';

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

export const FromField = () => (
  <div className="fieldset">
    <FromFieldLabel />
    <Field
      id="fromAmount"
      name="fromAmount"
      className="input w-full"
      placeholder="Type here"
      type="number"
      min="1"
    />
  </div>
);
