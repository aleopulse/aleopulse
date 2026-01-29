# Wave 1: Core Polling Foundation

## Schedule

| Phase | Dates |
|-------|-------|
| **Build Period** | January 20 - January 30, 2026 |
| **Judging Period** | January 31 - February 3, 2026 |
| **Allocation** | $5,000 USDT |

---

## Features Released This Wave

| Feature | Description |
|---------|-------------|
| Basic poll creation | Title, description, up to 4 options, duration |
| Basic voting flow | Select option and submit with wallet |
| Leo Wallet connection | Primary wallet support |
| Testnet deployment | `leopulse_poll_v2.aleo` on testnet |
| Poll listing (Dashboard) | View all polls |
| Poll details page | View poll info and vote |
| Identified privacy mode | Transparent voting (default) |

**Not Yet Released:**
- Anonymous & Semi-private modes (Wave 2)
- Reward distribution (Wave 3)
- Questionnaires (Wave 4)
- Invite-only polls (Wave 5)
- Staking & Tiers (Wave 6)
- Gamification (Wave 7)
- Token Swap (Wave 8)

---

## Plan

### Goals
Establish the foundational polling infrastructure on Aleo testnet.

### Planned Deliverables
- [x] Poll creation with title, description, options, and duration
- [x] Basic voting flow with wallet connection
- [x] Leo Wallet support
- [x] Testnet contract deployment (`leopulse_poll_v2.aleo`)
- [x] Poll listing page (Dashboard)
- [x] Poll details page
- [x] Identified privacy mode (transparent voting)

### Success Metrics
- Users can create polls ✅
- Users can vote on polls ✅
- Wallet connection works reliably ✅
- Contract deployed to testnet ✅

---

## What Was Actually Done

### Completed
- [x] **Poll Creation** - Multi-step form with title, description, options, duration
- [x] **Voting Flow** - Users can select options and submit votes
- [x] **Leo Wallet** - Integrated with `@provablehq/aleo-wallet-adaptor`
- [x] **Testnet Deployment** - `leopulse_poll_v2.aleo` deployed
- [x] **Poll Listing** - Dashboard shows all polls with filters
- [x] **Poll Details** - Full poll info, vote counts, voting interface
- [x] **Identified Mode** - Transparent voting enabled as default

### Challenges Encountered
- Leo contract compilation required careful field arithmetic
- Wallet adapter integration needed testing across browsers

### Lessons Learned
- Start with simplest privacy mode (Identified) for initial validation
- Test full transaction flow end-to-end before demo

---

## Demo

**Demo Video**: [Link to demo video]

**Live Testnet**: [Link to deployed app]

---

## Links

- [ABOUT.md](./ABOUT.md) - Full project description
- [ROADMAP.md](./ROADMAP.md) - Complete 10-wave roadmap
- [FEATURE-RELEASES.md](./FEATURE-RELEASES.md) - Feature release matrix
- **Next Wave**: [Wave 2 - Privacy UX & Verification](./wave2.md)
