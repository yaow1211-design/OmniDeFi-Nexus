# Envio Indexer

高性能区块链事件索引器，用于追踪PYUSD和其他协议事件。

## 设置

```bash
# 安装Envio CLI
npm i -g envio

# 初始化Envio项目
envio init

# 配置config.yaml（见下方示例）

# 生成代码
envio codegen

# 启动开发模式
envio dev
```

## 配置示例

创建 `config.yaml`:

```yaml
name: omnichain-defi-indexer
networks:
  - id: 11155111  # Sepolia测试网
    start_block: 5000000  # 从某个区块开始
    rpc_config:
      url: ${SEPOLIA_RPC_URL}

contracts:
  - name: PYUSD
    address: "0x..."  # PYUSD合约地址
    abi_file_path: ./abis/PYUSD.json
    handler: ./src/handlers.ts
    events:
      - event: Transfer
        required_entities:
          - name: Transfer
```

## 事件处理

在 `src/handlers.ts` 中处理事件：

```typescript
import { Transfer } from "generated";

Transfer.handler(async ({ event, context }) => {
  const entity = {
    id: `${event.transactionHash}-${event.logIndex}`,
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transactionHash,
  };

  await context.Transfer.insert(entity);
});
```

## GraphQL查询

启动后可访问 `http://localhost:8080/graphql`

```graphql
query {
  transfers(limit: 10, orderBy: { timestamp: desc }) {
    id
    from
    to
    value
    timestamp
  }
}
```

## 下一步

1. 获取PYUSD合约地址和ABI
2. 配置RPC端点
3. 运行 `envio dev` 开始索引
4. 测试GraphQL查询



