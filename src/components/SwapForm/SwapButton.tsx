import { BridgeStatus, useSwapContext } from '@/context/SwapContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFormikContext } from 'formik';
import { useAccount } from 'wagmi';

const labels: Record<BridgeStatus, string> = {
  READY: 'Swap',
  BUILDING_TX: 'Building Transaction',
  APPROVE_START: 'Approving',
  APPROVE_PENDING: 'Approving',
  APPROVE_COMPLETE: 'Approved',
  BRIDGE_START: 'Bridging',
  BRIDGE_PENDING: 'Bridging',
  BRIDGE_COMPLETE: 'Bridging Complete!',
};

export const SwapButton = () => {
  const { address } = useAccount();
  const { submitForm } = useFormikContext();
  const { currentStatus, isSwapping, routes, isRoutesLoading } =
    useSwapContext();
  if (!address) {
    return <ConnectButton />;
  }
  const isLoading = isSwapping || isRoutesLoading;
  const isDisabled = isSwapping || isRoutesLoading || routes.length === 0;
  const label = (() => {
    if (isRoutesLoading) {
      return 'Fetching Routes';
    }
    return labels[currentStatus];
  })();
  return (
    <div className="card-actions justify-end">
      <button
        className="btn btn-primary w-full"
        disabled={isDisabled}
        onClick={submitForm}
      >
        {isLoading && <span className="loading loading-spinner"></span>}
        {label}
      </button>
    </div>
  );
};
