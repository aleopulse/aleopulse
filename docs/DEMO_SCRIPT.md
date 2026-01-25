# LeoPulse Demo Script

## Live Demonstration Guide

**Duration**: 5-7 minutes
**Network**: Aleo Testnet

---

## Pre-Demo Checklist

- [ ] Leo Wallet or Puzzle Wallet installed
- [ ] Testnet wallet with Aleo Credits (from faucet)
- [ ] App running at https://leopulse.xyz (or localhost)
- [ ] Two browser windows/tabs ready (Creator + Participant view)
- [ ] Aleo testnet is operational (check explorer)

---

## Demo Flow

### Part 1: Introduction (30 seconds)

**Say**: "LeoPulse is a privacy-preserving polling platform on Aleo where users can vote anonymously and earn real token rewards. Let me show you how it works."

**Action**: Show the landing page

---

### Part 2: Wallet Connection (30 seconds)

**Say**: "Users connect with Aleo browser wallets like Leo Wallet. Unlike other platforms, LeoPulse leverages Aleo's zero-knowledge proofs for private voting."

**Action**:
1. Click "Connect Wallet"
2. Show wallet options (Leo Wallet, Puzzle Wallet)
3. Connect with Leo Wallet
4. Show connected address

---

### Part 3: Creator Flow - Creating a Poll (1.5 minutes)

**Say**: "Let's create a poll as a project creator. Notice we can choose a privacy mode."

**Action**:
1. Navigate to **Creator** > **Create Poll**
2. Fill in:
   - Title: "What's your favorite blockchain feature?"
   - Options: "Privacy", "Speed", "Low Fees", "Developer Experience"
   - Category: Technology
   - Duration: 1 hour
3. **Highlight Privacy Mode**:
   - **Anonymous**: Vote choices are private (ZK proof)
   - **Semi-Private**: Identity public, choice private
   - **Identified**: Fully transparent
4. Configure rewards:
   - Token: PULSE
   - Type: Equal Split
   - Total: 100 PULSE
5. Show platform fee (2%)
6. Click "Create Poll"
7. Confirm transaction in wallet

**Say**: "The poll is now live on Aleo. The reward pool is locked in the smart contract."

---

### Part 4: Participant Flow - Voting (1 minute)

**Say**: "Now let's switch to a participant's perspective and vote anonymously."

**Action**:
1. Open incognito/different browser
2. Connect a different wallet
3. Navigate to **Projects**
4. Find the poll we just created
5. Point out the "Anonymous" privacy badge
6. Click on it to view details
7. Select an option and vote
8. Confirm transaction

**Say**: "The vote is recorded on-chain with a ZK proof. Even though the blockchain is public, my vote choice remains private. I received a VoteReceipt that proves I voted without revealing what I voted for."

---

### Part 5: Privacy Modes (30 seconds)

**Say**: "LeoPulse offers three privacy modes to suit different use cases."

**Action**:
1. Show a poll with "Identified" mode
2. Explain: "For governance votes, transparency may be preferred"
3. Show a poll with "Anonymous" mode
4. Explain: "For sensitive topics, full privacy is important"

---

### Part 6: Questionnaires (1 minute)

**Say**: "LeoPulse also supports questionnaires - bundled surveys with shared reward pools."

**Action**:
1. Navigate to **Questionnaires**
2. Show an existing questionnaire
3. Highlight:
   - Multiple polls in sequence
   - Shared pool calculation
   - Bulk voting (one transaction for all)
   - Progress tracking

**Say**: "Participants complete all polls and claim their share of the reward pool."

---

### Part 7: Staking & Tiers (45 seconds)

**Say**: "Users can stake PULSE to unlock higher tiers with more daily votes."

**Action**:
1. Navigate to **Staking**
2. Show tier requirements:
   - Bronze: 0 PULSE = 3 votes/day
   - Platinum: 100,000 PULSE = 12 votes/day
3. Show staking interface with lock periods
4. (Optional) Stake a small amount

**Say**: "Staking encourages long-term participation in the platform."

---

### Part 8: Referral System (30 seconds)

**Say**: "Our referral system incentivizes user growth."

**Action**:
1. Navigate to **Participant** > **Referrals**
2. Show referral code and shareable link
3. Show milestone system (First Vote, 10 Votes, etc.)
4. Show leaderboard

---

### Part 9: Token Swap (30 seconds)

**Say**: "Users can swap between PULSE and stablecoins using our built-in AMM."

**Action**:
1. Navigate to **Swap**
2. Show swap interface
3. Enter an amount
4. Show price quote and slippage settings

---

### Part 10: Gas Sponsorship (Coming Soon) (15 seconds)

**Say**: "We're also building a gas sponsorship service that will enable free transactions for users by leveraging Aleo's fee delegation mechanism. This is coming soon!"

**Action**: Show Settings page with "Coming Soon" badge

---

### Part 11: Wrap-Up (30 seconds)

**Say**: "To summarize, LeoPulse offers:
- Privacy-preserving polling with configurable privacy levels
- Token rewards in Credits, PULSE, or stablecoins
- Zero-knowledge proofs for anonymous voting
- Questionnaire bundles with shared rewards
- Staking for tier benefits
- All built on Aleo's privacy-first infrastructure."

**Action**: Return to landing page

---

## Backup Plans

### If testnet is slow:
- Have pre-recorded video clips ready
- Show already-created polls instead of creating new ones

### If wallet connection fails:
- Try a different wallet (Leo vs Puzzle)
- Refresh the page and retry

### If transaction fails:
- Explain this is testnet and occasional issues occur
- Show the transaction that would be submitted
- Move to next demo section

---

## Key Talking Points

1. **Privacy-first design** - Configurable privacy levels using ZK proofs
2. **On-chain transparency** - All votes are verifiable without revealing choices
3. **Multi-token flexibility** - Support for native credits, PULSE, and stablecoins
4. **Gamification** - Tiers, quests, seasons, referrals drive engagement
5. **Aleo advantage** - True privacy through zero-knowledge proofs

---

## Questions to Anticipate

**Q: How is privacy achieved?**
A: Aleo uses zero-knowledge proofs. When you vote anonymously, a cryptographic proof verifies your vote was valid without revealing what you voted for.

**Q: How do you prevent sybil attacks?**
A: Tier system with staking requirements, daily vote limits, and planned integration with on-chain identity solutions.

**Q: What's the revenue model?**
A: 2% platform fee on reward distributions, premium features for creators.

**Q: Why Aleo?**
A: Aleo is the only blockchain with native ZK proofs at the protocol level, enabling true privacy without complex workarounds.

**Q: What about mainnet?**
A: Contracts are in development for testnet, mainnet deployment planned after security audits.

**Q: Is gas sponsorship available?**
A: Coming soon! We're building a service that uses Aleo's native fee delegation.
