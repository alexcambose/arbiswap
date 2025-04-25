import { Field } from 'formik';

export const FromField = () => {
  return (
    <div className="fieldset">
      <label className="fieldset-legend" htmlFor="fromAmount">
        From (USDC)
      </label>
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
