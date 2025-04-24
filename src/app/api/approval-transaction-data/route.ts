import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { chainID, owner, allowanceTarget, tokenAddress, amount } =
    await request.json();
  const response = await bungeeApi.buildApprovalTx({
    chainID,
    owner,
    allowanceTarget,
    tokenAddress,
    amount,
  });
  return NextResponse.json(response);
}
