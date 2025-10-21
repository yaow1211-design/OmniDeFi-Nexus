/**
 * TransfersList - Display recent transactions
 */

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { apiClient, shortenAddress, formatPYUSD, formatTimestamp } from '../lib/api-client';
import type { Transfer } from '../lib/api-client';

export function TransfersList({ limit = 10 }: { limit?: number }) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [limit]);

  const fetchData = async () => {
    try {
      const data = await apiClient.getTransfers(limit);
      setTransfers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Recent Transactions"
      subtitle={`Latest ${limit} transfers`}
      icon="💸"
      loading={loading}
      error={error || undefined}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">From</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">To</th>
              <th className="text-right py-3 px-2 font-medium text-gray-600">Amount</th>
              <th className="text-right py-3 px-2 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No transfers found
                </td>
              </tr>
            )}
            {transfers.map((transfer) => (
              <tr 
                key={transfer.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-2">
                  <a
                    href={`https://sepolia.etherscan.io/address/${transfer.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                  >
                    {shortenAddress(transfer.from)}
                  </a>
                </td>
                <td className="py-3 px-2">
                  <a
                    href={`https://sepolia.etherscan.io/address/${transfer.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                  >
                    {shortenAddress(transfer.to)}
                  </a>
                </td>
                <td className="py-3 px-2 text-right font-medium">
                  {formatPYUSD(transfer.value)} PYUSD
                </td>
                <td className="py-3 px-2 text-right text-gray-600 text-xs">
                  {formatTimestamp(transfer.timestamp * 1000)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {transfers.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchData}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ↻ Refresh
          </button>
        </div>
      )}
    </Card>
  );
}




