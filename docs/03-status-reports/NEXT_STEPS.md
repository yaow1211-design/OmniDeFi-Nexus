# 下一步行动计划 📋

> 项目初始化已完成！以下是接下来的具体行动步骤

---

## 🎯 立即行动（今天）

### 对于整个团队

- [ ] **所有成员阅读** [HANDOFF.md](./HANDOFF.md)（15分钟）
- [ ] **克隆代码仓库** 并运行 `pnpm install`
- [ ] **在Discord/Slack** 创建项目频道：
  - #general - 日常讨论
  - #dev-backend - 后端开发
  - #dev-frontend - 前端开发
  - #dev-contracts - 智能合约
  - #data-analytics - 数据分析（本模块）

### 对于数据分析模块负责人（你）

- [ ] 获取 **Sepolia RPC URL**（从Alchemy/Infura）
- [ ] 查找 **PYUSD测试网合约地址**
  - 方案A: 查找官方PYUSD Sepolia地址
  - 方案B: 部署简单的ERC20测试合约
- [ ] 确定 **DAO Treasury地址**（与团队讨论）
- [ ] 创建 **Discord Bot**（用于警报）
  - 访问: https://discord.com/developers
  - 创建应用 → 添加Bot → 获取Token
- [ ] 配置 `.env` 文件

---

## 📅 Day 2 任务（明天）

### 主要任务：配置Envio索引器

#### 1. 安装Envio CLI
```bash
npm i -g envio
```

#### 2. 初始化Envio项目
```bash
cd packages/indexer
envio init
```

按提示选择：
- Template: EVM (Ethereum Virtual Machine)
- Network: Sepolia
- Contract: PYUSD Token

#### 3. 配置config.yaml
```yaml
name: omnichain-defi-indexer
networks:
  - id: 11155111  # Sepolia
    start_block: 5000000
    rpc_config:
      url: ${SEPOLIA_RPC_URL}

contracts:
  - name: PYUSD
    address: "0x[你的PYUSD合约地址]"
    abi_file_path: ./abis/PYUSD.json
    handler: ./src/handlers.ts
    events:
      - event: Transfer(address indexed from, address indexed to, uint256 value)
```

#### 4. 编写事件处理器
```typescript
// src/handlers.ts
import { Transfer } from "generated";

Transfer.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value.toString(),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };

  await context.Transfer.insert(entity);
  
  console.log(`Indexed transfer: ${entity.from} → ${entity.to}: ${entity.value}`);
});
```

#### 5. 启动Envio
```bash
# 生成代码
envio codegen

# 启动开发模式
envio dev
```

#### 6. 测试GraphQL查询
访问 http://localhost:8080/graphql

```graphql
query {
  transfers(limit: 10, orderBy: { timestamp: desc }) {
    id
    from
    to
    value
    timestamp
    blockNumber
  }
}
```

### 验收标准
- [ ] Envio成功连接到Sepolia
- [ ] 至少索引到1笔Transfer事件
- [ ] GraphQL查询返回正确数据
- [ ] 日志中无错误信息

---

## 📅 Day 3 任务

### 主要任务：实现Pyth价格集成和API完善

#### 1. 集成Pyth Network
```bash
cd apps/api
pnpm add @pythnetwork/hermes-client
```

#### 2. 实现价格服务
```typescript
// apps/api/src/services/price-service.ts
import { HermesClient } from "@pythnetwork/hermes-client";

const hermesClient = new HermesClient("https://hermes.pyth.network");

export async function getPYUSDPrice() {
  const priceIds = [
    "0x...", // PYUSD价格ID（从Pyth文档获取）
  ];
  
  const priceFeeds = await hermesClient.getLatestPriceUpdates(priceIds);
  const price = priceFeeds.parsed[0].price.price / 1e8;
  
  return {
    symbol: "PYUSD",
    price,
    confidence: priceFeeds.parsed[0].price.confidence / 1e8,
    timestamp: Date.now(),
  };
}
```

#### 3. 更新API端点
完善这些端点的实现：
- `/api/price/pyusd` - 返回实时价格
- `/api/treasury/value` - 计算Treasury总值
- `/api/transfers` - 从Envio查询转账

#### 4. 连接Envio GraphQL
```typescript
// apps/api/src/services/envio-client.ts
import axios from 'axios';

const ENVIO_URL = process.env.ENVIO_API_URL || 'http://localhost:8080/graphql';

export async function queryTransfers(limit = 50, offset = 0) {
  const query = `
    query GetTransfers($limit: Int!, $offset: Int!) {
      transfers(limit: $limit, offset: $offset, orderBy: { timestamp: desc }) {
        id
        from
        to
        value
        timestamp
        blockNumber
        transactionHash
      }
    }
  `;
  
  const { data } = await axios.post(ENVIO_URL, {
    query,
    variables: { limit, offset }
  });
  
  return data.data.transfers;
}
```

### 验收标准
- [ ] `/api/price/pyusd` 返回实时价格
- [ ] `/api/transfers` 返回Envio索引的数据
- [ ] `/api/treasury/value` 计算正确
- [ ] 所有端点响应时间 < 500ms

---

## 📅 Day 4-5 任务

### 主要任务：数据聚合和Discord警报

#### Day 4: 数据聚合逻辑
- [ ] 实现24H交易量计算
- [ ] 实现Treasury余额查询
- [ ] 实现历史数据聚合
- [ ] 添加简单的缓存（内存级别即可）

#### Day 5: Discord警报系统
```bash
cd apps/api
pnpm add discord.js
```

实现警报监控：
- [ ] 创建Discord Bot
- [ ] 实现大额交易监控（>$100K）
- [ ] 设置定时任务（每30秒检查一次）
- [ ] 测试警报发送

---

## 📅 Day 7-12 任务

### 主要任务：前端Dashboard开发

#### Day 7: 前端项目完善
- [ ] 创建API客户端封装
- [ ] 配置TanStack Query
- [ ] 创建基础组件库

#### Day 8-9: Treasury Dashboard
- [ ] TotalValueCard组件
- [ ] BalanceChart组件
- [ ] PriceCard组件
- [ ] 实时数据刷新

#### Day 10-11: Volume Dashboard
- [ ] VolumeChart组件
- [ ] 24H/7D/30D切换器
- [ ] 交易历史列表

#### Day 12: 警报面板和样式
- [ ] AlertPanel组件
- [ ] 响应式布局调整
- [ ] UI/UX优化

---

## 📅 Day 13-14 任务

### Day 13: 集成测试
- [ ] 端到端测试核心流程
- [ ] 修复Bug
- [ ] 性能优化

### Day 14: 部署和演示
- [ ] 前端部署到Vercel
- [ ] 后端部署到Railway
- [ ] Envio部署
- [ ] 录制演示视频
- [ ] 准备Pitch

---

## 🤝 团队协作建议

### 每日站会（15分钟）

**时间**: 每天早上9:00

**格式**:
```
昨天完成了什么？
今天计划做什么？
遇到什么阻碍？
需要什么帮助？
```

### 沟通渠道

- **紧急问题**: Discord @mention
- **代码review**: GitHub PR comments
- **技术讨论**: Discord #dev频道
- **进度更新**: 每日站会

### 协作原则

1. **快速决策**: 5分钟内做决定
2. **问题不过夜**: 当天解决或升级
3. **代码优先**: Show, don't tell
4. **持续集成**: 每天至少push一次

---

## 🎯 关键里程碑

| 里程碑 | 目标日期 | 验收标准 |
| :--- | :--- | :--- |
| M1: Envio索引成功 | Day 2 | 索引到至少1笔交易 |
| M2: API基础完成 | Day 4 | 5个端点全部工作 |
| M3: 警报系统上线 | Day 5 | 成功发送1条Discord通知 |
| M4: 前端可演示 | Day 10 | Dashboard展示实时数据 |
| M5: MVP完成 | Day 14 | 部署上线，可公开演示 |

---

## 📞 需要协调的事项

### 与其他模块

1. **智能合约团队**
   - [ ] 确认PYUSD合约地址
   - [ ] 确认需要索引哪些事件
   - [ ] 对齐事件Schema

2. **Agent服务团队**
   - [ ] 讨论数据API的使用方式
   - [ ] 提供API文档
   - [ ] 测试集成

3. **前端dApp团队**
   - [ ] 协调UI设计风格
   - [ ] 提供API端点列表
   - [ ] 测试数据集成

4. **跨链桥接团队**
   - [ ] 确认桥接事件定义
   - [ ] 配置Envio索引Avail事件
   - [ ] 测试跨链数据追踪

---

## 🚨 风险提示

### 潜在阻塞点

1. **PYUSD合约地址未确定**
   - **影响**: Day 2无法配置Envio
   - **应对**: 先用Mock数据，或部署测试ERC20

2. **RPC限流**
   - **影响**: Envio索引速度慢
   - **应对**: 使用付费RPC或多个免费RPC轮换

3. **Pyth价格ID未找到**
   - **影响**: 无法获取实时价格
   - **应对**: 临时硬编码$1.00，后续替换

4. **团队成员时区不同**
   - **影响**: 协作效率低
   - **应对**: 异步沟通，文档先行

---

## ✅ 今天就做这些

1. [ ] 阅读 [HANDOFF.md](./HANDOFF.md)
2. [ ] 配置开发环境（安装依赖）
3. [ ] 获取Sepolia RPC URL
4. [ ] 创建Discord Bot
5. [ ] 与团队同步进度

**明天见！我们继续Day 2的任务 🚀**

---

**创建日期**: 2025年10月20日  
**更新频率**: 每天更新  
**负责人**: [你的名字]



