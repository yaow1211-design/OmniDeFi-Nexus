# PyUSD DAO Dashboard - 完整项目搭建指南

## 项目概述

一个基于区块链的实时数据仪表盘系统，使用 Envio、HyperSync 和 HyperIndex 架构构建，用于监控 PyUSD DAO 的薪资支付、质押和收益数据。

## 技术栈

- **后端**: Node.js, Express, Apollo Server, SQLite
- **前端**: React 18, Apollo Client, Styled Components, Recharts
- **区块链**: Envio Indexer, Base Network
- **数据**: GraphQL, SQLite

---

## 项目结构

```
pyusd-dao-dashboard/
├── abis/                    # 合约 ABI 文件
│   ├── PayrollManager.json
│   └── StrategyManager.json
├── data/                    # 数据库文件
│   └── payroll.db
├── frontend/                # React 前端
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── apollo/
│       │   ├── client.js
│       │   └── queries.js
│       ├── components/
│       │   ├── Dashboard.js
│       │   ├── ErrorMessage.js
│       │   ├── LoadingSpinner.js
│       │   ├── PayrollTable.js
│       │   ├── StakingChart.js
│       │   ├── StatsCard.js
│       │   └── WalletConnect.js
│       ├── hooks/
│       │   └── useWallet.js
│       ├── utils/
│       │   └── export.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── scripts/                 # 工具脚本
│   ├── init-database.js
│   ├── monitor-sync.js
│   ├── start-hypersync.js
│   └── test-api.js
├── src/                     # 后端源码
│   ├── mappings.ts
│   ├── resolvers.ts
│   └── server.js
├── env.example
├── envio.yaml
├── package.json
├── schema.graphql
└── tsconfig.json
```

---

## 第一步：初始化项目

### 1.1 创建项目目录

```bash
mkdir pyusd-dao-dashboard
cd pyusd-dao-dashboard
```

### 1.2 初始化 package.json

```json
{
  "name": "pyusd-dao-dashboard",
  "version": "1.0.0",
  "description": "Real-time blockchain data dashboard for PyUSD DAO using Envio, HyperSync, and HyperIndex",
  "main": "index.js",
  "scripts": {
    "build": "envio build",
    "dev": "envio dev",
    "codegen": "envio codegen",
    "hypersync": "node scripts/start-hypersync.js",
    "hyperindex": "node src/server.js",
    "init-db": "node scripts/init-database.js",
    "monitor": "node scripts/monitor-sync.js",
    "test-api": "node scripts/test-api.js",
    "start": "npm run dev",
    "setup": "npm run init-db && npm run build"
  },
  "keywords": [
    "blockchain",
    "indexing",
    "dashboard",
    "graphql",
    "envio",
    "hypersync",
    "hyperindex"
  ],
  "author": "PyUSD DAO",
  "license": "MIT",
  "dependencies": {
    "@apollo/client": "^3.8.0",
    "apollo-server-express": "^3.12.0",
    "express": "^4.18.2",
    "graphql": "^16.8.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.8.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "sqlite3": "^5.1.6",
    "jsonwebtoken": "^9.0.2",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.3 安装依赖

```bash
npm install
```

---

## 第二步：配置环境变量

### 2.1 创建 env.example

```bash
# PyUSD DAO Dashboard 环境配置

# 区块链网络配置
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453

# 合约地址 (需要替换为实际地址)
PAYROLL_MANAGER_ADDRESS=0xYourPayrollAddress
STRATEGY_MANAGER_ADDRESS=0xYourStrategyAddress

# 数据库配置
DATABASE_URL=sqlite:./data/payroll.db
# 或者使用 PostgreSQL
# DATABASE_URL=postgresql://username:password@localhost:5432/payroll_db

# 服务器配置
PORT=4000
HOST=0.0.0.0

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h

# 管理员地址
ADMIN_ADDRESSES=0xAdminAddress1,0xAdminAddress2

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 缓存配置
CACHE_TTL=300
CACHE_MAX_SIZE=1000

# 监控配置
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
```

---

## 第三步：配置合约 ABI

### 3.1 PayrollManager.json

```json
{
  "contractName": "PayrollManager",
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "SalaryPaid",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "paySalary",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        }
      ],
      "name": "getEmployeeSalary",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "bytecode": "0x...",
  "deployedBytecode": "0x...",
  "linkReferences": {},
  "deployedLinkReferences": {}
}
```

### 3.2 StrategyManager.json

```json
{
  "contractName": "StrategyManager",
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalStaked",
          "type": "uint256"
        }
      ],
      "name": "Staked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reward",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalEarnings",
          "type": "uint256"
        }
      ],
      "name": "Harvested",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "harvest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalStaked",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalEarnings",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "bytecode": "0x...",
  "deployedBytecode": "0x...",
  "linkReferences": {},
  "deployedLinkReferences": {}
}
```

---

## 第四步：配置 Envio

### 4.1 envio.yaml

```yaml
name: pyusd-dao-dashboard
description: "Real-time blockchain data dashboard for PyUSD DAO"
version: "1.0.0"

networks:
  - id: base
    name: "Base Network"
    rpc_url: "https://mainnet.base.org"
    start_block: 0

contracts:
  - name: PayrollManager
    network: base
    address: "0xYourPayrollAddress"  # 需要替换为实际地址
    abi_file_path: "./abis/PayrollManager.json"
    handler: "./src/mappings.ts"
    events:
      - event: "SalaryPaid(address indexed employee, uint256 amount, uint256 timestamp)"
        handler: "handleSalaryPaid"

  - name: StrategyManager
    network: base
    address: "0xYourStrategyAddress"  # 需要替换为实际地址
    abi_file_path: "./abis/StrategyManager.json"
    handler: "./src/mappings.ts"
    events:
      - event: "Staked(uint256 amount, uint256 totalStaked)"
        handler: "handleStaked"
      - event: "Harvested(uint256 reward, uint256 totalEarnings)"
        handler: "handleHarvested"

# 数据库配置
database:
  type: "sqlite"
  path: "./data/payroll.db"

# 索引配置
indexing:
  batch_size: 100
  max_retries: 3
  retry_delay: 1000
```

---

## 第五步：定义 GraphQL Schema

### 5.1 schema.graphql

```graphql
# PyUSD DAO Dashboard GraphQL Schema

# 薪资支付记录实体
type SalaryPaid @entity {
  id: ID!                    # 唯一标识符 (交易哈希)
  employee: Bytes!           # 员工地址
  amount: BigInt!            # 支付金额
  timestamp: BigInt!         # 支付时间戳
  txHash: Bytes!             # 交易哈希
  blockNumber: BigInt!       # 区块号
  logIndex: BigInt!          # 日志索引
}

# 质押状态实体
type StakingStatus @entity {
  id: ID!                    # 唯一标识符
  totalStaked: BigInt!       # 总质押金额
  totalEarnings: BigInt!     # 总收益
  updatedAt: BigInt!         # 最后更新时间
  lastStakeAmount: BigInt!   # 最后一次质押金额
  lastHarvestAmount: BigInt! # 最后一次收获金额
}

# 质押记录实体
type StakingRecord @entity {
  id: ID!                    # 唯一标识符
  amount: BigInt!            # 质押金额
  totalStaked: BigInt!       # 质押后总金额
  timestamp: BigInt!         # 质押时间戳
  txHash: Bytes!             # 交易哈希
  blockNumber: BigInt!       # 区块号
}

# 收益记录实体
type HarvestRecord @entity {
  id: ID!                    # 唯一标识符
  reward: BigInt!            # 收获奖励
  totalEarnings: BigInt!     # 收获后总收益
  timestamp: BigInt!         # 收获时间戳
  txHash: Bytes!             # 交易哈希
  blockNumber: BigInt!       # 区块号
}

# 查询类型
type Query {
  # 获取薪资记录
  payrollRecords(
    employee: Bytes           # 可选的员工地址过滤
    first: Int                # 返回记录数量限制
    skip: Int                 # 跳过记录数量
    orderBy: String           # 排序字段
    orderDirection: String    # 排序方向 (asc/desc)
  ): [SalaryPaid!]!
  
  # 获取单个薪资记录
  payrollRecord(id: ID!): SalaryPaid
  
  # 获取质押状态
  stakingStatus: StakingStatus
  
  # 获取质押记录
  stakingRecords(
    first: Int
    skip: Int
    orderBy: String
    orderDirection: String
  ): [StakingRecord!]!
  
  # 获取收益记录
  harvestRecords(
    first: Int
    skip: Int
    orderBy: String
    orderDirection: String
  ): [HarvestRecord!]!
  
  # 获取员工薪资统计
  employeeSalaryStats(employee: Bytes!): EmployeeStats
  
  # 获取总体统计
  dashboardStats: DashboardStats
}

# 员工统计信息
type EmployeeStats {
  employee: Bytes!
  totalPaid: BigInt!
  paymentCount: Int!
  lastPayment: SalaryPaid
  averagePayment: BigInt!
}

# 仪表盘统计信息
type DashboardStats {
  totalSalaryPaid: BigInt!
  totalStaked: BigInt!
  totalEarnings: BigInt!
  totalEmployees: Int!
  totalPayments: Int!
  totalStakes: Int!
  totalHarvests: Int!
}

# 订阅类型 (实时数据)
type Subscription {
  # 实时薪资支付事件
  salaryPaid: SalaryPaid!
  
  # 实时质押事件
  staked: StakingRecord!
  
  # 实时收益事件
  harvested: HarvestRecord!
  
  # 实时质押状态更新
  stakingStatusUpdated: StakingStatus!
}
```

---

## 第六步：数据库初始化脚本

### 6.1 scripts/init-database.js

```javascript
#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 创建必要的数据库表和索引
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保数据目录存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️  初始化数据库:', dbPath);

// 创建表结构
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 薪资记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS SalaryPaid (
          id TEXT PRIMARY KEY,
          employee TEXT NOT NULL,
          amount TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          txHash TEXT NOT NULL,
          blockNumber TEXT NOT NULL,
          logIndex TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 质押状态表
      db.run(`
        CREATE TABLE IF NOT EXISTS StakingStatus (
          id TEXT PRIMARY KEY,
          totalStaked TEXT NOT NULL,
          totalEarnings TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          lastStakeAmount TEXT,
          lastHarvestAmount TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 质押记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS StakingRecord (
          id TEXT PRIMARY KEY,
          amount TEXT NOT NULL,
          totalStaked TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          txHash TEXT NOT NULL,
          blockNumber TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 收益记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS HarvestRecord (
          id TEXT PRIMARY KEY,
          reward TEXT NOT NULL,
          totalEarnings TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          txHash TEXT NOT NULL,
          blockNumber TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建索引
      db.run(`CREATE INDEX IF NOT EXISTS idx_salary_employee ON SalaryPaid(employee)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_salary_timestamp ON SalaryPaid(timestamp)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_salary_txHash ON SalaryPaid(txHash)`);
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_staking_timestamp ON StakingRecord(timestamp)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_staking_txHash ON StakingRecord(txHash)`);
      
      db.run(`CREATE INDEX IF NOT EXISTS idx_harvest_timestamp ON HarvestRecord(timestamp)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_harvest_txHash ON HarvestRecord(txHash)`);

      console.log('✅ 数据库表创建完成');
      resolve();
    });
  });
};

// 初始化默认数据
const initDefaultData = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR IGNORE INTO StakingStatus (id, totalStaked, totalEarnings, updatedAt, lastStakeAmount, lastHarvestAmount)
      VALUES ('1', '0', '0', '0', '0', '0')
    `, (err) => {
      if (err) {
        console.error('❌ 初始化默认数据失败:', err.message);
        reject(err);
      } else {
        console.log('✅ 默认数据初始化完成');
        resolve();
      }
    });
  });
};

// 执行初始化
const init = async () => {
  try {
    await createTables();
    await initDefaultData();
    console.log('🎉 数据库初始化完成!');
    db.close();
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    db.close();
    process.exit(1);
  }
};

init();
```

### 6.2 运行初始化

```bash
npm run init-db
```

---

## 第七步：GraphQL 服务器

### 7.1 src/server.js

```javascript
#!/usr/bin/env node

/**
 * HyperIndex GraphQL 服务器
 * 提供 GraphQL API 接口
 */

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildSchema } = require('graphql');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// 配置
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// 数据库连接
const dbPath = path.join(__dirname, '..', 'data', 'payroll.db');
const db = new sqlite3.Database(dbPath);

// 确保数据库存在
if (!fs.existsSync(dbPath)) {
  console.error('❌ 数据库文件不存在:', dbPath);
  console.log('💡 请先运行: npm run init-db');
  process.exit(1);
}

/**
 * 数据库查询辅助函数
 */
const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * 权限验证中间件
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = { role: 'viewer' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { role: 'viewer' };
    } else {
      req.user = user;
    }
    next();
  });
};

/**
 * 权限检查函数
 */
const checkPermission = (user, resource, action) => {
  const permissions = {
    admin: ['read:all', 'write:all', 'export:all'],
    employee: ['read:own', 'export:own'],
    viewer: ['read:public']
  };

  const userPermissions = permissions[user.role] || permissions.viewer;
  return userPermissions.includes(`${action}:${resource}`) || userPermissions.includes(`${action}:all`);
};

/**
 * GraphQL 解析器
 */
const resolvers = {
  Query: {
    // 获取薪资记录
    payrollRecords: async (_, args, { user, db }) => {
      if (!checkPermission(user, 'payroll', 'read')) {
        throw new Error('权限不足');
      }

      let sql = 'SELECT * FROM SalaryPaid';
      const params = [];

      // 员工地址过滤
      if (args.employee) {
        sql += ' WHERE employee = ?';
        params.push(args.employee);
      } else if (user.role === 'employee') {
        sql += ' WHERE employee = ?';
        params.push(user.address);
      }

      // 排序
      const orderBy = args.orderBy || 'timestamp';
      const orderDirection = args.orderDirection || 'desc';
      sql += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;

      // 分页
      if (args.skip) {
        sql += ' OFFSET ?';
        params.push(args.skip);
      }
      if (args.first) {
        sql += ' LIMIT ?';
        params.push(args.first);
      }

      return await dbQuery(sql, params);
    },

    // 获取单个薪资记录
    payrollRecord: async (_, args, { user, db }) => {
      const record = await dbGet('SELECT * FROM SalaryPaid WHERE id = ?', [args.id]);
      
      if (!record) return null;
      
      if (user.role === 'employee' && record.employee !== user.address) {
        throw new Error('权限不足');
      }
      
      return record;
    },

    // 获取质押状态
    stakingStatus: async (_, args, { user, db }) => {
      if (!checkPermission(user, 'staking', 'read')) {
        throw new Error('权限不足');
      }
      
      return await dbGet('SELECT * FROM StakingStatus WHERE id = "1"');
    },

    // 获取质押记录
    stakingRecords: async (_, args, { user, db }) => {
      if (!checkPermission(user, 'staking', 'read')) {
        throw new Error('权限不足');
      }

      let sql = 'SELECT * FROM StakingRecord';
      const params = [];

      // 排序
      const orderBy = args.orderBy || 'timestamp';
      const orderDirection = args.orderDirection || 'desc';
      sql += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;

      // 分页
      if (args.skip) {
        sql += ' OFFSET ?';
        params.push(args.skip);
      }
      if (args.first) {
        sql += ' LIMIT ?';
        params.push(args.first);
      }

      return await dbQuery(sql, params);
    },

    // 获取收益记录
    harvestRecords: async (_, args, { user, db }) => {
      if (!checkPermission(user, 'harvest', 'read')) {
        throw new Error('权限不足');
      }

      let sql = 'SELECT * FROM HarvestRecord';
      const params = [];

      // 排序
      const orderBy = args.orderBy || 'timestamp';
      const orderDirection = args.orderDirection || 'desc';
      sql += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;

      // 分页
      if (args.skip) {
        sql += ' OFFSET ?';
        params.push(args.skip);
      }
      if (args.first) {
        sql += ' LIMIT ?';
        params.push(args.first);
      }

      return await dbQuery(sql, params);
    },

    // 获取员工薪资统计
    employeeSalaryStats: async (_, args, { user, db }) => {
      if (user.role === 'employee' && args.employee !== user.address) {
        throw new Error('权限不足');
      }

      const records = await dbQuery(
        'SELECT * FROM SalaryPaid WHERE employee = ? ORDER BY timestamp DESC',
        [args.employee]
      );

      if (records.length === 0) {
        return {
          employee: args.employee,
          totalPaid: '0',
          paymentCount: 0,
          lastPayment: null,
          averagePayment: '0'
        };
      }

      const totalPaid = records.reduce((sum, record) => 
        (BigInt(sum) + BigInt(record.amount)).toString(), '0'
      );

      const averagePayment = (BigInt(totalPaid) / BigInt(records.length)).toString();

      return {
        employee: args.employee,
        totalPaid,
        paymentCount: records.length,
        lastPayment: records[0],
        averagePayment
      };
    },

    // 获取总体统计
    dashboardStats: async (_, args, { user, db }) => {
      if (!checkPermission(user, 'dashboard', 'read')) {
        throw new Error('权限不足');
      }

      const salaryRecords = await dbQuery('SELECT * FROM SalaryPaid');
      const stakingStatus = await dbGet('SELECT * FROM StakingStatus WHERE id = "1"');
      const stakingRecords = await dbQuery('SELECT * FROM StakingRecord');
      const harvestRecords = await dbQuery('SELECT * FROM HarvestRecord');

      const totalSalaryPaid = salaryRecords.reduce((sum, record) => 
        (BigInt(sum) + BigInt(record.amount)).toString(), '0'
      );

      const uniqueEmployees = new Set(salaryRecords.map(r => r.employee)).size;

      return {
        totalSalaryPaid,
        totalStaked: stakingStatus ? stakingStatus.totalStaked : '0',
        totalEarnings: stakingStatus ? stakingStatus.totalEarnings : '0',
        totalEmployees: uniqueEmployees,
        totalPayments: salaryRecords.length,
        totalStakes: stakingRecords.length,
        totalHarvests: harvestRecords.length
      };
    }
  }
};

/**
 * 创建 Apollo 服务器
 */
const createServer = async () => {
  // 读取 GraphQL schema
  const schemaPath = path.join(__dirname, '..', 'schema.graphql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    context: ({ req }) => ({
      user: req.user,
      db: { query: dbQuery, get: dbGet }
    }),
    introspection: true,
    playground: true
  });

  const app = express();
  
  // 添加权限验证中间件
  app.use(authenticateToken);
  
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  return app;
};

/**
 * 启动服务器
 */
const startServer = async () => {
  try {
    console.log('🚀 启动 HyperIndex GraphQL 服务器...');
    
    const app = await createServer();
    
    app.listen(PORT, HOST, () => {
      console.log(`✅ 服务器运行在 http://${HOST}:${PORT}/graphql`);
      console.log(`📊 GraphQL Playground: http://${HOST}:${PORT}/graphql`);
      console.log(`📝 数据库: ${dbPath}`);
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止服务器...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在停止服务器...');
  db.close();
  process.exit(0);
});

// 启动服务器
startServer();
```

---

## 第八步：前端开发

### 8.1 前端 package.json

```json
{
  "name": "pyusd-dao-dashboard-frontend",
  "version": "1.0.0",
  "description": "React frontend for PyUSD DAO Dashboard",
  "private": true,
  "dependencies": {
    "@apollo/client": "^3.8.0",
    "@web3-react/core": "^8.2.0",
    "@web3-react/injected-connector": "^6.0.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "recharts": "^2.8.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "styled-components": "^6.0.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:4000"
}
```

### 8.2 安装前端依赖

```bash
cd frontend
npm install
```

### 8.3 前端入口文件

**frontend/public/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="PyUSD DAO Dashboard - 实时区块链数据监控平台"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>PyUSD DAO Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**frontend/src/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

**frontend/src/index.css**

```css
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root {
  min-height: 100vh;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Utility classes */
.text-center {
  text-align: center;
}

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }
.p-4 { padding: 2rem; }
```

### 8.4 Apollo Client 配置

**frontend/src/apollo/client.js**

```javascript
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP 链接
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// WebSocket 链接 (用于订阅)
const wsLink = new GraphQLWsLink(createClient({
  url: process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: localStorage.getItem('token'),
  },
}));

// 认证链接
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// 分割链接 (HTTP for queries/mutations, WebSocket for subscriptions)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client 实例
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      SalaryPaid: {
        keyFields: ['id'],
      },
      StakingStatus: {
        keyFields: ['id'],
      },
      StakingRecord: {
        keyFields: ['id'],
      },
      HarvestRecord: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
```

**frontend/src/apollo/queries.js**

```javascript
import { gql } from '@apollo/client';

// 获取仪表盘统计
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalSalaryPaid
      totalStaked
      totalEarnings
      totalEmployees
      totalPayments
      totalStakes
      totalHarvests
    }
  }
`;

// 获取薪资记录
export const GET_PAYROLL_RECORDS = gql`
  query GetPayrollRecords($employee: Bytes, $first: Int, $skip: Int) {
    payrollRecords(employee: $employee, first: $first, skip: $skip) {
      id
      employee
      amount
      timestamp
      txHash
      blockNumber
    }
  }
`;

// 获取质押状态
export const GET_STAKING_STATUS = gql`
  query GetStakingStatus {
    stakingStatus {
      id
      totalStaked
      totalEarnings
      updatedAt
      lastStakeAmount
      lastHarvestAmount
    }
  }
`;

// 获取质押记录
export const GET_STAKING_RECORDS = gql`
  query GetStakingRecords($first: Int, $skip: Int) {
    stakingRecords(first: $first, skip: $skip) {
      id
      amount
      totalStaked
      timestamp
      txHash
      blockNumber
    }
  }
`;

// 获取收益记录
export const GET_HARVEST_RECORDS = gql`
  query GetHarvestRecords($first: Int, $skip: Int) {
    harvestRecords(first: $first, skip: $skip) {
      id
      reward
      totalEarnings
      timestamp
      txHash
      blockNumber
    }
  }
`;

// 获取员工薪资统计
export const GET_EMPLOYEE_SALARY_STATS = gql`
  query GetEmployeeSalaryStats($employee: Bytes!) {
    employeeSalaryStats(employee: $employee) {
      employee
      totalPaid
      paymentCount
      lastPayment {
        id
        amount
        timestamp
      }
      averagePayment
    }
  }
`;

// 实时订阅 - 薪资支付事件
export const SALARY_PAID_SUBSCRIPTION = gql`
  subscription SalaryPaidSubscription {
    salaryPaid {
      id
      employee
      amount
      timestamp
      txHash
    }
  }
`;

// 实时订阅 - 质押事件
export const STAKED_SUBSCRIPTION = gql`
  subscription StakedSubscription {
    staked {
      id
      amount
      totalStaked
      timestamp
      txHash
    }
  }
`;

// 实时订阅 - 收益事件
export const HARVESTED_SUBSCRIPTION = gql`
  subscription HarvestedSubscription {
    harvested {
      id
      reward
      totalEarnings
      timestamp
      txHash
    }
  }
`;

// 实时订阅 - 质押状态更新
export const STAKING_STATUS_UPDATED_SUBSCRIPTION = gql`
  subscription StakingStatusUpdatedSubscription {
    stakingStatusUpdated {
      id
      totalStaked
      totalEarnings
      updatedAt
    }
  }
`;
```

---

## 第九步：运行项目

### 9.1 启动后端服务器

```bash
# 在项目根目录
npm run hyperindex
```

### 9.2 启动前端开发服务器

```bash
# 在 frontend 目录
cd frontend
npm start
```

### 9.3 访问应用

- 前端: http://localhost:3000
- GraphQL Playground: http://localhost:4000/graphql

---

## 项目特性

### ✅ 已实现功能

1. **数据监听**
   - 薪资支付事件 (SalaryPaid)
   - 质押事件 (Staked)
   - 收益收获事件 (Harvested)

2. **前端功能**
   - 实时数据仪表盘
   - 收益趋势图表
   - 薪资记录表格
   - 钱包连接功能
   - 响应式设计

3. **API 功能**
   - GraphQL 查询接口
   - 权限验证中间件
   - 数据分页和排序

4. **数据库**
   - SQLite 数据存储
   - 索引优化
   - 自动初始化

---

## 开发命令

```bash
# 初始化数据库
npm run init-db

# 启动 GraphQL 服务器
npm run hyperindex

# 启动前端开发服务器
cd frontend && npm start

# 构建前端生产版本
cd frontend && npm run build

# 测试 API
npm run test-api
```

---

## 环境要求

- Node.js 18+
- npm 或 pnpm
- 区块链网络访问权限
- MetaMask 或其他 Web3 钱包

---

## 部署建议

### 后端部署

1. 使用 PM2 管理 Node.js 进程
2. 配置 Nginx 反向代理
3. 使用 PostgreSQL 替代 SQLite（生产环境）
4. 配置 SSL 证书

### 前端部署

1. 构建生产版本: `npm run build`
2. 部署到 Vercel、Netlify 或其他静态托管服务
3. 配置环境变量
4. 启用 CDN 加速

---

## 安全建议

1. 更改默认 JWT_SECRET
2. 配置 CORS 策略
3. 实施速率限制
4. 定期更新依赖包
5. 使用环境变量管理敏感信息
6. 实施日志监控

---

## 故障排除

### 数据库连接失败
```bash
# 检查数据库文件是否存在
ls -la data/payroll.db

# 重新初始化数据库
npm run init-db
```

### GraphQL 服务器启动失败
```bash
# 检查端口是否被占用
lsof -i :4000

# 更改端口
PORT=5000 npm run hyperindex
```

### 前端无法连接后端
```bash
# 检查 proxy 配置
cat frontend/package.json | grep proxy

# 确保后端服务器正在运行
curl http://localhost:4000/graphql
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

MIT License

---

## 联系方式

- 项目主页: https://github.com/pyusd-dao/dashboard
- 问题反馈: https://github.com/pyusd-dao/dashboard/issues
- 文档: https://docs.pyusd-dao.org

---

## 更新日志

### v1.0.0 (2025-10-16)
- ✅ 初始版本发布
- ✅ 实现基础数据监听功能
- ✅ 完成前端仪表盘
- ✅ 集成 GraphQL API
- ✅ 添加钱包连接功能

---

**构建时间**: 2025年10月16日  
**作者**: PyUSD DAO Team  
**版本**: 1.0.0

