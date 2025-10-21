# Envio索引器设置指南 🚀

> 已完成基础配置！现在只需3步即可启动索引器

---

## ✅ 已完成的配置

- ✅ ERC20 ABI (`abis/ERC20.json`)
- ✅ Envio配置文件 (`config.yaml`)
- ✅ GraphQL Schema (`schema.graphql`)
- ✅ Event Handlers (`src/EventHandlers.ts`)
- ✅ Package配置 (`package.json`)

---

## 🚀 快速启动（3步）

### 步骤1: 安装Envio CLI

```bash
# 全局安装Envio
npm install -g envio

# 或使用pnpm
pnpm add -g envio

# 验证安装
envio --version
```

### 步骤2: 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 从根目录
cd /Users/tutu/Documents/ETHOline-2025/OmniDeFi-Nexus

# 复制Envio环境变量模板
cp packages/indexer/.env.example packages/indexer/.env

# 编辑.env文件，填入RPC URL
nano packages/indexer/.env
```

**必须配置的变量**：
```bash
# 从 Alchemy 或 Infura 获取
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# PostgreSQL配置（可选，Envio会自动创建本地数据库）
DATABASE_URL=postgresql://localhost:5432/omnichain_indexer
```

**获取免费RPC URL**：
- [Alchemy](https://www.alchemy.com/) - 注册 → 创建App → 复制Sepolia URL
- [Infura](https://www.infura.io/) - 注册 → 创建Project → 复制Sepolia URL

### 步骤3: 生成代码并启动

```bash
cd packages/indexer

# 1. 生成TypeScript类型和代码
envio codegen

# 2. 启动开发模式（会自动索引）
envio dev

# 可选：详细日志模式
envio dev --verbose
```

---

## 📊 验证索引器运行

### 1. 检查日志

启动后应该看到类似输出：
```
✅ Connected to Sepolia RPC
🔍 Scanning blocks from 5000000...
📊 Indexed Transfer: 0xabc... → 0xdef..., Value: 1000000
```

### 2. 访问GraphQL Playground

打开浏览器访问：
```
http://localhost:8080/graphql
```

### 3. 运行测试查询

```graphql
# 查询最近10笔转账
query {
  transfers(
    limit: 10
    orderBy: { timestamp: desc }
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

# 查询每日统计
query {
  dailyStats(
    limit: 7
    orderBy: { date: desc }
  ) {
    id
    date
    txCount
    totalVolume
    uniqueSenders
    uniqueReceivers
  }
}
```

---

## 🔧 配置说明

### 合约地址配置

当前配置使用 **USDC Sepolia** 作为测试：
```yaml
# packages/indexer/config.yaml
address:
  - "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # USDC Sepolia
```

**如需替换为真实PYUSD地址**：

1. 找到PYUSD Sepolia合约地址
2. 编辑 `config.yaml`
3. 替换 `address` 字段
4. 重新运行 `envio codegen` 和 `envio dev`

### 支持的查询

索引器提供以下GraphQL查询：

#### Transfers查询
```graphql
query GetTransfers(
  $limit: Int
  $offset: Int
  $where: TransferFilter
) {
  transfers(
    limit: $limit
    offset: $offset
    where: $where
    orderBy: { timestamp: desc }
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

# 示例变量
{
  "limit": 50,
  "offset": 0,
  "where": {
    "from": { "_eq": "0x..." }  # 过滤特定发送者
  }
}
```

#### 统计查询
```graphql
query GetDailyStats($startDate: String!, $endDate: String!) {
  dailyStats(
    where: {
      id: { "_gte": $startDate, "_lte": $endDate }
    }
    orderBy: { date: desc }
  ) {
    id
    date
    txCount
    totalVolume
    totalVolumeUSD
  }
}
```

---

## 🐛 常见问题

### Q1: `envio: command not found`

**解决方案**：
```bash
# 重新安装
npm uninstall -g envio
npm install -g envio

# 或使用npx（无需全局安装）
npx envio codegen
npx envio dev
```

### Q2: RPC连接失败

**症状**：
```
❌ Failed to connect to RPC
```

**解决方案**：
1. 检查`.env`文件中的`SEPOLIA_RPC_URL`是否正确
2. 确认RPC URL可访问：
```bash
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```
3. 如果是免费RPC，可能有速率限制，考虑使用付费计划

### Q3: PostgreSQL连接错误

**症状**：
```
❌ Could not connect to PostgreSQL
```

**解决方案**：

**方案A（推荐）**：使用Envio内置数据库（无需手动配置）
```bash
# 删除DATABASE_URL配置，让Envio自动管理
```

**方案B**：手动配置PostgreSQL
```bash
# macOS安装PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 创建数据库
createdb omnichain_indexer
```

### Q4: 索引速度很慢

**优化方案**：
1. 调整起始区块号（`config.yaml`的`start_block`）
2. 使用更快的RPC提供商
3. 减少索引的事件类型

### Q5: 数据不准确

**检查步骤**：
1. 确认合约地址正确
2. 检查ABI是否完整
3. 查看Handler逻辑是否正确
4. 重新索引：
```bash
envio dev --reset  # 清空数据库重新索引
```

---

## 🔄 工作流程

### 日常开发流程

```bash
# 1. 修改配置或Handler
nano config.yaml
nano src/EventHandlers.ts

# 2. 重新生成代码
envio codegen

# 3. 重启索引器
# Ctrl+C 停止
envio dev
```

### 重置数据库

```bash
# 清空数据库并重新索引
envio dev --reset
```

### 生产部署

```bash
# 方案1: Envio托管服务
envio deploy

# 方案2: Docker部署
# 创建Dockerfile（参考文档）
docker build -t omnichain-indexer .
docker run -e SEPOLIA_RPC_URL=... omnichain-indexer
```

---

## 📈 性能指标

索引器性能目标：

| 指标 | 目标值 | 备注 |
| :--- | :--- | :--- |
| 索引延迟 | < 10秒 | 区块确认后到数据可查 |
| GraphQL响应 | < 100ms | 简单查询 |
| 吞吐量 | 1000+ tx/min | 高峰期处理能力 |
| 数据库大小 | ~100MB/10K tx | 存储估算 |

---

## 🔗 集成到API

### 在后端API中查询Envio数据

```typescript
// apps/api/src/services/envio-client.ts
import axios from 'axios';

const ENVIO_GRAPHQL_URL = 'http://localhost:8080/graphql';

export async function queryRecentTransfers(limit = 50) {
  const query = `
    query GetTransfers($limit: Int!) {
      transfers(limit: $limit, orderBy: { timestamp: desc }) {
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

  const response = await axios.post(ENVIO_GRAPHQL_URL, {
    query,
    variables: { limit }
  });

  return response.data.data.transfers;
}
```

### 在API端点中使用

```typescript
// apps/api/src/index.ts
import { queryRecentTransfers } from './services/envio-client';

app.get('/api/transfers', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const transfers = await queryRecentTransfers(limit);
  
  res.json({
    transfers,
    total: transfers.length
  });
});
```

---

## 📝 下一步

- [ ] 测试索引器是否正常运行
- [ ] 在GraphQL Playground运行查询
- [ ] 集成到后端API
- [ ] 添加更多事件类型（Approval等）
- [ ] 优化索引性能

---

## 📞 获取帮助

- **Envio文档**: https://docs.envio.dev
- **Discord支持**: [Envio Discord](https://discord.gg/envio)
- **GitHub Issues**: 在项目仓库提Issue

---

**创建日期**: 2025年10月20日  
**最后更新**: 2025年10月20日  
**状态**: ✅ 配置完成，可以启动




