import Link from 'next/link';
import WalletIndicator from './ConnectButton';

const Header = () => {
  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex justify-around items-center">
          <div className="flex-1">
            <Link href="/">Arbiswap</Link>
          </div>
          <div className="flex-none">
            <WalletIndicator />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
