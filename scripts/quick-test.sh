#!/bin/bash

# 快速测试脚本 - 测试API服务器和前端
# 使用方法: bash quick-test.sh

echo "🧪 快速测试 - API服务器"
echo "=================================="

# 进入API目录并启动服务器（后台）
cd apps/api

echo "📦 安装API依赖..."
pnpm install > /dev/null 2>&1

echo "🚀 启动API服务器（后台）..."
pnpm dev > api.log 2>&1 &
API_PID=$!

echo "⏳ 等待API服务器启动..."
sleep 5

# 测试API健康检查
echo ""
echo "🧪 测试 /health 端点..."
curl -s http://localhost:3000/health | jq '.' || echo "API未响应或jq未安装"

echo ""
echo "🧪 测试 /api/price/pyusd 端点..."
curl -s http://localhost:3000/api/price/pyusd | jq '.' || echo "API未响应"

echo ""
echo "=================================="
echo "✅ 快速测试完成"
echo ""
echo "API进程ID: $API_PID"
echo "查看日志: tail -f apps/api/api.log"
echo "停止API: kill $API_PID"
echo ""
echo "⚠️  注意: 要测试完整功能（Envio + 数据查询），"
echo "   请配置 .env 中的 SEPOLIA_RPC_URL"
echo "   然后按照 TEST_GUIDE.md 的步骤操作"







