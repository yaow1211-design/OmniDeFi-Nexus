/**
 * Alert Service - Discord Notification System
 * 
 * Monitors transactions and sends alerts to Discord
 */

import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from 'discord.js';
import { queryTransfers } from './envio-client.js';
import { convertToUSD } from './pyth-price.js';

// Alert thresholds
const ALERT_THRESHOLDS = {
  LARGE_TRANSACTION: 100000, // $100,000 USD
  TREASURY_LOW_YIELD: 0.04,  // 4% APY
  INDEXER_STALE: 600,        // 10 minutes
};

// Alert storage (in-memory for MVP)
interface Alert {
  id: string;
  type: 'large_transaction' | 'treasury_yield' | 'indexer_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  timestamp: number;
  resolved: boolean;
}

const alertHistory: Alert[] = [];
let lastIndexedTimestamp = Date.now();

// Discord client
let discordClient: Client | null = null;
let alertChannelId: string | null = null;

/**
 * Initialize Discord bot
 */
export async function initializeDiscordBot(): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  
  if (!token || !channelId) {
    console.warn('⚠️  Discord bot not configured (DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID missing)');
    return false;
  }
  
  try {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });
    
    discordClient.once('ready', () => {
      console.log(`✅ Discord bot logged in as ${discordClient!.user!.tag}`);
    });
    
    await discordClient.login(token);
    alertChannelId = channelId;
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Discord bot:', error);
    return false;
  }
}

/**
 * Send alert to Discord
 */
async function sendDiscordAlert(alert: Alert): Promise<boolean> {
  if (!discordClient || !alertChannelId) {
    console.log('Discord not configured, alert logged:', alert.title);
    return false;
  }
  
  try {
    const channel = await discordClient.channels.fetch(alertChannelId) as TextChannel;
    
    if (!channel || !channel.isTextBased()) {
      throw new Error('Invalid channel');
    }
    
    // Create embed with color based on severity
    const colors = {
      low: 0x3498db,      // Blue
      medium: 0xf39c12,   // Orange
      high: 0xe74c3c,     // Red
      critical: 0x992d22, // Dark Red
    };
    
    const embed = new EmbedBuilder()
      .setTitle(getSeverityEmoji(alert.severity) + ' ' + alert.title)
      .setDescription(alert.description)
      .setColor(colors[alert.severity])
      .setTimestamp(alert.timestamp)
      .setFooter({ text: 'OmniChain DeFi Nexus Alert System' });
    
    // Add data fields
    if (alert.data) {
      Object.entries(alert.data).forEach(([key, value]) => {
        embed.addFields({
          name: formatFieldName(key),
          value: String(value),
          inline: true
        });
      });
    }
    
    await channel.send({ embeds: [embed] });
    console.log(`✅ Alert sent to Discord: ${alert.title}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send Discord alert:', error);
    return false;
  }
}

/**
 * Create and store an alert
 */
function createAlert(
  type: Alert['type'],
  severity: Alert['severity'],
  title: string,
  description: string,
  data?: any
): Alert {
  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    title,
    description,
    data: data || {},
    timestamp: Date.now(),
    resolved: false,
  };
  
  // Store in history (keep last 100)
  alertHistory.unshift(alert);
  if (alertHistory.length > 100) {
    alertHistory.pop();
  }
  
  // Send to Discord
  sendDiscordAlert(alert);
  
  return alert;
}

/**
 * Monitor large transactions
 */
async function checkLargeTransactions(): Promise<void> {
  try {
    // Get transfers from last 30 seconds
    const now = Math.floor(Date.now() / 1000);
    const thirtySecondsAgo = now - 30;
    
    const transfers = await queryTransfers(50, 0);
    
    for (const transfer of transfers) {
      // Skip if already checked
      if (transfer.timestamp < thirtySecondsAgo) continue;
      
      // Calculate USD value
      const valueUSD = await convertToUSD(BigInt(transfer.value));
      
      // Check if exceeds threshold
      if (valueUSD > ALERT_THRESHOLDS.LARGE_TRANSACTION) {
        // Check if we already alerted for this transaction
        const alreadyAlerted = alertHistory.some(
          a => a.type === 'large_transaction' && a.data.txHash === transfer.transactionHash
        );
        
        if (!alreadyAlerted) {
          createAlert(
            'large_transaction',
            'high',
            '🚨 Large Transaction Detected',
            `A transaction of $${valueUSD.toLocaleString()} was detected`,
            {
              'Amount': `$${valueUSD.toLocaleString()}`,
              'From': shortenAddress(transfer.from),
              'To': shortenAddress(transfer.to),
              'Transaction': `[View](https://sepolia.etherscan.io/tx/${transfer.transactionHash})`,
              'Block': transfer.blockNumber,
            }
          );
        }
      }
      
      // Update last indexed timestamp
      lastIndexedTimestamp = Date.now();
    }
  } catch (error) {
    console.error('Error checking large transactions:', error);
  }
}

/**
 * Monitor indexer health
 */
async function checkIndexerHealth(): Promise<void> {
  const timeSinceLastIndex = Date.now() - lastIndexedTimestamp;
  
  if (timeSinceLastIndex > ALERT_THRESHOLDS.INDEXER_STALE * 1000) {
    // Check if we already alerted recently
    const recentAlert = alertHistory.find(
      a => a.type === 'indexer_health' && 
           Date.now() - a.timestamp < 600000 // Don't spam, only alert every 10 min
    );
    
    if (!recentAlert) {
      createAlert(
        'indexer_health',
        'critical',
        '⚠️ Indexer Health Alert',
        `No new data indexed for ${Math.floor(timeSinceLastIndex / 60000)} minutes`,
        {
          'Status': 'Stale',
          'Last Update': new Date(lastIndexedTimestamp).toISOString(),
          'Duration': `${Math.floor(timeSinceLastIndex / 60000)} minutes`,
        }
      );
    }
  }
}

/**
 * Start monitoring
 */
export function startMonitoring(): void {
  console.log('🔍 Starting alert monitoring...');
  
  // Check large transactions every 30 seconds
  setInterval(() => {
    checkLargeTransactions();
  }, 30000);
  
  // Check indexer health every 5 minutes
  setInterval(() => {
    checkIndexerHealth();
  }, 300000);
  
  console.log('✅ Alert monitoring started');
  console.log(`   - Large transaction threshold: $${ALERT_THRESHOLDS.LARGE_TRANSACTION.toLocaleString()}`);
  console.log(`   - Checking every 30 seconds`);
}

/**
 * Get alert history
 */
export function getAlertHistory(limit: number = 20): Alert[] {
  return alertHistory.slice(0, limit);
}

/**
 * Get alert by ID
 */
export function getAlertById(id: string): Alert | undefined {
  return alertHistory.find(a => a.id === id);
}

/**
 * Resolve an alert
 */
export function resolveAlert(id: string): boolean {
  const alert = alertHistory.find(a => a.id === id);
  if (alert) {
    alert.resolved = true;
    return true;
  }
  return false;
}

/**
 * Get active alerts (unresolved)
 */
export function getActiveAlerts(): Alert[] {
  return alertHistory.filter(a => !a.resolved);
}

/**
 * Send a test alert
 */
export async function sendTestAlert(): Promise<Alert> {
  return createAlert(
    'large_transaction',
    'medium',
    '🧪 Test Alert',
    'This is a test alert from the OmniChain DeFi Nexus alert system',
    {
      'Status': 'Test',
      'Time': new Date().toISOString(),
      'System': 'Alert Service',
    }
  );
}

// Helper functions
function getSeverityEmoji(severity: Alert['severity']): string {
  const emojis = {
    low: '🔵',
    medium: '🟡',
    high: '🔴',
    critical: '🚨',
  };
  return emojis[severity];
}

function formatFieldName(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Export alert thresholds for testing
export { ALERT_THRESHOLDS };







