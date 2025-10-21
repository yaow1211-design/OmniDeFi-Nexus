# Backend API Service

Express.js API服务，提供数据查询和聚合功能。

## 端点

### GET /health
健康检查端点

### GET /api/transfers
获取最近的PYUSD转账记录

### GET /api/treasury/value
获取DAO Treasury的总价值

### GET /api/volume/24h
获取过去24小时的交易量

### GET /api/price/pyusd
获取PYUSD的实时价格（Pyth Network）

### GET /api/alerts
获取最近的警报记录

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 运行生产版本
pnpm start
```



