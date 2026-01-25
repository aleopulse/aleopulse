# LeoPulse User Manual

Welcome to LeoPulse - a privacy-preserving polling and rewards platform on Aleo.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Connecting Your Wallet](#connecting-your-wallet)
3. [For Participants](#for-participants)
4. [For Creators](#for-creators)
5. [Token Management](#token-management)
6. [Staking](#staking)
7. [Referral Program](#referral-program)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is LeoPulse?

LeoPulse is a Web3 platform where you can:
- **Vote on polls** privately or publicly, and earn token rewards
- **Choose your privacy level** - anonymous, semi-private, or identified voting
- **Create polls** to gather opinions from the community
- **Stake PULSE** tokens to unlock higher tiers and more daily votes
- **Refer friends** and earn rewards when they participate
- **Complete questionnaires** (bundled surveys) for bonus rewards

### Why Aleo?

LeoPulse is built on Aleo, which uses zero-knowledge proofs to enable:
- **Private voting** - your vote choice can be hidden while still being verifiable
- **Selective disclosure** - poll creators can choose privacy levels
- **Cryptographic guarantees** - all votes are verified without revealing private data

### Supported Networks

| Network | Status | Use Case |
|---------|--------|----------|
| Aleo Testnet | Active | Testing and development |
| Aleo Mainnet | Coming Soon | Production use |

---

## Connecting Your Wallet

### Supported Wallets

LeoPulse supports Aleo browser extension wallets:

| Wallet | Status | Notes |
|--------|--------|-------|
| **Leo Wallet** | Recommended | Most popular Aleo wallet |
| **Puzzle Wallet** | Supported | Alternative option |

### How to Connect

1. Install a supported wallet extension (e.g., Leo Wallet from Chrome Web Store)
2. Create or import an Aleo account
3. Visit LeoPulse and click **"Connect Wallet"**
4. Select your wallet from the list
5. Approve the connection in your wallet popup
6. You're connected!

### Getting Testnet Credits

On testnet, you need Aleo Credits for transaction fees:

1. Visit the [Aleo Faucet](https://faucet.aleo.org)
2. Enter your wallet address
3. Complete the captcha
4. Receive testnet credits

### Switching Networks

1. Click on your wallet address (top-right)
2. Select **"Settings"**
3. Choose between Testnet and Mainnet

---

## For Participants

### Browsing Polls

1. Navigate to **"Projects"** from the main menu
2. Browse active polls by category
3. Look for the privacy badge on each poll:
   - **Anonymous**: Your vote choice is private
   - **Semi-Private**: Your identity is public, choice is private
   - **Identified**: Both identity and choice are public
4. Click on any poll to view details

### Voting on a Poll

1. Open a poll you want to vote on
2. Read the question and options carefully
3. Note the privacy mode (shown on the poll)
4. Select your preferred option
5. Click **"Vote"**
6. Confirm the transaction in your wallet
7. Your vote is recorded on-chain with a ZK proof!
8. You'll receive a private **VoteReceipt** record

**Note**: For anonymous polls, your vote choice is stored only in your private record - not visible on-chain.

### Daily Vote Limits

Your tier determines how many polls you can vote on per day:

| Tier | PULSE Required | Daily Votes |
|------|----------------|-------------|
| Bronze | 0 | 3 |
| Silver | 1,000 | 6 |
| Gold | 10,000 | 9 |
| Platinum | 100,000 | 12 |

**Tip:** Stake PULSE tokens to increase your tier!

### Claiming Rewards

After a poll closes and rewards are distributed:

1. Go to **"Participant"** > **"Rewards"**
2. View your pending rewards
3. Click **"Claim"** next to each reward
4. Provide your VoteReceipt (proves you voted)
5. Confirm the transaction
6. Tokens are sent to your wallet

### Completing Questionnaires

Questionnaires are bundled surveys with bonus rewards:

1. Go to **"Questionnaires"** from the menu
2. Select an active questionnaire
3. Answer all polls in sequence
4. Submit all answers in a single transaction (efficient!)
5. Claim your shared pool reward after completion

### Viewing Your History

1. Go to **"Participant"** > **"History"**
2. See all your past votes (via your VoteReceipt records)
3. Track rewards earned
4. View voting streaks

### Quests and Seasons

Earn bonus points by completing quests:

1. Go to **"Participant"** > **"Quests"**
2. View available daily, weekly, and special quests
3. Complete quest objectives (e.g., "Vote 3 times today")
4. Claim quest points
5. Compete on the seasonal leaderboard

---

## For Creators

### Creating a Poll

1. Go to **"Creator"** > **"Create Poll"**
2. Fill in the poll details:
   - **Title**: Clear, concise question
   - **Description**: Additional context
   - **Options**: 2-10 voting options
   - **Category**: Select the best fit
   - **Duration**: How long the poll stays open
3. **Choose Privacy Mode**:
   - **Anonymous**: Vote choices hidden, voter identity hidden
   - **Semi-Private**: Vote choices hidden, voter identity public
   - **Identified**: Both visible (for governance)
4. Configure rewards:
   - **Reward Token**: Aleo Credits, PULSE, or stablecoin
   - **Reward Type**: Fixed per vote OR equal split
   - **Total Reward Pool**: Amount to distribute
5. Review the platform fee (2%)
6. Click **"Create Poll"**
7. Confirm the funding transaction
8. Your poll is live!

### Creating a Questionnaire

Bundle multiple polls into a survey:

1. Go to **"Creator"** > **"Create Questionnaire"**
2. Set questionnaire details:
   - Title and description
   - Category
   - Reward configuration (fixed or shared pool)
3. Add polls:
   - Create new polls inline, OR
   - Select existing polls
4. Arrange poll order (drag and drop)
5. Set the total reward pool
6. Publish your questionnaire

### Managing Your Polls

1. Go to **"Creator"** > **"Manage"**
2. View all your polls with status:
   - **Active**: Currently accepting votes
   - **Closed**: Voting ended
   - **Finalized**: Rewards distributed
3. Actions available:
   - **View Results**: See vote breakdown
   - **Close Poll**: End voting early
   - **Distribute Rewards**: Send rewards to voters

### Distributing Rewards

Two distribution methods:

**Manual Push (Creator Distributes):**
1. Go to your poll's management page
2. Click **"Distribute Rewards"**
3. Confirm the transaction
4. All eligible voters receive rewards

**Manual Pull (Voters Claim):**
1. Voters claim their own rewards using VoteReceipt
2. No action needed from creator

### Organizing with Projects

Group your polls and questionnaires:

1. Go to **"Creator"** > **"Projects"**
2. Click **"Create Project"**
3. Name your project and set a color
4. Add polls and questionnaires to the project
5. Invite collaborators with different roles:
   - **Admin**: Full management access
   - **Editor**: Create and edit content
   - **Viewer**: View-only access
6. View analytics and AI-powered insights

---

## Token Management

### Viewing Balances

1. Click your wallet address (top-right)
2. Select **"Wallet"**
3. View balances for:
   - **Credits**: Native Aleo gas token
   - **PULSE**: Platform token
   - **Stablecoins**: USD-pegged tokens

### Getting Testnet Tokens

**Credits (for gas):**
- Use the [Aleo Faucet](https://faucet.aleo.org)

**PULSE (for participation):**
1. Go to **"Wallet"** page
2. Click **"Get PULSE"** or **"Faucet"**
3. Receive 1,000 PULSE (testnet only)

### Swapping Tokens

Exchange PULSE for stablecoins (and vice versa):

1. Go to **"Swap"** from the menu
2. Select input token (e.g., PULSE)
3. Select output token (e.g., stablecoin)
4. Enter the amount
5. Review the exchange rate and slippage
6. Click **"Swap"**
7. Confirm the transaction

---

## Staking

Stake PULSE to unlock higher tiers and more daily votes.

### How to Stake

1. Go to **"Staking"** from the menu
2. Enter the amount of PULSE to stake
3. Select a lock period:
   - 7 days
   - 14 days
   - 30 days
   - 90 days
   - 180 days
   - 365 days
4. Click **"Stake"**
5. Confirm the transaction
6. You'll receive a **StakeReceipt** record

### Viewing Your Stakes

1. Go to **"Staking"**
2. View all active stake positions
3. See lock expiry dates (block heights)
4. Check total staked amount

### Unstaking

1. Go to **"Staking"**
2. Find expired stake positions
3. Click **"Unstake"** on individual positions, OR
4. Click **"Unstake All"** to withdraw all expired stakes
5. Provide your StakeReceipt
6. Confirm the transaction
7. PULSE returns to your wallet

**Note:** You cannot unstake before the lock period ends.

---

## Referral Program

Earn rewards by inviting friends to LeoPulse.

### Getting Your Referral Code

1. Go to **"Participant"** > **"Referrals"**
2. Your unique code is displayed (e.g., `abc123`)
3. Copy your referral link: `https://leopulse.xyz?ref=abc123`

### Sharing Your Link

Share your link via:
- Social media (Twitter, Discord, Telegram)
- Direct messages
- Community forums

### Earning Rewards

When your referees reach milestones, you earn points:

| Milestone | Requirement | Points |
|-----------|-------------|--------|
| First Vote | Referee makes 1 vote | 10 |
| Active Voter | Referee makes 10 votes | 50 |
| Power Voter | Referee makes 50 votes | 200 |
| Completion | Referee makes 100 votes | 500 |

### Referral Tiers

Your tier increases with more active referrals:

| Tier | Active Referrals | Point Multiplier |
|------|------------------|------------------|
| Bronze | 0-4 | 1x |
| Silver | 5-14 | 1.5x |
| Gold | 15-29 | 2x |
| Platinum | 30+ | 3x |

### Tracking Progress

1. Go to **"Participant"** > **"Referrals"**
2. View total referrals and active referrals
3. See milestone progress for each referee
4. Check your position on the referral leaderboard

---

## Troubleshooting

### Transaction Failed

**Possible causes:**
- Insufficient credits (gas)
- Network congestion
- Contract error

**Solutions:**
1. Ensure you have enough credits for fees
2. Wait a few minutes and retry
3. Refresh the page and try again

### Wallet Won't Connect

**Solutions:**
1. Refresh the page
2. Check if wallet extension is enabled
3. Try a different browser
4. Clear browser cache
5. Make sure you're on the correct network (testnet/mainnet)

### Rewards Not Showing

**Possible causes:**
- Poll hasn't closed yet
- Rewards not distributed by creator
- Already claimed

**Solutions:**
1. Check poll status (must be "Closed" or "Finalized")
2. Contact the poll creator
3. Check your VoteReceipt records

### Daily Votes Used Up

**Solutions:**
1. Wait until tomorrow (resets at midnight UTC)
2. Stake more PULSE to increase your tier
3. Maintain a voting streak for bonus votes

### Gas Sponsorship

**Note:** Gas sponsorship is **Coming Soon!**

Once available, the gas sponsorship service will use Aleo's native fee delegation to cover transaction fees for users, enabling free transactions.

---

## Glossary

| Term | Definition |
|------|------------|
| **Credits** | Native gas token on Aleo Network |
| **PULSE** | LeoPulse platform token |
| **Poll** | A single voting question with options |
| **Privacy Mode** | Anonymous, Semi-Private, or Identified voting |
| **VoteReceipt** | Private record proving you voted |
| **ZK Proof** | Zero-knowledge proof verifying your vote |
| **Questionnaire** | A bundle of polls as a survey |
| **Project** | A collection of polls/questionnaires |
| **Tier** | Your rank based on PULSE holdings/stakes |
| **Streak** | Consecutive days of voting |
| **Quest** | A challenge with point rewards |
| **Season** | A time-bounded competition period |
| **Record** | Private data owned by your wallet |
| **Mapping** | Public data stored on-chain |

---

## Support

- **Discord**: Join our community for help
- **GitHub Issues**: Report bugs or feature requests
- **Documentation**: See /docs folder

---

*LeoPulse - Where Every Opinion Counts, Earns, and Stays Private*
