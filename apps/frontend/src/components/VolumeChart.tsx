/**
 * VolumeChart - Display historical volume using Recharts
 */

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';
import { apiClient, formatUSD } from '../lib/api-client';
import type { DailyStat } from '../lib/api-client';

interface ChartDataPoint {
  date: string;
  volume: number;
  transfers: number;
}

export function VolumeChart({ period = '7d' }: { period?: string }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stats = await apiClient.getVolumeHistory(period);
      
      // Transform data for chart
      const chartData = stats.map((stat: DailyStat) => ({
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(stat.totalVolume) / 1e6, // Convert to millions
        transfers: stat.transferCount,
      }));
      
      setData(chartData.reverse()); // Oldest first
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch volume data');
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-blue-600 font-semibold">
            Volume: {formatUSD(payload[0].value * 1e6)}
          </p>
          <p className="text-sm text-gray-600">
            Transfers: {payload[0].payload.transfers.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      title="Trading Volume"
      subtitle={`Last ${period}`}
      icon="📈"
      loading={loading}
      error={error || undefined}
    >
      {data.length > 0 && (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

