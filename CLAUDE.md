# LeoPulse

Privacy-preserving polls and surveys platform built on Aleo.

## Project Structure

```
contracts/aleo/       # Leo smart contracts
  poll/               # Core polling logic (privacy modes, voting, rewards)
  pulse/              # Platform token/points
  staking/            # Staking mechanics
  swap/               # Token swap functionality

frontend/             # Full-stack web application
  client/src/         # React 19 frontend
    components/       # UI components (shadcn/ui based)
    contexts/         # React contexts
    hooks/            # Custom hooks
    lib/              # Utilities
    pages/            # Route pages
  server/             # Express backend
  db/                 # Drizzle ORM schema

docs/                 # Project documentation
```

## Tech Stack

**Contracts:**
- Leo language on Aleo blockchain
- Docs: https://developer.aleo.org/

**Frontend:**
- React 19 + TypeScript + Vite
- TailwindCSS 4 + shadcn/ui components
- wouter for routing
- @tanstack/react-query for data fetching
- @provablehq/sdk for Aleo integration
- @demox-labs/aleo-wallet-adapter for wallet connection

**Backend:**
- Express + TypeScript
- Drizzle ORM + Neon (PostgreSQL)
- Passport for auth

## Commands

```bash
# Frontend development
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Database migrations
cd frontend && npm run db:push

# Leo contract commands
cd contracts/aleo/poll && leo run <function> <args>
cd contracts/aleo/poll && leo build
```

## Leo Contract Patterns

**Privacy modes:** anonymous (0), semi-private (1), identified (2)

**Poll lifecycle:** ACTIVE → CLAIMING → CLOSED → FINALIZED

**Key records (private state):**
- `VoteReceipt` - proves participation
- `RewardTicket` - claim rewards
- `PollTicket` - poll ownership

**Key mappings (public state):**
- `polls` - poll metadata
- `vote_counts` - aggregated results
- `has_voted` - prevents double voting

## Reference Projects

- `/Users/east/workspace/leo/zk-auction-example`
- `/Users/east/workspace/leo/aleo-voting-app`

## Custom Agents

This project has specialized Claude agents in `.claude/agents/`:
- `leo-contract-reviewer` - Security audits for Leo contracts
- `aleo-docs-helper` - Aleo/Leo documentation assistance
- `frontend-integration` - Frontend-to-Aleo integration
- `test-generator` - Test case generation
