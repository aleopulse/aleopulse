# LeoPulse - Project One-Pager

## Privacy-Preserving Polling & Rewards Platform on Aleo

---

## The Problem

Traditional polling platforms are:
- **Centralized** - Data can be manipulated, results lack transparency
- **Privacy-Invasive** - Your voting choices are often visible to everyone
- **Unrewarding** - Users give opinions but receive nothing in return
- **Siloed** - No integration with Web3 ecosystems or token economies

## Our Solution

**LeoPulse** is a privacy-preserving polling platform where users can vote anonymously and earn real token rewards. Built on Aleo, it leverages zero-knowledge proofs to enable configurable privacy for polls while maintaining transparent reward distribution.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Privacy-Configurable Polls** | Creators choose: anonymous, semi-private, or identified voting |
| **Token-Rewarded Polls** | Earn Aleo Credits, PULSE, or stablecoins for every vote |
| **Zero-Knowledge Proofs** | Vote privately while proving eligibility |
| **Questionnaires** | Bundled surveys with shared reward pools |
| **PULSE Staking** | Stake tokens to unlock higher tiers and more daily votes |
| **Referral System** | Earn rewards by inviting friends |
| **Project Organization** | Team collaboration with role-based access |
| **Gas Sponsorship** | Fee delegation for seamless UX (Coming Soon!) |

---

## Privacy Model

LeoPulse offers three privacy levels per poll:

| Mode | Vote Choice | Voter Identity | Use Case |
|------|-------------|----------------|----------|
| **Anonymous** | Private (ZK proof) | Hidden | Sensitive topics |
| **Semi-Private** | Private | Public | Accountability without revealing preference |
| **Identified** | Public | Public | Transparent governance |

---

## How It Works

```
Creator funds poll with tokens
        ↓
Users vote on-chain (privately or publicly)
        ↓
ZK proofs verify eligibility without revealing choices
        ↓
Poll closes, rewards distributed
        ↓
Voters claim their earnings
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Aleo Network |
| **Smart Contracts** | Leo Language |
| **Privacy** | Zero-Knowledge Proofs (Marlin) |
| **Frontend** | React + TypeScript + Vite |
| **Backend** | Express.js + PostgreSQL |
| **Wallet** | Leo Wallet, Puzzle Wallet |
| **Token Standard** | Aleo Token Registry |
| **Gas Sponsorship** | Native Fee Delegation (Coming Soon!) |

---

## Smart Contracts (Testnet - In Development)

| Contract | Purpose |
|----------|---------|
| **poll.aleo** | Core polling logic, privacy modes, reward distribution |
| **PULSE Token** | Platform token (via token_registry.aleo) |
| **staking.aleo** | PULSE staking for tier qualification |
| **swap.aleo** | AMM for PULSE/stablecoin exchange |

---

## Traction & Metrics

- **4 Smart Contracts** being developed for Aleo Testnet
- **Full-stack dApp** with 20+ pages
- **3 Token Types** supported (Aleo Credits, PULSE, Stablecoins)
- **Gamification System** with tiers, quests, seasons, referrals
- **Privacy-First** architecture leveraging Aleo's ZK capabilities

---

## What Makes Us Different

1. **Privacy-First Design** - First polling platform with configurable privacy levels using ZK proofs
2. **Multi-Token Rewards** - Support for native credits, custom PULSE, and stablecoins
3. **Questionnaire Bundles** - Bundled survey rewards with shared pools
4. **Tier System** - Incentivizes long-term holding through staking benefits
5. **Aleo Native** - Built specifically for Aleo's privacy-preserving infrastructure

---

## Team

Migrated from Movement Network to leverage Aleo's privacy features.

---

## Links

- **GitHub**: [github.com/leopulse](https://github.com/leopulse)
- **Documentation**: See /docs folder

---

## Future Vision

- Mainnet deployment with real token rewards
- Gas sponsorship service integration
- DAO governance for platform decisions
- Enterprise B2B survey solutions (BizPulse)
- Mobile application
- Embedded wallet support (when available for Aleo)

---

*LeoPulse - Where Every Opinion Counts, Earns, and Stays Private*
