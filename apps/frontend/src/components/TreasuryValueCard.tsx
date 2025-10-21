/**
 * TreasuryValueCard - Display DAO treasury value
 */

import { useEffect, useState } from 'react';
import { Card, CardStat } from './ui/Card';
import { apiClient, formatUSD, formatPYUSD } from '../lib/api-client';
import type { TreasuryValueResponse } from '../lib/api-client';

export function TreasuryValueCard() {
  const [data, setData] = useState<TreasuryValueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const result = await apiClient.getTreasuryValue();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch treasury data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Treasury Value"
      subtitle="DAO Treasury Holdings"
      icon="💰"
      loading={loading}
      error={error || undefined}
    >
      {data && (
        <div className="space-y-4">
          <CardStat
            label="Total Value (USD)"
            value={formatUSD(data.valueUSD)}
            icon="💵"
            color="green"
          />
          <div className="border-t border-gray-200 pt-4">
            <CardStat
              label="PYUSD Balance"
              value={formatPYUSD(data.balancePYUSD)}
              icon="🪙"
              color="blue"
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </Card>
  );
}




