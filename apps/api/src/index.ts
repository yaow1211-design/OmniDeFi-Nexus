import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getPYUSDPrice, convertToUSD } from './services/pyth-price.js';
import {
  queryTransfers,
  queryDailyStats,
  getAddressBalance,
  getTotalVolumeInRange,
  countTransfersInRange,
  checkEnvioHealth
} from './services/envio-client.js';
import {
  initializeDiscordBot,
  startMonitoring,
  getAlertHistory,
  getAlertById,
  getActiveAlerts,
  sendTestAlert
} from './services/alert-service.js';

// Load environment variables
dotenv.config();

// Configuration validation
const requiredEnvVars = [
  'TREASURY_ADDRESS'
] as const;

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
const isProduction = process.env.NODE_ENV === 'production';
if (missingVars.length > 0) {
  if (isProduction) {
    console.error('❌ Missing required environment variables:');
    for (const v of missingVars) console.error(`  - ${v}`);
    process.exit(1);
  } else {
    console.warn('⚠️ Missing env vars in development, using safe defaults:');
    for (const v of missingVars) console.warn(`  - ${v}`);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Treasury address (required in prod; dev falls back for graceful startup)
const TREASURY_ADDRESS = (process.env.TREASURY_ADDRESS as string) || '0x0000000000000000000000000000000000000000';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Discord bot and monitoring (async)
let discordEnabled = false;
initializeDiscordBot().then((enabled) => {
  discordEnabled = enabled;
  // Start monitoring regardless of Discord status (decoupled)
  setTimeout(() => {
    startMonitoring();
  }, 2000);
});

// Health check
app.get('/health', async (req, res) => {
  const envioHealthy = await checkEnvioHealth();
  
  res.json({ 
    status: envioHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'OmniChain DeFi Nexus API',
    dependencies: {
      envio: envioHealthy ? 'up' : 'down'
    }
  });
});

// Get recent transfers
app.get('/api/transfers', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transfers = await queryTransfers(limit, offset);
    
    // Optimize: fetch price once and compute synchronously
    const price = await getPYUSDPrice();
    const transfersWithUSD = transfers.map((tx) => ({
      ...tx,
      valueUSD: (Number(tx.value) / 1e6) * price.price
    }));
    
    res.json({
      transfers: transfersWithUSD,
      total: transfers.length,
      hasMore: transfers.length === limit
    });
  } catch (error: any) {
    console.error('Failed to fetch transfers:', error);
    res.status(500).json({
      error: 'Failed to fetch transfers',
      message: error.message
    });
  }
});

// Get Treasury value
app.get('/api/treasury/value', async (req, res) => {
  try {
    const price = await getPYUSDPrice();
    const balance = await getAddressBalance(TREASURY_ADDRESS);
    const balanceInTokens = Number(balance) / 1e6; // Assuming 6 decimals
    const totalValue = balanceInTokens * price.price;
    
    res.json({
      totalValue,
      balance: balanceInTokens,
      balanceWei: balance.toString(),
      price: price.price,
      priceSource: price.source,
      timestamp: Date.now(),
      lastUpdate: new Date(price.timestamp).toISOString()
    });
  } catch (error: any) {
    console.error('Failed to calculate treasury value:', error);
    res.status(500).json({
      error: 'Failed to calculate treasury value',
      message: error.message
    });
  }
});

// Get 24H volume
app.get('/api/volume/24h', async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 24 * 60 * 60;
    
    const txCount = await countTransfersInRange(oneDayAgo, now);
    const totalVolume = await getTotalVolumeInRange(oneDayAgo, now);
    const volumeUSD = await convertToUSD(totalVolume);
    
    res.json({
      volume: volumeUSD,
      volumeWei: totalVolume.toString(),
      txCount,
      period: '24h',
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Failed to calculate 24h volume:', error);
    res.status(500).json({
      error: 'Failed to calculate 24h volume',
      message: error.message
    });
  }
});

// Get volume history
app.get('/api/volume/history', async (req, res) => {
  try {
    const period = (req.query.period as string) || '7d';
    const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
    
    const stats = await queryDailyStats(days);
    
    // Calculate USD values for each day
    const price = await getPYUSDPrice();
    const data = stats.map(day => ({
      date: new Date(day.date * 1000).toISOString().split('T')[0],
      volume: (Number(day.totalVolume) / 1e6) * price.price,
      volumeWei: day.totalVolume,
      txCount: day.txCount,
      uniqueUsers: day.uniqueSenders + day.uniqueReceivers
    }));
    
    res.json({ data, period });
  } catch (error: any) {
    console.error('Failed to fetch volume history:', error);
    res.status(500).json({
      error: 'Failed to fetch volume history',
      message: error.message
    });
  }
});

// Get PYUSD price
app.get('/api/price/pyusd', async (req, res) => {
  try {
    const price = await getPYUSDPrice();
    res.json(price);
  } catch (error: any) {
    console.error('Failed to fetch PYUSD price:', error);
    res.status(500).json({
      error: 'Failed to fetch PYUSD price',
      message: error.message
    });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activeOnly = req.query.active === 'true';
    
    const alerts = activeOnly ? getActiveAlerts() : getAlertHistory(limit);
    
    res.json({
      alerts,
      count: alerts.length,
      discordEnabled
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

// Get alert by ID
app.get('/api/alerts/:id', async (req, res) => {
  try {
    const alert = getAlertById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    res.json(alert);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch alert',
      message: error.message
    });
  }
});

// Send test alert
app.post('/api/alerts/test', async (req, res) => {
  try {
    const alert = await sendTestAlert();
    res.json({
      success: true,
      alert,
      message: 'Test alert sent'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to send test alert',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Treasury address: ${TREASURY_ADDRESS}`);
  console.log('');
  console.log('📡 API Endpoints:');
  console.log(`  GET /api/transfers`);
  console.log(`  GET /api/treasury/value`);
  console.log(`  GET /api/volume/24h`);
  console.log(`  GET /api/volume/history?period=7d`);
  console.log(`  GET /api/price/pyusd`);
  console.log(`  GET /api/alerts`);
});

