import bungeeApi from '@/utils/server/api/BungeeApi';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const quote = await bungeeApi.buildTx(body);
  return NextResponse.json(quote);
}
