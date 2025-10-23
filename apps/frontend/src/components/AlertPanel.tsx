/**
 * AlertPanel - Display system alerts
 */

import { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { apiClient, formatTimestamp } from '../lib/api-client';
import type { Alert } from '../lib/api-client';

export function AlertPanel({ activeOnly = false, limit = 10 }: { activeOnly?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [discordEnabled, setDiscordEnabled] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [activeOnly, limit]);

  const fetchData = async () => {
    try {
      const data = await apiClient.getAlerts(limit, activeOnly);
      setAlerts(data.alerts);
      setDiscordEnabled(data.discordEnabled);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-red-200 text-red-900 border-red-300',
    };
    return colors[severity];
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    const icons = {
      low: '🔵',
      medium: '🟡',
      high: '🔴',
      critical: '🚨',
    };
    return icons[severity];
  };

  return (
    <Card
      title="System Alerts"
      subtitle={
        discordEnabled
          ? '🟢 Discord notifications enabled'
          : '🔴 Discord not configured'
      }
      icon="⚠️"
      loading={loading}
      error={error || undefined}
    >
      <div className="space-y-3">
        {alerts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            ✅ No alerts found
          </div>
        )}
        
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              border rounded-lg p-4 transition-all
              ${getSeverityColor(alert.severity)}
              ${alert.resolved ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                  <h4 className="font-semibold">{alert.title}</h4>
                  {alert.resolved && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1">{alert.description}</p>
                
                {/* Alert data */}
                {alert.data && Object.keys(alert.data).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(alert.data).map(([key, value]) => (
                      <div key={key} className="text-xs flex items-center gap-2">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs mt-2 opacity-75">
              {formatTimestamp(alert.timestamp)}
            </div>
          </div>
        ))}
      </div>
      
      {alerts.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchData}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ↻ Refresh Alerts
          </button>
        </div>
      )}
    </Card>
  );
}







