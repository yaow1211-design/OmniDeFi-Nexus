# 归档文件夹 (Archive)

此文件夹包含已归档的开发过程文件，这些文件对历史追溯有用，但不影响当前开发。

## 📂 目录结构

```
archive/
├── logs/           # 开发和调试日志文件
└── README.md       # 本文件
```

## 📋 日志文件说明

### API 日志
- `api.log` - API 服务器运行日志

### Frontend 日志
- `frontend-debug.log` - 前端调试日志

### Envio Indexer 日志
- `envio.log` - Envio 主日志
- `envio-dev.log` - 开发模式日志
- `envio-dev-2.log`, `envio-dev-3.log`, `envio-dev-4.log` - 多次调试迭代日志
- `envio-dev-final.log` - 最终开发日志
- `envio-final-run.log` - 最终运行日志
- `envio-success.log` - 成功运行日志
- `envio-tui.log` - TUI 界面日志

## ⚠️ 注意事项

1. **日志文件已被添加到 `.gitignore`**，不会提交到版本控制
2. 这些文件可以安全删除，但保留以便问题追溯
3. 如需清理空间，可以删除整个 `archive/` 文件夹

## 🗓️ 归档时间

归档日期: 2025-10-23

