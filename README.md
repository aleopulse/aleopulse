# LeoPulse

A privacy-preserving polling and rewards platform built on Aleo. Create polls with configurable privacy modes, vote anonymously with zero-knowledge proofs, and earn PULSE token rewards.

**Live Demo:** [aleopulse.onrender.com](https://aleopulse.onrender.com)

## Documentation

| Document | Description |
|----------|-------------|
| [User Manual](docs/USER_MANUAL.md) | Complete guide for end users |
| [One-Pager](docs/ONE_PAGER.md) | Quick project overview |
| [Architecture](docs/ARCHITECTURE.md) | System design and data flows |
| [Smart Contracts](docs/SMART_CONTRACTS.md) | Contract specifications and functions |
| [API Reference](docs/API_REFERENCE.md) | REST API documentation |
| [Deployment Guide](docs/DEPLOYMENT.md) | How to deploy the platform |
| [Demo Script](docs/DEMO_SCRIPT.md) | Live demonstration guide |
| [Video Script](docs/VIDEO_SCRIPT.md) | Demo video recording script |
| [Roadmap](docs/ROADMAP.md) | Future plans and vision |
| [Security](docs/SECURITY.md) | Security considerations |

## Project Structure

```
leopulse/
├── frontend/              # React + Vite dApp with wallet connection
│   ├── client/src/        # React 19 frontend
│   ├── server/            # Express backend
│   └── db/                # Drizzle ORM schema
├── contracts/aleo/        # Leo smart contracts
│   ├── poll/              # Core polling logic (privacy modes, voting, rewards)
│   ├── pulse/             # Platform token/points
│   ├── staking/           # Staking mechanics
│   └── swap/              # Token swap functionality
└── docs/                  # Project documentation
```

## Deployed Contracts (Testnet)

| Program | Description |
|---------|-------------|
| `leopulse_poll_v2.aleo` | Core polling with privacy modes, rewards, and invites |

## Features

### Privacy-Preserving Polling
- **Anonymous Mode**: Zero-knowledge voting with cryptographic privacy
- **Semi-Private Mode**: Votes hidden by default, optionally revealable
- **Identified Mode**: Public voting for transparent governance
- **Private Polls**: Invite-only polls with `PollInvite` records

### Poll Lifecycle
- Create polls with PULSE token rewards
- Full lifecycle: ACTIVE → CLAIMING → CLOSED → FINALIZED
- Manual claim (MANUAL_PULL) or creator distribution (MANUAL_PUSH)
- Platform fee (2%) for sustainability

### Questionnaires
- Bundle multiple polls into surveys
- Shared reward pools with auto-calculation
- Progress tracking for participants
- Bulk vote recording

### PULSE Token
- Platform utility token on Aleo
- Testnet faucet for development
- Token rewards for participation

### Tier System
Users earn tiers based on their total PULSE holdings:

| Tier | PULSE Required | Daily Votes |
|------|----------------|-------------|
| Bronze | 0+ | 3 |
| Silver | 1,000+ | 6 |
| Gold | 10,000+ | 9 |
| Platinum | 100,000+ | 12 |

**Streak Bonuses:**
- 7+ day voting streak: +1 tier
- 30+ day voting streak: +2 tiers (max Platinum)

### Projects & Collaboration
- Organize polls and questionnaires into projects
- Team collaboration with role-based access (Owner, Admin, Editor, Viewer)
- Project analytics and AI-powered insights
- Invitation system for collaborators

### Referral System
- Unique referral codes per user
- Milestone rewards (1, 10, 50, 100 votes)
- Tiered point multipliers
- Referral leaderboard

### Quests & Seasons
- Daily, weekly, and achievement quests
- Seasonal competitions with leaderboards
- Point-based rewards system

## Frontend

The frontend is a React 19 + Vite application with Aleo wallet support.

### Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5000`.

### Features

- Leo Wallet and Shield Wallet support
- Aleo testnet and mainnet support
- PULSE faucet for testnet
- Poll creation with privacy mode selection
- Questionnaire creation with shared reward pools
- Project organization with team collaboration
- Referral dashboard with milestone tracking
- Quest system with seasonal competitions

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Aleo Configuration
VITE_ALEO_NETWORK=testnet
VITE_POLL_PROGRAM_ID=leopulse_poll_v2.aleo
VITE_PULSE_TOKEN_ID=100field

# Database (PostgreSQL)
DATABASE_URL=postgresql://...

# Faucet Minting (optional)
FAUCET_MINTER_PRIVATE_KEY=APrivateKey1...
```

## Contracts

Leo smart contracts for Aleo blockchain.

### Quick Start

```bash
# Build contracts
cd contracts/aleo/poll && leo build

# Run contract functions locally
cd contracts/aleo/poll && leo run <function> <args>

# Deploy (requires funded account)
snarkos developer deploy leopulse_poll_v2.aleo --private-key <key> --query "https://api.explorer.provable.com/v1" --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" --fee 1000000
```

## Networks

| Network | Explorer |
|---------|----------|
| Mainnet | https://explorer.aleo.org |
| Testnet | https://testnet.aleoscan.io |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Aleo (Zero-Knowledge) |
| Smart Contracts | Leo Language |
| Frontend | React 19 + TypeScript + Vite |
| Backend | Express.js + Drizzle ORM |
| Database | PostgreSQL (Neon/Supabase) |
| Styling | TailwindCSS 4 + shadcn/ui |
| Wallet | Leo Wallet, Shield Wallet |

## Resources

- [Aleo Developer Docs](https://developer.aleo.org/)
- [Leo Language Guide](https://developer.aleo.org/leo/)
- [Aleo Explorer](https://explorer.aleo.org/)

---

*Built for privacy-first decentralized governance*
