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

# E2E tests (uses Brave with Leo Wallet)
cd frontend && npm run test:e2e        # Run all tests
cd frontend && npm run test:e2e:ui     # Interactive UI mode
cd frontend && npm run test:e2e:debug  # Debug mode
cd frontend && npm run test:e2e:report # View test report
```

## E2E Testing

Tests use Playwright with Brave browser and the "playwright" profile (Profile 22) which has Leo Wallet installed.

**Test files:** `frontend/e2e/`
- `fixtures.ts` - Brave + Leo Wallet setup
- `navigation.spec.ts` - Route navigation tests
- `wallet.spec.ts` - Wallet connection tests
- `poll.spec.ts` - Poll and questionnaire tests

**Important:** Tests run with `headless: false` since browser extensions require a visible window.

## Leo Contract Patterns

**Current program:** `leopulse_poll_v2.aleo` (deployed on testnet)

**Privacy modes:** anonymous (0), semi-private (1), identified (2)

**Visibility modes:** public (0), private/invite-only (1)

**Poll lifecycle:** ACTIVE → CLAIMING → CLOSED → FINALIZED

**Key records (private state):**
- `VoteReceipt` - proves participation
- `RewardTicket` - claim rewards
- `PollTicket` - poll ownership (used to issue invites)
- `PollInvite` - invite to private poll (owner, poll_id, can_vote, expires_block)

**Key mappings (public state):**
- `polls` - poll metadata
- `poll_settings` - privacy mode, visibility, show_results_live
- `vote_counts` - aggregated results per option
- `has_voted` - prevents double voting
- `private_polls` - tracks which polls are invite-only
- `invite_counts` - tracks invites per poll

## Reference Projects

- `/Users/east/workspace/leo/zk-auction-example`
- `/Users/east/workspace/leo/aleo-voting-app`

## Custom Agents

This project has specialized Claude agents in `.claude/agents/`:
- `leo-contract-reviewer` - Security audits for Leo contracts
- `aleo-docs-helper` - Aleo/Leo documentation assistance
- `frontend-integration` - Frontend-to-Aleo integration
- `test-generator` - Test case generation

## Custom Skills (Slash Commands)

Available skills in `.claude/commands/`:
- `/docs:sync-claude-md` - Update CLAUDE.md to reflect current codebase state
- `/agent-os:shape-spec` - Gather context and structure planning for significant work
- `/agent-os:discover-standards` - Find and document coding standards
- `/agent-os:plan-product` - Product planning assistance
