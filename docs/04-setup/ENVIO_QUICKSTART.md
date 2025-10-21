# 🚀 Envio 快速启动指南

## 当前状态 ✅

**所有系统正常运行！**

```
✅ Envio Indexer:  正在索引 (6 events processed)
✅ API Server:     http://localhost:3000
✅ Frontend:       http://localhost:5173
✅ GraphQL:        http://localhost:8080/v1/graphql
✅ PostgreSQL:     localhost:5433
```

---

## 🎯 检查系统状态

### 快速健康检查
```bash
# 1. 检查所有进程
ps aux | grep -E "envio|node.*api|vite"

# 2. 检查 Docker 容器
docker ps

# 3. 测试 API
curl http://localhost:3000/api/price/pyusd

# 4. 测试 GraphQL
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ Transfer(limit: 1) { id } }"}'
```

### 查看日志
```bash
# Envio indexer 日志
tail -f packages/indexer/envio-final-run.log

# API 日志
tail -f apps/api/api.log
```

---

## 🔄 重启服务

### 停止所有服务
```bash
# 停止 Envio
pkill -f "envio dev"

# 停止 API
pkill -f "node.*api"

# 停止前端
pkill -f "vite"

# 停止 Docker (可选)
cd packages/indexer/generated && docker compose down
```

### 启动服务（按顺序）

#### 1. 启动 Docker
```bash
cd packages/indexer/generated
docker compose up -d
# 等待 5 秒让服务启动
sleep 5
```

#### 2. 启动 Envio Indexer
```bash
cd packages/indexer
pnpm run dev > envio.log 2>&1 &
# 记录 PID: echo $!
```

#### 3. 启动 API Server
```bash
cd apps/api
pnpm run dev > api.log 2>&1 &
# 记录 PID: echo $!
```

#### 4. 启动 Frontend
```bash
cd apps/frontend
pnpm run dev > frontend.log 2>&1 &
# 记录 PID: echo $!
```

#### 5. 验证所有服务
```bash
# 等待 10 秒
sleep 10

# 测试
curl http://localhost:3000/api/price/pyusd
curl http://localhost:5173
```

---

## 🛠️ 常见问题

### 问题 1: 端口已被占用

**错误**: `EADDRINUSE: address already in use`

**解决**:
```bash
# 找到占用端口的进程
lsof -ti:9898  # Envio
lsof -ti:3000  # API
lsof -ti:5173  # Frontend
lsof -ti:8080  # Hasura

# 杀死进程
kill -9 <PID>

# 或者一次性杀死所有
lsof -ti:9898 | xargs kill -9
```

### 问题 2: Envio 编译失败

**错误**: `Failed to import handler file`

**解决**:
```bash
cd packages/indexer

# 重新生成代码
pnpm run codegen

# 确认桥接文件存在
ls -l generated/src/Handlers.gen.js

# 如果不存在，创建它
cat > generated/src/Handlers.gen.js << 'EOF'
export * from './Handlers.res.js';
EOF

# 重启 Envio
pnpm run dev
```

### 问题 3: API 无法连接到 Envio

**错误**: `Failed to fetch transfers from Envio`

**检查**:
```bash
# 1. 确认 GraphQL 端点可访问
curl http://localhost:8080/v1/graphql

# 2. 检查 API 配置
grep ENVIO_GRAPHQL_URL apps/api/src/services/envio-client.ts
# 应该是: http://localhost:8080/v1/graphql

# 3. 重启 API
pkill -f "node.*api"
cd apps/api && pnpm run dev &
```

### 问题 4: Docker 容器未运行

**解决**:
```bash
cd packages/indexer/generated

# 启动容器
docker compose up -d

# 检查状态
docker compose ps

# 查看日志
docker compose logs -f
```

---

## 📊 监控索引进度

### 实时监控
```bash
# 持续显示最新状态
watch -n 5 'tail -20 packages/indexer/envio-final-run.log | grep -E "Events Processed|Total Events"'
```

### 检查数据库
```bash
# 连接到 PostgreSQL
psql -h localhost -p 5433 -U postgres -d envio

# 查询 Transfer 表
SELECT COUNT(*) FROM "Transfer";
SELECT * FROM "Transfer" LIMIT 5;

# 查询 DailyStats 表
SELECT COUNT(*) FROM "DailyStats";
SELECT * FROM "DailyStats" ORDER BY date DESC LIMIT 5;
```

---

## 🧪 测试 API 端点

### 所有端点测试脚本
```bash
#!/bin/bash
echo "Testing API Endpoints..."
echo ""

echo "1. Health Check:"
curl -s http://localhost:3000/health | jq '.'
echo ""

echo "2. Transfers:"
curl -s "http://localhost:3000/api/transfers?limit=5" | jq '.'
echo ""

echo "3. PYUSD Price:"
curl -s http://localhost:3000/api/price/pyusd | jq '.'
echo ""

echo "4. Treasury Value:"
curl -s http://localhost:3000/api/treasury/value | jq '.'
echo ""

echo "5. 24h Volume:"
curl -s http://localhost:3000/api/volume/24h | jq '.'
echo ""

echo "6. Alerts:"
curl -s "http://localhost:3000/api/alerts?limit=5" | jq '.'
echo ""

echo "All tests complete!"
```

保存为 `test-api.sh` 并运行:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 🎨 访问 Dashboard

### 本地开发
```bash
# 打开浏览器访问
open http://localhost:5173

# 或者使用 curl 测试
curl -I http://localhost:5173
```

### 功能验证
1. ✅ 价格卡片显示 PYUSD 实时价格
2. ✅ Transfer 列表（索引完成后会有数据）
3. ✅ 图表和统计数据
4. ✅ 响应式设计

---

## 📝 重要文件位置

### 配置文件
```
packages/indexer/config.yaml                    - Envio 配置
packages/indexer/schema.graphql                 - GraphQL Schema
apps/api/src/services/envio-client.ts          - API 客户端
```

### 生成文件
```
packages/indexer/generated/src/Handlers.gen.js  - 桥接文件 [重要!]
packages/indexer/generated/src/Handlers.gen.ts  - 类型定义
packages/indexer/generated/src/Handlers.res.js  - ReScript 编译输出
```

### 日志文件
```
packages/indexer/envio-final-run.log            - Envio 主日志
apps/api/api.log                                - API 日志
```

---

## 🔐 环境变量

### 当前配置
```bash
# API
PORT=3000
ENVIO_API_URL=http://localhost:8080/v1/graphql

# Envio
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/envio
HASURA_URL=http://localhost:8080

# Sepolia RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/a_gFIJZ5scY2Vj6Dj8LQe
```

---

## 🚨 紧急修复命令

### 完全重置并重启
```bash
#!/bin/bash
echo "🔄 完全重置系统..."

# 1. 停止所有服务
pkill -f "envio dev"
pkill -f "node.*api"
pkill -f "vite"

# 2. 重启 Docker
cd packages/indexer/generated
docker compose down
docker compose up -d
sleep 10

# 3. 清理旧日志
cd ../..
rm -f envio*.log api*.log

# 4. 重新生成代码
pnpm run codegen

# 5. 确保桥接文件存在
cat > generated/src/Handlers.gen.js << 'EOF'
export * from './Handlers.res.js';
EOF

# 6. 启动 Envio
pnpm run dev > envio-new.log 2>&1 &
ENVIO_PID=$!
echo "Envio PID: $ENVIO_PID"
sleep 15

# 7. 启动 API
cd ../../apps/api
pnpm run dev > api-new.log 2>&1 &
API_PID=$!
echo "API PID: $API_PID"
sleep 5

# 8. 启动 Frontend
cd ../frontend
pnpm run dev > frontend-new.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
sleep 5

# 9. 测试
echo ""
echo "🧪 Testing..."
curl -s http://localhost:3000/api/price/pyusd | jq '.'

echo ""
echo "✅ 重启完成!"
echo "📊 Envio: http://localhost:8080/v1/graphql"
echo "🔌 API: http://localhost:3000"
echo "🎨 Frontend: http://localhost:5173"
```

保存为 `reset-all.sh` 并运行:
```bash
chmod +x reset-all.sh
./reset-all.sh
```

---

## 📞 获取帮助

### 查看状态报告
```bash
cat ENVIO_DEBUG_SUCCESS.md
```

### 检查进程
```bash
# 获取所有相关进程
ps aux | grep -E "envio|node.*api|vite|docker" | grep -v grep

# 显示进程树
pstree -p | grep -E "envio|node|docker"
```

### 端口检查
```bash
# 检查所有使用的端口
lsof -i :3000,5173,5433,8080,9898
```

---

## ✨ 成功标志

当你看到以下输出时，说明系统运行正常：

### Envio
```
Events Processed: X
Total Events Processed: X
GraphQL Endpoint: http://localhost:8080/v1/graphql
```

### API
```bash
$ curl http://localhost:3000/api/price/pyusd
{"symbol":"PYUSD","price":0.99985019,"timestamp":...}
```

### Frontend
```bash
$ curl -I http://localhost:5173
HTTP/1.1 200 OK
```

---

**祝调试顺利！🎉**

如有问题，请查看 `ENVIO_DEBUG_SUCCESS.md` 获取详细的调试报告。


