# LeoPulse Feature Release Matrix

This document defines which features are released in each wave. Features should only be enabled/visible to users when their designated wave arrives.

## Release Matrix

| Feature | Wave 1 | Wave 2 | Wave 3 | Wave 4 | Wave 5 | Wave 6 | Wave 7 | Wave 8 | Wave 9 | Wave 10 |
|---------|--------|--------|--------|--------|--------|--------|--------|--------|--------|---------|
| **Core Polling** |
| Poll creation (basic) | ✅ | | | | | | | | | |
| Poll voting | ✅ | | | | | | | | | |
| Poll listing | ✅ | | | | | | | | | |
| Poll details page | ✅ | | | | | | | | | |
| Leo Wallet connection | ✅ | | | | | | | | | |
| Testnet deployment | ✅ | | | | | | | | | |
| **Privacy Features** |
| Identified mode | ✅ | | | | | | | | | |
| Anonymous mode | | ✅ | | | | | | | | |
| Semi-private mode | | ✅ | | | | | | | | |
| Privacy mode selector | | ✅ | | | | | | | | |
| Privacy education UI | | ✅ | | | | | | | | |
| VoteReceipt display | | ✅ | | | | | | | | |
| Vote verification | | ✅ | | | | | | | | |
| Shield Wallet support | | ✅ | | | | | | | | |
| **Rewards** |
| Reward pool funding | | | ✅ | | | | | | | |
| MANUAL_PULL claims | | | ✅ | | | | | | | |
| MANUAL_PUSH distribution | | | ✅ | | | | | | | |
| Platform fee (2%) | | | ✅ | | | | | | | |
| Reward tracking UI | | | ✅ | | | | | | | |
| Multi-token support | | | ✅ | | | | | | | |
| **Questionnaires** |
| Questionnaire creation | | | | ✅ | | | | | | |
| Multi-poll bundling | | | | ✅ | | | | | | |
| Bulk voting | | | | ✅ | | | | | | |
| Progress tracking | | | | ✅ | | | | | | |
| Questionnaire analytics | | | | ✅ | | | | | | |
| **Access Control** |
| Private visibility mode | | | | | ✅ | | | | | |
| PollInvite records | | | | | ✅ | | | | | |
| Invite generation | | | | | ✅ | | | | | |
| Invite management UI | | | | | ✅ | | | | | |
| Access validation | | | | | ✅ | | | | | |
| **Staking** |
| Staking contract | | | | | | ✅ | | | | |
| Lock periods | | | | | | ✅ | | | | |
| Tier system | | | | | | ✅ | | | | |
| Daily vote limits | | | | | | ✅ | | | | |
| StakeReceipt | | | | | | ✅ | | | | |
| **Gamification** |
| Voting streaks | | | | | | | ✅ | | | |
| Quest system | | | | | | | ✅ | | | |
| Seasons | | | | | | | ✅ | | | |
| Leaderboards | | | | | | | ✅ | | | |
| Referral program | | | | | | | ✅ | | | |
| **Token Swap** |
| Swap contract | | | | | | | | ✅ | | |
| AMM trading | | | | | | | | ✅ | | |
| Add/remove liquidity | | | | | | | | ✅ | | |
| LP shares | | | | | | | | ✅ | | |
| Price charts | | | | | | | | ✅ | | |
| **Security & Launch** |
| Security audit | | | | | | | | | ✅ | |
| Gas optimization | | | | | | | | | ✅ | |
| E2E test coverage | | | | | | | | | ✅ | |
| Mainnet deployment | | | | | | | | | | ✅ |
| Production environment | | | | | | | | | | ✅ |

---

## Wave-by-Wave Feature List

### Wave 1: Core Polling Foundation
**Release Date:** January 20 - February 3, 2026

| Feature | Status |
|---------|--------|
| Basic poll creation (title, description, options, duration) | Release |
| Basic voting flow | Release |
| Leo Wallet connection | Release |
| Testnet contract deployment | Release |
| Poll listing page (Dashboard) | Release |
| Poll details page | Release |
| Identified privacy mode only | Release |

**Hidden/Disabled:**
- Anonymous and Semi-private modes
- Reward distribution
- Questionnaires
- Invite-only polls
- Staking
- Gamification
- Token swap

---

### Wave 2: Privacy UX & Verification
**Release Date:** February 3 - February 17, 2026

| Feature | Status |
|---------|--------|
| Anonymous privacy mode | Release |
| Semi-private privacy mode | Release |
| Privacy mode selector UI | Release |
| Privacy education component | Release |
| VoteReceipt display | Release |
| Vote verification flow | Release |
| Shield Wallet support | Release |
| Transaction feedback improvements | Release |

**Cumulative:** All Wave 1 features + Wave 2 features

---

### Wave 3: Reward Distribution
**Release Date:** February 17 - March 3, 2026

| Feature | Status |
|---------|--------|
| Reward pool funding during poll creation | Release |
| MANUAL_PULL: Voter claims rewards | Release |
| MANUAL_PUSH: Creator distributes rewards | Release |
| Platform fee (2%) collection | Release |
| Reward tracking UI | Release |
| Multi-token support (PULSE, MOVE, USDC) | Release |
| RewardTicket records | Release |

**Cumulative:** All Wave 1-2 features + Wave 3 features

---

### Wave 4: Questionnaires & Bulk Voting
**Release Date:** March 3 - March 17, 2026

| Feature | Status |
|---------|--------|
| Questionnaire creation | Release |
| Multi-poll bundling | Release |
| Bulk voting (single transaction) | Release |
| Progress tracking | Release |
| Partial completion handling | Release |
| Questionnaire analytics | Release |

**Cumulative:** All Wave 1-3 features + Wave 4 features

---

### Wave 5: Invite-Only Polls
**Release Date:** March 17 - March 31, 2026

| Feature | Status |
|---------|--------|
| Private visibility mode | Release |
| PollInvite record generation | Release |
| Invite link creation | Release |
| Invite expiration | Release |
| Invite management dashboard | Release |
| Bulk invite generation | Release |
| Access validation | Release |

**Cumulative:** All Wave 1-4 features + Wave 5 features

---

### Wave 6: Staking & Tiers
**Release Date:** March 31 - April 14, 2026

| Feature | Status |
|---------|--------|
| Staking contract deployment | Release |
| Lock periods (7-365 days) | Release |
| Tier calculation | Release |
| Bronze tier (0+ PULSE, 3 daily votes) | Release |
| Silver tier (1K+ PULSE, 6 daily votes) | Release |
| Gold tier (10K+ PULSE, 9 daily votes) | Release |
| Platinum tier (100K+ PULSE, 12 daily votes) | Release |
| StakeReceipt management | Release |
| Staking UI | Release |
| Daily vote limit enforcement | Release |

**Cumulative:** All Wave 1-5 features + Wave 6 features

---

### Wave 7: Gamification
**Release Date:** April 14 - April 28, 2026

| Feature | Status |
|---------|--------|
| Voting streak tracking | Release |
| 7+ day streak bonus (+1 tier) | Release |
| 30+ day streak bonus (+2 tiers) | Release |
| Daily quests | Release |
| Weekly quests | Release |
| Achievement quests | Release |
| Season competitions | Release |
| Leaderboards | Release |
| Referral program | Release |
| Referral milestones (1, 10, 50, 100) | Release |

**Cumulative:** All Wave 1-6 features + Wave 7 features

---

### Wave 8: Token Swap & Liquidity
**Release Date:** April 28 - May 12, 2026

| Feature | Status |
|---------|--------|
| Swap contract deployment | Release |
| Constant product AMM | Release |
| PULSE/stablecoin trading | Release |
| Add liquidity | Release |
| Remove liquidity | Release |
| LP share tracking | Release |
| Swap interface | Release |
| Price impact display | Release |
| Price charts | Release |

**Cumulative:** All Wave 1-7 features + Wave 8 features

---

### Wave 9: Security & Optimization
**Release Date:** May 12 - May 26, 2026

| Feature | Status |
|---------|--------|
| Security audit completion | Release |
| Audit remediation | Release |
| Gas cost optimization | Release |
| E2E test coverage (80%+) | Release |
| Load testing | Release |
| Bug bounty program | Release |
| Performance improvements | Release |

**Cumulative:** All Wave 1-8 features + Wave 9 improvements

---

### Wave 10: Mainnet Launch
**Release Date:** May 26 - June 9, 2026

| Feature | Status |
|---------|--------|
| Mainnet contract deployment | Release |
| Production environment | Release |
| Network switching (testnet/mainnet) | Release |
| Migration documentation | Release |
| SDK documentation | Release |
| API documentation | Release |
| Launch campaign | Release |

**Cumulative:** Full platform live on mainnet

---

## Implementation Notes

### Feature Flags
Consider implementing feature flags to control visibility:

```typescript
const FEATURE_FLAGS = {
  // Wave 1
  CORE_POLLING: true,
  LEO_WALLET: true,

  // Wave 2
  PRIVACY_MODES_FULL: false,  // Enable in Wave 2
  SHIELD_WALLET: false,       // Enable in Wave 2
  VOTE_VERIFICATION: false,   // Enable in Wave 2

  // Wave 3
  REWARDS: false,             // Enable in Wave 3

  // Wave 4
  QUESTIONNAIRES: false,      // Enable in Wave 4

  // Wave 5
  PRIVATE_POLLS: false,       // Enable in Wave 5

  // Wave 6
  STAKING: false,             // Enable in Wave 6
  TIERS: false,               // Enable in Wave 6

  // Wave 7
  GAMIFICATION: false,        // Enable in Wave 7

  // Wave 8
  TOKEN_SWAP: false,          // Enable in Wave 8

  // Wave 10
  MAINNET: false,             // Enable in Wave 10
};
```

### UI Considerations
- Hide navigation items for unreleased features
- Disable buttons/forms for unreleased features
- Show "Coming Soon" badges where appropriate
- Use environment variables to control feature availability

### Contract Considerations
- Deploy contract functions progressively or use admin controls
- Consider separate contract versions per wave if needed
- Ensure backward compatibility as features are added
