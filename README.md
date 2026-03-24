# 🗳️ VoteChain — Decentralized Voting DApp

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://voting-system-alpha.vercel.app)
[![Ethereum](https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-blue?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io)

A production-ready, full-stack decentralized voting application. Secure, transparent, and tamper-proof voting powered by Ethereum smart contracts and MongoDB Atlas.

## 🌟 Key Features

- **Decentralized Infrastructure**: Votes are immutable and stored on the Sepolia Testnet.
- **Voter Whitelisting**: Only authorized wallet addresses can participate (managed by Admin).
- **Premium UI/UX**: Built with Next.js 15, Tailwind CSS, and Framer Motion for a stunning experience.
- **Real-time Analytics**: Interactive charts using Recharts for live vote distribution.
- **Secure Admin Portal**: Cryptographic signature verification (EIP-191) for all administrative actions.
- **Mobile Responsive**: Fully optimized for all device sizes.
- **Toast Notifications**: Global feedback system for transaction states.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: Flask (Python), Flask-Limiter (Security), Web3.py.
- **Blockchain**: Solidity (Smart Contract), Ethers.js, Alchemy (RPC).
- **Database**: MongoDB Atlas (External metadata storage).

## 🚀 Deployment Instructions

### 1. Smart Contract
Deploy the `contracts/Voting.sol` using Hardhat or Remix to **Sepolia**.
Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in your environment.

### 2. Backend (Flask)
Configure the following environment variables:
```env
SEPOLIA_RPC_URL=your_alchemy_url
ADMIN_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=0x...
MONGODB_URI=your_atlas_connection_string
ADMIN_ADDRESS=0x...
```

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 4. Vercel Deployment
The project is configured for Vercel out-of-the-box using `vercel.json`. Ensure all environment variables are added to the Vercel Dashboard.

## 🔒 Security Measures

- **Rate Limiting**: Backend protected by `flask-limiter` to prevent DDoS.
- **Signature Auth**: Admin routes require a ECDSA signature from the registered Admin wallet.
- **Network Guard**: Application automatically detects and enforces the correct Ethereum network (Sepolia).

## 📜 License
MIT License - 2026 VoteChain Team.
