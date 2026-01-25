# LeoPulse Security Documentation

## Overview

This document outlines security considerations, known risks, and mitigations for the LeoPulse platform built on Aleo.

---

## Smart Contract Security

### Aleo/Leo Language Benefits

Leo and Aleo provide several built-in security features:

1. **Zero-Knowledge Proofs**: All transitions are verified cryptographically without revealing private inputs
2. **Record-Based Ownership**: Private records can only be consumed by their owner
3. **No Reentrancy**: Aleo's execution model inherently prevents reentrancy attacks
4. **Integer Overflow Protection**: Leo has built-in overflow checks
5. **Type Safety**: Leo is strongly typed with compile-time checks
6. **Deterministic Execution**: All execution is deterministic and verifiable

### Privacy Guarantees

| Privacy Mode | Vote Choice | Voter Identity | Verification |
|--------------|-------------|----------------|--------------|
| Anonymous | Hidden (in private record) | Hidden | ZK proof only |
| Semi-Private | Hidden (in private record) | Public (in mapping) | ZK proof + public voter |
| Identified | Public (in mapping) | Public (in mapping) | Fully transparent |

### Access Control

| Function | Access Level | Protection |
|----------|--------------|------------|
| `create_poll` | Any user | None required |
| `vote` | Any user | One vote per address (enforced) |
| `start_claims` | Poll creator only | Record ownership / address check |
| `distribute_rewards` | Poll creator only | Creator verification |
| `initialize` | Deployer only | Once per contract |

### Poll Contract Security

```leo
// Access control patterns
assert_eq(poll.creator, caller);  // Only creator can manage
assert_eq(voters.contains(hash), false);  // No double voting
assert(current_height <= poll.end_height);  // Time checks
```

**Protections:**
- Only poll creator can close/distribute rewards
- Vote uniqueness enforced via mapping key `hash(poll_id, voter)`
- Reward claims tracked to prevent double-claiming
- VoteReceipt required for pull-mode claims (cryptographic proof)

### Staking Contract Security

**Lock Period Enforcement:**
```leo
assert(current_height >= position.unlock_height);
```

**Protections:**
- Cannot unstake before lock period expires
- Uses block heights (not user input) for time tracking
- Valid lock periods are whitelisted
- StakeReceipt required for unstaking

### Swap Contract Security

**AMM Invariant:**
```leo
// Constant product check
assert(new_k >= old_k);  // k = pulse_reserve * stable_reserve
```

**Protections:**
- Constant product (x*y=k) validation prevents manipulation
- Slippage protection via `min_*_out` parameters
- Minimum liquidity locked forever (prevents complete drain)

---

## Known Risks & Mitigations

### 1. Sybil Attacks

**Risk:** Users creating multiple wallets to farm rewards

**Mitigations:**
- Tier system requires PULSE holdings/staking
- Daily vote limits per wallet
- Future: On-chain identity integration

### 2. Front-Running

**Risk:** Observers front-running transactions

**Mitigations:**
- Aleo transactions are encrypted until confirmed
- Vote choices can be private (anonymous mode)
- Slippage protection on swaps

### 3. Oracle Manipulation

**Risk:** Price manipulation in swap AMM

**Mitigations:**
- AMM uses on-chain reserves only
- No external price oracles
- Price impact calculation for UI warnings

### 4. Admin Key Compromise

**Risk:** Malicious admin actions

**Current State:**
- Single admin key controls initialization and fees

**Future Mitigations:**
- Multi-sig admin controls
- Timelock on sensitive operations
- DAO governance transition

### 5. Smart Contract Bugs

**Risk:** Undiscovered vulnerabilities

**Mitigations:**
- Leo language safety features
- ZK proof verification of all transitions
- Thorough testing
- Planned: Professional security audit

### 6. Private Record Loss

**Risk:** User loses access to VoteReceipt or StakeReceipt

**Mitigations:**
- Records are stored in wallet and can be backed up
- View key allows record recovery
- UI shows record status before critical actions

---

## Off-Chain Security

### API Security

| Protection | Implementation |
|------------|----------------|
| Input Validation | All API inputs validated with Zod |
| SQL Injection | Drizzle ORM parameterized queries |
| CORS | Configured for allowed origins |
| Rate Limiting | Applied to sensitive endpoints |

### Database Security

- PostgreSQL with SSL/TLS
- Connection pooling via Neon
- No raw SQL queries (ORM only)
- Environment-based configuration

### Secret Management

| Secret | Storage |
|--------|---------|
| Database URL | Environment variable |
| Admin Private Key | Secure wallet (never in env) |
| API Keys | Environment variable |

**Recommendations:**
- Never commit secrets to git
- Use secret managers in production
- Rotate keys periodically
- Use hardware wallets for admin keys

---

## Gas Sponsorship Security (Coming Soon)

### Planned Protections

**Risks:**
- Abuse of sponsored transactions
- Quota exhaustion attacks

**Mitigations:**
- Sponsorship limits per user/day
- dApp-based budget controls
- Transaction type whitelisting
- Logging for audit
- Fee authorization signed by sponsor wallet

---

## Zero-Knowledge Specific Considerations

### Proof Generation

- Proofs are generated client-side in the wallet
- Invalid proofs are rejected by the network
- Proofs do not reveal private inputs

### Record Privacy

- Records are encrypted with the owner's view key
- Only the owner can decrypt and spend records
- Record ciphertexts are public but contents are private

### Finality

- Aleo uses a consensus mechanism for finality
- Transactions are final once included in a block
- No reorganization of confirmed transactions

---

## Vulnerability Disclosure

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email: security@leopulse.xyz (placeholder)
3. Include detailed description and reproduction steps
4. We aim to respond within 48 hours

### Bug Bounty (Future)

We plan to implement a bug bounty program post-mainnet launch.

---

## Audit Status

| Component | Audit Status | Date |
|-----------|--------------|------|
| poll.aleo | Not Audited | - |
| staking.aleo | Not Audited | - |
| swap.aleo | Not Audited | - |

**Note:** Professional security audits are planned before mainnet deployment.

---

## Security Checklist for Mainnet

- [ ] Complete security audit of Leo contracts
- [ ] Implement multi-sig for admin operations
- [ ] Add timelock to fee changes
- [ ] Rate limiting on all API endpoints
- [ ] DDoS protection (Cloudflare)
- [ ] Monitoring and alerting
- [ ] Incident response plan
- [ ] Insurance consideration
- [ ] Private key management procedures

---

## Best Practices for Users

### Wallet Security
- Use hardware wallets for large holdings
- Never share private keys or view keys
- Back up seed phrases securely
- Verify transaction details before signing

### Interaction Safety
- Only interact with verified program IDs
- Be cautious of phishing sites
- Check URL matches official domain
- Verify you're on the correct network

### Record Management
- Back up important records (VoteReceipts, StakeReceipts)
- Use view key to recover records if needed
- Don't share records publicly

---

## Contract Addresses (Verify Before Use)

**Testnet (In Development):**
```
Poll:    poll.aleo (TBD)
Staking: staking.aleo (TBD)
Swap:    swap.aleo (TBD)
PULSE:   token_registry.aleo (token_id TBD)
```

Always verify program IDs match official sources before interacting.

---

*Last Updated: January 2025 (Aleo Migration)*
