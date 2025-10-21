# 快速开始指南 🚀

> 为OmniChain DeFi Nexus项目的新成员准备

## 📦 项目已完成的初始化

### ✅ 已创建的结构

```
omnichain-defi-nexus/
├── apps/
│   ├── api/              ✅ 后端API（Express + TypeScript）
│   └── frontend/         ✅ 前端Dashboard（React + Vite + Tailwind）
├── packages/
│   └── indexer/          ✅ Envio索引器（配置模板）
├── docs/
│   ├── PRD.md                      ✅ 产品需求文档
│   ├── context_engineering.md      ✅ 技术栈说明
│   ├── DEVELOPMENT_PLAN.md         ✅ 完整开发计划（8-12周）
│   ├── MVP_SPRINT_PLAN.md          ✅ 2周MVP冲刺计划
│   └── HANDOFF.md                  ✅ 交接文档
├── package.json          ✅ Monorepo配置
├── turbo.json            ✅ Turbo构建配置
├── pnpm-workspace.yaml   ✅ PNPM工作区
└── README.md             ✅ 项目说明
```

## 🚀 立即开始（3步）

### 第1步：安装依赖

```bash
# 确保已安装必要工具
node --version  # 需要 >= 20.0.0
pnpm --version  # 需要 >= 8.0.0

# 克隆仓库后，进入项目目录
cd omnichain-defi-nexus

# 安装所有依赖
pnpm install
```

### 第2步：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件（最小配置）
# 必须配置:
# - SEPOLIA_RPC_URL (从Alchemy/Infura获取)
# - PYUSD_CONTRACT_ADDRESS (查看下方)
# - TREASURY_ADDRESS (你们的DAO Treasury地址)

# 可选配置:
# - DISCORD_BOT_TOKEN (警报系统需要)
# - PYTH_PRICE_ID (价格数据需要)
```

### 第3步：启动开发环境

```bash
# 方案A: 分别启动（推荐，便于调试）

# 终端1: 启动后端API
cd apps/api
pnpm dev

# 终端2: 启动前端
cd apps/frontend
pnpm dev

# 终端3: 启动Envio索引器（配置好后）
cd packages/indexer
envio dev

# 方案B: 一键启动所有服务
pnpm dev  # 使用Turbo并行启动
```

## 📍 重要信息

### PYUSD合约地址

```bash
# Sepolia测试网
# TODO: 需要查找官方PYUSD测试合约地址
PYUSD_CONTRACT_ADDRESS=0x...

# 或者可以部署一个简单的ERC20测试合约
# 参考: apps/api/src/contracts/MockPYUSD.sol
```

### 服务端口

```
API服务器:    http://localhost:3000
前端Dashboard: http://localhost:5173
Envio GraphQL: http://localhost:8080/graphql
```

### 健康检查

```bash
# 检查API是否运行
curl http://localhost:3000/health

# 检查前端是否运行
open http://localhost:5173

# 检查Envio是否索引
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ transfers(limit: 1) { id } }"}'
```

## 📖 关键文档阅读顺序

1. **先读**: [HANDOFF.md](./HANDOFF.md) - 了解数据模块在整个项目中的位置
2. **再读**: [MVP_SPRINT_PLAN.md](./MVP_SPRINT_PLAN.md) - 2周开发计划
3. **参考**: [PRD.md](./PRD.md) - 完整产品需求
4. **深入**: [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - 长期规划

## 🎯 Day 1 任务清单

- [ ] 安装Node.js 20+和pnpm 8+
- [ ] 克隆仓库并安装依赖 (`pnpm install`)
- [ ] 配置环境变量（`.env`）
- [ ] 获取Sepolia RPC URL（Alchemy/Infura）
- [ ] 找到PYUSD测试合约地址
- [ ] 启动API服务器并访问 `/health`
- [ ] 启动前端并看到Dashboard
- [ ] 阅读HANDOFF.md文档

## 🤝 与其他模块的协作

### 如果你负责前端dApp（Autoscout）

数据模块为你提供：
- REST API端点（查询交易、价格、Treasury等）
- 实时数据（可以轮询或WebSocket）
- 参考: [HANDOFF.md 第5.1节](./HANDOFF.md#51-与前端dapp集成)

### 如果你负责Agent服务（Hedera）

数据模块为你提供：
- 历史交易数据（用于信用评估）
- 实时价格数据（用于估值）
- 参考: [HANDOFF.md 第5.2节](./HANDOFF.md#52-与hedera-agent服务集成)

### 如果你负责跨链桥接（Avail Nexus）

数据模块会：
- 自动索引你的桥接事件
- 追踪跨链交易状态
- 参考: [HANDOFF.md 第5.3节](./HANDOFF.md#53-与跨链桥接服务集成)

### 如果你负责智能合约

确保你的合约发出这些事件：
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event AssetLocked(bytes32 indexed tradeId, address asset, uint256 amount, uint256 timestamp);
event AssetReleased(bytes32 indexed tradeId, address recipient, uint256 amount, uint256 timestamp);
```

参考: [HANDOFF.md 第5.4节](./HANDOFF.md#54-事件流集成)

## 🆘 遇到问题？

### 常见问题

**Q: `pnpm install` 失败**
```bash
# 清理缓存重试
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Q: TypeScript报错**
```bash
# 重新生成类型
pnpm build
```

**Q: API启动失败**
```bash
# 检查端口是否被占用
lsof -i :3000
# 或改变端口
PORT=3001 pnpm dev
```

**Q: Envio索引不工作**
```bash
# 检查RPC URL是否正确
# 检查合约地址是否正确
# 查看Envio日志
envio dev --verbose
```

### 获取帮助

- **代码问题**: 在Discord #dev-questions频道提问
- **架构问题**: 查看HANDOFF.md或联系模块负责人
- **Bug报告**: 在GitHub提Issue

## 📅 接下来做什么？

根据今天是哪一天：

- **Day 1-2**: 完成环境配置，熟悉代码结构
- **Day 2-3**: 配置Envio索引PYUSD Transfer事件
- **Day 3-4**: 开发后端API端点和Pyth集成
- **Day 5-6**: 开发Discord警报系统
- **Day 7+**: 前端Dashboard开发

参考: [MVP_SPRINT_PLAN.md](./MVP_SPRINT_PLAN.md)

## 🎉 恭喜！

你已经完成了项目初始化！现在：

1. ✅ 阅读完这份文档
2. ✅ 完成Day 1任务清单
3. ✅ 阅读HANDOFF.md了解整体集成
4. ✅ 加入团队Discord/Slack
5. ✅ 开始编码！

**Let's build something amazing! 🚀**



