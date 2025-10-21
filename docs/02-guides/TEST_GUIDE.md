# 测试指南 - 完整测试流程 🧪

> 按照本指南测试已完成的Day 1-4功能

---

## 📋 测试前准备

### 第0步：运行环境检查

```bash
# 运行自动检查脚本
bash test-setup.sh
```

这会检查：
- ✅ Node.js 是否安装
- ✅ pnpm 是否安装
- ✅ Envio CLI 是否安装
- ✅ .env 文件是否配置
- ✅ 依赖是否安装
- ✅ 端口是否可用

---

## 🔧 第1步：配置环境

### 1.1 创建.env文件

```bash
# 如果还没有.env文件
cp .env.example .env
```

### 1.2 获取Sepolia RPC URL

**选项A：使用Alchemy（推荐）**

1. 访问 [https://www.alchemy.com/](https://www.alchemy.com/)
2. 注册免费账户
3. 创建新App：
   - Name: `OmniDeFi Nexus`
   - Chain: `Ethereum`
   - Network: `Sepolia`
4. 复制HTTP URL（类似：`https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY`）

**选项B：使用Infura**

1. 访问 [https://www.infura.io/](https://www.infura.io/)
2. 注册免费账户
3. 创建新Project
4. 选择Sepolia网络
5. 复制HTTPS endpoint

### 1.3 编辑.env文件

```bash
# 使用你喜欢的编辑器
nano .env

# 或
code .env
```

**必须配置的变量**：
```bash
# 替换为你的实际RPC URL
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-ACTUAL-KEY

# 设置一个测试Treasury地址（或使用你的钱包地址）
TREASURY_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# 其他保持默认即可
PYTH_ENDPOINT=https://hermes.pyth.network
ENVIO_API_URL=http://localhost:8080/graphql
```

### 1.4 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装API依赖
cd apps/api
pnpm install
cd ../..

# 安装前端依赖
cd apps/frontend
pnpm install
cd ../..

# 安装Envio CLI（如果还没有）
npm install -g envio
```

---

## 🚀 第2步：启动服务

### 2.1 启动Envio索引器（终端1）

```bash
# 进入indexer目录
cd packages/indexer

# 生成TypeScript代码
envio codegen

# 启动开发模式
envio dev
```

**预期输出**：
```
✅ Connected to Sepolia RPC
📦 Starting indexer...
🔍 Scanning blocks from 5000000...
📊 Indexed Transfer: 0x... → 0x..., Value: 1000000
✅ Listening on http://localhost:8080/graphql
```

**如果失败**：
- 检查RPC URL是否正确
- 检查是否有网络连接
- 检查PostgreSQL是否运行（Envio会自动启动）

### 2.2 启动后端API（终端2）

打开新终端：

```bash
# 进入api目录
cd apps/api

# 启动开发服务器
pnpm dev
```

**预期输出**：
```
🚀 API Server running on http://localhost:3000
📊 Health check: http://localhost:3000/health
💰 Treasury address: 0x742d35Cc...
```

### 2.3 启动前端（终端3 - 可选）

打开新终端：

```bash
# 进入frontend目录
cd apps/frontend

# 启动开发服务器
pnpm dev
```

**预期输出**：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 第3步：测试API端点

### 3.1 健康检查

```bash
curl http://localhost:3000/health
```

**预期响应**：
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T10:30:00.000Z",
  "service": "OmniChain DeFi Nexus API",
  "dependencies": {
    "envio": "up"
  }
}
```

### 3.2 测试价格API

```bash
curl http://localhost:3000/api/price/pyusd
```

**预期响应**：
```json
{
  "symbol": "PYUSD",
  "price": 1.0003,
  "confidence": 0.0001,
  "timestamp": 1729420200000,
  "source": "Pyth Network"
}
```

### 3.3 测试转账查询

```bash
# 获取最近10笔转账
curl "http://localhost:3000/api/transfers?limit=10"
```

**预期响应**：
```json
{
  "transfers": [
    {
      "id": "0x...abc-0",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000",
      "valueUSD": 1.0,
      "timestamp": 1729420000,
      "blockNumber": 5123456,
      "transactionHash": "0x...abc"
    }
  ],
  "total": 10,
  "hasMore": true
}
```

### 3.4 测试Treasury价值

```bash
curl http://localhost:3000/api/treasury/value
```

**预期响应**：
```json
{
  "totalValue": 15234.56,
  "balance": 15234.56,
  "balanceWei": "15234560000",
  "price": 1.0,
  "priceSource": "Pyth Network",
  "timestamp": 1729420200000,
  "lastUpdate": "2025-10-20T10:30:00Z"
}
```

### 3.5 测试24H交易量

```bash
curl http://localhost:3000/api/volume/24h
```

**预期响应**：
```json
{
  "volume": 125000.50,
  "volumeWei": "125000500000",
  "txCount": 42,
  "period": "24h",
  "timestamp": 1729420200000
}
```

### 3.6 测试历史交易量

```bash
# 7天数据
curl "http://localhost:3000/api/volume/history?period=7d"
```

**预期响应**：
```json
{
  "data": [
    {
      "date": "2025-10-20",
      "volume": 125000.50,
      "volumeWei": "125000500000",
      "txCount": 42,
      "uniqueUsers": 30
    },
    {
      "date": "2025-10-19",
      "volume": 98000.20,
      "volumeWei": "98000200000",
      "txCount": 35,
      "uniqueUsers": 25
    }
  ],
  "period": "7d"
}
```

---

## 🎨 第4步：测试Envio GraphQL

### 4.1 访问GraphQL Playground

打开浏览器访问：
```
http://localhost:8080/graphql
```

### 4.2 运行GraphQL查询

**查询1：获取最近转账**
```graphql
query {
  transfers(limit: 10, orderBy: { timestamp: desc }) {
    id
    from
    to
    value
    timestamp
    blockNumber
    transactionHash
  }
}
```

**查询2：获取每日统计**
```graphql
query {
  dailyStats(limit: 7, orderBy: { date: desc }) {
    id
    date
    txCount
    totalVolume
    uniqueSenders
    uniqueReceivers
  }
}
```

**查询3：过滤特定地址的转账**
```graphql
query {
  transfers(
    where: {
      or: [
        { from: { _eq: "0x742d35cc6634c0532925a3b844bc9e7595f0beb" } }
        { to: { _eq: "0x742d35cc6634c0532925a3b844bc9e7595f0beb" } }
      ]
    }
    limit: 20
  ) {
    id
    from
    to
    value
    timestamp
  }
}
```

---

## 🌐 第5步：测试前端Dashboard

### 5.1 访问前端

打开浏览器访问：
```
http://localhost:5173
```

### 5.2 检查内容

你应该看到：
- ✅ 页面标题："OmniChain DeFi Nexus Dashboard"
- ✅ 三个卡片（Treasury、24H Volume、PYUSD Price）
- ✅ "Coming soon..." 占位符

**注意**：前端目前只有骨架，Day 7-10会完善UI。

---

## ✅ 测试检查清单

### 环境配置
- [ ] Node.js >= 20.0.0 已安装
- [ ] pnpm 已安装
- [ ] Envio CLI 已安装
- [ ] .env 文件已配置
- [ ] SEPOLIA_RPC_URL 已设置
- [ ] 所有依赖已安装

### Envio索引器
- [ ] `envio codegen` 成功执行
- [ ] `envio dev` 成功启动
- [ ] 看到 "Connected to Sepolia RPC"
- [ ] 看到Transfer事件被索引
- [ ] GraphQL Playground可访问

### 后端API
- [ ] API服务器启动在3000端口
- [ ] `/health` 返回"ok"状态
- [ ] `/api/price/pyusd` 返回价格数据
- [ ] `/api/transfers` 返回转账数据
- [ ] `/api/treasury/value` 返回Treasury数据
- [ ] `/api/volume/24h` 返回交易量数据
- [ ] `/api/volume/history` 返回历史数据

### 前端Dashboard
- [ ] 前端启动在5173端口
- [ ] 页面可以访问
- [ ] 看到Dashboard骨架

---

## 🐛 常见问题排查

### 问题1：Envio连接失败

**症状**：
```
❌ Failed to connect to RPC
```

**解决方案**：
1. 检查RPC URL是否正确
2. 测试RPC连接：
```bash
curl -X POST $SEPOLIA_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```
3. 如果是免费RPC，可能有速率限制，等待几分钟再试

### 问题2：API返回空数据

**症状**：
```json
{
  "transfers": [],
  "total": 0
}
```

**可能原因**：
1. Envio还没索引到数据（等待几分钟）
2. 合约地址没有交易记录
3. 起始区块号太大

**解决方案**：
- 检查Envio日志，看是否有索引活动
- 降低`config.yaml`中的`start_block`值
- 使用更活跃的合约地址

### 问题3：端口被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用不同端口
PORT=3001 pnpm dev
```

### 问题4：PostgreSQL连接错误

**症状**：
```
❌ Could not connect to PostgreSQL
```

**解决方案**：
- Envio通常会自动管理PostgreSQL
- 如果问题持续，重启Envio：
```bash
envio stop
envio dev --reset
```

---

## 📊 性能测试

### 测试API响应时间

```bash
# 安装httpstat（如果没有）
brew install httpstat

# 测试API性能
httpstat http://localhost:3000/api/price/pyusd
httpstat http://localhost:3000/api/transfers?limit=50
```

**目标性能**：
- API响应时间 < 500ms
- GraphQL查询 < 100ms

---

## 🎉 测试成功标准

如果你看到以下结果，说明测试成功：

✅ **Envio索引器**
- 成功连接到Sepolia RPC
- 索引到至少1笔Transfer事件
- GraphQL Playground可访问且能查询数据

✅ **后端API**
- 所有6个端点返回有效JSON
- `/health` 显示 "ok" 状态
- 价格数据正常（~$1.00）

✅ **前端**
- 页面正常加载
- 看到Dashboard骨架

---

## 🚀 测试成功后的下一步

### 选项A：继续Day 5开发
实现Discord警报系统

### 选项B：优化现有功能
- 添加更多测试
- 优化性能
- 改进错误处理

### 选项C：开始前端开发
跳到Day 7，开发Dashboard UI

---

## 📞 获取帮助

### 测试失败？

1. **检查日志**：查看终端输出的错误信息
2. **查看文档**：
   - Envio: `packages/indexer/SETUP_GUIDE.md`
   - API: `apps/api/README.md`
3. **重新检查**：运行 `bash test-setup.sh`
4. **清理重启**：
   ```bash
   # 停止所有服务
   # Ctrl+C in each terminal
   
   # 清理Envio数据
   cd packages/indexer
   envio dev --reset
   ```

---

**测试愉快！🎉**

如有问题，请查看 `CURRENT_STATUS.md` 或 `HANDOFF.md`



