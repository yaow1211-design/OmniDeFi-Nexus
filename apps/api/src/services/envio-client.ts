/**
 * Envio GraphQL Client
 * 
 * Queries the Envio indexer for blockchain data
 */

import axios from 'axios';

const ENVIO_GRAPHQL_URL = process.env.ENVIO_API_URL || 'http://localhost:8080/v1/graphql';

export interface Transfer {
  id: string;
  from: string;
  to: string;
  value: string;
  valueUSD?: number;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface DailyStats {
  id: string;
  date: number;
  txCount: number;
  totalVolume: string;
  totalVolumeUSD?: number;
  uniqueSenders: number;
  uniqueReceivers: number;
}

/**
 * Query recent transfers
 */
export async function queryTransfers(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    from?: string;
    to?: string;
    minValue?: string;
  }
): Promise<Transfer[]> {
  const whereClause = buildWhereClause(filters);
  
  const query = `
    query GetTransfers($limit: Int!, $offset: Int!) {
      Transfer(
        limit: $limit
        offset: $offset
        ${whereClause ? `where: ${whereClause}` : ''}
        order_by: { timestamp: desc }
      ) {
        id
        from
        to
        value
        valueUSD
        timestamp
        blockNumber
        transactionHash
        logIndex
      }
    }
  `;
  
  try {
    const response = await axios.post(
      ENVIO_GRAPHQL_URL,
      {
        query,
        variables: { limit, offset }
      },
      {
        timeout: 10000
      }
    );
    
    if (response.data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
    }
    
    return response.data.data.Transfer || [];
  } catch (error) {
    console.error('Failed to query transfers:', error);
    throw new Error('Failed to fetch transfers from Envio');
  }
}

/**
 * Query transfers for a specific address
 */
export async function queryAddressTransfers(
  address: string,
  limit: number = 100
): Promise<Transfer[]> {
  const query = `
    query GetAddressTransfers($address: String!, $limit: Int!) {
      Transfer(
        limit: $limit
        where: {
          _or: [
            { from: { _eq: $address } }
            { to: { _eq: $address } }
          ]
        }
        order_by: { timestamp: desc }
      ) {
        id
        from
        to
        value
        valueUSD
        timestamp
        blockNumber
        transactionHash
      }
    }
  `;
  
  const response = await axios.post(ENVIO_GRAPHQL_URL, {
    query,
    variables: { address: address.toLowerCase(), limit }
  });
  
  return response.data.data.Transfer || [];
}

/**
 * Query daily statistics
 */
export async function queryDailyStats(
  days: number = 30
): Promise<DailyStats[]> {
  const query = `
    query GetDailyStats($limit: Int!) {
      DailyStats(
        limit: $limit
        order_by: { date: desc }
      ) {
        id
        date
        txCount
        totalVolume
        totalVolumeUSD
        uniqueSenders
        uniqueReceivers
      }
    }
  `;
  
  const response = await axios.post(ENVIO_GRAPHQL_URL, {
    query,
    variables: { limit: days }
  });
  
  return response.data.data.DailyStats || [];
}

/**
 * Get transfer count in time range
 */
export async function countTransfersInRange(
  startTimestamp: number,
  endTimestamp: number
): Promise<number> {
  const query = `
    query CountTransfers($start: Int!, $end: Int!) {
      Transfer(
        where: {
          timestamp: { _gte: $start, _lte: $end }
        }
      ) {
        id
      }
    }
  `;
  
  const response = await axios.post(ENVIO_GRAPHQL_URL, {
    query,
    variables: { start: startTimestamp, end: endTimestamp }
  });
  
  return response.data.data.Transfer?.length || 0;
}

/**
 * Get total volume in time range
 */
export async function getTotalVolumeInRange(
  startTimestamp: number,
  endTimestamp: number
): Promise<bigint> {
  const query = `
    query GetVolume($start: Int!, $end: Int!) {
      Transfer(
        where: {
          timestamp: { _gte: $start, _lte: $end }
        }
      ) {
        value
      }
    }
  `;
  
  const response = await axios.post(ENVIO_GRAPHQL_URL, {
    query,
    variables: { start: startTimestamp, end: endTimestamp }
  });
  
  const transfers = response.data.data.Transfer || [];
  return transfers.reduce((sum: bigint, tx: Transfer) => {
    return sum + BigInt(tx.value);
  }, 0n);
}

/**
 * Get balance of an address (sum of received - sent)
 */
export async function getAddressBalance(address: string): Promise<bigint> {
  const query = `
    query GetBalance($address: String!) {
      AddressBalance(
        where: { id: { _eq: $address } }
      ) {
        id
        balance
        lastUpdate
      }
    }
  `;
  
  try {
    const response = await axios.post(ENVIO_GRAPHQL_URL, {
      query,
      variables: { address: address.toLowerCase() }
    });
    
    const balances = response.data.data.AddressBalance || [];
    if (balances.length === 0) {
      return 0n;
    }
    
    return BigInt(balances[0].balance);
  } catch (error) {
    console.error('Failed to get address balance:', error);
    return 0n;
  }
}

/**
 * Helper: Build WHERE clause from filters
 */
function buildWhereClause(filters?: {
  from?: string;
  to?: string;
  minValue?: string;
}): string | null {
  if (!filters) return null;
  
  const conditions: string[] = [];
  
  if (filters.from) {
    conditions.push(`from: { _eq: "${filters.from.toLowerCase()}" }`);
  }
  
  if (filters.to) {
    conditions.push(`to: { _eq: "${filters.to.toLowerCase()}" }`);
  }
  
  if (filters.minValue) {
    conditions.push(`value: { _gte: "${filters.minValue}" }`);
  }
  
  if (conditions.length === 0) return null;
  
  return `{ ${conditions.join(', ')} }`;
}

/**
 * Health check for Envio indexer
 */
export async function checkEnvioHealth(): Promise<boolean> {
  try {
    const query = `
      query {
        Transfer(limit: 1) {
          id
        }
      }
    `;
    
    const response = await axios.post(
      ENVIO_GRAPHQL_URL,
      { query },
      { timeout: 5000 }
    );
    
    return !response.data.errors;
  } catch (error) {
    return false;
  }
}

