/*
 * Event Handlers for OmniChain DeFi Indexer
 * 
 * This file contains handlers for blockchain events.
 * Each handler processes an event and stores the data in the database.
 */

import { PYUSD } from "../generated/src/Handlers.gen.js";
import type { Transfer_t } from "../generated/src/db/Entities.gen.js";
import type { DailyStats_t } from "../generated/src/db/Entities.gen.js";
import type { handlerContext } from "../generated/src/Types.gen.js";
import type { PYUSD_Transfer_event } from "../generated/src/Types.gen.js";

/**
 * Handler for PYUSD Transfer events
 * Triggered whenever tokens are transferred
 */
PYUSD.Transfer.handler(async ({ event, context }: { event: PYUSD_Transfer_event; context: handlerContext }) => {
  const { from, to, value } = event.params;
  
  // Create unique ID using block hash and log index
  const transferId = `${event.block.hash}-${event.logIndex}`;
  
  // Get date for daily stats (YYYY-MM-DD format)
  const timestamp = event.block.timestamp;
  const blockNumber = event.block.number;
  const date = new Date(timestamp * 1000);
  const dateStr = date.toISOString().split('T')[0];
  
  // Create Transfer entity
  const transfer: Transfer_t = {
    id: transferId,
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    value: value,
    valueUSD: undefined, // Will be calculated by API using Pyth price
    blockNumber: event.block.number,
    timestamp: timestamp,
    transactionHash: event.block.hash, // Using block hash since transaction hash is not available
    logIndex: event.logIndex,
  };
  
  // Save transfer to database
  context.Transfer.set(transfer);
  
  // Update address balances (O(1))
  await updateAddressBalance(
    context,
    from.toLowerCase(),
    value,
    false, // outgoing
    timestamp,
    blockNumber
  );
  
  await updateAddressBalance(
    context,
    to.toLowerCase(),
    value,
    true, // incoming
    timestamp,
    blockNumber
  );
  
  // Update daily statistics
  await updateDailyStats(
    context,
    dateStr,
    timestamp,
    from.toLowerCase(),
    to.toLowerCase(),
    value
  );
  
  // Log for debugging
  console.log(`📊 Indexed Transfer: ${from} → ${to}, Value: ${value.toString()}`);
});

/**
 * Update or create daily statistics
 */
async function updateDailyStats(
  context: handlerContext,
  dateStr: string,
  timestamp: number,
  from: string,
  to: string,
  value: bigint
) {
  // Try to load existing stats for this date
  let stats = await context.DailyStats.get(dateStr);
  
  if (!stats) {
    // Create new stats entry
    const newStats: DailyStats_t = {
      id: dateStr,
      date: Math.floor(new Date(dateStr).getTime() / 1000),
      txCount: 1,
      totalVolume: value,
      totalVolumeUSD: undefined,
      uniqueSenders: 0,
      uniqueReceivers: 0,
    };
    context.DailyStats.set(newStats);
  } else {
    // Update existing stats by creating a new object
    const updatedStats: DailyStats_t = {
      ...stats,
      txCount: stats.txCount + 1,
      totalVolume: stats.totalVolume + value,
    };
    context.DailyStats.set(updatedStats);
  }
}

/**
 * Update address balance in real-time
 */
async function updateAddressBalance(
  context: handlerContext,
  address: string,
  amount: bigint,
  isIncoming: boolean,
  timestamp: number,
  blockNumber: number
) {
  let current = await context.AddressBalance.get(address);
  
  if (!current) {
    current = {
      id: address,
      balance: isIncoming ? amount : -amount,
      totalReceived: isIncoming ? amount : 0n,
      totalSent: isIncoming ? 0n : amount,
      incomingCount: isIncoming ? 1 : 0,
      outgoingCount: isIncoming ? 0 : 1,
      lastUpdate: timestamp,
      lastBlock: blockNumber,
    } as any;
  } else {
    current = {
      ...current,
      balance: current.balance + (isIncoming ? amount : -amount),
      totalReceived: current.totalReceived + (isIncoming ? amount : 0n),
      totalSent: current.totalSent + (isIncoming ? 0n : amount),
      incomingCount: current.incomingCount + (isIncoming ? 1 : 0),
      outgoingCount: current.outgoingCount + (isIncoming ? 0 : 1),
      lastUpdate: timestamp,
      lastBlock: blockNumber,
    } as any;
  }
  
  context.AddressBalance.set(current);
}