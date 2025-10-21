# 🚀 OmniChain DeFi Nexus - 部署指南

> 完整的生产环境部署指南

---

## 📋 部署概览

### 架构
```
┌─────────────────┐
│   Frontend      │ ← Vercel
│   (React/Vite)  │
└────────┬────────┘
         │ API Calls
┌────────▼────────┐
│   Backend API   │ ← Railway
│   (Express)     │
└────────┬────────┘
         │ GraphQL
┌────────▼────────┐
│ Envio Indexer   │ ← Envio Cloud
│ (Data Layer)    │
└─────────────────┘
```

---

## 🎯 准备工作

### 1. 账号注册

- [ ] [Vercel](https://vercel.com/) - 前端托管
- [ ] [Railway](https://railway.app/) - 后端托管
- [ ] [Envio](https://envio.dev/) - 索引器托管
- [ ] [Alchemy](https://www.alchemy.com/) - RPC服务
- [ ] [Discord Developer](https://discord.com/developers) - 警报系统（可选）

### 2. 获取凭证

```bash
# Alchemy RPC URL
https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Discord Bot Token (可选)
YOUR-DISCORD-BOT-TOKEN

# Discord Channel ID (可选)
YOUR-DISCORD-CHANNEL-ID
```

---

## 1️⃣ 部署 Envio 索引器

### 步骤 1: 安装 Envio CLI

```bash
npm install -g envio
```

### 步骤 2: 配置 Envio

```bash
cd packages/indexer
```

编辑 `config.yaml`:
```yaml
networks:
  - id: 11155111  # Sepolia
    rpc_config:
      url: https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY  # 替换
      
contracts:
  - name: PYUSD
    address: 0x9c6522498b09F1b8Bd6C4fC77d1833a2fA5f1111  # 实际PYUSD地址
```

### 步骤 3: 生成代码

```bash
envio codegen
```

### 步骤 4: 本地测试

```bash
envio dev
```

访问: `http://localhost:8080/graphql`

### 步骤 5: 部署到 Envio Cloud

```bash
# 登录
envio login

# 部署
envio deploy
```

获取GraphQL端点:
```
https://YOUR-PROJECT-ID.envio.dev/graphql
```

---

## 2️⃣ 部署后端API到Railway

### 步骤 1: 准备代码

确保 `apps/api` 目录中有：
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `src/index.ts`

### 步骤 2: 创建Railway项目

1. 访问 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权并选择你的仓库
5. 选择 **"apps/api"** 目录

### 步骤 3: 配置环境变量

在Railway Dashboard中设置：

```env
# Node环境
NODE_ENV=production
PORT=3000

# RPC
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY

# Treasury
TREASURY_ADDRESS=0x_YOUR_TREASURY_ADDRESS

# Envio
ENVIO_GRAPHQL_URL=https://YOUR-PROJECT.envio.dev/graphql

# Discord (可选)
DISCORD_BOT_TOKEN=YOUR_TOKEN
DISCORD_CHANNEL_ID=YOUR_CHANNEL_ID
```

### 步骤 4: 配置构建设置

Railway会自动检测，但确保：

**Build Command**:
```bash
pnpm install && pnpm build
```

**Start Command**:
```bash
node dist/index.js
```

**Root Directory**:
```
apps/api
```

### 步骤 5: 部署

点击 **"Deploy"** 按钮

获取API URL:
```
https://YOUR-PROJECT.railway.app
```

### 步骤 6: 验证

```bash
curl https://YOUR-PROJECT.railway.app/health
```

---

## 3️⃣ 部署前端到Vercel

### 步骤 1: 安装Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2: 配置环境变量

创建 `apps/frontend/.env.production`:

```env
VITE_API_URL=https://YOUR-PROJECT.railway.app
```

### 步骤 3: Vercel配置

创建 `apps/frontend/vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "devCommand": "pnpm dev"
}
```

### 步骤 4: 从CLI部署

```bash
cd apps/frontend
vercel login
vercel --prod
```

### 步骤 5: 或从GitHub部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 导入GitHub仓库
4. 配置项目设置：

**Framework Preset**: Vite
**Root Directory**: `apps/frontend`
**Build Command**: `pnpm build`
**Output Directory**: `dist`

5. 设置环境变量：
```
VITE_API_URL=https://YOUR-PROJECT.railway.app
```

6. 点击 **"Deploy"**

### 步骤 6: 自定义域名（可选）

在Vercel Dashboard：
1. 进入项目设置
2. 点击 **"Domains"**
3. 添加自定义域名
4. 配置DNS

---

## 🧪 部署后测试

### 1. 测试Envio索引器

```bash
curl -X POST https://YOUR-PROJECT.envio.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ transfers(limit: 5) { id from to value } }"}'
```

### 2. 测试后端API

```bash
# 健康检查
curl https://YOUR-PROJECT.railway.app/health

# 价格API
curl https://YOUR-PROJECT.railway.app/api/price/pyusd

# 转账记录
curl https://YOUR-PROJECT.railway.app/api/transfers
```

### 3. 测试前端

访问: `https://YOUR-PROJECT.vercel.app`

检查：
- ✅ Dashboard加载正常
- ✅ 价格数据显示
- ✅ Treasury值显示
- ✅ 图表渲染
- ✅ 交易列表显示

---

## ⚙️ 环境变量完整清单

### Envio (`config.yaml`)
```yaml
rpc_url: YOUR_RPC_URL
```

### Railway (Backend)
```env
NODE_ENV=production
PORT=3000
SEPOLIA_RPC_URL=YOUR_RPC_URL
TREASURY_ADDRESS=YOUR_TREASURY_ADDRESS
ENVIO_GRAPHQL_URL=YOUR_ENVIO_URL
DISCORD_BOT_TOKEN=OPTIONAL
DISCORD_CHANNEL_ID=OPTIONAL
```

### Vercel (Frontend)
```env
VITE_API_URL=YOUR_RAILWAY_URL
```

---

## 📊 监控和日志

### Railway 日志

在Railway Dashboard查看实时日志：
```
Dashboard > Your Project > Deployments > Logs
```

### Vercel 日志

在Vercel Dashboard查看：
```
Dashboard > Your Project > Logs
```

### Envio 监控

在Envio Dashboard查看索引状态：
```
Dashboard > Your Project > Metrics
```

---

## 🔧 故障排除

### 问题1: Frontend无法连接Backend

**症状**: CORS错误

**解决方案**:
在 `apps/api/src/index.ts` 中配置CORS：

```typescript
app.use(cors({
  origin: [
    'https://YOUR-FRONTEND.vercel.app',
    'http://localhost:5173'  // 开发环境
  ],
  credentials: true
}));
```

重新部署Backend。

### 问题2: Envio未索引数据

**症状**: 查询返回空数组

**检查清单**:
- [ ] RPC URL正确且有效
- [ ] 合约地址正确
- [ ] 链ID匹配 (Sepolia: 11155111)
- [ ] 起始区块号合理

**解决方案**:
```bash
# 重新部署Envio
cd packages/indexer
envio deploy --force
```

### 问题3: Railway构建失败

**症状**: Build命令失败

**解决方案**:
1. 检查 `package.json` 中的构建脚本
2. 确保所有依赖都在 `dependencies` 中
3. 检查 TypeScript 配置

```bash
# 本地测试构建
cd apps/api
pnpm build
```

### 问题4: Vercel部署超时

**症状**: 构建超过15分钟

**解决方案**:
优化构建:
```json
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false,  // 禁用source maps
    minify: 'esbuild',  // 使用esbuild
    target: 'es2020'
  }
});
```

---

## 🚀 CI/CD 自动部署

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd apps/frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          # Railway会自动部署
          echo "Railway auto-deploy from GitHub"
```

---

## 📈 性能优化

### Frontend
- ✅ 使用lazy loading
- ✅ 图片优化
- ✅ 代码分割
- ✅ CDN缓存

### Backend
- ✅ 使用缓存（Redis）
- ✅ API速率限制
- ✅ 数据库查询优化
- ✅ 使用PM2进程管理

### Envio
- ✅ 合理设置索引范围
- ✅ 优化GraphQL查询
- ✅ 使用分页

---

## 🔒 安全建议

### API安全
- [ ] 启用HTTPS
- [ ] 实现API密钥认证
- [ ] 添加速率限制
- [ ] 验证输入

### 环境变量
- [ ] 永远不要提交 `.env` 文件
- [ ] 使用环境特定的配置
- [ ] 定期轮换密钥

### 依赖管理
- [ ] 定期更新依赖
- [ ] 使用 `pnpm audit` 检查漏洞
- [ ] 启用Dependabot

---

## 📚 有用的命令

### 快速部署
```bash
# 部署所有服务
./deploy-all.sh
```

### 查看日志
```bash
# Railway
railway logs

# Vercel
vercel logs
```

### 回滚
```bash
# Vercel
vercel rollback

# Railway - 在Dashboard中操作
```

---

## ✅ 部署检查清单

完成后确认：

- [ ] Envio索引器运行正常
- [ ] Backend API响应正常
- [ ] Frontend加载成功
- [ ] 价格数据实时更新
- [ ] 交易数据显示正确
- [ ] Discord警报工作（如已配置）
- [ ] 所有环境变量已设置
- [ ] HTTPS已启用
- [ ] 自定义域名已配置（如需要）
- [ ] 监控和日志已设置
- [ ] 团队成员已添加

---

## 🎓 更多资源

### 文档
- [Vercel文档](https://vercel.com/docs)
- [Railway文档](https://docs.railway.app/)
- [Envio文档](https://docs.envio.dev/)

### 支持
- Discord: ETHOline 2025社区
- GitHub Issues: 项目仓库

---

**部署愉快！🚀**

**创建日期**: 2025-10-20  
**版本**: V1.0  
**状态**: ✅ 生产就绪



