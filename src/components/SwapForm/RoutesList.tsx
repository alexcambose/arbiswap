import { useSwapContext } from '@/context/SwapContext';
import { Route } from '@/types/BungeeApi';
import { dexConfig } from '@/config/dexConfig';
import Image from 'next/image';
import { assets } from '@/config/assetsConfig';
import { formatUnits } from 'viem';
import classNames from 'classnames';

const formatAmount = (amount: string, decimals: number) => {
  return parseFloat(formatUnits(BigInt(amount), decimals))
    .toFixed(3)
    .replace(/\.?0+$/, '');
};

const RouteCard = ({ route }: { route: Route }) => {
  const { setSelectedRoute, selectedRoute } = useSwapContext();

  const { fromChainId, toChainId, fromTokenAddress, toTokenAddress } =
    useSwapContext();
  const routeDexConfig = dexConfig.find(
    (dex) => dex.name === route.usedDexName
  );
  const fromAssetConfig = assets[fromChainId].find(
    (asset) => asset.address === fromTokenAddress
  );
  const toAssetConfig = assets[toChainId].find(
    (asset) => asset.address === toTokenAddress
  );

  if (!fromAssetConfig || !toAssetConfig) {
    return null;
  }

  return (
    <div
      role="button"
      onClick={() => setSelectedRoute(route)}
      className={classNames(
        'card bg-base-100 w-full shadow-sm cursor-pointer border transition-all duration-150 border-base-200 hover:border-primary/60',
        {
          'border-primary ring-2 ring-primary':
            selectedRoute?.routeId === route.routeId,
        }
      )}
    >
      <div className="card-body flex flex-row items-center gap-4 p-2">
        <div className="flex flex-1 flex-col items-center">
          <div className="avatar mb-1">
            {routeDexConfig && (
              <Image
                src={routeDexConfig?.logoUri}
                alt={routeDexConfig?.displayName}
                className="w-8 h-8 rounded-full"
                width={30}
                height={30}
              />
            )}
          </div>
          <span className="text-xs font-semibold capitalize text-base-content">
            {routeDexConfig?.displayName || route.usedDexName}
          </span>
        </div>
        <div className="flex-4 flex items-stand flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {fromAssetConfig && (
                <Image
                  src={fromAssetConfig.logoUrl}
                  alt={fromAssetConfig.symbol}
                  className="w-5 h-5 rounded-full"
                  width={20}
                  height={20}
                />
              )}
              <span className="font-medium">
                {formatAmount(route.fromAmount, fromAssetConfig.decimals)}
              </span>
              <span className="text-xs text-base-content/60">
                {fromAssetConfig?.symbol}
              </span>
            </div>
            <span className="mx-2 text-base-content/40">→</span>
            <div className="flex items-center gap-1">
              {toAssetConfig && (
                <Image
                  src={toAssetConfig.logoUrl}
                  alt={toAssetConfig.symbol}
                  className="w-5 h-5 rounded-full"
                  width={20}
                  height={20}
                />
              )}
              <span className="font-medium">
                {formatAmount(route.toAmount, toAssetConfig.decimals)}
              </span>
              <span className="text-xs text-base-content/60">
                {toAssetConfig?.symbol}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-xs text-base-content/60">
              Est. Output:{' '}
              <span className="font-semibold">
                ${route.outputValueInUsd?.toFixed(2) ?? '0.00'}
              </span>
            </div>
            <div className="text-xs text-base-content/60">
              Gas Fees:{' '}
              <span className="font-semibold">
                ${route.totalGasFeesInUsd.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoutesList = () => {
  const { routes } = useSwapContext();
  if (routes.length === 0) {
    return null;
  }
  return (
    <div className="mt-3">
      {routes.length > 1 && (
        <div className="text-base-content">Found {routes.length} routes:</div>
      )}
      <div className="flex flex-col gap-3 mt-2">
        {routes.map((route) => (
          <RouteCard key={route.routeId} route={route} />
        ))}
      </div>
    </div>
  );
};

export default RoutesList;
