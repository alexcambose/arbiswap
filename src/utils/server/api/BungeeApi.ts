import {
  BuildTxRequest,
  BuildTxResponse,
  CheckAllowanceRequest,
  CheckAllowanceResponse,
  GetQuoteRequestParams,
  BuildApprovalTxRequest,
  BuildApprovalTxResponse,
  GetBridgeStatusResponse,
  GetBridgeStatusRequest,
  GetQuoteResponse,
} from '@/types/BungeeApi';
import fetch from 'node-fetch';

class BungeeAPI {
  private readonly baseUrl = 'https://api.socket.tech/v2/quote';
  private readonly headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      'API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
  private buildQuery(params: object): string {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          query.append(key, v);
        }
      } else if (value !== undefined) {
        query.append(key, String(value));
      }
    }
    return query.toString();
  }
  /**
   * Fetches a quote for a swap
   * @param params - The parameters for the quote
   * @returns The quote
   */
  public async getQuote(
    params: GetQuoteRequestParams
  ): Promise<GetQuoteResponse> {
    const queryString = this.buildQuery(params);
    const url = `${this.baseUrl}?${queryString}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return (await response.json()) as GetQuoteResponse;
    } catch (error) {
      console.error('Error fetching from-token-list:', error);
      throw error;
    }
  }
  /**
   * Builds a transaction for a swap
   * @param data - The data for the transaction
   * @returns The transaction
   */
  public async buildTx(data: BuildTxRequest): Promise<BuildTxResponse> {
    const res = await fetch('https://api.socket.tech/v2/build-tx', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    console.log(JSON.stringify(data), { res });
    if (!res.ok) {
      throw new Error(`Failed to fetch build-tx: ${res.statusText}`);
    }

    const json = await res.json();
    return json as BuildTxResponse;
  }

  /**
   * Checks if the allowance is sufficient for a swap
   * @param params - The parameters for the allowance check
   * @returns The allowance check
   */
  public async checkAllowance(
    params: CheckAllowanceRequest
  ): Promise<CheckAllowanceResponse> {
    const queryParams = new URLSearchParams({
      chainID: params.chainID,
      owner: params.owner,
      allowanceTarget: params.allowanceTarget,
      tokenAddress: params.tokenAddress,
    });
    const response = await fetch(
      `https://api.socket.tech/v2/approval/check-allowance?${queryParams.toString()}`,
      {
        headers: this.headers,
        method: 'GET',
      }
    );

    return response.json() as Promise<CheckAllowanceResponse>;
  }

  /**
   * Builds an approval transaction for a swap
   * @param params - The parameters for the approval transaction
   * @returns The approval transaction
   */
  public async buildApprovalTx(
    params: BuildApprovalTxRequest
  ): Promise<BuildApprovalTxResponse> {
    const queryParams = new URLSearchParams({
      chainID: params.chainID,
      owner: params.owner,
      allowanceTarget: params.allowanceTarget,
      tokenAddress: params.tokenAddress,
      amount: params.amount,
    });
    const response = await fetch(
      `https://api.socket.tech/v2/approval/build-tx?${queryParams.toString()}`,
      {
        headers: this.headers,
        method: 'GET',
      }
    );

    return response.json() as Promise<BuildApprovalTxResponse>;
  }

  /**
   * Fetches the bridging status for a transaction
   * @param params - The parameters for the bridging status
   * @returns The bridging status
   */
  public async getBridgeStatus(
    params: GetBridgeStatusRequest
  ): Promise<GetBridgeStatusResponse> {
    const queryParams = new URLSearchParams({
      transactionHash: params.transactionHash,
      fromChainId: params.fromChainId,
      toChainId: params.toChainId || '',
      bridgeName: params.bridgeName || '',
      isBridgeProtectionTx: params.isBridgeProtectionTx ? 'true' : 'false',
    });
    const response = await fetch(
      `https://api.socket.tech/v2/bridge-status?${queryParams.toString()}`,
      {
        headers: this.headers,
        method: 'GET',
      }
    );

    return response.json() as Promise<GetBridgeStatusResponse>;
  }
}

if (!process.env.BUNGEE_API_KEY) {
  throw new Error('BUNGEE_API_KEY is not set');
}

const bungeeApi = new BungeeAPI(process.env.BUNGEE_API_KEY);

export default bungeeApi;
