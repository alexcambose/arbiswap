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
  return (
    <div className="card-actions justify-end">
      <button
        className="btn btn-primary w-full"
        disabled={isSwapping || isRoutesLoading || routes.length === 0}
        onClick={submitForm}
      >
        {isSwapping && <span className="loading loading-spinner"></span>}
        {labels[currentStatus]}
      </button>
    </div>
  );
};
