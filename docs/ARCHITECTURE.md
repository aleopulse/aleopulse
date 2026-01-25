# LeoPulse Technical Architecture

## System Overview

LeoPulse is a full-stack decentralized application with on-chain smart contracts written in Leo and off-chain services for enhanced functionality. It leverages Aleo's zero-knowledge proof system for privacy-preserving voting.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    React + TypeScript + Vite                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │  Pages   │ │Components│ │  Hooks   │ │    Contexts      │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                    ┌───────────────┼───────────────┐                    │
│                    ▼               ▼               ▼                    │
│            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│            │ Aleo Wallet  │ │ Provable SDK │ │ Gas Sponsor  │          │
│            │   Adapter    │ │ (Blockchain) │ │ (Coming Soon)│          │
│            └──────────────┘ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   EXPRESS BACKEND    │  │   ALEO NETWORK   │  │   GAS SPONSORSHIP    │
│  ┌────────────────┐  │  │  ┌────────────┐  │  │      SERVICE         │
│  │   REST API     │  │  │  │   poll     │  │  │  ┌────────────────┐  │
│  │   Routes       │  │  │  │   .aleo    │  │  │  │  Fee Delegation│  │
│  └────────────────┘  │  │  └────────────┘  │  │  │  (Coming Soon) │  │
│  ┌────────────────┐  │  │  ┌────────────┐  │  │  └────────────────┘  │
│  │  Drizzle ORM   │  │  │  │   PULSE    │  │  └──────────────────────┘
│  │                │  │  │  │   Token    │  │
│  └────────────────┘  │  │  └────────────┘  │
│          │           │  │  ┌────────────┐  │
│          ▼           │  │  │  staking   │  │
│  ┌────────────────┐  │  │  │   .aleo    │  │
│  │   PostgreSQL   │  │  │  └────────────┘  │
│  │   (Neon)       │  │  │  ┌────────────┐  │
│  └────────────────┘  │  │  │   swap     │  │
└──────────────────────┘  │  │   .aleo    │  │
                          │  └────────────┘  │
                          └──────────────────┘
```

---

## Component Breakdown

### 1. Frontend (React Application)

**Location**: `frontend/client/`

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Route-based page components |
| `src/components/` | Reusable UI components |
| `src/hooks/` | Custom React hooks for data fetching |
| `src/contexts/` | React contexts (Wallet, Network, Theme) |
| `src/lib/` | Utility functions, token configs, Aleo helpers |

**Key Technologies**:
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui for styling
- TanStack React Query for state management
- Wouter for routing
- @demox-labs/aleo-wallet-adapter-react for wallet connection
- @provablehq/sdk for Aleo interactions

### 2. Backend (Express Server)

**Location**: `frontend/server/`

| File | Purpose |
|------|---------|
| `index.ts` | Server entry point, middleware setup |
| `routes.ts` | API endpoint definitions |
| `db.ts` | Database connection (Drizzle) |

**Key Features**:
- RESTful API for off-chain data
- Drizzle ORM for type-safe database access
- Session management for user preferences
- Caching for poll metadata (titles, descriptions stored as readable text)

### 3. Database (PostgreSQL)

**Location**: `frontend/shared/schema.ts`

**Provider**: Neon Serverless PostgreSQL

| Table Group | Tables |
|-------------|--------|
| **Users** | `userProfiles`, `userSettings`, `userSeasonSnapshots` |
| **Voting** | `dailyVoteLogs` |
| **Quests** | `seasons`, `quests`, `questProgress`, `seasonLeaderboard` |
| **Questionnaires** | `questionnaires`, `questionnairePolls`, `questionnaireProgress` |
| **Projects** | `projects`, `projectCollaborators`, `projectPolls`, `projectQuestionnaires`, `projectInsights` |
| **Referrals** | `referralCodes`, `referrals`, `referralMilestones`, `referralStats` |
| **Utility** | `sponsorshipLogs` |

### 4. Smart Contracts (Leo)

**Location**: `contracts/`

| Contract | Purpose |
|----------|---------|
| poll.aleo | Core polling, voting, privacy modes, rewards |
| PULSE (token_registry) | Platform token via Aleo Token Registry |
| staking.aleo | PULSE staking for tiers |
| swap.aleo | AMM for token exchange |

---

## Privacy Architecture

### Aleo's Privacy Model

Aleo uses a UTXO-like model with **records** (private state) and **mappings** (public state).

```
┌─────────────────────────────────────────────────────────────┐
│                     POLL CONTRACT                            │
│                                                              │
│  Public State (Mappings)           Private State (Records)   │
│  ┌─────────────────────┐          ┌─────────────────────┐   │
│  │ polls: Poll info    │          │ VoteReceipt         │   │
│  │ vote_counts: totals │          │ - owner             │   │
│  │ voters: who voted   │          │ - poll_id           │   │
│  │ public_votes: if    │          │ - option_index      │   │
│  │   identified mode   │          │ - voted_at          │   │
│  └─────────────────────┘          └─────────────────────┘   │
│                                                              │
│  Privacy Modes:                                              │
│  - Anonymous: option in record only, voter hidden            │
│  - Semi-Private: voter public, option in record              │
│  - Identified: both voter and option public                  │
└─────────────────────────────────────────────────────────────┘
```

### Zero-Knowledge Proofs

Every transaction generates a ZK proof that:
1. Validates the transition logic executed correctly
2. Proves ownership of input records
3. Does not reveal private inputs to observers

---

## Data Flow Diagrams

### Poll Creation Flow

```
Creator                Frontend              Backend            Blockchain
   │                      │                     │                    │
   │  Fill poll form      │                     │                    │
   │─────────────────────>│                     │                    │
   │                      │                     │                    │
   │                      │ Build Leo transaction                    │
   │                      │────────────────────────────────────────>│
   │                      │                     │                    │
   │                      │                     │  Execute transition│
   │                      │                     │  Generate ZK proof │
   │                      │                     │  Update mappings   │
   │                      │<────────────────────────────────────────│
   │                      │                     │                    │
   │                      │ Store metadata      │                    │
   │                      │────────────────────>│                    │
   │                      │                     │  Save to DB        │
   │                      │                     │───────────>        │
   │                      │<────────────────────│                    │
   │  Poll created        │                     │                    │
   │<─────────────────────│                     │                    │
```

### Voting Flow (Anonymous Mode)

```
Participant           Frontend              Backend            Blockchain
   │                      │                     │                    │
   │  Select option       │                     │                    │
   │─────────────────────>│                     │                    │
   │                      │                     │                    │
   │                      │ Check vote limit    │                    │
   │                      │────────────────────>│                    │
   │                      │                     │  Query user tier   │
   │                      │<────────────────────│                    │
   │                      │                     │                    │
   │                      │ Build vote transition                    │
   │                      │────────────────────────────────────────>│
   │                      │                     │                    │
   │                      │                     │  Generate ZK proof │
   │                      │                     │  (option hidden)   │
   │                      │                     │  Update vote_count │
   │                      │                     │  Return VoteReceipt│
   │                      │<────────────────────────────────────────│
   │                      │                     │                    │
   │                      │ Update progress     │                    │
   │                      │────────────────────>│                    │
   │  Vote confirmed      │<────────────────────│                    │
   │<─────────────────────│                     │                    │
```

### Reward Distribution Flow

```
Creator               Frontend              Blockchain
   │                      │                     │
   │  Trigger distribute  │                     │
   │─────────────────────>│                     │
   │                      │                     │
   │                      │ Call distribute_rewards()
   │                      │────────────────────>│
   │                      │                     │
   │                      │                     │ For each voter:
   │                      │                     │   Calculate share
   │                      │                     │   Transfer tokens
   │                      │                     │   (via records)
   │                      │                     │
   │                      │<────────────────────│
   │  Distribution done   │                     │
   │<─────────────────────│                     │
```

---

## Smart Contract Architecture

### Poll Contract Structure (Leo)

```leo
program poll.aleo {
    // Public mappings
    mapping polls: u64 => PollInfo;
    mapping poll_settings: u64 => PollSettings;
    mapping vote_counts: field => u64;      // hash(poll_id, option) => count
    mapping voters: field => bool;          // hash(poll_id, voter) => voted
    mapping public_votes: field => u8;      // hash(poll_id, voter) => option (identified only)
    mapping claimed: field => bool;

    // Private records
    record VoteReceipt {
        owner: address,
        poll_id: u64,
        option_index: u8,
        voted_at: u64,
    }

    record RewardTicket {
        owner: address,
        poll_id: u64,
        amount: u64,
    }

    // Transitions
    transition create_poll(...) -> ...;
    transition vote(poll_id: u64, option: u8) -> VoteReceipt;
    transition bulk_vote(...) -> ...;
    transition start_claims(...);
    transition claim_reward(receipt: VoteReceipt) -> ...;
    transition distribute_rewards(...);
    transition finalize_poll(...);
}
```

### Token Flow

```
                    ┌─────────────────┐
                    │   User Wallet   │
                    │   (Records)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Credits  │  │  PULSE   │  │  Stable  │
        │ (Native) │  │  (FA)    │  │   (FA)   │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Poll Contract  │
                  │  (Reward Pool)  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Voters        │
                  │ (Claim Rewards) │
                  └─────────────────┘
```

---

## Security Considerations

### On-Chain Security

1. **Zero-Knowledge Proofs**: All transitions verified cryptographically
2. **Record Ownership**: Only record owners can spend their records
3. **No Reentrancy**: Aleo's execution model prevents reentrancy
4. **Integer Overflow**: Leo has built-in overflow checks
5. **Access Control**: Verified via record ownership and address checks

### Off-Chain Security

1. **Input Validation**: All API inputs validated
2. **SQL Injection**: Prevented via Drizzle ORM parameterized queries
3. **Rate Limiting**: Applied to API endpoints
4. **CORS**: Configured for allowed origins only

---

## Data Indexing Strategy

### No Subgraph Equivalent

Aleo doesn't have The Graph. Use explorer APIs instead.

### Indexing Architecture

```
Frontend
   │
   ├── Public State (mappings) ──→ Aleoscan API / Provable API
   │     GET /mapping/list_program_mapping_values/{program}/{mapping}
   │     GET /mapping/get_value/{program}/{mapping}/{key}
   │
   └── Private State (records) ──→ Wallet SDK
         requestRecords(programId)
         findRecords(viewKey, filter)
```

### API Endpoints

- **Aleoscan**: `https://api.testnet.aleoscan.io/v2`
- **Provable**: `https://api.explorer.provable.com/v1`

### Caching Strategy

- React Query with 30-second stale time for poll data
- Cache user records locally after fetching
- Backend PostgreSQL for off-chain metadata (titles, descriptions)

---

## Scalability Design

### Current Architecture (Testnet)

- Single database instance
- Direct API calls to Aleo explorers
- In-memory caching via React Query

### Production Considerations

1. **Database**: Read replicas for scaling queries
2. **Indexer**: Custom indexer for historical data
3. **Caching**: Redis for frequently accessed data
4. **CDN**: Static asset delivery optimization

---

## Development Setup

```bash
# Clone repository
git clone https://github.com/leopulse/leopulse.git
cd leopulse

# Install Leo CLI
curl -L https://raw.githubusercontent.com/ProvableHQ/leo/mainnet/install.sh | sh

# Install frontend dependencies
cd frontend && npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx drizzle-kit push

# Start development server
npm run dev
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `VITE_ALEO_NETWORK` | Network (testnet/mainnet) |
| `VITE_POLL_PROGRAM_ID` | Poll contract program ID |
| `VITE_PULSE_TOKEN_ID` | PULSE token ID in registry |
| `VITE_STAKING_PROGRAM_ID` | Staking contract program ID |
| `VITE_SWAP_PROGRAM_ID` | Swap contract program ID |
| `VITE_ALEOSCAN_API` | Aleoscan API URL |
| `VITE_PROVABLE_API` | Provable API URL |
