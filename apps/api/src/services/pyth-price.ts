/**
 * Pyth Network Price Service
 * 
 * Fetches real-time price data from Pyth Network
 * Docs: https://docs.pyth.network/price-feeds
 */

import axios from 'axios';

// Pyth Hermes API endpoint
const PYTH_HERMES_ENDPOINT = process.env.PYTH_ENDPOINT || 'https://hermes.pyth.network';

/**
 * Pyth Price Feed IDs
 * Find more at: https://pyth.network/developers/price-feed-ids
 */
export const PRICE_FEED_IDS = {
  // PYUSD/USD price feed
  // Note: This is a placeholder. Get real ID from Pyth documentation
  PYUSD: '0x6e...', // TODO: Replace with actual Pyth PYUSD feed ID
  
  // Backup: Use USDC/USD as proxy (PYUSD ≈ $1)
  USDC: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
} as const;

export interface PriceData {
  symbol: string;
  price: number;
  confidence: number;
  timestamp: number;
  source: string;
}

/**
 * 价格缓存（简单内存缓存）
 * 避免频繁请求Pyth API
 */
const priceCache = new Map<string, { data: PriceData; expiry: number }>();
const CACHE_DURATION = 10 * 1000; // 10秒缓存

/**
 * Get PYUSD price from Pyth Network
 * Falls back to $1.00 if Pyth is unavailable
 */
export async function getPYUSDPrice(): Promise<PriceData> {
  const cacheKey = 'PYUSD';
  
  // 检查缓存
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  
  try {
    // 方案1: 尝试获取真实PYUSD价格
    // const priceData = await fetchPythPrice(PRICE_FEED_IDS.PYUSD);
    
    // 方案2 (MVP): 使用USDC作为代理（PYUSD ≈ USDC ≈ $1）
    const priceData = await fetchPythPrice(PRICE_FEED_IDS.USDC, 'PYUSD');
    
    // 缓存价格
    priceCache.set(cacheKey, {
      data: priceData,
      expiry: Date.now() + CACHE_DURATION
    });
    
    return priceData;
  } catch (error) {
    console.warn('Failed to fetch Pyth price, using fallback:', error);
    
    // Fallback: PYUSD is a stablecoin, return $1.00
    return {
      symbol: 'PYUSD',
      price: 1.0,
      confidence: 0.001,
      timestamp: Date.now(),
      source: 'Fallback (Stablecoin)'
    };
  }
}

/**
 * Fetch price from Pyth Network
 */
async function fetchPythPrice(
  priceId: string,
  symbolOverride?: string
): Promise<PriceData> {
  const url = `${PYTH_HERMES_ENDPOINT}/v2/updates/price/latest`;
  
  const response = await axios.get(url, {
    params: {
      ids: [priceId],
    },
    timeout: 5000
  });
  
  const priceFeeds = response.data.parsed;
  if (!priceFeeds || priceFeeds.length === 0) {
    throw new Error('No price feed data returned');
  }
  
  const feed = priceFeeds[0];
  const price = parseFloat(feed.price.price) * Math.pow(10, feed.price.expo);
  const confidence = parseFloat(feed.price.conf) * Math.pow(10, feed.price.expo);
  
  return {
    symbol: symbolOverride || 'Unknown',
    price,
    confidence,
    timestamp: feed.price.publish_time * 1000, // Convert to milliseconds
    source: 'Pyth Network'
  };
}

/**
 * Get multiple asset prices at once
 */
export async function getMultiplePrices(
  symbols: string[]
): Promise<Record<string, PriceData>> {
  const prices: Record<string, PriceData> = {};
  
  // For now, only support PYUSD
  for (const symbol of symbols) {
    if (symbol === 'PYUSD') {
      prices[symbol] = await getPYUSDPrice();
    }
  }
  
  return prices;
}

/**
 * Convert token amount to USD value
 */
export async function convertToUSD(
  amount: bigint,
  decimals: number = 6 // PYUSD has 6 decimals
): Promise<number> {
  const price = await getPYUSDPrice();
  const amountInTokens = Number(amount) / Math.pow(10, decimals);
  return amountInTokens * price.price;
}

/**
 * Clear price cache (useful for testing)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}







