# LeoPulse Smart Contract Documentation

## Overview

LeoPulse consists of smart contracts written in Leo, deployed on Aleo Network. These contracts leverage Aleo's zero-knowledge proof system for privacy-preserving voting.

**Status**: In Development for Aleo Testnet

---

## Contract Overview

| Contract | Program ID | Purpose |
|----------|------------|---------|
| poll.aleo | TBD | Core polling, voting, privacy modes, rewards |
| PULSE Token | via token_registry.aleo | Platform token |
| staking.aleo | TBD | PULSE staking for tier qualification |
| swap.aleo | TBD | AMM for token exchange |

---

## 1. Poll Contract (`poll.aleo`)

The core contract for creating polls, voting with configurable privacy, and distributing rewards.

### Privacy Modes

Poll creators choose one of three privacy levels:

| Mode | Value | Vote Choice | Voter Identity | Use Case |
|------|-------|-------------|----------------|----------|
| Anonymous | 0 | Private (in record only) | Hidden | Sensitive topics |
| Semi-Private | 1 | Private (in record only) | Public | Accountability without revealing preference |
| Identified | 2 | Public (in mapping) | Public | Transparent governance |

### Data Structures

```leo
struct PollInfo {
    creator: address,
    reward_pool: u64,
    max_voters: u64,
    end_height: u64,       // Block height when poll ends
    status: u8,            // 0=Active, 1=Closed, 2=Claiming, 3=Finalized
    total_voters: u64,
    coin_type: u8,         // 0=Credits, 1=PULSE
}

struct PollSettings {
    privacy_mode: u8,      // 0=anonymous, 1=semi-private, 2=identified
    show_results_live: bool,
    require_receipt: bool,
}

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
    claimed: bool,
}
```

### Mappings (Public State)

```leo
mapping polls: u64 => PollInfo;
mapping poll_settings: u64 => PollSettings;
mapping poll_count: u8 => u64;                    // Key 0 => total polls
mapping vote_counts: field => u64;                // hash(poll_id, option) => count
mapping voters: field => bool;                    // hash(poll_id, voter) => voted
mapping public_votes: field => u8;                // hash(poll_id, voter) => option (identified only)
mapping claimed: field => bool;                   // hash(poll_id, voter) => claimed
```

### Transitions

#### Initialization

```leo
transition initialize(admin: address)
```
Initialize the poll registry. Called once by deployer.

#### Poll Creation

```leo
transition create_poll(
    title_hash: field,           // Hash of title (stored off-chain)
    options_count: u8,
    reward_per_vote: u64,        // 0 for equal split
    max_voters: u64,             // 0 for unlimited
    duration_blocks: u64,
    fund_amount: u64,
    privacy_mode: u8,
    show_results_live: bool
) -> (u64, ...)                  // Returns poll_id
```
Create a poll. Funds are transferred from creator to contract.

#### Voting

```leo
transition vote(
    poll_id: u64,
    option_index: u8
) -> VoteReceipt
```
Cast a vote. Returns a private VoteReceipt record.

```leo
transition bulk_vote(
    poll_ids: [u64; 10],
    option_indices: [u8; 10],
    count: u8
) -> [VoteReceipt; 10]
```
Vote on multiple polls in a single transaction.

#### Poll Lifecycle

```leo
transition start_claims(
    poll_id: u64,
    distribution_mode: u8       // 0=pull (voters claim), 1=push (creator distributes)
)
```
Close voting and start claims/distribution period. Only poll creator can call.

```leo
transition close_poll(poll_id: u64)
```
Close the claims period. Only poll creator can call.

```leo
transition finalize_poll(poll_id: u64)
```
Finalize a poll after claim period, return unclaimed funds to treasury.

#### Rewards

```leo
transition claim_reward(receipt: VoteReceipt) -> ...
```
Claim reward using VoteReceipt (for pull mode).

```leo
transition distribute_rewards(poll_id: u64)
```
Distribute rewards to all voters (for push mode). Only poll creator can call.

### View Functions (via Mappings)

Since Leo doesn't have traditional view functions, query mappings via API:

```
GET /mapping/get_value/poll.aleo/polls/{poll_id}
GET /mapping/get_value/poll.aleo/vote_counts/{hash}
GET /mapping/get_value/poll.aleo/voters/{hash}
```

---

## 2. PULSE Token (via token_registry.aleo)

PULSE is registered as a token in Aleo's official `token_registry.aleo` program.

### Token Properties

| Property | Value |
|----------|-------|
| Name | Pulse Token |
| Symbol | PULSE |
| Decimals | 8 |
| Max Supply | 1,000,000,000 PULSE |
| Token ID | TBD (registered field) |

### Registration

```leo
// Called on token_registry.aleo
transition register_token(
    token_id: field,
    name: [field; 4],           // "Pulse Token" encoded
    symbol: [field; 1],         // "PULSE" encoded
    decimals: u8,               // 8
    max_supply: u128,
    external_authorization_required: bool,
    admin: address
)
```

### Standard Operations

All token operations use `token_registry.aleo`:

```leo
// Mint (admin only)
transition mint_public(token_id: field, to: address, amount: u128)
transition mint_private(token_id: field, to: address, amount: u128) -> token

// Transfer
transition transfer_public(token_id: field, to: address, amount: u128)
transition transfer_private(token: token, to: address, amount: u128) -> (token, token)
transition transfer_public_to_private(token_id: field, to: address, amount: u128) -> token
transition transfer_private_to_public(token: token, to: address, amount: u128)

// Balance queries via mappings
GET /mapping/get_value/token_registry.aleo/balances/{hash(token_id, address)}
```

### Faucet (Testnet)

Optional wrapper program for testnet faucet:

```leo
program pulse_faucet.aleo {
    transition faucet() -> token
    // Mints 1000 PULSE to caller (testnet only)
}
```

---

## 3. Staking Contract (`staking.aleo`)

Stake PULSE tokens for tier qualification with flexible lock periods.

### Lock Periods

| Duration | Seconds | Blocks (~1s/block) |
|----------|---------|-------------------|
| 7 days | 604,800 | ~604,800 |
| 14 days | 1,209,600 | ~1,209,600 |
| 30 days | 2,592,000 | ~2,592,000 |
| 90 days | 7,776,000 | ~7,776,000 |
| 180 days | 15,552,000 | ~15,552,000 |
| 365 days | 31,536,000 | ~31,536,000 |

### Data Structures

```leo
struct StakePosition {
    amount: u64,
    start_height: u64,
    lock_duration: u64,
    unlock_height: u64,
}

record StakeReceipt {
    owner: address,
    position_id: field,
    amount: u64,
    unlock_height: u64,
}

mapping positions: field => StakePosition;     // hash(user, index) => position
mapping total_staked: u8 => u64;               // Key 0 => total
mapping stakers_count: u8 => u64;              // Key 0 => count
mapping user_stake_count: address => u64;      // user => position count
```

### Transitions

```leo
transition initialize(admin: address)
```
Initialize the staking pool.

```leo
transition stake(
    amount: u64,
    lock_duration: u64
) -> StakeReceipt
```
Stake PULSE with a specified lock period. Returns a StakeReceipt.

```leo
transition unstake(receipt: StakeReceipt) -> token
```
Unstake a specific position using the receipt. Must be past unlock height.

```leo
transition unstake_all()
```
Unstake all unlocked positions for caller.

---

## 4. Swap Contract (`swap.aleo`)

AMM for PULSE/Stablecoin trading using constant product formula (x*y=k).

### Constants

```leo
const MAX_FEE_BPS: u64 = 500u64;       // Max 5%
const DEFAULT_FEE_BPS: u64 = 30u64;    // 0.3%
const MINIMUM_LIQUIDITY: u64 = 1000u64;
```

### Data Structures

```leo
struct PoolState {
    pulse_reserve: u64,
    stable_reserve: u64,
    total_lp_shares: u64,
    fee_bps: u64,
}

record LPToken {
    owner: address,
    shares: u64,
}

mapping pool: u8 => PoolState;                  // Key 0 => pool state
mapping lp_positions: address => u64;           // provider => shares
```

### Transitions

```leo
transition initialize(
    stable_token_id: field,
    fee_bps: u64
)
```
Initialize the liquidity pool.

```leo
transition add_liquidity(
    pulse_amount: u64,
    stable_amount: u64,
    min_lp_shares: u64
) -> LPToken
```
Add liquidity and receive LP token.

```leo
transition remove_liquidity(
    lp_token: LPToken,
    min_pulse_out: u64,
    min_stable_out: u64
) -> (token, token)
```
Remove liquidity by burning LP token.

```leo
transition swap_pulse_to_stable(
    pulse_amount_in: u64,
    min_stable_out: u64
) -> token
```
Sell PULSE for stablecoin.

```leo
transition swap_stable_to_pulse(
    stable_amount_in: u64,
    min_pulse_out: u64
) -> token
```
Buy PULSE with stablecoin.

---

## Error Handling

Leo uses `assert` statements that cause the transaction to fail:

### Poll Contract Errors

| Condition | Message |
|-----------|---------|
| `poll.creator != caller` | "Not poll creator" |
| `poll.status != ACTIVE` | "Poll not active" |
| `voters[hash] == true` | "Already voted" |
| `option_index >= options_count` | "Invalid option" |
| `claimed[hash] == true` | "Already claimed" |
| `current_height > poll.end_height` | "Poll ended" |

### Staking Contract Errors

| Condition | Message |
|-----------|---------|
| `!is_valid_lock_period(duration)` | "Invalid lock period" |
| `amount == 0` | "Cannot stake zero" |
| `current_height < position.unlock_height` | "Position still locked" |

### Swap Contract Errors

| Condition | Message |
|-----------|---------|
| `pulse_reserve == 0 \|\| stable_reserve == 0` | "Insufficient liquidity" |
| `amount_out < min_out` | "Slippage exceeded" |
| `new_k < old_k` | "K invariant violated" |

---

## Integration Examples

### Creating a Poll (TypeScript)

```typescript
import { Transaction } from "@demox-labs/aleo-wallet-adapter-base";

const transaction = Transaction.createTransaction(
  walletAddress,
  "testnet",
  "poll.aleo",
  "create_poll",
  [
    titleHash,           // field
    "4u8",               // options_count
    "0u64",              // reward_per_vote (0 = equal split)
    "100u64",            // max_voters
    "86400u64",          // duration_blocks (~1 day)
    "1000000000u64",     // fund_amount (1000 PULSE with 8 decimals)
    "0u8",               // privacy_mode (anonymous)
    "true",              // show_results_live
  ],
  1000000,               // fee in microcredits
  false                  // feePrivate
);

const txId = await requestTransaction(transaction);
```

### Voting on a Poll

```typescript
const transaction = Transaction.createTransaction(
  walletAddress,
  "testnet",
  "poll.aleo",
  "vote",
  [
    `${pollId}u64`,      // poll_id
    `${optionIndex}u8`,  // option_index
  ],
  500000,                // fee
  false
);

const txId = await requestTransaction(transaction);
// Transaction returns a VoteReceipt record
```

### Staking PULSE

```typescript
const transaction = Transaction.createTransaction(
  walletAddress,
  "testnet",
  "staking.aleo",
  "stake",
  [
    "100000000000u64",   // 1000 PULSE (8 decimals)
    "2592000u64",        // 30 days in seconds
  ],
  500000,
  false
);

const txId = await requestTransaction(transaction);
```

### Swapping Tokens

```typescript
const transaction = Transaction.createTransaction(
  walletAddress,
  "testnet",
  "swap.aleo",
  "swap_pulse_to_stable",
  [
    "10000000000u64",    // 100 PULSE in
    "9500000000u64",     // min 95 stable out (5% slippage)
  ],
  500000,
  false
);

const txId = await requestTransaction(transaction);
```

---

## Querying On-Chain Data

### Via Aleoscan API

```typescript
// Get poll info
const response = await fetch(
  `https://api.testnet.aleoscan.io/v2/mapping/get_value/poll.aleo/polls/${pollId}u64`
);

// Get vote count for option
const hash = hashFields([pollId, optionIndex]);
const response = await fetch(
  `https://api.testnet.aleoscan.io/v2/mapping/get_value/poll.aleo/vote_counts/${hash}`
);

// Check if user voted
const hash = hashFields([pollId, userAddress]);
const response = await fetch(
  `https://api.testnet.aleoscan.io/v2/mapping/get_value/poll.aleo/voters/${hash}`
);
```

### Via Provable API

```typescript
// List all polls
const response = await fetch(
  `https://api.explorer.provable.com/v1/testnet/program/poll.aleo/mapping/polls`
);
```

---

## Deployment

### Build Contracts

```bash
cd contracts/poll
leo build

cd ../staking
leo build

cd ../swap
leo build
```

### Deploy to Testnet

```bash
snarkos developer deploy poll.aleo \
  --private-key $PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast"
```

---

*Last Updated: January 2025 (Aleo Migration)*
