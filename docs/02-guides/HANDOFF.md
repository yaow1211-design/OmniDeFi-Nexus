# 数据分析模块交接文档 📊

> **OmniChain DeFi & Commerce Nexus - Data Intelligence Layer**
>
> 本文档说明数据分析模块在整个项目中的定位、集成方式和使用指南

---

## 📋 目录

1. [模块概述](#1-模块概述)
2. [在整个项目中的定位](#2-在整个项目中的定位)
3. [技术架构](#3-技术架构)
4. [提供的功能与API](#4-提供的功能与api)
5. [与其他模块的集成](#5-与其他模块的集成)
6. [快速开始](#6-快速开始)
7. [部署指南](#7-部署指南)
8. [常见问题](#8-常见问题)

---

## 1. 模块概述

### 1.1 模块定位

**数据分析模块是整个OmniChain DeFi & Commerce Nexus协议的"神经系统"**，负责：

- 📊 **实时监控**：追踪所有跨链交易、Agent谈判、资产流动
- 💰 **财务健康**：管理DAO Treasury的资产、收益和支出
- 🔔 **智能警报**：关键事件的实时通知（大额交易、异常活动等）
- 📈 **数据智能**：为Agent决策提供历史数据和趋势分析

### 1.2 核心价值

在整个项目生态中，数据分析模块提供：

1. **透明度**：让DAO成员和用户实时看到协议运行状态
2. **决策支持**：为自治Agent提供数据基础（如最佳收益率、交易趋势）
3. **合规审计**：所有交易和Agent谈判的可追溯记录
4. **运营监控**：及时发现异常和风险

### 1.3 使用的赞助商技术

| 技术 | 用途 | 赞助商奖金 |
| :--- | :--- | :--- |
| **Blockscout SDK** | 链上数据聚合、Dashboard UI | $10,000 |
| **Envio** | 高性能事件索引和GraphQL API | 数据基础设施 |
| **Pyth Network** | 实时价格数据（PYUSD及其他资产） | 价格预言机 |

---

## 2. 在整个项目中的定位

### 2.1 完整用户旅程中的角色

让我们通过一个完整的用例，展示数据分析模块如何融入整个协议：

#### 场景：用户通过Avail跨链购买NFT

```
┌─────────────────────────────────────────────────────────────────┐
│  步骤1: 资产发现（Autoscout/Blockscout）                        │
│  - 用户浏览NFT列表                                               │
│  - 【数据模块】提供历史价格趋势、交易量数据                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤2: Agent自主谈判（Hedera Agent Kit）                       │
│  - Buyer Agent与Seller Agent协商                                │
│  - 【数据模块】记录所有谈判事件到Hedera HCS                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤3: 跨链结算（Avail Nexus + PYUSD）                         │
│  - 从Avalanche的USDC桥接到Polygon的PYUSD                        │
│  - 【数据模块】追踪跨链交易状态，计算Gas成本                     │
│  - 【数据模块】记录交易到数据库，更新交易量指标                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤4: DAO财政管理（PYUSD）                                     │
│  - 协议收取0.5%手续费                                            │
│  - 【数据模块】更新Treasury余额，计算收益率                      │
│  - 【数据模块】显示在Dashboard上，供DAO成员查看                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  步骤5: 实时监控与警报（Blockscout Dashboard）                  │
│  - 如果交易额>$100K，触发Discord警报                             │
│  - 【数据模块】发送通知给DAO管理员                               │
│  - 【数据模块】在Dashboard显示警报历史                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 与其他团队成员模块的关系

```
┌──────────────────┐
│  前端dApp        │ ──────┐
│ (Autoscout UI)   │       │
└──────────────────┘       │
                           │  读取数据展示
┌──────────────────┐       │  (交易历史、价格)
│  Agent服务       │ ──────┤
│ (Hedera Agents)  │       │
└──────────────────┘       ↓
                    ┌──────────────────┐
┌──────────────────┐│  数据分析模块     │
│  跨链桥接服务    ││  (你的部分)      │
│ (Avail Nexus)    │└──────────────────┘
└──────────────────┘       ↑
                           │  索引事件
┌──────────────────┐       │  (Transfer, Lock, etc.)
│  智能合约        │ ──────┘
│ (PYUSD, Escrow)  │
└──────────────────┘
```

**数据流向：**
1. **输入**：智能合约发出的事件（Transfer, AgentNegotiation, BridgeExecuted等）
2. **处理**：Envio索引 → 数据聚合 → 实时计算
3. **输出**：GraphQL API → 前端Dashboard / Agent决策逻辑

---

## 3. 技术架构

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    数据分析模块架构                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  前端层 (apps/frontend)                              │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │   │
│  │  │ Treasury   │  │ Volume     │  │ Alerts       │   │   │
│  │  │ Dashboard  │  │ Dashboard  │  │ Panel        │   │   │
│  │  └────────────┘  └────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↑                                  │
│                           │ REST API                         │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  后端API层 (apps/api)                                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │   │
│  │  │ Express    │  │ Pyth Price │  │ Discord      │   │   │
│  │  │ Server     │  │ Service    │  │ Alert Bot    │   │   │
│  │  └────────────┘  └────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↑                                  │
│                           │ GraphQL Query                    │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  数据索引层 (packages/indexer)                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Envio Indexer                                 │  │   │
│  │  │  - Event Handlers                              │  │   │
│  │  │  - PostgreSQL Storage                          │  │   │
│  │  │  - GraphQL API                                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↑                                  │
│                           │ Event Logs                       │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────────┐
              │   区块链数据源               │
              │  - PYUSD Contract           │
              │  - Hedera HTS/HCS           │
              │  - Avail Nexus Events       │
              └─────────────────────────────┘
```

### 3.2 技术栈

```yaml
数据索引:
  - Envio: 事件索引器
  - PostgreSQL: 数据存储
  - GraphQL: 查询接口

后端服务:
  - Node.js + Express: API服务器
  - Pyth Hermes Client: 价格数据
  - Discord.js: 警报通知
  - ethers.js: 区块链交互

前端:
  - React 18 + TypeScript
  - Vite: 构建工具
  - Tailwind CSS + shadcn/ui: UI组件
  - TanStack Query: 数据获取
  - Recharts: 图表库
```

---

## 4. 提供的功能与API

### 4.1 核心功能

#### 功能1: 实时交易监控

**描述**：追踪所有PYUSD转账，包括：
- 用户间转账
- 手续费收取
- Treasury收入/支出

**使用场景**：
- 在dApp中展示最近交易历史
- Agent在谈判时参考历史交易价格

#### 功能2: DAO Treasury管理

**描述**：实时计算和展示：
- Treasury总资产价值（USD）
- PYUSD余额
- 实时价格（Pyth）
- 历史收益率

**使用场景**：
- DAO治理决策
- 自动化薪酬发放监控

#### 功能3: 交易量统计

**描述**：聚合计算：
- 24小时交易量
- 7天/30天趋势
- 按链分类的交易量

**使用场景**：
- 协议健康度评估
- 营销数据展示

#### 功能4: 智能警报系统

**描述**：实时监控并通知：
- 大额交易（>$100K）
- 异常活动
- 系统健康问题

**使用场景**：
- 风险控制
- 运维监控

### 4.2 REST API端点

#### 基础URL
```
Development: http://localhost:3000
Production: https://api.omnichain-nexus.com
```

#### 端点列表

```typescript
// 1. 获取最近转账记录
GET /api/transfers
Query Parameters:
  - limit: number (default: 50, max: 100)
  - offset: number (default: 0)
Response:
{
  "transfers": [
    {
      "id": "0x...txhash-logIndex",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000", // in wei
      "valueUSD": 1000.00,
      "timestamp": 1234567890,
      "blockNumber": 12345,
      "txHash": "0x..."
    }
  ],
  "total": 1500,
  "hasMore": true
}

// 2. 获取Treasury总值
GET /api/treasury/value
Response:
{
  "totalValue": 1500000.50,  // USD
  "balance": 1500000.00,      // PYUSD
  "price": 1.0003,            // PYUSD/USD
  "timestamp": 1234567890,
  "lastUpdate": "2025-10-20T10:30:00Z"
}

// 3. 获取24小时交易量
GET /api/volume/24h
Response:
{
  "volume": 250000.00,        // USD
  "txCount": 142,
  "period": "24h",
  "timestamp": 1234567890
}

// 4. 获取历史交易量
GET /api/volume/history
Query Parameters:
  - period: "7d" | "30d" | "all" (default: "7d")
Response:
{
  "data": [
    {
      "date": "2025-10-20",
      "volume": 250000.00,
      "txCount": 142
    },
    // ...
  ]
}

// 5. 获取PYUSD实时价格
GET /api/price/pyusd
Response:
{
  "symbol": "PYUSD",
  "price": 1.0003,
  "confidence": 0.0001,
  "timestamp": 1234567890,
  "source": "Pyth Network"
}

// 6. 获取最新警报
GET /api/alerts
Query Parameters:
  - limit: number (default: 20)
  - severity: "low" | "medium" | "high" | "critical"
Response:
{
  "alerts": [
    {
      "id": "alert-1",
      "type": "large_transaction",
      "severity": "high",
      "title": "大额交易警报",
      "description": "检测到价值$150,000的PYUSD转账",
      "data": {
        "txHash": "0x...",
        "from": "0x...",
        "to": "0x...",
        "value": 150000.00
      },
      "timestamp": 1234567890,
      "resolved": false
    }
  ],
  "total": 5
}

// 7. 健康检查
GET /health
Response:
{
  "status": "ok",
  "timestamp": "2025-10-20T10:30:00Z",
  "service": "OmniChain DeFi Nexus API",
  "version": "1.0.0",
  "uptime": 86400
}
```

### 4.3 GraphQL API（Envio提供）

如果需要更灵活的查询，可以直接使用Envio的GraphQL端点：

```graphql
# GraphQL Endpoint
# Development: http://localhost:8080/graphql
# Production: https://envio.omnichain-nexus.com/graphql

# 查询示例1: 获取特定地址的转账历史
query GetAddressTransfers($address: String!) {
  transfers(
    where: {
      or: [
        { from: { _eq: $address } },
        { to: { _eq: $address } }
      ]
    }
    orderBy: { timestamp: desc }
    limit: 100
  ) {
    id
    from
    to
    value
    timestamp
    blockNumber
    transactionHash
  }
}

# 查询示例2: 获取时间范围内的交易统计
query GetVolumeStats($startTime: Int!, $endTime: Int!) {
  transfers(
    where: {
      timestamp: { _gte: $startTime, _lte: $endTime }
    }
  ) {
    value
    timestamp
  }
}

# 查询示例3: 获取大额交易
query GetLargeTransactions($minValue: BigInt!) {
  transfers(
    where: { value: { _gte: $minValue } }
    orderBy: { timestamp: desc }
    limit: 50
  ) {
    id
    from
    to
    value
    timestamp
    transactionHash
  }
}
```

---

## 5. 与其他模块的集成

### 5.1 与前端dApp集成

如果你负责前端dApp（Autoscout UI），可以这样集成数据模块：

#### 安装依赖
```bash
npm install @tanstack/react-query axios
```

#### 创建API客户端
```typescript
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

export const dataAPI = {
  // 获取最近交易
  getRecentTransfers: async (limit = 50) => {
    const { data } = await apiClient.get('/api/transfers', {
      params: { limit }
    });
    return data;
  },

  // 获取Treasury价值
  getTreasuryValue: async () => {
    const { data } = await apiClient.get('/api/treasury/value');
    return data;
  },

  // 获取交易量
  getVolume24h: async () => {
    const { data } = await apiClient.get('/api/volume/24h');
    return data;
  },

  // 获取价格
  getPYUSDPrice: async () => {
    const { data } = await apiClient.get('/api/price/pyusd');
    return data;
  },
};
```

#### 在React组件中使用
```typescript
// src/components/TreasuryWidget.tsx
import { useQuery } from '@tanstack/react-query';
import { dataAPI } from '@/lib/api-client';

export function TreasuryWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['treasury-value'],
    queryFn: dataAPI.getTreasuryValue,
    refetchInterval: 30000, // 每30秒刷新
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="treasury-widget">
      <h3>DAO Treasury</h3>
      <p className="value">${data.totalValue.toLocaleString()}</p>
      <p className="balance">{data.balance.toLocaleString()} PYUSD</p>
    </div>
  );
}
```

### 5.2 与Hedera Agent服务集成

如果你负责Agent服务，可以让Agent在决策时查询历史数据：

```typescript
// agent-service/src/data-intelligence.ts
import axios from 'axios';

const DATA_API = process.env.DATA_API_URL || 'http://localhost:3000';

export class DataIntelligence {
  // 获取资产的历史价格趋势
  async getAssetPriceTrend(assetId: string, days: number = 7) {
    const { data } = await axios.get(`${DATA_API}/api/volume/history`, {
      params: { period: `${days}d` }
    });
    return data;
  }

  // 获取当前PYUSD价格（用于估值）
  async getPYUSDPrice() {
    const { data } = await axios.get(`${DATA_API}/api/price/pyusd`);
    return data.price;
  }

  // 检查地址的信用历史（基于交易记录）
  async checkAddressReputation(address: string) {
    // 查询该地址的历史交易
    const { data } = await axios.get(`${DATA_API}/api/transfers`, {
      params: { address, limit: 100 }
    });
    
    return {
      totalTxCount: data.total,
      totalVolume: data.transfers.reduce((sum, tx) => sum + tx.valueUSD, 0),
      avgTxValue: data.transfers.length > 0 
        ? data.transfers.reduce((sum, tx) => sum + tx.valueUSD, 0) / data.transfers.length 
        : 0
    };
  }
}

// 在Agent中使用
export class BuyerAgent {
  private dataIntel = new DataIntelligence();

  async negotiate(nftPrice: number) {
    // 获取当前PYUSD价格
    const pyusdPrice = await this.dataIntel.getPYUSDPrice();
    
    // 转换为PYUSD数量
    const priceInPYUSD = nftPrice / pyusdPrice;
    
    // 获取卖家信用
    const sellerRep = await this.dataIntel.checkAddressReputation(
      this.sellerAddress
    );
    
    // 基于数据做决策
    if (sellerRep.totalTxCount > 10 && sellerRep.avgTxValue > 1000) {
      // 信用良好，可以接受
      return this.acceptOffer(priceInPYUSD);
    }
  }
}
```

### 5.3 与跨链桥接服务集成

如果你负责Avail Nexus集成，可以在跨链完成后通知数据模块：

```typescript
// avail-service/src/bridge-monitor.ts

// 方案1: 智能合约自动发出事件（推荐）
// Envio会自动索引这些事件，无需额外集成

// 方案2: 手动通知（如果Envio未覆盖）
import axios from 'axios';

export async function notifyBridgeCompleted(txData: BridgeTransaction) {
  await axios.post(`${DATA_API}/api/events/bridge-completed`, {
    txHash: txData.hash,
    fromChain: txData.sourceChain,
    toChain: txData.destinationChain,
    amount: txData.amount,
    asset: 'PYUSD',
    timestamp: Date.now()
  });
}
```

### 5.4 事件流集成

数据模块会自动索引以下事件，确保你的智能合约正确发出这些事件：

```solidity
// 在你的智能合约中确保发出这些事件

// PYUSD转账（ERC20标准）
event Transfer(address indexed from, address indexed to, uint256 value);

// 托管锁定（如果你有Escrow合约）
event AssetLocked(
    bytes32 indexed tradeId,
    address indexed asset,
    uint256 amount,
    uint256 timestamp
);

// 托管释放
event AssetReleased(
    bytes32 indexed tradeId,
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);

// Agent谈判完成（在Hedera HCS上记录）
event NegotiationComplete(
    bytes32 indexed agentId,
    bool success,
    uint256 duration
);

// 跨链桥接执行（Avail Nexus）
event BridgeExecuted(
    bytes32 indexed txHash,
    string fromChain,
    string toChain,
    uint256 amount
);
```

---

## 6. 快速开始

### 6.1 环境要求

```bash
Node.js >= 20.0.0
pnpm >= 8.0.0
PostgreSQL >= 15 (Envio需要)
```

### 6.2 安装步骤

```bash
# 1. 克隆仓库
git clone <repository-url>
cd omnichain-defi-nexus

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env文件，填入必要配置

# 4. 启动Envio索引器
cd packages/indexer
pnpm dev

# 5. 启动后端API（新终端）
cd apps/api
pnpm dev

# 6. 启动前端Dashboard（新终端）
cd apps/frontend
pnpm dev
```

### 6.3 配置指南

#### 必须配置的环境变量

```bash
# .env文件

# PYUSD合约地址（Sepolia测试网）
PYUSD_CONTRACT_ADDRESS=0x... # 从官方文档获取

# Treasury地址（DAO多签钱包）
TREASURY_ADDRESS=0x... # 你们的DAO Treasury地址

# Pyth Network配置
PYTH_ENDPOINT=https://hermes.pyth.network
PYUSD_PRICE_ID=0x... # 从Pyth官方获取

# Discord Bot配置
DISCORD_BOT_TOKEN=your_bot_token  # 创建Discord Bot
DISCORD_CHANNEL_ID=your_channel_id # 警报频道ID

# RPC端点
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY
```

#### 获取PYUSD合约地址

```bash
# Sepolia测试网
# 查看官方文档: https://paxos.com/pyusd/

# 或者使用已知的测试合约
PYUSD_CONTRACT_ADDRESS=0x... # 待确认
```

#### 配置Discord Bot

1. 访问 https://discord.com/developers/applications
2. 创建新应用 → 添加Bot
3. 复制Token
4. 邀请Bot到你的服务器
5. 获取频道ID（开发者模式）

### 6.4 验证安装

```bash
# 测试API是否运行
curl http://localhost:3000/health

# 应返回:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "service": "OmniChain DeFi Nexus API"
# }

# 测试Envio GraphQL
curl http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ transfers(limit: 1) { id from to value } }"}'
```

---

## 7. 部署指南

### 7.1 部署架构

```
┌─────────────────┐
│  Vercel         │  ← 前端Dashboard
│  (Frontend)     │
└─────────────────┘
        ↓ API调用
┌─────────────────┐
│  Railway        │  ← 后端API + PostgreSQL
│  (Backend API)  │
└─────────────────┘
        ↓ GraphQL查询
┌─────────────────┐
│  Railway/Envio  │  ← Envio索引器
│  (Indexer)      │
└─────────────────┘
        ↓ 读取事件
┌─────────────────┐
│  以太坊测试网    │  ← 区块链数据源
└─────────────────┘
```

### 7.2 前端部署（Vercel）

```bash
cd apps/frontend

# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod

# 配置环境变量
vercel env add VITE_API_URL
# 输入: https://your-api.railway.app
```

### 7.3 后端部署（Railway）

```bash
cd apps/api

# 安装Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加PostgreSQL
railway add -d postgres

# 部署
railway up

# 配置环境变量
railway variables set PYUSD_CONTRACT_ADDRESS=0x...
railway variables set DISCORD_BOT_TOKEN=your_token
# ... 其他环境变量
```

### 7.4 Envio部署

```bash
cd packages/indexer

# 如果使用Envio托管服务
envio deploy

# 或者部署到Railway（Docker）
# 创建Dockerfile并使用railway up
```

### 7.5 部署检查清单

- [ ] 所有环境变量已配置
- [ ] 数据库已创建并可访问
- [ ] Envio索引器成功连接到RPC
- [ ] API健康检查返回200
- [ ] 前端可以访问API
- [ ] Discord Bot在线
- [ ] 测试一笔交易，确认能被索引

---

## 8. 常见问题

### Q1: 数据更新延迟是多少？

**A**: 
- **Envio索引延迟**: 通常 < 10秒（取决于区块确认时间）
- **API响应时间**: < 500ms
- **前端刷新间隔**: 默认30秒（可配置）
- **Discord警报延迟**: < 30秒

### Q2: 如何添加新的监控指标？

**A**: 按以下步骤：

1. **在Envio中添加新的事件索引**:
```yaml
# packages/indexer/config.yaml
events:
  - YourNewEvent(...)  # 添加新事件
```

2. **编写Handler**:
```typescript
// packages/indexer/src/handlers.ts
async function handleYourNewEvent(event) {
  // 处理逻辑
}
```

3. **添加API端点**:
```typescript
// apps/api/src/index.ts
app.get('/api/your-metric', async (req, res) => {
  // 查询Envio数据
});
```

4. **前端展示**:
```typescript
// apps/frontend/src/components/YourMetricCard.tsx
// 创建新组件展示指标
```

### Q3: 如何修改警报阈值？

**A**: 编辑 `apps/api/src/alert-service.ts`:

```typescript
const ALERT_THRESHOLDS = {
  LARGE_TRANSACTION: 100000, // 改为你想要的值
  LOW_YIELD: 0.04,           // 4%
  // ...
};
```

### Q4: 支持哪些链？

**A**: MVP版本只支持以太坊Sepolia测试网。要添加新链：

1. 在Envio配置中添加新网络
2. 配置该链的RPC端点
3. 更新智能合约地址

### Q5: 如何调试Envio索引问题？

**A**: 
```bash
# 查看Envio日志
cd packages/indexer
pnpm dev --verbose

# 检查数据库
psql $DATABASE_URL
\dt  # 查看表
SELECT * FROM transfers LIMIT 10;  # 查看数据

# 重新索引
envio codegen
envio dev --reset
```

### Q6: Dashboard加载很慢怎么办？

**A**: 优化方向：
1. 减少API调用频率
2. 添加Redis缓存层
3. 使用分页加载大数据集
4. 前端使用虚拟滚动

### Q7: 如何测试警报系统？

**A**: 
```bash
# 在测试网发送一笔大额测试交易
# 或者手动触发（仅测试用）

curl -X POST http://localhost:3000/api/test/trigger-alert \
  -H "Content-Type: application/json" \
  -d '{
    "type": "large_transaction",
    "data": { "value": 150000 }
  }'
```

### Q8: 数据不准确怎么办？

**A**: 检查步骤：
1. 确认Envio索引是否最新（检查最新区块号）
2. 确认Pyth价格数据是否正常
3. 检查计算逻辑是否正确
4. 查看API日志是否有错误

### Q9: 如何扩展到生产环境？

**A**: 生产环境额外需要：
1. **Redis缓存层** - 减轻数据库压力
2. **负载均衡** - 多实例部署API
3. **监控告警** - Grafana + Prometheus
4. **日志系统** - ELK Stack
5. **备份策略** - 数据库定期备份
6. **CDN** - 前端静态资源加速

### Q10: 团队协作流程是什么？

**A**: 
1. **数据模块独立开发** - 不阻塞其他模块
2. **提供Mock API** - 让前端可以先用假数据
3. **版本化API** - 避免破坏性变更
4. **文档先行** - 更新文档再改代码
5. **定期同步** - 每天站会15分钟

---

## 9. 联系与支持

### 9.1 负责人

**数据分析模块负责人**: [你的名字]
- Discord: @your-handle
- Email: your-email@example.com

### 9.2 相关资源

- **代码仓库**: [GitHub链接]
- **项目文档**: [Notion/Confluence链接]
- **API文档**: [Swagger/Postman链接]
- **团队Discord**: [邀请链接]

### 9.3 其他文档

- [产品需求文档 (PRD)](./PRD.md)
- [2周MVP冲刺计划](./MVP_SPRINT_PLAN.md)
- [完整开发计划](./DEVELOPMENT_PLAN.md)
- [Context Engineering](./context_engineering.md)

---

## 10. 快速集成示例

### 示例1: 在前端dApp显示实时价格

```tsx
// YourDapp.tsx
import { useQuery } from '@tanstack/react-query';

function PriceDisplay() {
  const { data } = useQuery({
    queryKey: ['pyusd-price'],
    queryFn: () => fetch('http://localhost:3000/api/price/pyusd').then(r => r.json()),
    refetchInterval: 10000
  });

  return <span>1 PYUSD = ${data?.price.toFixed(4)}</span>;
}
```

### 示例2: 在Agent中查询历史数据

```typescript
// agent/negotiation.ts
async function checkMarketPrice(assetId: string) {
  const response = await fetch(
    `http://localhost:3000/api/volume/history?period=7d`
  );
  const data = await response.json();
  
  const avgVolume = data.data.reduce((sum, day) => sum + day.volume, 0) / data.data.length;
  return avgVolume;
}
```

### 示例3: 订阅警报事件（WebSocket - 待实现）

```typescript
// future: WebSocket实时通知
const ws = new WebSocket('ws://localhost:3000/ws/alerts');

ws.on('message', (event) => {
  const alert = JSON.parse(event.data);
  if (alert.type === 'large_transaction') {
    // 处理大额交易警报
    notifyUser(alert);
  }
});
```

---

**最后更新**: 2025年10月20日  
**文档版本**: V1.0  
**状态**: ✅ Ready for Integration
