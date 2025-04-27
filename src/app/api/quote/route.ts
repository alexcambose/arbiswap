import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromChainId = searchParams.get('fromChainId');
  const fromTokenAddress = searchParams.get('fromTokenAddress');
  const toChainId = searchParams.get('toChainId');
  const toTokenAddress = searchParams.get('toTokenAddress');
  const fromAmount = searchParams.get('fromAmount');
  const userAddress = searchParams.get('userAddress');
  if (
    !fromChainId ||
    !fromTokenAddress ||
    !toChainId ||
    !toTokenAddress ||
    !fromAmount ||
    !userAddress
  ) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }
  const quote = await bungeeApi.getQuote({
    fromChainId,
    fromTokenAddress,
    toChainId,
    toTokenAddress,
    fromAmount,
    userAddress,
    uniqueRoutesPerBridge: true,
    sort: 'output',
  });
  return NextResponse.json(quote);
}
