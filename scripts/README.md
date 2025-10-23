# 开发脚本 (Development Scripts)

此文件夹包含项目开发和测试的辅助脚本。

## 📜 可用脚本

### 🧪 `quick-test.sh` - 快速测试脚本

快速测试 API 服务器的基本功能。

**使用方法：**
```bash
bash scripts/quick-test.sh
```

**功能：**
- ✅ 启动 API 服务器
- ✅ 测试 `/health` 端点
- ✅ 测试 `/api/price/pyusd` 端点
- ✅ 输出进程 ID 和日志路径

**输出：**
- 日志文件：`apps/api/api.log`

---

### 🔍 `test-setup.sh` - 环境检查脚本

检查开发环境配置和依赖安装情况。

**使用方法：**
```bash
bash scripts/test-setup.sh
```

**检查项目：**
- ✅ Node.js 版本
- ✅ pnpm 安装状态
- ✅ Envio CLI 安装状态
- ✅ `.env` 文件配置
- ✅ 项目依赖安装
- ✅ 端口占用情况 (3000, 5173, 8080)

---

## 🚀 使用建议

1. **新成员入职**：先运行 `test-setup.sh` 检查环境
2. **快速验证**：使用 `quick-test.sh` 验证 API 功能
3. **完整测试**：参考 `docs/02-guides/TEST_GUIDE.md`

## ⚙️ 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Envio CLI (可选)
- 已配置的 `.env` 文件

## 📝 注意事项

- 脚本需要在项目根目录执行
- 确保有执行权限：`chmod +x scripts/*.sh`
- 日志输出到各自的 `.log` 文件中

