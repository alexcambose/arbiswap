import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const {
    transactionHash,
    fromChainId,
    toChainId,
    bridgeName,
    isBridgeProtectionTx,
  } = await request.json();
  const response = await bungeeApi.getBridgeStatus({
    transactionHash,
    fromChainId,
    toChainId,
    bridgeName,
    isBridgeProtectionTx,
  });
  return NextResponse.json(response);
}
