import { useSwapContext } from '@/context/SwapContext';
import { useErc20TokenBalance } from '@/utils/hooks/useErc20TokenBalance';
import { Field } from 'formik';

const FromFieldLabel = () => {
  const { fromTokenAddress } = useSwapContext();
  const { balance, isLoading, error } = useErc20TokenBalance(fromTokenAddress);
  return (
    <label className="fieldset-legend" htmlFor="fromAmount">
      From (USDC) {balance}
    </label>
  );
};

export const FromField = () => {
  return (
    <div className="fieldset">
      <FromFieldLabel />
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
