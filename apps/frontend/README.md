# Frontend Dashboard

React + TypeScript + Vite Dashboard for OmniChain DeFi Nexus

## 技术栈

- **React 18** + TypeScript
- **Vite** - 构建工具
- **Tailwind CSS** - 样式
- **TanStack Query** - 数据获取
- **Recharts** - 图表库

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 项目结构

```
src/
├── components/      # React组件
│   ├── Dashboard.tsx
│   ├── TreasuryCard.tsx
│   └── VolumeChart.tsx
├── lib/            # 工具函数
│   └── api-client.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 环境变量

创建 `.env.local` 文件：

```bash
VITE_API_URL=http://localhost:3000
```



