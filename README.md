# OmniChain DeFi Nexus - MVP 🚀

> 跨链DeFi数据分析与可视化平台 - 2周MVP版本

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Sprint](https://img.shields.io/badge/sprint-2%20weeks-blue)

## 📖 项目概述

OmniChain DeFi Nexus 是一个统一的数据分析平台，用于监控和可视化：
- 💰 DAO财政健康度
- 📊 PYUSD交易量分析
- 🔔 实时大额交易警报
- 💱 实时价格数据（Pyth Network）

## 🏗️ 项目结构

```
omnichain-defi-nexus/
├── apps/
│   ├── api/              # 后端API服务
│   └── frontend/         # React Dashboard
├── packages/
│   └── indexer/          # Envio数据索引器
├── docs/
│   ├── PRD.md
│   ├── DEVELOPMENT_PLAN.md
│   └── MVP_SPRINT_PLAN.md
└── package.json
```

## 🛠️ 技术栈

### 后端
- **Runtime**: Node.js 20+ / Bun
- **Framework**: Express
- **Data Indexing**: Envio
- **Price Feed**: Pyth Network
- **Notifications**: Discord.js

### 前端
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Data Fetching**: TanStack Query

## 🚀 快速开始

### 前置要求

```bash
node >= 20.0.0
pnpm >= 8.0.0
```

### 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd omnichain-defi-nexus

# 安装依赖
pnpm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
# - PYUSD合约地址
# - Discord Bot Token
# - RPC URLs
# - 等等
```

### 启动开发环境

```bash
# 启动所有服务（需要在不同终端）

# 终端1: 启动Envio索引器
cd packages/indexer
pnpm dev

# 终端2: 启动后端API
cd apps/api
pnpm dev

# 终端3: 启动前端
cd apps/frontend
pnpm dev
```

访问: `http://localhost:5173`

## 📦 包说明

### `apps/api` - 后端API

提供以下核心端点：

```
GET  /api/transfers          # 获取最近的PYUSD转账
GET  /api/treasury/value     # 获取Treasury总值
GET  /api/volume/24h         # 获取24小时交易量
GET  /api/price/pyusd        # 获取PYUSD实时价格
GET  /api/alerts             # 获取最新警报
```

### `apps/frontend` - 前端Dashboard

包含两个核心Dashboard：
- 💰 **财政健康Dashboard**: 显示Treasury总值、余额和价格
- 📊 **交易量Dashboard**: 显示24H/7D交易量趋势

### `packages/indexer` - Envio索引器

索引PYUSD合约的Transfer事件，存储到PostgreSQL并提供GraphQL查询。

## 🎯 MVP功能范围

### ✅ 已完成
- [ ] 项目结构初始化
- [ ] Envio配置
- [ ] 后端API基础
- [ ] 前端框架搭建

### 🚧 开发中
- [ ] PYUSD Transfer事件索引
- [ ] Pyth价格集成
- [ ] Discord警报系统
- [ ] Dashboard UI

### 📋 待办
- [ ] 集成测试
- [ ] 部署到生产环境

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 测试特定包
pnpm --filter api test
pnpm --filter frontend test
```

## 🚢 部署

### 前端部署（Vercel）

```bash
cd apps/frontend
vercel deploy --prod
```

### 后端部署（Railway）

```bash
cd apps/api
railway login
railway up
```

### Envio部署

```bash
cd packages/indexer
envio deploy
```

## 📚 文档导航

> **✨ 所有文档已重新组织！** 查看 **[docs/README.md](./docs/README.md)** 获取完整文档索引

### 🚀 快速开始（必读）
1. **[快速上手指南](./docs/02-guides/GETTING_STARTED.md)** - 3步启动开发环境
2. **[模块交接文档](./docs/02-guides/HANDOFF.md)** - 给队友的集成指南 ⭐⭐⭐⭐⭐
3. **[项目完成状态](./docs/03-status-reports/FINAL_COMPLETION_STATUS.md)** - 98% 完成，生产就绪！

### 📋 文档分类（已整理）

| 分类 | 路径 | 文件数 | 说明 |
|:---|:---|:---:|:---|
| 📋 **规划文档** | [docs/01-planning/](./docs/01-planning/) | 5 | PRD、开发计划、演示指南 |
| 📖 **使用指南** | [docs/02-guides/](./docs/02-guides/) | 4 | 快速开始、部署、测试指南 |
| 📊 **状态报告** | [docs/03-status-reports/](./docs/03-status-reports/) | 9 | 项目进度和完成状态 |
| ⚙️ **配置设置** | [docs/04-setup/](./docs/04-setup/) | 3 | 环境配置和集成设置 |
| 🐛 **调试记录** | [docs/05-debug-logs/](./docs/05-debug-logs/) | 6 | 问题排查和修复记录 |
| 📝 **项目总结** | [docs/06-summaries/](./docs/06-summaries/) | 3 | 项目概览和总结报告 |

**总计：30 份文档，11,000+ 行**

### 🎯 推荐阅读路径

#### 新成员入门（30分钟）
```
快速上手指南 → 项目完成状态 → 模块交接文档 ✓
```

#### 准备演示（15分钟）
```
演示指南 → 完成状态 → 项目概览 ✓
```

#### 全面了解（2小时）
```
PRD → 项目概览 → MVP计划 → 部署指南 ✓
```

### 📂 完整文档索引
👉 **[查看完整文档结构](./docs/README.md)** - 包含所有文档的详细索引和导航

## 🤝 贡献指南

本项目采用2周MVP冲刺模式开发：

1. **快速迭代** - 直接push到main分支
2. **聚焦核心** - 只做MVP必需功能
3. **简单优先** - 选择最简单的实现方案

## 📞 联系方式

- **技术问题**: 在Discord讨论
- **Bug报告**: 提Issue
- **功能建议**: 留到MVP后

## 📄 License

MIT License

---

---

## 📊 项目状态

| 指标 | 状态 |
| :--- | :--- |
| **阶段** | ✅ Day 1-4 完成 - 核心基础设施就绪 |
| **进度** | 4 / 14 天 (40%) |
| **下一里程碑** | Day 5: Discord警报系统 |
| **代码状态** | ✅ 可运行、可测试 |

### ✅ 已完成 (Day 1-4)
- ✅ Monorepo项目结构
- ✅ Envio数据索引器配置（Transfer事件、每日统计）
- ✅ 后端API完整实现（6个端点）
  - `/api/transfers` - 转账查询
  - `/api/treasury/value` - Treasury价值
  - `/api/volume/24h` - 24H交易量
  - `/api/volume/history` - 历史交易量
  - `/api/price/pyusd` - PYUSD实时价格
  - `/health` - 健康检查
- ✅ Pyth Network价格集成（含缓存）
- ✅ Envio GraphQL客户端
- ✅ 完整文档（8份，5000+行）

### 📋 待完成
- ⏳ Discord警报系统（Day 5）
- ⏳ 前端Dashboard UI（Day 7-10）
- ⏳ 集成测试（Day 11）
- ⏳ 部署上线（Day 12-14）

### 📈 代码统计
- **总文件数**: 45+
- **代码行数**: ~3,000行
- **文档行数**: ~5,000行
- **功能完成度**: 40%

---

## 👥 给队友的话

如果你是刚加入项目的队友，**强烈建议按以下顺序阅读文档**：

1. 📖 先读 **[HANDOFF.md](./HANDOFF.md)** (15分钟)
   - 了解数据模块在整个项目中的定位
   - 学习如何集成你的模块与数据模块
   - 查看提供的API端点

2. 🚀 再读 **[GETTING_STARTED.md](./GETTING_STARTED.md)** (10分钟)
   - 3步启动开发环境
   - 理解Day 1任务清单
   - 配置必要的环境变量

3. 📊 最后读 **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** (5分钟)
   - 了解已完成的工作
   - 查看技术亮点
   - 理解模块间协作

**30分钟后，你就可以开始集成开发了！**

