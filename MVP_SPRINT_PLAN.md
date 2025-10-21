# OmniChain DeFi Nexus - 2周MVP冲刺计划 🚀

| 属性 | 值 |
| :--- | :--- |
| **文档版本** | MVP V1.0 |
| **冲刺周期** | 2周（14天） |
| **目标** | 可演示的最小可行产品 |
| **团队规模** | 3-4人（全栈） |
| **工作模式** | 高强度并行开发 |

---

## ⚡ MVP核心原则

### 砍掉80%，保留20%核心价值

**只做这些：**
- ✅ 1个核心链（以太坊测试网）的数据索引
- ✅ 1个简单的PYUSD转账追踪合约
- ✅ 基础的Envio索引器（仅PYUSD Transfer事件）
- ✅ 2个关键Dashboard（财政健康 + 交易量）
- ✅ 1个警报功能（大额交易通知）
- ✅ 基础的实时价格展示

**不做这些：**
- ❌ 跨链功能（Avail Nexus集成）
- ❌ Hedera HCS/HTS集成
- ❌ Agent谈判分析
- ❌ 复杂的数据聚合
- ❌ 完整的测试覆盖
- ❌ 生产级部署优化

---

## 📅 2周冲刺时间表

```
Week 1: 后端基础 + 数据索引
Week 2: 前端Dashboard + 集成
```

### Week 1: Day 1-7（后端与数据层）

| 天数 | 主要任务 | 负责人 | 交付物 |
| :--- | :--- | :--- | :--- |
| **Day 1** | 项目初始化 + 智能合约 | 全员 | 项目骨架 + 简单合约 |
| **Day 2** | Envio配置 + 首次索引 | Backend | 运行的Indexer |
| **Day 3** | GraphQL API + Pyth集成 | Backend | 可查询的API |
| **Day 4** | 数据聚合逻辑 | Backend | 计算服务 |
| **Day 5** | 警报系统（MVP） | Backend | Discord通知 |
| **Day 6** | API优化 + 测试 | Backend | 稳定的API |
| **Day 7** | 前端项目初始化 | Frontend | React项目骨架 |

### Week 2: Day 8-14（前端与集成）

| 天数 | 主要任务 | 负责人 | 交付物 |
| :--- | :--- | :--- | :--- |
| **Day 8** | Dashboard基础UI | Frontend | 页面框架 |
| **Day 9** | 财政健康Dashboard | Frontend | 第一个Dashboard |
| **Day 10** | 交易量Dashboard | Frontend | 第二个Dashboard |
| **Day 11** | 实时数据连接 | Frontend | WebSocket/轮询 |
| **Day 12** | 警报面板 + 样式优化 | Frontend | 完整UI |
| **Day 13** | 集成测试 + Bug修复 | 全员 | 可演示版本 |
| **Day 14** | 部署 + 文档 + 演示准备 | 全员 | 线上版本 |

---

## 🎯 MVP功能范围定义

### 1. 智能合约层（极简版）

**只部署1个合约：**
```solidity
// SimplePYUSDTracker.sol
contract SimplePYUSDTracker {
    // 监听PYUSD合约的Transfer事件即可
    // 不需要自己的逻辑，只是一个监听器配置
}
```

**或者直接使用：**
- 使用现有的PYUSD合约地址
- 不部署新合约，直接索引现有事件

**开发时间：** 半天（或跳过）

---

### 2. Envio索引器（核心）

**只索引1个事件：**
```yaml
# config.yaml
networks:
  - id: 11155111  # Sepolia测试网
    
contracts:
  - name: PYUSD
    address: "0x..." # PYUSD Sepolia地址
    events:
      - Transfer(address indexed from, address indexed to, uint256 value)

handlers:
  - event: Transfer
    handler: handleTransfer
```

**Handler逻辑：**
```typescript
// handlers.ts
async function handleTransfer(event: TransferEvent) {
  await Transfer.create({
    id: event.transactionHash + "-" + event.logIndex,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number
  });
}
```

**GraphQL Schema（自动生成）：**
```graphql
type Transfer {
  id: ID!
  from: String!
  to: String!
  value: BigInt!
  timestamp: Int!
  blockNumber: Int!
}

type Query {
  transfers(limit: Int, offset: Int): [Transfer!]!
  getTransferById(id: ID!): Transfer
}
```

**开发时间：** 1.5天

---

### 3. 后端API层（简化版）

**技术选型：**
```json
{
  "runtime": "Node.js 20 / Bun",
  "framework": "Express (快速搭建)",
  "database": "Envio的PostgreSQL直接用",
  "cache": "无（MVP不需要）"
}
```

**API端点（5个核心接口）：**

```typescript
// server.ts
import express from 'express';

const app = express();

// 1. 获取最近转账记录
app.get('/api/transfers', async (req, res) => {
  // 直接查询Envio的GraphQL
  const transfers = await envioClient.query(GET_RECENT_TRANSFERS);
  res.json(transfers);
});

// 2. 获取Treasury总值（简化计算）
app.get('/api/treasury/value', async (req, res) => {
  const treasuryAddress = "0x..."; // 设定一个Treasury地址
  const balance = await calculateBalance(treasuryAddress);
  const price = await getPythPrice("PYUSD");
  res.json({
    totalValue: balance * price,
    balance,
    price
  });
});

// 3. 获取24H交易量
app.get('/api/volume/24h', async (req, res) => {
  const volume = await calculate24HVolume();
  res.json({ volume });
});

// 4. 获取PYUSD实时价格
app.get('/api/price/pyusd', async (req, res) => {
  const price = await getPythPrice("PYUSD");
  res.json({ price, timestamp: Date.now() });
});

// 5. 获取最新警报
app.get('/api/alerts', async (req, res) => {
  const alerts = await getRecentAlerts();
  res.json(alerts);
});
```

**Pyth集成（超简化）：**
```typescript
import { PythHttpClient } from "@pythnetwork/client";

const pythClient = new PythHttpClient({
  endpoint: "https://hermes.pyth.network"
});

async function getPythPrice(symbol: string) {
  // PYUSD价格ID
  const priceIds = {
    "PYUSD": "0x..." // 从Pyth文档获取
  };
  
  const price = await pythClient.getLatestPriceFeeds([priceIds[symbol]]);
  return price[0].price.price / 1e8; // 返回USD价格
}
```

**开发时间：** 2天

---

### 4. 警报系统（最小化）

**只实现1种警报：大额交易通知**

```typescript
// alert-service.ts
import { Client, GatewayIntentBits } from 'discord.js';

const discordClient = new Client({ 
  intents: [GatewayIntentBits.Guilds] 
});

// 定时检查（每30秒）
setInterval(async () => {
  const recentTransfers = await getRecentTransfers(30); // 最近30秒
  
  for (const transfer of recentTransfers) {
    if (transfer.value > 100000 * 1e6) { // >$100,000
      await sendDiscordAlert({
        title: "🚨 大额交易警报",
        description: `检测到大额PYUSD转账`,
        fields: [
          { name: "金额", value: `$${(transfer.value / 1e6).toLocaleString()}` },
          { name: "发送方", value: transfer.from },
          { name: "接收方", value: transfer.to },
          { name: "交易哈希", value: transfer.id }
        ]
      });
    }
  }
}, 30000);

async function sendDiscordAlert(embed) {
  const channel = await discordClient.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  await channel.send({ embeds: [embed] });
}
```

**开发时间：** 1天

---

### 5. 前端Dashboard（极简但美观）

**技术栈：**
```json
{
  "framework": "React 18 + TypeScript + Vite",
  "ui": "Tailwind CSS + shadcn/ui（现成组件）",
  "charts": "Recharts（简单易用）",
  "data": "TanStack Query（数据获取）"
}
```

**页面结构（单页面应用）：**
```
/dashboard
  ├── Header（logo + 实时价格）
  ├── TreasurySection（财政健康）
  │   ├── TotalValueCard
  │   └── BalanceChart
  ├── VolumeSection（交易量分析）
  │   ├── Volume24HCard
  │   └── VolumeChart
  └── AlertsSection（最近警报）
      └── AlertsList
```

**核心组件代码：**

```tsx
// TotalValueCard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TotalValueCard() {
  const { data } = useQuery({
    queryKey: ['treasury-value'],
    queryFn: () => fetch('/api/treasury/value').then(r => r.json()),
    refetchInterval: 10000 // 每10秒刷新
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>DAO Treasury 总值</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          ${data?.totalValue.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.balance.toLocaleString()} PYUSD
        </div>
      </CardContent>
    </Card>
  );
}
```

```tsx
// VolumeChart.tsx
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function VolumeChart() {
  const { data } = useQuery({
    queryKey: ['volume-history'],
    queryFn: () => fetch('/api/volume/history').then(r => r.json())
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

```tsx
// Dashboard.tsx（主页面）
export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">OmniChain DeFi Dashboard</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* 财政健康 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">财政健康</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TotalValueCard />
            <PriceCard />
          </div>
        </section>

        {/* 交易量分析 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">交易量分析</h2>
          <Card>
            <CardContent className="pt-6">
              <VolumeChart />
            </CardContent>
          </Card>
        </section>

        {/* 最近警报 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">最近警报</h2>
          <AlertsList />
        </section>
      </main>
    </div>
  );
}
```

**开发时间：** 3天

---

## 🛠️ 快速开发技巧

### 1. 使用脚手架和模板

```bash
# Day 1 立即执行
# 1. 创建Monorepo
pnpm create turbo@latest omnichain-defi-nexus

# 2. 在apps/目录创建子项目
cd omnichain-defi-nexus

# 创建后端
cd apps && mkdir api && cd api
pnpm init && pnpm add express @pythnetwork/client discord.js

# 创建前端
cd ../
pnpm create vite@latest frontend -- --template react-ts
cd frontend
pnpm add @tanstack/react-query recharts tailwindcss

# 创建Envio项目
cd ../../packages
npx envio init indexer
```

### 2. 复用现有代码

**不要从零开始，使用：**
- [Envio官方模板](https://docs.envio.dev/docs/getting-started)
- [shadcn/ui组件库](https://ui.shadcn.com/)（复制粘贴即用）
- [Pyth价格SDK示例](https://docs.pyth.network/price-feeds/use-real-time-data/evm)
- [Discord Bot模板](https://discord.js.org/docs/packages/discord.js/14.16.3)

### 3. AI辅助开发

**每天使用Cursor/Copilot生成：**
- Envio handler函数
- React组件模板
- API路由代码
- Tailwind样式

### 4. 并行开发策略

```
Day 1-3: Backend (Person A) + 合约准备 (Person B)
Day 4-6: Backend完善 (Person A) + Frontend初始化 (Person B)
Day 7-10: Backend收尾 (Person A) + Frontend主要开发 (Person B + C)
Day 11-12: 集成 (全员)
Day 13: 测试 (全员)
Day 14: 部署 (Person A) + 演示准备 (Person B)
```

---

## 📦 最小技术栈

### 严格限制依赖，只用核心工具：

```json
{
  "backend": {
    "express": "^4.18.0",
    "@pythnetwork/client": "^2.0.0",
    "discord.js": "^14.0.0",
    "axios": "^1.6.0"
  },
  "frontend": {
    "react": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0"
  },
  "indexer": {
    "envio": "latest"
  }
}
```

**不使用：**
- ❌ Redux（用Zustand或React Query状态）
- ❌ GraphQL客户端（直接fetch）
- ❌ 复杂的ORM（直接SQL或用Envio的查询）
- ❌ 测试框架（手动测试为主）

---

## 🚀 部署策略（极简）

### 使用免费/低成本服务

```yaml
前端部署:
  - Vercel（免费，自动部署）
  - Netlify（备选）

后端部署:
  - Railway（简单，支持PostgreSQL）
  - Render（备选）

Envio Indexer:
  - Envio托管服务（如果可用）
  - 或Railway上的Docker容器

数据库:
  - Railway内置PostgreSQL
  - 或Supabase免费层
```

**部署步骤（1小时内）：**
```bash
# 前端部署（Vercel）
cd apps/frontend
vercel deploy --prod

# 后端部署（Railway）
cd apps/api
railway login
railway up

# Envio部署
cd packages/indexer
envio deploy
```

---

## ✅ MVP验收标准（极简版）

### 功能标准
- ✅ 能看到实时的PYUSD转账记录（最近50笔）
- ✅ 能看到Treasury的PYUSD余额和USD价值
- ✅ 能看到过去7天的交易量趋势图
- ✅ 大额交易（>$100K）能在Discord收到通知
- ✅ 价格数据延迟 < 30秒

### 性能标准（放宽）
- ✅ Dashboard加载时间 < 5秒（不是3秒）
- ✅ API响应时间 < 500ms（不是100ms）
- ✅ 数据更新频率：10-30秒一次

### 质量标准（大幅降低）
- ✅ 核心功能无崩溃即可
- ✅ 能在测试环境稳定运行2小时
- ✅ 代码有基本注释（不要求测试覆盖率）

---

## 📋 每日站会检查清单

### 每天早上9:00（15分钟）

```markdown
## Day X 站会

### 昨天完成 ✅
- [ ] 任务1
- [ ] 任务2

### 今天目标 🎯
- [ ] 任务1
- [ ] 任务2

### 遇到的阻碍 ⚠️
- 问题描述
- 需要的帮助

### 风险预警 🚨
- 是否有延期风险？
- 需要调整计划吗？
```

---

## 🔥 应急预案

### 如果进度落后怎么办？

**Week 1结束前评估：**
```
如果后端未完成 50% → 
  - 砍掉警报系统
  - 前端只做1个Dashboard

如果Envio索引有问题 →
  - 改用Alchemy/Infura直接查询
  - 放弃实时性，改为每分钟查询

如果Pyth集成失败 →
  - 硬编码价格（PYUSD ≈ $1）
  - 或使用CoinGecko API
```

**Week 2中期评估：**
```
如果前端进度慢 →
  - 使用更多现成模板
  - 减少动画和交互
  - 只做桌面端，不做响应式

如果部署有问题 →
  - 本地演示（录屏）
  - 使用ngrok临时暴露
```

---

## 🎯 最终交付物（2周后）

### 必须有的：
1. ✅ **可访问的Dashboard URL** - Vercel上的线上版本
2. ✅ **Discord Bot运行中** - 能收到实时警报
3. ✅ **GitHub代码仓库** - 完整的源码
4. ✅ **5分钟演示视频** - 录制功能演示
5. ✅ **简单的README** - 如何运行和部署

### 不需要的：
- ❌ 完整的技术文档
- ❌ 测试报告
- ❌ 架构设计文档
- ❌ API文档（有代码即可）

---

## 💪 团队工作模式建议

### 高强度冲刺模式

```yaml
工作时间:
  - 每天10-12小时
  - 周末不休息（2周冲刺）

沟通方式:
  - 每天早晚2次站会（15分钟）
  - Discord实时协作
  - 遇到问题立即互助

代码协作:
  - 不需要PR Review（直接push main）
  - 快速迭代优先
  - 重构等以后再说

决策原则:
  - 5分钟内做决定
  - 选最简单的方案
  - 能用就行，不求完美
```

---

## 📊 进度追踪表

| 里程碑 | 目标日期 | 状态 | 负责人 |
| :--- | :--- | :--- | :--- |
| 项目初始化 | Day 1 | ⏳ Pending | 全员 |
| 智能合约部署 | Day 1 | ⏳ Pending | Backend |
| Envio首次索引成功 | Day 2 | ⏳ Pending | Backend |
| API基础端点完成 | Day 3 | ⏳ Pending | Backend |
| Pyth集成完成 | Day 4 | ⏳ Pending | Backend |
| 警报系统可用 | Day 5 | ⏳ Pending | Backend |
| 前端项目初始化 | Day 7 | ⏳ Pending | Frontend |
| 第一个Dashboard完成 | Day 9 | ⏳ Pending | Frontend |
| 第二个Dashboard完成 | Day 10 | ⏳ Pending | Frontend |
| 前后端打通 | Day 11 | ⏳ Pending | 全员 |
| 集成测试通过 | Day 13 | ⏳ Pending | 全员 |
| 生产环境部署 | Day 14 | ⏳ Pending | DevOps |

---

## 🎬 Day 1 立即开始的命令

```bash
# 1. 创建项目目录
mkdir omnichain-defi-nexus && cd omnichain-defi-nexus

# 2. 初始化Monorepo
pnpm init
mkdir -p apps/api apps/frontend packages/indexer

# 3. 创建后端
cd apps/api
pnpm init
pnpm add express cors dotenv @pythnetwork/client discord.js axios
pnpm add -D typescript @types/node @types/express tsx nodemon

# 4. 创建前端
cd ../frontend
pnpm create vite@latest . -- --template react-ts
pnpm install
pnpm add @tanstack/react-query recharts tailwindcss @tailwindcss/forms
pnpx shadcn-ui@latest init

# 5. 初始化Envio
cd ../../packages/indexer
pnpm add -g envio
envio init

# 6. 创建配置文件
cd ../../
touch .env.example README.md

# 7. 初始化Git
git init
git add .
git commit -m "Initial commit: 2-week MVP sprint"
```

---

**关键成功因素：**
1. ✅ **极度聚焦** - 只做核心功能
2. ✅ **快速决策** - 不要纠结细节
3. ✅ **复用代码** - 站在巨人肩膀上
4. ✅ **并行开发** - 最大化效率
5. ✅ **持续沟通** - 问题不过夜

**Let's Ship It! 🚢**



