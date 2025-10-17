## 1. 简介与目标 (Introduction & Objectives)

### 1.1 项目背景

OmniChain DeFi & Commerce Nexus 是一个统一的跨链商业与金融协议，旨在通过自主代理 (Agent) 和原子化跨链技术 (Avail Nexus) 实现去中心化交易。

### 1.2 目标

本模块旨在实现项目的 **数据智能 (Data Intelligence)** 和 **实时监控 (Real-time Monitoring)**。核心目标是为 DAO 成员、贡献者和社区提供透明、实时、可操作的洞察，以指导治理和资金管理决策。

### 1.3 核心工具栈

| 技术名称 | 主要用途 |
| :--- | :--- |
| **Envio** | 数据索引与高性能 GraphQL 查询 |
| **Blockscout SDK** | 实时链上数据源、Dashboard UI 构建 |
| **Pyth Network** | 实时喂价 (PYUSD, 其他资产) |
| **Hedera, Avail Nexus** | 交易和审计日志的追踪数据源 |

---

## 2. 功能需求：数据处理与索引 (Functional Requirements: Data & Indexing)

### 2.1 Envio Indexer (数据提取核心)

**需求 ID：** `DA-ENVIO-001`

| 数据源与事件 | 描述 | 目的 |
| :--- | :--- | :--- |
| **PYUSD 转移** | 监听 PYUSD 合约的 `Transfer` 事件。 | 追踪资金流向和 DAO 收入/支出。 |
| **交易与托管** | 监听 HTS 托管合约的 `AssetLocked`, `AssetReleased` 等事件。 | 追踪交易状态和资产锁定情况。 |
| **Agent 谈判** | 监听 Hedera Consensus Service (HCS) 上的 Agent A2A 协议日志。 | 分析谈判效率和审计追踪。 |
| **跨链结算** | 监听 Avail Nexus 的 `BridgeExecuted` 和 `SwapCompleted` 事件。 | 追踪跨链原子化交易的完整性。 |

**验收标准：**
* Indexer 能够稳定运行并成功索引过去 100,000 个区块的关键事件。
* 关键 GraphQL 查询的延迟低于 50ms。

### 2.2 Pyth Network 集成

**需求 ID：** `DA-PYTH-002`

**描述：** 集成 Pyth Network 实时喂价数据，用于所有 USD 计价的计算。

**关键用途：**
1.  **PYUSD 汇率：** 获取 PYUSD 兑 USD 的实时价格。
2.  **交易量折算：** 将不同代币计价的交易统一折算成 USD 价值。

**验收标准：** Dashboard 上的所有 USD 价值展示基于 Pyth Network 实时数据，延迟 $\le 5$ 秒。

---

## 3. 功能需求：仪表板与可视化 (Functional Requirements: Dashboard & Visualization)

### 3.1 DAO 财政健康仪表板 (Treasury Health Dashboard)

**需求 ID：** `DA-DASH-001`

**核心组件 (基于 Blockscout SDK 的数据展示)：**

| 组件 | 数据来源 | 描述 |
| :--- | :--- | :--- |
| **总资产价值 (Total Value)** | Envio/Blockscout & Pyth | 金库中所有资产的实时总 USD 价值。 |
| **资产流动图** | Envio | 按日期显示的费用收入 (PYUSD) 和薪酬支出 (PYUSD) 的净流量图。 |
| **Yield 表现** | Envio/外部 API | 实时 APY 曲线图，展示 PYUSD 质押收益率。 |
| **APY Top-Up Card** | Blockscout/Envio | 突出显示当前推荐的最高收益 PYUSD 农场。 |

### 3.2 商业与交易分析仪表板 (Commerce & Transaction Analyzer)

**需求 ID：** `DA-DASH-002`

**核心组件：**

| 组件 | 数据来源 | 描述 |
| :--- | :--- | :--- |
| **跨链交易量 (TVol)** | Envio | 过去 24H/7D/30D 的总交易量 (USD)。 |
| **Agent 成功率** | Envio (HCS Logs) | 饼图展示自主谈判的成功率（成功交易数 / 部署 Agent 总数）。 |
| **平均谈判时间** | Envio (HCS Logs) | 从 Agent 部署到交易锁定的平均时长 (单位：秒)。 |
| **跨链路径分析** | Envio (Avail Events) | 最常用的 Avail Nexus 跨链路径、数量和平均 Gas 成本。 |

**3.3 用户体验 (UX) 要求**

1.  所有图表必须提供时间范围选择器（1D, 7D, 30D, All-Time）。
2.  Dashboard 首屏关键指标加载时间目标：$\le 3$ 秒。

---

## 4. 功能需求：监控与预警系统 (Monitoring & Alerts)

### 4.1 自定义预警系统 (Custom Alerting)

**需求 ID：** `DA-ALERT-001`

**描述：** 构建一个后端服务，定期查询 Envio 数据，并在满足条件时触发通知。

**关键警报类型 (MVP)：**

1.  **财政警报：**
    * **条件：** DAO 财政的实时 Yield APY 持续低于阈值（例如：`< 4%`）超过 $N$ 小时。
    * **通知：** 实时发送 “🚨 DAO 收益警报”。
2.  **交易量警报：**
    * **条件：** 单笔交易的 USD 价值超过阈值（例如：`> $100,000`）。
    * **通知：** 实时发送 “💰 大额交易警报”。
3.  **系统健康警报：**
    * **条件：** Envio Indexer 连续 10 分钟未索引到新的区块。
    * **通知：** 实时发送 “⚠️ 数据健康警报”。

**4.2 通知渠道**

* MVP：集成推送服务到私有的 Discord/Telegram 频道。

---

## 5. 技术要求与约束 (Technical Requirements & Constraints)

| 类型 | 要求/约束 |
| :--- | :--- |
| **性能** | GraphQL API 查询时间：关键指标查询时间 $\le 100$ 毫秒。 |
| **数据源** | **单一来源原则 (SSOT)：** 所有分析数据必须以 Envio Indexer 的聚合结果为准。 |
| **智能合约** | 智能合约必须发出可供 Envio 索引的、清晰且字段完整的事件 (Events)。 |
| **安全** | 所有连接到链上数据源和 API 的凭证必须安全存储。 |

---

## 6. 发布与验收标准 (Launch & Acceptance Criteria)

| 阶段 | 验收标准 | 负责人 |
| :--- | :--- | :--- |
| **数据层** | Envio Indexer 成功部署，关键 GraphQL 查询性能达标。 | 后端工程师 |
| **可视化** | 所有核心 Dashboard 组件 (DA-DASH-001, DA-DASH-002) 均能正确渲染和展示数据。 | 前端工程师 |
| **监控** | 至少两种自定义警报 (DA-ALERT-001) 设置成功，并在满足条件时成功发送通知。 | 后端工程师/运维 |
