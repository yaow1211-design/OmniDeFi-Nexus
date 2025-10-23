#!/bin/bash

# 测试脚本 - 检查环境配置和服务状态
# 使用方法: bash test-setup.sh

echo "🔍 OmniChain DeFi Nexus - 环境检查"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Node.js
echo "📦 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js 未安装${NC}"
    echo "   请安装 Node.js >= 20.0.0"
    echo "   下载: https://nodejs.org/"
    exit 1
fi

# 检查pnpm
echo ""
echo "📦 检查 pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✅ pnpm 已安装: $PNPM_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  pnpm 未安装${NC}"
    echo "   安装命令: npm install -g pnpm"
fi

# 检查envio
echo ""
echo "📦 检查 Envio CLI..."
if command -v envio &> /dev/null; then
    ENVIO_VERSION=$(envio --version 2>&1 | head -n 1)
    echo -e "${GREEN}✅ Envio 已安装: $ENVIO_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Envio 未安装${NC}"
    echo "   安装命令: npm install -g envio"
fi

# 检查.env文件
echo ""
echo "🔐 检查环境配置..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env 文件存在${NC}"
    
    # 检查关键配置
    if grep -q "SEPOLIA_RPC_URL=" .env && ! grep -q "SEPOLIA_RPC_URL=$" .env && ! grep -q "YOUR-KEY" .env; then
        echo -e "${GREEN}✅ SEPOLIA_RPC_URL 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  SEPOLIA_RPC_URL 未配置或使用默认值${NC}"
        echo "   请设置实际的 Alchemy/Infura RPC URL"
    fi
    
    if grep -q "TREASURY_ADDRESS=" .env && ! grep -q "TREASURY_ADDRESS=0x0000000000000000000000000000000000000000" .env; then
        echo -e "${GREEN}✅ TREASURY_ADDRESS 已配置${NC}"
    else
        echo -e "${YELLOW}⚠️  TREASURY_ADDRESS 未配置或使用默认值${NC}"
        echo "   请设置实际的 Treasury 地址"
    fi
else
    echo -e "${RED}❌ .env 文件不存在${NC}"
    echo "   请复制 .env.example 并配置"
    echo "   命令: cp .env.example .env"
fi

# 检查依赖是否安装
echo ""
echo "📦 检查项目依赖..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ 根目录依赖已安装${NC}"
else
    echo -e "${YELLOW}⚠️  根目录依赖未安装${NC}"
    echo "   运行: pnpm install"
fi

if [ -d "apps/api/node_modules" ]; then
    echo -e "${GREEN}✅ API 依赖已安装${NC}"
else
    echo -e "${YELLOW}⚠️  API 依赖未安装${NC}"
    echo "   运行: cd apps/api && pnpm install"
fi

if [ -d "apps/frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend 依赖已安装${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend 依赖未安装${NC}"
    echo "   运行: cd apps/frontend && pnpm install"
fi

# 检查端口占用
echo ""
echo "🔌 检查端口占用..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口 3000 已被占用（API服务器）${NC}"
    echo "   进程: $(lsof -Pi :3000 -sTCP:LISTEN | tail -n +2)"
else
    echo -e "${GREEN}✅ 端口 3000 可用（API服务器）${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口 5173 已被占用（前端）${NC}"
    echo "   进程: $(lsof -Pi :5173 -sTCP:LISTEN | tail -n +2)"
else
    echo -e "${GREEN}✅ 端口 5173 可用（前端）${NC}"
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口 8080 已被占用（Envio）${NC}"
    echo "   进程: $(lsof -Pi :8080 -sTCP:LISTEN | tail -n +2)"
else
    echo -e "${GREEN}✅ 端口 8080 可用（Envio）${NC}"
fi

# 总结
echo ""
echo "=================================="
echo "📊 检查总结"
echo "=================================="
echo ""

# 判断是否可以启动
CAN_START=true

if ! command -v node &> /dev/null; then
    CAN_START=false
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}建议: 安装 pnpm${NC}"
fi

if ! command -v envio &> /dev/null; then
    echo -e "${YELLOW}建议: 安装 Envio CLI${NC}"
fi

if [ ! -f ".env" ]; then
    CAN_START=false
    echo -e "${RED}必须: 创建 .env 文件${NC}"
fi

if [ "$CAN_START" = true ]; then
    echo -e "${GREEN}✅ 环境检查通过！可以开始测试${NC}"
    echo ""
    echo "🚀 下一步："
    echo "   1. 配置 .env 文件（如果还没配置）"
    echo "   2. 安装依赖: pnpm install"
    echo "   3. 按照 TEST_GUIDE.md 的步骤测试"
else
    echo -e "${RED}❌ 环境检查未通过，请先完成上述配置${NC}"
fi

echo ""







