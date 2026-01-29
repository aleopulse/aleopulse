# LeoPulse 10-Wave Roadmap

> 10 Waves, 3 Months, One Goal: Mainnet Deployment

Each wave follows a 14-day build cycle with 10 days of development and 4 days of evaluation.

## Overview

| Wave | Dates | Focus | Key Deliverables |
|------|-------|-------|------------------|
| **1** | 1/20 - 2/3 | Core Polling Foundation | Basic poll creation/voting on testnet, wallet integration, three privacy modes working |
| **2** | 2/3 - 2/17 | Privacy UX & Verification | Enhanced privacy mode UI, ZK proof visualization, vote verification flow, receipt system |
| **3** | 2/17 - 3/3 | Reward Distribution | Token rewards for voting, claim flows, MANUAL_PULL and MANUAL_PUSH modes, platform fee mechanism |
| **4** | 3/3 - 3/17 | Questionnaires & Bulk Voting | Multi-poll surveys, shared reward pools, atomic bulk voting, progress tracking |
| **5** | 3/17 - 3/31 | Invite-Only Polls | Private visibility mode, PollInvite records, access control, invite management UI |
| **6** | 3/31 - 4/14 | Staking & Tiers | PULSE staking contract, lock periods, tier system (Bronze→Platinum), daily vote limits |
| **7** | 4/14 - 4/28 | Gamification | Voting streaks, quests system, seasons/leaderboards, referral rewards |
| **8** | 4/28 - 5/12 | Token Swap & Liquidity | AMM for PULSE/stablecoin, LP shares, swap UI, tokenomics dashboard |
| **9** | 5/12 - 5/26 | Security & Optimization | Contract audit fixes, gas optimization, E2E test coverage, performance tuning |
| **10** | 5/26 - 6/9 | Mainnet Launch | Production deployment, migration tools, launch campaign, documentation |

---

## Wave 1: Core Polling Foundation
**Dates:** January 20 - February 3, 2026

### Goals
Establish the foundational polling infrastructure on Aleo testnet with working privacy modes.

### Deliverables
- [ ] Poll creation with title, description, options, and duration
- [ ] Basic voting flow with wallet connection
- [ ] Three privacy modes implemented:
  - Anonymous (vote + identity hidden)
  - Semi-private (vote hidden, identity public)
  - Identified (both public)
- [ ] Leo Wallet and Shield Wallet support
- [ ] Testnet contract deployment (`leopulse_poll_v2.aleo`)
- [ ] Basic poll listing and detail pages

### Success Metrics
- Users can create and vote on polls
- Privacy modes function correctly on-chain
- Wallet connection works reliably

---

## Wave 2: Privacy UX & Verification
**Dates:** February 3 - February 17, 2026

### Goals
Enhance the user experience around privacy features and provide vote verification capabilities.

### Deliverables
- [ ] Visual privacy level indicators throughout UI
- [ ] Privacy mode comparison/education component
- [ ] "Prove your vote was counted" verification flow
- [ ] VoteReceipt display and export functionality
- [ ] ZK proof visualization (simplified for users)
- [ ] Improved transaction status feedback
- [ ] Privacy mode tooltips and help text

### Success Metrics
- Users understand privacy implications before voting
- Vote verification flow is intuitive
- Transaction feedback is clear and timely

---

## Wave 3: Reward Distribution
**Dates:** February 17 - March 3, 2026

### Goals
Implement the complete reward system for incentivizing poll participation.

### Deliverables
- [ ] Multi-token reward support (PULSE, MOVE, USDC)
- [ ] Creator funds reward pool during poll creation
- [ ] MANUAL_PULL mode: voters claim their own rewards
- [ ] MANUAL_PUSH mode: creator distributes rewards in bulk
- [ ] RewardTicket generation and claim flow
- [ ] 2% platform fee integration
- [ ] Reward history and tracking UI
- [ ] Unclaimed rewards dashboard for creators

### Success Metrics
- Creators can fund polls with tokens
- Voters can claim rewards after voting
- Platform fees are collected correctly

---

## Wave 4: Questionnaires & Bulk Voting
**Dates:** March 3 - March 17, 2026

### Goals
Enable multi-poll surveys with streamlined voting and shared reward pools.

### Deliverables
- [ ] Questionnaire creation (bundle multiple polls)
- [ ] Shared reward pool with automatic per-poll calculation
- [ ] Single transaction for all questionnaire votes
- [ ] Progress indicators during questionnaire completion
- [ ] Questionnaire listing and detail pages
- [ ] Partial completion handling
- [ ] Questionnaire analytics for creators

### Success Metrics
- Users can complete multi-poll questionnaires in one flow
- Rewards are distributed correctly across questionnaire
- Progress is tracked and displayed

---

## Wave 5: Invite-Only Polls
**Dates:** March 17 - March 31, 2026

### Goals
Implement private poll visibility with cryptographic access control.

### Deliverables
- [ ] Private visibility mode for polls
- [ ] PollInvite record generation
- [ ] Invite link creation with expiration
- [ ] Access validation before voting
- [ ] Invite management dashboard for creators
- [ ] Bulk invite generation
- [ ] Invite usage tracking
- [ ] Revoke invite functionality

### Success Metrics
- Private polls are only accessible to invited users
- Invite records work correctly on-chain
- Creators can manage invites easily

---

## Wave 6: Staking & Tiers
**Dates:** March 31 - April 14, 2026

### Goals
Launch PULSE token staking with tier-based benefits.

### Deliverables
- [ ] Staking contract deployment (`leopulse_staking.aleo`)
- [ ] Lock period options (7, 14, 21, 30, 90, 180, 365 days)
- [ ] Tier calculation (wallet balance + staked amount)
  - Bronze: 0+ PULSE (3 daily votes)
  - Silver: 1,000+ PULSE (6 daily votes)
  - Gold: 10,000+ PULSE (9 daily votes)
  - Platinum: 100,000+ PULSE (12 daily votes)
- [ ] StakeReceipt management
- [ ] Staking UI with APY display
- [ ] Unstaking flow with countdown
- [ ] Daily vote limit enforcement

### Success Metrics
- Users can stake PULSE and receive tier benefits
- Vote limits are enforced by tier
- Staking/unstaking flows are smooth

---

## Wave 7: Gamification
**Dates:** April 14 - April 28, 2026

### Goals
Add engagement mechanics to drive consistent participation.

### Deliverables
- [ ] Voting streak tracking
  - 7+ day streak: +1 tier bonus
  - 30+ day streak: +2 tier bonus
- [ ] Quest system:
  - Daily quests
  - Weekly quests
  - Achievement quests
  - Special event quests
- [ ] Season competitions with time limits
- [ ] Leaderboards (daily, weekly, all-time)
- [ ] Referral system with milestone rewards (1, 10, 50, 100 referrals)
- [ ] Gamification dashboard

### Success Metrics
- Users return daily to maintain streaks
- Quest completion rates are healthy
- Referral program drives new users

---

## Wave 8: Token Swap & Liquidity
**Dates:** April 28 - May 12, 2026

### Goals
Launch the built-in AMM for PULSE token trading.

### Deliverables
- [ ] Swap contract deployment (`leopulse_swap.aleo`)
- [ ] Constant product AMM (x*y=k formula)
- [ ] PULSE/stablecoin trading pair
- [ ] Add liquidity flow
- [ ] Remove liquidity flow
- [ ] LP share tracking and display
- [ ] Swap interface with price impact
- [ ] Price charts and history
- [ ] Tokenomics dashboard

### Success Metrics
- Users can swap tokens with reasonable slippage
- Liquidity providers can add/remove liquidity
- Price discovery functions correctly

---

## Wave 9: Security & Optimization
**Dates:** May 12 - May 26, 2026

### Goals
Harden the platform for mainnet through security review and optimization.

### Deliverables
- [ ] Smart contract security audit
- [ ] Audit finding remediation
- [ ] Gas cost optimization across all contracts
- [ ] Comprehensive E2E test coverage
- [ ] Load testing and performance benchmarks
- [ ] Bug bounty program launch
- [ ] Error handling improvements
- [ ] Edge case fixes

### Success Metrics
- All critical/high audit findings resolved
- Gas costs are optimized
- Test coverage exceeds 80%
- No critical bugs in bug bounty

---

## Wave 10: Mainnet Launch
**Dates:** May 26 - June 9, 2026

### Goals
Deploy to Aleo mainnet and launch publicly.

### Deliverables
- [ ] Deploy all contracts to mainnet:
  - `leopulse_poll.aleo`
  - `leopulse_token.aleo`
  - `leopulse_staking.aleo`
  - `leopulse_swap.aleo`
- [ ] Testnet to mainnet migration guide
- [ ] Production environment setup
- [ ] Launch marketing campaign
- [ ] SDK and API documentation
- [ ] Developer integration guide
- [ ] Post-launch monitoring and alerting
- [ ] Community launch event

### Success Metrics
- All contracts deployed and verified on mainnet
- Users can create/vote on mainnet polls
- Launch campaign reaches target audience
- No critical issues in first week

---

## Judging Criteria Alignment

Each wave is designed to demonstrate progress across the four judging criteria:

| Criteria | How We Address It |
|----------|-------------------|
| **Privacy Implementation & ZK Capabilities** | Waves 1-2 (privacy modes), Wave 5 (invite records), continuous ZK proof usage |
| **Product Quality & UX** | Every wave includes UX improvements; Waves 2, 7 focus heavily on experience |
| **Innovation & Creativity** | Waves 4 (questionnaires), 6-7 (staking/gamification), 8 (AMM) show unique features |
| **Progress & Iteration** | Clear deliverables each wave with measurable success metrics |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Smart contract bugs | Wave 9 dedicated to security; testing throughout |
| Scope creep | Each wave has defined scope; defer extras to later waves |
| Wallet integration issues | Early focus in Wave 1; continuous testing |
| Mainnet deployment delays | Buffer time in Wave 9-10; testnet practice |
| User adoption | Gamification in Wave 7; rewards throughout |

---

## Dependencies

```
Wave 1 (Core)
   ↓
Wave 2 (Privacy UX) → Wave 5 (Invites)
   ↓
Wave 3 (Rewards) → Wave 4 (Questionnaires)
   ↓
Wave 6 (Staking) → Wave 7 (Gamification)
   ↓
Wave 8 (Swap)
   ↓
Wave 9 (Security)
   ↓
Wave 10 (Mainnet)
```

---

## Long-Term Vision (Post-Mainnet)

After completing the 10-wave grant program, LeoPulse will continue development:

### Phase A: Growth
- Community features (comments, sharing, social integrations)
- Platform governance with PULSE token
- Mobile PWA and native apps

### Phase B: Enterprise (BizPulse)
- White-label enterprise dashboard
- Custom branding and SSO
- GDPR/compliance features
- API and SDK for developers

### Phase C: Expansion
- Embedded wallets for Web2 onboarding
- AI-powered poll suggestions and insights
- Partner integrations and grants program

---

## Key Metrics to Track

| Metric | Wave 5 Target | Wave 10 Target |
|--------|---------------|----------------|
| Active Users | 1,000 | 10,000 |
| Total Polls | 500 | 5,000 |
| Total Votes | 10,000 | 100,000 |
| Anonymous Votes | 50% | 60% |
| Questionnaire Completions | 500 | 10,000 |

---

*Total Prize Pool: $50,000 USDT across 10 waves*

*Roadmap subject to change based on community feedback and Aleo ecosystem developments.*
