import { useNativeTokenBalance } from '@/utils/hooks/useNativeTokenBalance';
import { Field } from 'formik';

const FromFieldLabel = () => {
  const { balance, symbol, isLoading, error } = useNativeTokenBalance();
  return (
    <label className="fieldset-legend" htmlFor="fromAmount">
      From ({symbol || 'ETH'}) {balance + ' ' + symbol}
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
