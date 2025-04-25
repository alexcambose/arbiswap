import { Field } from 'formik';

export const ToField = () => {
  return (
    <div className="fieldset">
      <label className="fieldset-legend" htmlFor="toAmount">
        To (USDC)
      </label>
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
