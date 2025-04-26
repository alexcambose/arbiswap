import { useNativeTokenBalance } from '@/utils/hooks/useNativeTokenBalance';
import { Field } from 'formik';

const ToFieldLabel = () => {
  const { balance, symbol, isLoading, error } = useNativeTokenBalance();
  return (
    <label className="fieldset-legend" htmlFor="toAmount">
      To ({symbol || 'USDC'}) {balance + ' ' + symbol}
    </label>
  );
};

export const ToField = () => (
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
