# Decentralized Voting DApp

A transparent, tamper-proof, and verifiable voting system built on the Ethereum blockchain.

## Features
- **Smart Contract Auditing**: Solid architecture utilizing OpenZeppelin's ReentrancyGuard.
- **Flask Backend Integration**: Relaying via py-solc-x and web3.py Python libraries. MongoDB for rapid off-chain metadata caching.
- **Next.js 15 UI**: Stunning and responsive real-time results dashboards and MetaMask authentication flows.

## Architecture
1. **Blockchain**: Solidity (`Voting.sol`) deployed via Hardhat/Infura on Sepolia.
2. **Backend Engine**: Flask HTTP Server + PyMongo.
3. **Frontend Application**: Next.js 15 App router with Tailwind CSS.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB instance running locally (Port 27017)
- MetaMask Extension installed.

### 1. Smart Contract & Backend Setup
```powershell
# Enter the project directory
cd decentralized-voting

# If activation fails, run commands directly using the environment's python:
.\env\Scripts\python.exe scripts\compile.py
.\env\Scripts\python.exe scripts\deploy.py

# Start Flask Backend
.\env\Scripts\python.exe backend\app.py
```

### 2. Frontend Setup
```bash
# Enter the frontend directory (from the project root)
cd frontend

# Install Dependencies (only if not already done)
npm install

# Run Development Server
npm run dev
```

Navigate to `http://localhost:3000` to interact with your decentralized voting system!

## Testing
To test the smart contracts on a local Hardhat node:
1. Terminal 1: `npx hardhat node`
2. Terminal 2: `pytest tests/test_voting_contract.py`
3. Terminal 3: `pytest tests/test_flask_routes.py`
