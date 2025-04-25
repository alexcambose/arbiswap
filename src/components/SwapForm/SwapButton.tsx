import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFormikContext } from 'formik';
import { useAccount } from 'wagmi';

export const SwapButton = ({
  isLoading,
  disabled,
}: {
  isLoading: boolean;
  disabled: boolean;
}) => {
  const { address } = useAccount();
  const { submitForm } = useFormikContext();

  if (!address) {
    return <ConnectButton />;
  }
  return (
    <div className="card-actions justify-end">
      <button
        className="btn btn-primary w-full"
        disabled={isLoading || disabled}
        onClick={submitForm}
      >
        {isLoading ? <span className="loading loading-spinner"></span> : 'Swap'}
      </button>
    </div>
  );
};
