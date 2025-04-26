import { useAccount } from 'wagmi';

const AdditionalInfo = () => {
  const { connector } = useAccount();
  if (connector?.id === 'safe') {
    return (
      <div role="alert" className="alert alert-success alert-soft w-full">
        You are using a Safe account.
      </div>
    );
  }
  return null;
};

export default AdditionalInfo;
