# 2025
# Uniswap Transaction Analyzer

A decentralized application (DApp) for visually analyzing Uniswap transaction data, built as an example of on-chain data indexing.

## Problem

DeFi users have difficulty visually analyzing Uniswap transaction data (such as transaction volume and gas costs).

## Solution

- Use The Graph to index Uniswap V3 swap events and generate a subgraph of transaction data.
- Deploy a simple contract in Solidity to record user query history.
- Use Python (Web3.py) to query subgraph data, SQL to analyze transaction trends, and Matplotlib to draw charts.
- Develop the front-end in React to visualize transaction volume and gas costs.

## Innovation

Integrate Chainlink data feeds to update ETH prices in real time and calculate transaction costs.

## Technology Stack

- **Contract**: Solidity + Hardhat
- **Data**: The Graph (GraphQL) + Python (Web3.py) + SQL
- **Front-end**: React + Ethers.js

## Time Estimate

- Contract and subgraph: 5-7 days
- Data processing and visualization: 3-5 days
- Front-end and demo: 3-5 days
