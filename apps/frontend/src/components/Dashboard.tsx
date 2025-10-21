/**
 * Dashboard Component - Main dashboard view
 */

import { useState } from 'react';
import { CardGrid } from './ui/Card';
import { TreasuryValueCard } from './TreasuryValueCard';
import { PriceCard } from './PriceCard';
import { VolumeChart } from './VolumeChart';
import { TransfersList } from './TransfersList';
import { TimeRangeSelector } from './TimeRangeSelector';
import { AlertPanel } from './AlertPanel';

export function Dashboard() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌐 OmniChain DeFi Nexus
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time Dashboard for Cross-chain DeFi & Commerce
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Network</p>
                <p className="font-medium text-blue-600">Sepolia Testnet</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" 
                   title="Live"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Key Metrics</h2>
          <CardGrid>
            <TreasuryValueCard />
            <PriceCard />
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">🎯 System Status</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span>API Server</span>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm">✅ Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pyth Oracle</span>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm">✅ Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Envio Indexer</span>
                  <span className="px-2 py-1 bg-white/20 rounded text-sm">⏳ Pending</span>
                </div>
              </div>
            </div>
          </CardGrid>
        </section>

        {/* Volume Chart */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-gray-900">📈 Trading Activity</h2>
            <TimeRangeSelector value={period} onChange={setPeriod} />
          </div>
          <VolumeChart period={period} />
        </section>

        {/* Two Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <TransfersList limit={10} />
          
          {/* Alerts */}
          <AlertPanel limit={5} />
        </section>

        {/* Footer Info */}
        <section className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by Blockscout · Envio · Pyth Network · Hedera · Avail</p>
          <p className="mt-2">Built for ETHOline 2025 Hackathon</p>
        </section>
      </main>
    </div>
  );
}
