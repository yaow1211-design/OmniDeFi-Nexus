# Discord Bot 设置指南 🤖

> 为OmniChain DeFi Nexus配置Discord警报系统

---

## 📋 概述

Discord警报系统可以实时推送：
- 🔴 大额交易警报 (>$100,000)
- ⚠️ 索引器健康检查
- 📊 Treasury状态变化

---

## 🚀 快速设置（5分钟）

### 步骤1: 创建Discord Bot

1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)

2. 点击 **"New Application"**
   - 名称: `OmniChain DeFi Nexus`
   - 同意条款

3. 进入 **"Bot"** 标签页
   - 点击 **"Add Bot"**
   - 确认创建

4. 配置Bot权限：
   - ✅ `Send Messages`
   - ✅ `Send Messages in Threads`
   - ✅ `Embed Links`

5. **复制Bot Token** 🔑
   ```
   点击 "Reset Token" 或 "Copy"
   保存Token到安全的地方
   ```

### 步骤2: 邀请Bot到服务器

1. 在Developer Portal，进入 **"OAuth2" > "URL Generator"**

2. 选择以下权限：

   **Scopes**:
   - ✅ `bot`

   **Bot Permissions**:
   - ✅ `Send Messages`
   - ✅ `Embed Links`

3. 复制生成的URL，在浏览器打开

4. 选择你的Discord服务器，点击 **"授权"**

### 步骤3: 获取频道ID

1. 在Discord中启用开发者模式：
   - 用户设置 > 高级 > 开发者模式 ✅

2. 右键点击警报频道 > **"复制频道ID"**

### 步骤4: 配置环境变量

编辑 `.env` 文件：

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=你的Bot Token
DISCORD_CHANNEL_ID=你的频道ID
```

### 步骤5: 重启API服务器

```bash
cd apps/api
pnpm dev
```

你会看到：
```
✅ Discord bot logged in as OmniChain DeFi Nexus#1234
🔍 Starting alert monitoring...
   - Large transaction threshold: $100,000
   - Checking every 30 seconds
```

---

## 🧪 测试警报

### 使用API端点测试

```bash
# 发送测试警报
curl -X POST http://localhost:3000/api/alerts/test
```

你应该在Discord频道看到：

```
🟡 🧪 Test Alert
This is a test alert from the OmniChain DeFi Nexus alert system

Status: Test
Time: 2025-10-20T02:30:00.000Z
System: Alert Service
```

### 检查警报历史

```bash
# 获取所有警报
curl http://localhost:3000/api/alerts

# 只获取活跃警报
curl http://localhost:3000/api/alerts?active=true

# 限制数量
curl http://localhost:3000/api/alerts?limit=10
```

---

## 📊 警报类型

### 1. 大额交易警报 🚨

**触发条件**: 交易金额 > $100,000 USD

**示例**:
```
🔴 🚨 Large Transaction Detected
A transaction of $150,000 was detected

Amount: $150,000
From: 0x1234...5678
To: 0xabcd...ef01
Transaction: [View]
Block: 12345678
```

**严重程度**: High

### 2. 索引器健康警报 ⚠️

**触发条件**: 超过10分钟未索引新数据

**示例**:
```
🚨 ⚠️ Indexer Health Alert
No new data indexed for 15 minutes

Status: Stale
Last Update: 2025-10-20T02:15:00.000Z
Duration: 15 minutes
```

**严重程度**: Critical

---

## ⚙️ 自定义配置

### 修改警报阈值

编辑 `apps/api/src/services/alert-service.ts`:

```typescript
const ALERT_THRESHOLDS = {
  LARGE_TRANSACTION: 100000, // 修改为你想要的金额
  TREASURY_LOW_YIELD: 0.04,  // 4% APY
  INDEXER_STALE: 600,        // 10分钟（秒）
};
```

### 修改监控频率

在 `alert-service.ts` 的 `startMonitoring()` 函数:

```typescript
// 大额交易检查（默认30秒）
setInterval(() => {
  checkLargeTransactions();
}, 30000); // 修改为你想要的毫秒数

// 索引器健康检查（默认5分钟）
setInterval(() => {
  checkIndexerHealth();
}, 300000); // 修改为你想要的毫秒数
```

---

## 🎨 自定义警报外观

### 修改警报颜色

在 `sendDiscordAlert()` 函数:

```typescript
const colors = {
  low: 0x3498db,      // 蓝色
  medium: 0xf39c12,   // 橙色
  high: 0xe74c3c,     // 红色
  critical: 0x992d22, // 深红色
};
```

### 修改Emoji

在 `getSeverityEmoji()` 函数:

```typescript
const emojis = {
  low: '🔵',
  medium: '🟡',
  high: '🔴',
  critical: '🚨',
};
```

---

## 🔍 API端点

### 获取警报历史

```http
GET /api/alerts
GET /api/alerts?limit=10
GET /api/alerts?active=true
```

**响应**:
```json
{
  "alerts": [
    {
      "id": "alert-1234567890-abc",
      "type": "large_transaction",
      "severity": "high",
      "title": "🚨 Large Transaction Detected",
      "description": "A transaction of $150,000 was detected",
      "data": {
        "Amount": "$150,000",
        "From": "0x1234...5678",
        "To": "0xabcd...ef01"
      },
      "timestamp": 1729383000000,
      "resolved": false
    }
  ],
  "count": 1,
  "discordEnabled": true
}
```

### 获取单个警报

```http
GET /api/alerts/:id
```

### 发送测试警报

```http
POST /api/alerts/test
```

---

## ⚠️ 故障排除

### 问题1: Bot未上线

**症状**:
```
⚠️  Discord bot not configured
```

**解决方案**:
1. 检查 `.env` 文件中的 `DISCORD_BOT_TOKEN`
2. 确保Token正确且未过期
3. 重启API服务器

### 问题2: 消息发送失败

**症状**:
```
❌ Failed to send Discord alert: DiscordAPIError
```

**解决方案**:
1. 检查 `DISCORD_CHANNEL_ID` 是否正确
2. 确保Bot在该频道有权限
3. 检查Bot权限设置（Send Messages, Embed Links）

### 问题3: 未收到警报

**可能原因**:
- ✅ 检查Envio是否运行
- ✅ 检查是否有真实交易发生
- ✅ 检查交易金额是否达到阈值

**测试方法**:
```bash
# 发送测试警报验证Discord连接
curl -X POST http://localhost:3000/api/alerts/test
```

### 问题4: 警报重复

**解决方案**:
系统会自动去重，检查 `alert-service.ts` 中的去重逻辑：

```typescript
const alreadyAlerted = alertHistory.some(
  a => a.type === 'large_transaction' && 
       a.data.txHash === transfer.transactionHash
);
```

---

## 📊 监控指标

### 警报统计

```bash
# 查看警报数量
curl http://localhost:3000/api/alerts | jq '.count'

# 查看活跃警报
curl http://localhost:3000/api/alerts?active=true | jq '.alerts | length'

# 按类型统计
curl http://localhost:3000/api/alerts | jq '[.alerts | group_by(.type) | .[] | {type: .[0].type, count: length}]'
```

---

## 🚀 生产环境建议

### 1. 使用独立的警报频道

创建专用频道：
```
#alerts-critical  (只放critical级别)
#alerts-all       (所有警报)
```

### 2. 配置频道权限

- 管理员: 可读可写
- 团队成员: 只读
- Bot: 发送消息

### 3. 添加Webhook通知

除了Discord，还可以集成：
- Slack
- Telegram
- Email
- PagerDuty（严重故障）

### 4. 设置警报聚合

避免警报风暴：
```typescript
// 在同一时间窗口内只发送一次同类警报
const ALERT_COOLDOWN = 600000; // 10分钟
```

---

## 📚 进阶功能（未来）

### 计划中的功能：

- [ ] **智能警报分组** - 合并相关警报
- [ ] **警报优先级** - 基于机器学习
- [ ] **自动解决** - 问题消失后自动标记已解决
- [ ] **警报订阅** - 用户可选择接收哪些类型
- [ ] **多频道支持** - 不同级别发送到不同频道
- [ ] **警报分析** - 统计和趋势分析

---

## 🤝 需要帮助？

### 相关文档
- **API文档**: `apps/api/README.md`
- **测试指南**: `TEST_GUIDE.md`
- **项目总览**: `PROJECT_OVERVIEW.md`

### Discord Bot文档
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs)

---

## ✅ 检查清单

设置完成后，确认以下项目：

- [ ] Discord Bot已创建
- [ ] Bot已添加到服务器
- [ ] `.env` 文件已配置
- [ ] API服务器显示Bot已登录
- [ ] 测试警报成功发送
- [ ] 在Discord看到测试消息
- [ ] 警报历史API正常工作

---

**配置完成！🎉**

你的Discord警报系统已准备就绪！

---

**创建日期**: 2025-10-20  
**版本**: V1.0  
**状态**: ✅ 生产就绪

**Happy Monitoring! 📊**



