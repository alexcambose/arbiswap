import { GetQuoteRequestParams } from '@/types/ApiTypes';
import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { chainID, owner, allowanceTarget, tokenAddress } =
    await request.json();
  const response = await bungeeApi.checkAllowance({
    chainID,
    owner,
    allowanceTarget,
    tokenAddress,
  });
  return NextResponse.json(response);
}
