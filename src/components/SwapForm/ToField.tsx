import { useSwapContext } from '@/context/SwapContext';
import { useErc20TokenBalance } from '@/utils/hooks/useErc20TokenBalance';
import { Field } from 'formik';

const ToFieldLabel = () => {
  const { toTokenAddress } = useSwapContext();
  const { balance, isLoading, error } = useErc20TokenBalance(toTokenAddress);
  return (
    <label className="fieldset-legend" htmlFor="toAmount">
      To (USDC) {balance}
    </label>
  );
};

export const ToField = () => {
  return (
    <div className="fieldset">
      <ToFieldLabel />
      <Field
        id="toAmount"
        name="toAmount"
        className="input"
        placeholder="Type here"
        type="number"
        min="1"
      />
    </div>
  );
};
