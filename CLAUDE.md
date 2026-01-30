# LeoPulse

Privacy-preserving polls and surveys platform built on Aleo.

## Project Structure

```
contracts/            # Leo smart contracts
  poll/               # Core polling logic (privacy modes, voting, rewards)
  pulse/              # Platform token/points
  staking/            # Staking mechanics
  swap/               # Token swap functionality
  scripts/            # Deployment and utility scripts
  Makefile            # Contract build/deploy commands

frontend/             # Full-stack web application
  client/src/         # React 19 frontend
    components/       # UI components (shadcn/ui based)
    contexts/         # React contexts (NetworkContext, WalletContext)
    hooks/            # Custom hooks (useContract, useAleoWallet, useAleoPolls)
    lib/              # Utilities (aleo-indexer, aleo-encoding, contract helpers)
    pages/            # Route pages (creator/, participant/, etc.)
  server/             # Express backend
  db/                 # Drizzle ORM schema
  e2e/                # Playwright E2E tests

videos/               # Remotion video project (demo videos, voiceovers)

docs/                 # Project documentation
```

## Tech Stack

**Contracts:**
- Leo language on Aleo blockchain
- Docs: https://developer.aleo.org/
- GitHub: https://github.com/AleoNet

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
cd contracts/poll && leo run <function> <args>
cd contracts/poll && leo build

# Unit tests (Vitest)
cd frontend && npm run test           # Run unit tests
cd frontend && npm run test:watch     # Watch mode
cd frontend && npm run test:coverage  # With coverage

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
- `private-polls.spec.ts` - Private poll and invite tests

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
- `polls` - poll metadata (PollInfo struct)
- `poll_settings` - privacy mode, visibility, show_results_live
- `poll_options` - option text per poll (hashed keys)
- `vote_counts` - aggregated results per option (hashed keys)
- `has_voted` - prevents double voting (hashed keys)
- `private_polls` - tracks which polls are invite-only
- `invite_counts` - tracks invites per poll
- `poll_count` - total number of polls created (key: 0u8)

## Environment Configuration

Key environment variables (in `frontend/.env`):
- `VITE_POLL_PROGRAM_ID` - Poll contract program ID (leopulse_poll_v2.aleo)
- `VITE_PULSE_PROGRAM_ID` - Token program ID
- `VITE_ALEOSCAN_API` - Aleoscan API endpoint for mapping queries
- `VITE_PROVABLE_API` - Provable API endpoint for RPC calls
- `VITE_PULSE_TOKEN_ID` - PULSE token field ID (100field)

## API Endpoints

**Provable API (RPC):**
- Block height: `GET /testnet/block/height/latest`
- Mapping value: `GET /testnet/program/{program}/mapping/{mapping}/{key}`
- Transaction: `GET /testnet/transaction/{txId}`

**Aleoscan API (Indexer):**
- List mapping values: `GET /mapping/list_program_mapping_values/{program}/{mapping}`

## Data Flow

1. **Poll Creation**: Frontend → Leo Wallet → Aleo Network → On-chain mappings
2. **Poll Retrieval**: Frontend → Indexer API → Parse mappings → Enrich with metadata
3. **Filtering**: Creator dashboard filters polls by `poll.creator === connectedWallet`

**Note:** Polls are stored 100% on-chain. There is no off-chain database for poll data.

## Reference Projects

- `/Users/east/workspace/leo/zk-auction-example`
- `/Users/east/workspace/leo/aleo-voting-app`

## Custom Skills (Slash Commands)

Available skills in `.claude/commands/`:
- `/docs:sync-claude-md` - Update CLAUDE.md to reflect current codebase state
- `/remotion:demo-video` - Create demo videos with ElevenLabs voiceover
- `/pulse:latent-demand` - Discover latent demand and market opportunities

## Installed Skills

External skills in `.claude/skills/`:
- `remotion-best-practices` - Remotion video creation patterns
- `pulse-latent-demand` - Market research and demand discovery
- `aleo-token-registry` - ARC-21 token standard reference
- `aleo-dev` - Aleo/Leo development expertise and troubleshooting

## Troubleshooting

### Polls not showing in dashboard
1. Check if poll exists on-chain: `curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_poll_v2.aleo/mapping/polls/{pollId}u64"`
2. Check poll_count: `curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_poll_v2.aleo/mapping/poll_count/0u8"`
3. Verify creator address matches connected wallet (case-insensitive comparison)
4. Check transaction finalization on Aleoscan explorer

### Transaction failures
- Check wallet has sufficient credits for fees
- Verify program is deployed on the correct network (testnet/mainnet)
- Check transition inputs match expected types
