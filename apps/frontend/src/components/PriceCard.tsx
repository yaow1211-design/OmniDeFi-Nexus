/**
 * PriceCard - Display PYUSD real-time price
 */

import { useEffect, useState } from 'react';
import { Card, CardStat } from './ui/Card';
import { apiClient, formatUSD } from '../lib/api-client';
import type { PriceData } from '../lib/api-client';

export function PriceCard() {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const result = await apiClient.getPYUSDPrice();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="PYUSD Price"
      subtitle="Real-time from Pyth Network"
      icon="📊"
      loading={loading}
      error={error || undefined}
    >
      {data && (
        <div className="space-y-4">
          <CardStat
            label="Current Price"
            value={formatUSD(data.price)}
            icon="💲"
            color="purple"
          />
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium text-gray-900">
                ±{formatUSD(data.confidence)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Source:</span>
              <span className="font-medium text-gray-900">{data.source}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </Card>
  );
}




