# LeoPulse

**Privacy-Preserving Polls & Surveys on Aleo**

> The only polling platform where your vote is cryptographically private AND you get rewarded for participating.

---

## What it does

LeoPulse is a full-stack polling and survey platform built natively on the Aleo blockchain, leveraging zero-knowledge proofs to provide mathematically-guaranteed voter privacy while incentivizing participation through token rewards.

### Core Features

**Poll Creation & Voting**
- Create polls with customizable titles, descriptions, up to 4 options, and flexible durations (1 hour to indefinite)
- Vote on polls with instant on-chain recording
- Real-time or hidden results display based on creator preference
- Poll lifecycle management: ACTIVE → CLAIMING → CLOSED → FINALIZED

**Three Privacy Modes**

| Mode | Vote Choice | Voter Identity | Use Case |
|------|-------------|----------------|----------|
| **Anonymous** | Hidden | Hidden | Sensitive topics, whistleblowing, honest feedback |
| **Semi-Private** | Hidden | Public | Accountability with privacy (know WHO voted, not WHAT) |
| **Identified** | Public | Public | Transparent governance, public record |

**Token Rewards System**
- Poll creators fund reward pools with PULSE, MOVE, or USDC tokens
- Participants earn rewards for completing polls
- Two distribution modes:
  - **MANUAL_PULL**: Voters claim their own rewards using VoteReceipt proof
  - **MANUAL_PUSH**: Creators distribute rewards in bulk to all participants
- 2% platform fee (configurable, max 10%) funds ongoing development

**Questionnaires (Multi-Poll Surveys)**
- Bundle multiple polls into comprehensive surveys
- Shared reward pool with automatic per-poll calculation
- Atomic bulk voting in a single transaction
- Progress tracking for partial completion
- Ideal for market research, employee feedback, community sentiment

**Invite-Only Polls**
- Private visibility mode restricts access to invited participants only
- Cryptographic PollInvite records ensure access control on-chain
- Invite links with configurable expiration
- Bulk invite generation for large groups
- Invite usage tracking and revocation

**Staking & Tier System**
- Stake PULSE tokens with lock periods (7, 14, 21, 30, 90, 180, 365 days)
- Tier benefits based on total holdings (wallet + staked):
  - **Bronze** (0+ PULSE): 3 daily votes
  - **Silver** (1,000+ PULSE): 6 daily votes
  - **Gold** (10,000+ PULSE): 9 daily votes
  - **Platinum** (100,000+ PULSE): 12 daily votes
- StakeReceipt records prove ownership

**Gamification**
- **Voting Streaks**: Consecutive daily voting bonuses (+1 tier for 7+ days, +2 for 30+ days)
- **Quests**: Daily, weekly, achievement, and special event challenges
- **Seasons**: Time-limited competitions with leaderboards
- **Referral Program**: Milestone rewards at 1, 10, 50, and 100 successful referrals

**Token Swap (AMM)**
- Built-in PULSE/stablecoin automated market maker
- Constant product formula (x*y=k) for price discovery
- Add/remove liquidity with LP share tracking
- Swap interface with slippage protection

**Project Organization**
- Group polls and questionnaires into projects
- Team collaboration with role-based access (Owner, Admin, Editor, Viewer)
- Project-level analytics and management

---

## The problem it solves

### Problem 1: DAO Governance is Broken

**The Current State:**
- Voting on platforms like Snapshot, Tally, and Aragon is 100% public
- Whale wallets can see how others vote and apply social pressure
- Vote buying is trivial when preferences are visible (the "Dark DAO" problem)
- Participation rates languish below 30% due to voter apathy and fear of retaliation
- Power concentration: <1% of token holders control 90%+ of voting power

**How LeoPulse Solves It:**
- Zero-knowledge proofs provide mathematically-proven anonymity, not trust-based privacy
- Vote buying becomes ineffective when vote choices cannot be verified
- Token rewards boost participation rates significantly beyond 30%
- Per-proposal privacy settings let DAOs choose the right level for each decision
- Anonymous mode eliminates social pressure and whale manipulation

### Problem 2: Enterprise Surveys Are Not Trusted

**The Current State:**
- Over 40% of employees don't believe "anonymous" workplace surveys are truly anonymous
- HR departments control the backend and can potentially de-anonymize responses
- Fear of retaliation leads to self-censorship, reducing feedback quality
- Small team sizes make de-anonymization easier through response patterns
- Trust deficit means organizations miss critical feedback

**How LeoPulse Solves It:**
- Blockchain-based anonymity means employers mathematically cannot identify respondents
- Zero-knowledge proofs provide cryptographic guarantees, not policy promises
- Immutable on-chain records prevent tampering or selective disclosure
- Trustless architecture removes the need to trust any central party
- Employees can verify their vote was counted without revealing their choice

### Problem 3: Market Research Suffers from Fraud

**The Current State:**
- The $80B+ market research industry is plagued by fake responses
- Bot farms and click farms generate fraudulent survey completions
- Respondents game systems to maximize rewards without genuine input
- No reliable way to verify unique, real participants
- Privacy regulations (GDPR, CCPA) create compliance complexity

**How LeoPulse Solves It:**
- One vote per wallet address ensures verifiable uniqueness
- On-chain immutable records prevent response tampering
- Transparent, trustless reward distribution eliminates gaming
- Cryptographic verification proves response authenticity
- Privacy-by-design architecture simplifies regulatory compliance

### Problem 4: Aleo Ecosystem Lacks Governance Infrastructure

**The Current State:**
- 350+ teams building on Aleo with $228M+ in funding
- No native polling or governance solution exists
- Projects lack tools to engage their communities privately
- The ecosystem needs infrastructure to mature

**How LeoPulse Solves It:**
- First-mover advantage as THE privacy-preserving engagement platform on Aleo
- Native integration with Aleo's ZK capabilities (not a port from another chain)
- Can become the standard governance layer for Aleo projects
- Positioned for grants and ecosystem partnerships

---

## Challenges I ran into

### Zero-Knowledge Circuit Design
Designing voting logic that works within ZK constraints required fundamentally rethinking how polls work. Traditional voting systems assume a trusted server; ZK systems must prove correctness without revealing inputs. We had to:
- Optimize Leo contract logic for ZK proof generation efficiency
- Balance privacy guarantees with gas costs
- Design record structures (VoteReceipt, PollInvite) that prove facts without leaking data

### Three Privacy Modes in One Contract
Implementing anonymous, semi-private, and identified voting in a single smart contract while maintaining security guarantees for each mode was complex. Each mode has different:
- Data visibility requirements
- Proof generation logic
- On-chain storage patterns

We solved this with configurable privacy settings stored in `poll_settings` mapping and conditional logic paths in the voting functions.

### Wallet Integration Across Multiple Providers
Supporting Leo Wallet and Shield Wallet with consistent UX required:
- Building an adapter layer that normalizes wallet APIs
- Handling different transaction signing flows
- Managing network switching (testnet/mainnet) gracefully
- Testing with actual browser extensions (headless mode doesn't work)

### Hybrid On-Chain/Off-Chain Architecture
Balancing on-chain privacy requirements with off-chain performance needs:
- **On-chain**: Voting proofs, rewards, token state, poll results (privacy-critical)
- **Off-chain**: Poll metadata, user profiles, gamification data (performance-critical)

Synchronizing these two data sources while maintaining consistency was challenging.

### Reward Distribution Mechanics
Building trustless, verifiable reward mechanisms that support both pull and push models:
- MANUAL_PULL requires voters to actively claim (gas-efficient, may have unclaimed)
- MANUAL_PUSH requires creators to distribute (guaranteed delivery, higher cost)
- Calculating per-voter rewards with platform fees correctly
- Handling partial claims and expired polls

### Transaction Feedback UX
Aleo transactions can take time to confirm. Providing clear feedback without misleading users:
- Optimistic UI updates vs. waiting for confirmation
- Handling transaction failures gracefully
- Explaining ZK proof generation to non-technical users

### E2E Testing with Browser Extensions
Playwright E2E tests require special handling for wallet extensions:
- Can't run headless (extensions need visible window)
- Required dedicated browser profile with Leo Wallet pre-installed
- Test isolation is harder with persistent wallet state

---

## Technologies I used

### Blockchain Layer

**Aleo**
- Layer 1 blockchain built for zero-knowledge applications
- Native ZK proof generation and verification
- Supports private state (records) and public state (mappings)
- Testnet and mainnet deployment

**Leo Language**
- Domain-specific language for ZK smart contracts
- Rust-like syntax optimized for ZK circuits
- Compiles to Aleo instructions with automatic constraint generation
- Supports records (private), mappings (public), and structs

### Smart Contracts

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| `leopulse_poll_v2.aleo` | Core polling | Privacy modes, voting, rewards, invites |
| `leopulse_token.aleo` | PULSE token | 1B max supply, 8 decimals, faucet |
| `leopulse_staking.aleo` | Staking | Lock periods, positions, receipts |
| `leopulse_swap.aleo` | AMM | Constant product, LP shares |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with concurrent features |
| **TypeScript** | Type-safe development |
| **Vite** | Fast dev server and optimized builds |
| **TailwindCSS 4** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **wouter** | Lightweight SPA routing |
| **@tanstack/react-query** | Server state management |
| **react-hook-form + zod** | Form handling and validation |
| **framer-motion** | Animations |
| **recharts** | Data visualization |
| **sonner** | Toast notifications |

### Aleo Integration

| Package | Purpose |
|---------|---------|
| `@provablehq/sdk` | Aleo blockchain interaction |
| `@provablehq/aleo-wallet-adaptor-react` | Wallet connection |
| `@demox-labs/aleo-wallet-adapter` | Wallet adapter utilities |

### Backend

| Technology | Purpose |
|------------|---------|
| **Express.js** | HTTP server framework |
| **TypeScript** | Type-safe server code |
| **Drizzle ORM** | Type-safe database queries |
| **Neon** | Serverless PostgreSQL |
| **Passport.js** | Authentication |
| **express-session** | Session management |
| **http-proxy-middleware** | RPC proxy for CORS |

### Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | Authentication credentials |
| `user_profiles` | Tier, streak, cached balances |
| `polls` | Poll metadata |
| `poll_options` | Poll choices |
| `donations` | Donation tracking |
| `quests` | Gamification challenges |
| `seasons` | Competition periods |
| `projects` | Poll organization |
| `referrals` | Referral tracking |

### Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing with Brave + Leo Wallet |
| **Profile 22** | Dedicated browser profile for tests |

### Development Tools

| Tool | Purpose |
|------|---------|
| **esbuild** | Fast TypeScript compilation |
| **drizzle-kit** | Database migrations |
| **dotenv** | Environment configuration |

---

## How we built it

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Polls    │  │  Staking   │  │    Swap    │  │  Quests    │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              │   Custom React Hooks    │                        │
│              │  useContract, usePolls  │                        │
│              └────────────┬────────────┘                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Express    │   │  Aleo RPC    │   │  PostgreSQL  │
│   Backend    │   │   Proxy      │   │   (Neon)     │
│              │   │              │   │              │
│  API Routes  │   │  CORS Fix    │   │  User Data   │
│  Drizzle ORM │   │  Testnet/    │   │  Metadata    │
│  Auth        │   │  Mainnet     │   │  Gamification│
└──────────────┘   └──────────────┘   └──────────────┘
         │                  │
         └──────────────────┴──────────────────┐
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALEO BLOCKCHAIN (L1)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ poll.aleo   │  │ token.aleo  │  │staking.aleo │             │
│  │             │  │             │  │             │             │
│  │ ZK Voting   │  │ PULSE Token │  │ Lock/Unlock │             │
│  │ Privacy     │  │ Minting     │  │ Tiers       │             │
│  │ Rewards     │  │ Transfers   │  │ Receipts    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Development Approach

**1. Smart Contract First**
We started with Leo smart contracts, designing the on-chain data structures and privacy mechanics before building the frontend. This ensured the UI could only do what the contracts allow.

Key contract patterns:
- **Records** for private state (VoteReceipt, StakeReceipt, PollInvite)
- **Mappings** for public state (polls, vote_counts, has_voted)
- **Async/Future** pattern for multi-block operations

**2. Hybrid Data Model**
We split data between on-chain and off-chain based on privacy requirements:

| Data | Location | Reason |
|------|----------|--------|
| Vote proofs | On-chain | Privacy-critical, must be verifiable |
| Token transfers | On-chain | Trustless, immutable |
| Poll metadata | Off-chain | Performance, not privacy-sensitive |
| User profiles | Off-chain | Frequent updates, tier caching |
| Gamification | Off-chain | Complex queries, leaderboards |

**3. Wallet Adapter Pattern**
Built an abstraction layer to support multiple Aleo wallets:

```typescript
// Normalized wallet interface
interface WalletAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  signTransaction(tx: Transaction): Promise<SignedTransaction>
  getAddress(): string
  getNetwork(): 'testnet' | 'mainnet'
}
```

**4. Custom React Hooks**
Created 18+ hooks to encapsulate blockchain interaction:

| Hook | Purpose |
|------|---------|
| `useContract` | Generic contract calls |
| `useAleoPolls` | Poll CRUD operations |
| `useAleoStaking` | Stake/unstake operations |
| `useAleoSwap` | AMM swap operations |
| `useWalletConnection` | Wallet state management |
| `usePlatformStats` | Aggregate metrics |
| `useDonations` | Donation tracking |

**5. Component Library**
Leveraged shadcn/ui for accessible, customizable components, then built 32+ domain-specific components:

```
components/
├── poll/           # PollCard, PollForm, VoteButton
├── questionnaire/  # QuestionnaireWizard, ProgressBar
├── onboarding/     # WalletSetup, TierExplainer
├── staking/        # StakeForm, PositionList
├── ui/             # Button, Card, Dialog (shadcn)
└── layout/         # Header, Sidebar, Footer
```

**6. Testing Strategy**

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Hooks, utilities, components |
| Integration | Vitest | API routes, database |
| E2E | Playwright | Full user flows with wallet |

E2E tests run with Brave browser and a dedicated profile (Profile 22) with Leo Wallet pre-installed.

### File Organization

```
leopulse/
├── contracts/aleo/           # Leo smart contracts
│   ├── poll/                 # Core polling logic
│   ├── pulse/                # PULSE token
│   ├── staking/              # Staking mechanics
│   └── swap/                 # AMM
├── frontend/
│   ├── client/src/
│   │   ├── components/       # 32+ UI components
│   │   ├── pages/            # 18+ route pages
│   │   ├── hooks/            # 18+ custom hooks
│   │   ├── contexts/         # 7+ React contexts
│   │   ├── lib/              # Utilities
│   │   └── types/            # TypeScript interfaces
│   ├── server/
│   │   ├── index.ts          # Express setup
│   │   ├── routes.ts         # API endpoints
│   │   ├── aleo-service.ts   # Blockchain interaction
│   │   └── db.ts             # Database connection
│   ├── shared/
│   │   └── schema.ts         # Drizzle schema + Zod types
│   └── e2e/                  # Playwright tests
├── docs/                     # Documentation
└── videos/                   # Remotion demo videos
```

---

## What we learned

### ZK Design Requires Upfront Planning
Privacy constraints must be architected from day one, not bolted on later. The data structures, proof circuits, and user flows all depend on what information can and cannot be revealed.

### Leo Language Has Unique Patterns
Coming from Solidity or Rust, Leo feels familiar but has critical differences:
- Field arithmetic instead of arbitrary integers
- Records for private state require different thinking than mappings
- Async operations span multiple blocks
- ZK constraints affect what computations are practical

### User Experience Cannot Be Compromised
Even with complex cryptography underneath, the voting experience must feel simple. Users don't need to understand ZK proofs to benefit from them. We invested heavily in:
- Clear privacy mode explanations
- Transaction status feedback
- Error messages that guide users

### Hybrid Architectures Are Necessary
Pure on-chain applications are too slow and expensive for good UX. Hybrid architectures that put privacy-critical operations on-chain and everything else off-chain provide the best balance.

### Testing with Wallets Is Hard
Browser extension wallets don't work in headless mode. E2E testing requires:
- Headed browser with visible window
- Pre-configured wallet profile
- Careful test isolation
- Longer test execution times

### Privacy Modes Need Flexibility
Different use cases need different privacy guarantees:
- DAOs want anonymous voting for contentious proposals but identified voting for routine matters
- Enterprises want semi-private (accountability without vote exposure)
- Market research wants anonymous for honest responses

One-size-fits-all privacy doesn't work.

### Aleo Ecosystem Is Early but Promising
Building on Aleo means dealing with:
- Evolving tooling and documentation
- Smaller community (but growing fast)
- Fewer reference implementations

But the native ZK capabilities are worth it for privacy-focused applications.

---

## What's next for LeoPulse

### 10-Wave Grant Program (January - June 2026)

LeoPulse is participating in the Aleo 10-wave grant program, with each wave following a 14-day build cycle. See individual wave files for detailed plans and progress:

| Wave | Focus | Dates | Status |
|------|-------|-------|--------|
| [Wave 1](./wave1.md) | Core Polling Foundation | Jan 20 - Feb 3 | Complete |
| [Wave 2](./wave2.md) | Privacy UX & Verification | Feb 3 - Feb 17 | Planned |
| [Wave 3](./wave3.md) | Reward Distribution | Feb 17 - Mar 3 | Planned |
| [Wave 4](./wave4.md) | Questionnaires & Bulk Voting | Mar 3 - Mar 17 | Planned |
| [Wave 5](./wave5.md) | Invite-Only Polls | Mar 17 - Mar 31 | Planned |
| [Wave 6](./wave6.md) | Staking & Tiers | Mar 31 - Apr 14 | Planned |
| [Wave 7](./wave7.md) | Gamification | Apr 14 - Apr 28 | Planned |
| [Wave 8](./wave8.md) | Token Swap & Liquidity | Apr 28 - May 12 | Planned |
| [Wave 9](./wave9.md) | Security & Optimization | May 12 - May 26 | Planned |
| [Wave 10](./wave10.md) | Mainnet Launch | May 26 - Jun 9 | Planned |

**Total Grant**: $50,000 USDT | **Goal**: Mainnet deployment by June 2026

See [ROADMAP.md](./ROADMAP.md) for the complete roadmap and [FEATURE-RELEASES.md](./FEATURE-RELEASES.md) for the controlled feature release matrix.

### Post-Mainnet: Growth Phase
- **Community Features**: Comments, sharing, social integrations
- **Platform Governance**: PULSE token holders vote on protocol changes
- **Mobile Experience**: PWA and native iOS/Android apps
- **Creator Verification**: Badges for verified organizations

### Post-Mainnet: Enterprise Phase (BizPulse)
- **White-Label Solution**: Custom branding for enterprises
- **Enterprise SSO**: Integration with corporate identity providers
- **Compliance Features**: GDPR, CCPA, SOC 2 compliance tools
- **API & SDK**: Developer tools for third-party integrations
- **SLA Packages**: Enterprise support tiers

### Post-Mainnet: Expansion Phase
- **Embedded Wallets**: Web2 onboarding without wallet setup
- **AI Features**: Poll suggestions, sentiment analysis, fraud detection
- **Cross-Chain**: Support rewards in tokens from other blockchains
- **Partner Integrations**: Direct integration with DAO frameworks
- **Developer Grants**: Fund ecosystem builders

### Long-Term Vision
LeoPulse aims to become the default engagement layer for Web3:
- Every DAO uses LeoPulse for governance
- Every enterprise uses BizPulse for internal feedback
- Every market researcher uses LeoPulse for privacy-preserving surveys

**Privacy-preserving participation should be the default, not the exception.**

---

## Links

- **Website**: [Coming Soon]
- **Testnet**: [Coming Soon]
- **GitHub**: [Repository]
- **Documentation**: See `/docs` folder
- **Smart Contracts**: See `/contracts/aleo` folder

---

*Built with zero-knowledge proofs on Aleo. Your vote is private. Your voice matters.*
