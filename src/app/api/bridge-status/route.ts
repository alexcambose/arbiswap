import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionHash = searchParams.get('transactionHash');
  const fromChainId = searchParams.get('fromChainId');
  const toChainId = searchParams.get('toChainId') || undefined;
  const bridgeName = searchParams.get('bridgeName') || undefined;
  const isBridgeProtectionTx = searchParams.get('isBridgeProtectionTx');
  console.log(request.nextUrl.searchParams);
  if (!transactionHash || !fromChainId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const response = await bungeeApi.getBridgeStatus({
    transactionHash,
    fromChainId,
    toChainId,
    bridgeName,
    isBridgeProtectionTx: isBridgeProtectionTx === 'true',
  });
  return NextResponse.json(response);
}
