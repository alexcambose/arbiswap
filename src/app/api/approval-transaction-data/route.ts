import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chainID = searchParams.get('chainID');
  const owner = searchParams.get('owner');
  const allowanceTarget = searchParams.get('allowanceTarget');
  const tokenAddress = searchParams.get('tokenAddress');
  const amount = searchParams.get('amount');

  if (!chainID || !owner || !allowanceTarget || !tokenAddress || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const response = await bungeeApi.buildApprovalTx({
    chainID,
    owner,
    allowanceTarget,
    tokenAddress,
    amount,
  });
  return NextResponse.json(response);
}
