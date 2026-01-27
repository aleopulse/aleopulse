# LeoPulse User Wireflow Diagram

## Overview

LeoPulse has three main user roles that interact with the platform:

| Role | Description | Primary Actions |
|------|-------------|-----------------|
| **Creator** | Poll initiators who design, fund, and manage polls | Create polls, issue invites, distribute rewards |
| **Participant** | Survey respondents who vote and earn rewards | Vote, claim rewards, track progress |
| **Donor** | Community supporters who fund existing polls | Fund polls, track impact |

---

## Main User Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LEOPULSE USER FLOWS                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────┐
                                    │  Landing │
                                    │   Page   │
                                    └────┬─────┘
                                         │
                                         ▼
                                ┌────────────────┐
                                │ Connect Wallet │
                                └───────┬────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────┐       ┌─────────────┐     ┌───────────┐
            │  CREATOR  │       │ PARTICIPANT │     │   DONOR   │
            │ Dashboard │       │  Dashboard  │     │ Dashboard │
            └─────┬─────┘       └──────┬──────┘     └─────┬─────┘
                  │                    │                  │
                  ▼                    ▼                  ▼
        ┌─────────────────┐   ┌──────────────┐   ┌──────────────┐
        │ • Create Poll   │   │ • Vote       │   │ • Fund Polls │
        │ • Manage Polls  │   │ • Claim      │   │ • Track      │
        │ • Distribute    │   │ • History    │   │   Impact     │
        │ • Analytics     │   │ • Tiers      │   │ • History    │
        └─────────────────┘   └──────────────┘   └──────────────┘
```

---

## 1. Creator Role Wireflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CREATOR WIREFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   /creator  │ ◄──────────────────────────────────────────────────────────────┐
│  Dashboard  │                                                                 │
└──────┬──────┘                                                                 │
       │                                                                        │
       ├──────────────┬─────────────────┬──────────────────┐                   │
       │              │                 │                  │                    │
       ▼              ▼                 ▼                  ▼                    │
┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐           │
│   /create   │ │   /creator   │ │   /creator   │ │    /creator    │           │
│  New Poll   │ │    /manage   │ │/distributions│ │/questionnaires │           │
└──────┬──────┘ └──────┬───────┘ └──────────────┘ └────────────────┘           │
       │               │                                                        │
       ▼               ▼                                                        │
┌──────────────────────────────────────────────────────────────────┐           │
│                    POLL CREATION WIZARD                          │           │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐              │           │
│  │ Step 1  │───►│   Step 2    │───►│   Step 3    │              │           │
│  │Basic    │    │   Voting    │    │ Incentives  │              │           │
│  │Info     │    │   Options   │    │ & Funding   │              │           │
│  │         │    │             │    │             │              │           │
│  │• Title  │    │• 2-4 Options│    │• No Reward  │              │           │
│  │• Desc   │    │• Templates: │    │• Fixed/Vote │              │           │
│  │• Category│   │  Yes/No     │    │• Equal Split│              │           │
│  │• Duration│   │  A/B/C/D    │    │• Token Type │              │           │
│  │• Privacy│    │  Rating     │    │• Amount     │              │           │
│  │• Visible│    │             │    │• Fee: 2%    │              │           │
│  └─────────┘    └─────────────┘    └──────┬──────┘              │           │
└──────────────────────────────────────────┼───────────────────────┘           │
                                           │                                    │
                                           ▼                                    │
                                   ┌───────────────┐                           │
                                   │ Deploy to     │                           │
                                   │ Aleo Network  │                           │
                                   └───────┬───────┘                           │
                                           │                                    │
                                           ▼                                    │
┌──────────────────────────────────────────────────────────────────────────────┐│
│                         POLL LIFECYCLE MANAGEMENT                            ││
│                                                                              ││
│  ┌────────┐      ┌──────────┐      ┌────────┐      ┌───────────┐           ││
│  │ ACTIVE │─────►│ CLAIMING │─────►│ CLOSED │─────►│ FINALIZED │           ││
│  └────┬───┘      └────┬─────┘      └───┬────┘      └───────────┘           ││
│       │               │                │                                    ││
│       │               │                │                                    ││
│  ┌────┴────┐     ┌────┴─────┐     ┌────┴─────┐                             ││
│  │Monitor  │     │Distribution│    │Grace     │                             ││
│  │Votes    │     │Mode:      │    │Period:   │                             ││
│  │         │     │           │    │          │                             ││
│  │• Issue  │     │• Pull:    │    │• Withdraw│                             ││
│  │  Invites│     │  Voters   │    │  Unclaimed│                            ││
│  │  (if    │     │  claim    │    │          │                             ││
│  │  private│     │           │    │• Finalize│                             ││
│  │  poll)  │     │• Push:    │    │  sends to│                             ││
│  │         │     │  Creator  │    │  treasury│                             ││
│  │         │     │  distrib. │    │          │                             ││
│  └─────────┘     └───────────┘    └──────────┘                             ││
│                                                                              ││
└──────────────────────────────────────────────────────────────────────────────┘│
                                           │                                    │
                                           └────────────────────────────────────┘
```

### Creator Sub-Flows

#### Private Poll Management
```
┌──────────────────────────────────────────────────────────┐
│              PRIVATE POLL INVITE FLOW                     │
│                                                           │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │ Create Poll │───►│ Set Visibility│───►│ Poll Created│  │
│  │ (Step 1)    │    │ = Private     │    │ (ACTIVE)    │  │
│  └─────────────┘    └──────────────┘    └──────┬──────┘  │
│                                                 │         │
│                                                 ▼         │
│                                         ┌─────────────┐  │
│                                         │ Issue       │  │
│                                         │ PollInvite  │◄─┼── Repeat for
│                                         │ Records     │  │   each invitee
│                                         └──────┬──────┘  │
│                                                │         │
│                                                ▼         │
│                           ┌────────────────────────────┐ │
│                           │ Invite contains:           │ │
│                           │ • poll_id                  │ │
│                           │ • invitee_address          │ │
│                           │ • can_vote: bool           │ │
│                           │ • expires_block            │ │
│                           └────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Participant Role Wireflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            PARTICIPANT WIREFLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐
│ /participant  │
│   Dashboard   │
└───────┬───────┘
        │
        ├────────────────┬─────────────────┬────────────────┐
        │                │                 │                │
        ▼                ▼                 ▼                ▼
┌───────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐
│ Tier Progress │ │ Claimable   │ │ Recommended │ │ Recent Votes   │
│ Card          │ │ Rewards     │ │ Polls       │ │                │
│               │ │ Section     │ │             │ │                │
│ • Current Tier│ │             │ │             │ │                │
│ • Daily Votes │ │ • Claim All │ │ • Browse    │ │ • View History │
│ • Streak      │ │ • Per-poll  │ │ • Vote      │ │ • Analytics    │
│ • Progress    │ │   claim     │ │             │ │                │
└───────────────┘ └──────┬──────┘ └──────┬──────┘ └────────────────┘
                         │               │
                         │               ▼
                         │        ┌──────────────┐
                         │        │  /poll/[id]  │
                         │        │  Poll Detail │
                         │        └──────┬───────┘
                         │               │
                         │               ▼
                         │  ┌────────────────────────────────────────────┐
                         │  │              VOTING FLOW                    │
                         │  │                                             │
                         │  │  ┌───────────┐   ┌─────────────┐           │
                         │  │  │ View Poll │──►│ Check Daily │           │
                         │  │  │ Details   │   │ Vote Limit  │           │
                         │  │  └───────────┘   └──────┬──────┘           │
                         │  │                         │                   │
                         │  │         ┌───────────────┼───────────────┐  │
                         │  │         │               │               │  │
                         │  │         ▼               ▼               ▼  │
                         │  │    ┌─────────┐    ┌─────────┐    ┌───────┐│
                         │  │    │ Limit   │    │ Limit   │    │Upgrade││
                         │  │    │ OK      │    │ Reached │    │ Tier  ││
                         │  │    └────┬────┘    └────┬────┘    └───────┘│
                         │  │         │              │                   │
                         │  │         ▼              ▼                   │
                         │  │    ┌─────────┐    ┌─────────┐             │
                         │  │    │ Select  │    │ Wait or │             │
                         │  │    │ Option  │    │ Upgrade │             │
                         │  │    └────┬────┘    └─────────┘             │
                         │  │         │                                  │
                         │  │         ▼                                  │
                         │  │    ┌──────────────────────────────┐       │
                         │  │    │ Privacy Mode Determines:     │       │
                         │  │    │ • Anonymous: Choice private  │       │
                         │  │    │ • Semi-Private: ID public    │       │
                         │  │    │ • Identified: All public     │       │
                         │  │    └───────────────┬──────────────┘       │
                         │  │                    │                       │
                         │  │                    ▼                       │
                         │  │               ┌─────────┐                  │
                         │  │               │ Submit  │                  │
                         │  │               │ Vote    │                  │
                         │  │               └────┬────┘                  │
                         │  │                    │                       │
                         │  │                    ▼                       │
                         │  │        ┌────────────────────────┐         │
                         │  │        │ Receive VoteReceipt    │         │
                         │  │        │ (ZK proof of voting)   │         │
                         │  │        └────────────────────────┘         │
                         │  └────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────────────────────┐
        │                    REWARD CLAIMING FLOW                         │
        │                                                                 │
        │    ┌─────────────────────────────────────────────────────┐     │
        │    │              Poll reaches CLAIMING status            │     │
        │    └─────────────────────────┬───────────────────────────┘     │
        │                              │                                  │
        │              ┌───────────────┴───────────────┐                 │
        │              │                               │                  │
        │              ▼                               ▼                  │
        │    ┌─────────────────┐             ┌─────────────────┐         │
        │    │   PULL MODE     │             │   PUSH MODE     │         │
        │    │   (Manual)      │             │   (Automatic)   │         │
        │    └────────┬────────┘             └────────┬────────┘         │
        │             │                               │                   │
        │             ▼                               ▼                   │
        │    ┌─────────────────┐             ┌─────────────────┐         │
        │    │ Click "Claim"   │             │ Creator triggers│         │
        │    │ on Dashboard    │             │ distribution    │         │
        │    └────────┬────────┘             └────────┬────────┘         │
        │             │                               │                   │
        │             ▼                               ▼                   │
        │    ┌─────────────────┐             ┌─────────────────┐         │
        │    │ Execute claim   │             │ Rewards sent    │         │
        │    │ transaction     │             │ automatically   │         │
        │    └────────┬────────┘             └────────┬────────┘         │
        │             │                               │                   │
        │             └───────────────┬───────────────┘                  │
        │                             │                                   │
        │                             ▼                                   │
        │                   ┌─────────────────┐                          │
        │                   │ Tokens credited │                          │
        │                   │ to wallet       │                          │
        │                   └─────────────────┘                          │
        │                                                                 │
        └────────────────────────────────────────────────────────────────┘
```

### Participant Tier System

```
┌──────────────────────────────────────────────────────────────────┐
│                      TIER PROGRESSION SYSTEM                      │
│                                                                   │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐     │
│   │ BRONZE  │───►│ SILVER  │───►│  GOLD   │───►│ PLATINUM │     │
│   │         │    │         │    │         │    │          │     │
│   │ 3 votes │    │ ? votes │    │ ? votes │    │ ? votes  │     │
│   │ /day    │    │ /day    │    │ /day    │    │ /day     │     │
│   └─────────┘    └─────────┘    └─────────┘    └──────────┘     │
│        │              │              │               │           │
│        └──────────────┴──────────────┴───────────────┘           │
│                              │                                    │
│                              ▼                                    │
│                    ┌──────────────────┐                          │
│                    │ Upgrade by       │                          │
│                    │ Staking PULSE    │                          │
│                    └──────────────────┘                          │
│                                                                   │
│   Gamification:                                                   │
│   • Daily voting streaks (flame badge)                           │
│   • XP accumulation toward next tier                             │
│   • Quest completion for bonus points                            │
│   • Seasonal leaderboards                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Donor Role Wireflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DONOR WIREFLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   /donor    │
│  Dashboard  │
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┬─────────────────┐
       │                 │                  │                 │
       ▼                 ▼                  ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Impact      │   │ Your Funded │   │ Recommended │   │ Stats       │
│ Metrics     │   │ Polls       │   │ to Fund     │   │ Overview    │
│ Card        │   │             │   │             │   │             │
│             │   │             │   │             │   │ • Total     │
│ • Partici-  │   │ • Recent 3  │   │ • Active    │   │   Funded    │
│   pants     │   │ • View All  │   │   polls     │   │ • Active    │
│   Reached   │   │             │   │ • Refresh   │   │   Funded    │
│ • Rewards   │   │             │   │             │   │ • Available │
│   Distrib.  │   │             │   │             │   │             │
│ • Complete  │   │             │   │             │   │             │
│   Rate      │   │             │   │             │   │             │
└─────────────┘   └──────┬──────┘   └──────┬──────┘   └─────────────┘
                         │                 │
                         │                 ▼
                         │          ┌─────────────┐
                         │          │/donor/explore│
                         │          │ Browse Polls │
                         │          └──────┬──────┘
                         │                 │
                         ▼                 ▼
              ┌────────────────────────────────────────────────────┐
              │                  FUNDING FLOW                       │
              │                                                     │
              │  ┌───────────────┐    ┌───────────────┐            │
              │  │ Browse Active │───►│ Search/Filter │            │
              │  │ Polls         │    │ Polls         │            │
              │  └───────────────┘    └───────┬───────┘            │
              │                               │                     │
              │                               ▼                     │
              │                       ┌───────────────┐            │
              │                       │ Select Poll   │            │
              │                       │ to Fund       │            │
              │                       └───────┬───────┘            │
              │                               │                     │
              │                               ▼                     │
              │    ┌───────────────────────────────────────────┐   │
              │    │           FUNDING DIALOG                   │   │
              │    │                                            │   │
              │    │  ┌─────────────────────────────────────┐  │   │
              │    │  │ Poll: [Title]                       │  │   │
              │    │  │ Description: [...]                  │  │   │
              │    │  │ Current Pool: 500 PULSE             │  │   │
              │    │  ├─────────────────────────────────────┤  │   │
              │    │  │ Your Contribution:                  │  │   │
              │    │  │ ┌─────────┐ ┌───────────────┐       │  │   │
              │    │  │ │  100    │ │ PULSE ▼      │       │  │   │
              │    │  │ └─────────┘ └───────────────┘       │  │   │
              │    │  ├─────────────────────────────────────┤  │   │
              │    │  │ New Pool Total: 600 PULSE           │  │   │
              │    │  │                                     │  │   │
              │    │  │        [ Cancel ]  [ Fund ]         │  │   │
              │    │  └─────────────────────────────────────┘  │   │
              │    │                                            │   │
              │    └────────────────────┬───────────────────────┘   │
              │                         │                           │
              │                         ▼                           │
              │                 ┌───────────────┐                  │
              │                 │ Execute       │                  │
              │                 │ Transaction   │                  │
              │                 └───────┬───────┘                  │
              │                         │                           │
              │                         ▼                           │
              │                 ┌───────────────┐                  │
              │                 │ Update Impact │                  │
              │                 │ Metrics       │                  │
              │                 └───────────────┘                  │
              │                                                     │
              └────────────────────────────────────────────────────┘


                         ┌─────────────────┐
                         │  /donor/funded  │
                         │  Funded Polls   │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ View all funded polls:     │
                    │ • Poll title & status      │
                    │ • Your contribution amount │
                    │ • Current participation    │
                    │ • Reward distribution %    │
                    └────────────────────────────┘


                         ┌─────────────────┐
                         │ /donor/history  │
                         │ Funding History │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ Transaction history:       │
                    │ • Date & time              │
                    │ • Poll funded              │
                    │ • Amount & token           │
                    │ • Transaction hash         │
                    └────────────────────────────┘
```

---

## Cross-Role Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CROSS-ROLE INTERACTIONS                                  │
└─────────────────────────────────────────────────────────────────────────────────┘


                              ┌───────────────┐
                              │   PLATFORM    │
                              │   TREASURY    │
                              └───────┬───────┘
                                      │
                    2% fee ◄──────────┤
                    on creation       │
                                      │
                                      │ Unclaimed rewards
                                      │ after finalization
                                      ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                                                                          │
   │                            ┌─────────────┐                              │
   │           ┌───────────────►│    POLL     │◄───────────────┐             │
   │           │                │             │                │             │
   │           │                │ ┌─────────┐ │                │             │
   │           │                │ │ Reward  │ │                │             │
   │           │                │ │  Pool   │ │                │             │
   │           │                │ └─────────┘ │                │             │
   │           │                │             │                │             │
   │           │                └──────┬──────┘                │             │
   │           │                       │                       │             │
   │           │                       │                       │             │
   │    Creates │                      │ Votes                 │ Funds       │
   │    & Funds │                      │                       │             │
   │           │                       │                       │             │
   │           │                       ▼                       │             │
   │   ┌───────┴───────┐        ┌─────────────┐        ┌──────┴──────┐      │
   │   │               │        │             │        │             │      │
   │   │    CREATOR    │        │ PARTICIPANT │        │    DONOR    │      │
   │   │               │        │             │        │             │      │
   │   └───────┬───────┘        └──────┬──────┘        └─────────────┘      │
   │           │                       │                                     │
   │           │                       │                                     │
   │           │   Issues PollInvite   │                                     │
   │           │   (Private Polls)     │                                     │
   │           └───────────────────────┘                                     │
   │                                                                          │
   │           ┌───────────────────────┐                                     │
   │           │                       │                                     │
   │           │   Distributes Rewards │                                     │
   │           │   (Push Mode)         │                                     │
   │           │         OR            │                                     │
   │           │   Participants Claim  │                                     │
   │           │   (Pull Mode)         │                                     │
   │           ▼                       │                                     │
   │   ┌───────────────┐        ┌──────┴──────┐                             │
   │   │               │        │             │                              │
   │   │    CREATOR    │───────►│ PARTICIPANT │                              │
   │   │               │        │             │                              │
   │   └───────────────┘        └─────────────┘                              │
   │                                                                          │
   └──────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│                      DATA FLOW LEGEND                             │
│                                                                   │
│   ────────►  Token/Fund flow                                     │
│   - - - - ► Record/Data flow                                     │
│   ════════► Action trigger                                       │
│                                                                   │
│   Key Records (Private ZK State):                                │
│   • VoteReceipt - Proves participation                           │
│   • RewardTicket - Claim rewards                                 │
│   • PollTicket - Poll ownership                                  │
│   • PollInvite - Access to private poll                          │
│                                                                   │
│   Key Mappings (Public State):                                   │
│   • polls - Poll metadata                                        │
│   • vote_counts - Aggregate results                              │
│   • has_voted - Double-vote prevention                           │
│   • private_polls - Invite-only tracking                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Poll Lifecycle State Machine

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           POLL STATE MACHINE                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    Creator calls
                                    create_poll()
                                         │
                                         ▼
                              ┌────────────────────┐
                              │                    │
                              │       ACTIVE       │◄────────────────────────┐
                              │                    │                          │
                              └──────────┬─────────┘                          │
                                         │                                    │
                    ┌────────────────────┼────────────────────┐              │
                    │                    │                    │              │
                    ▼                    ▼                    ▼              │
             ┌─────────────┐    ┌───────────────┐    ┌─────────────┐        │
             │ Participants│    │ Donors fund   │    │ Creator     │        │
             │ vote        │    │ poll          │    │ issues      │        │
             │             │    │               │    │ invites     │        │
             └─────────────┘    └───────────────┘    └─────────────┘        │
                                                                             │
                                         │                                   │
                                         │ Creator calls                     │
                                         │ start_claims()                    │
                                         │ + sets distribution mode          │
                                         ▼                                   │
                              ┌────────────────────┐                         │
                              │                    │                         │
                              │     CLAIMING       │                         │
                              │                    │                         │
                              └──────────┬─────────┘                         │
                                         │                                   │
                    ┌────────────────────┼────────────────────┐             │
                    │                    │                    │             │
                    ▼                    ▼                    ▼             │
             ┌─────────────┐    ┌───────────────┐    ┌─────────────┐       │
             │ PULL MODE:  │    │               │    │ PUSH MODE:  │       │
             │ Participants│    │               │    │ Creator     │       │
             │ call        │    │               │    │ calls       │       │
             │ claim_reward│    │               │    │ distribute_ │       │
             │             │    │               │    │ rewards()   │       │
             └─────────────┘    │               │    └─────────────┘       │
                               │               │                           │
                               │ Creator calls │                           │
                               │ close_poll()  │                           │
                               ▼               │                           │
                    ┌────────────────────┐     │                           │
                    │                    │     │                           │
                    │      CLOSED        │     │                           │
                    │   (Grace Period)   │◄────┘                           │
                    │                    │                                  │
                    └──────────┬─────────┘                                  │
                               │                                            │
                    ┌──────────┼──────────┐                                │
                    │          │          │                                 │
                    ▼          │          ▼                                 │
             ┌─────────────┐   │   ┌─────────────┐                         │
             │ Creator     │   │   │ Grace       │                         │
             │ withdraws   │   │   │ period      │                         │
             │ unclaimed   │   │   │ expires     │                         │
             └─────────────┘   │   └─────────────┘                         │
                               │                                            │
                               │ Creator calls                              │
                               │ finalize_poll()                            │
                               ▼                                            │
                    ┌────────────────────┐                                  │
                    │                    │                                  │
                    │    FINALIZED       │                                  │
                    │                    │                                  │
                    │ • Unclaimed funds  │                                  │
                    │   sent to treasury │                                  │
                    │ • Poll locked      │                                  │
                    │ • No more actions  │                                  │
                    │                    │                                  │
                    └────────────────────┘                                  │

```

---

## Privacy Mode Comparison

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRIVACY MODES                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│                 │   ANONYMOUS     │  SEMI-PRIVATE   │   IDENTIFIED    │
│                 │     (0)         │      (1)        │      (2)        │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ Voter Identity  │    PRIVATE      │    PUBLIC       │    PUBLIC       │
│                 │    (hidden)     │   (visible)     │   (visible)     │
│                 │                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ Vote Choice     │    PRIVATE      │    PRIVATE      │    PUBLIC       │
│                 │  (ZK record)    │  (ZK record)    │  (on-chain)     │
│                 │                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ Aggregate       │    PUBLIC       │    PUBLIC       │    PUBLIC       │
│ Results         │   (visible)     │   (visible)     │   (visible)     │
│                 │                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ Use Case        │ Sensitive       │ Accountability  │ Full            │
│                 │ surveys,        │ with choice     │ transparency,   │
│                 │ elections       │ privacy         │ governance      │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VISIBILITY MODES                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────────────────────────┐
│         PUBLIC (0)              │           PRIVATE (1)                          │
├─────────────────────────────────┼───────────────────────────────────────────────┤
│                                 │                                                │
│ • Anyone can discover poll      │ • Poll hidden from public browse              │
│ • Anyone can vote               │ • Requires PollInvite record to vote          │
│ • Results visible to all        │ • Creator issues invites to specific users    │
│ • Suitable for public surveys   │ • Suitable for exclusive/targeted research    │
│                                 │                                                │
└─────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## Navigation Sitemap

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SITE MAP                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

/
├── /dashboard              # Role switcher (Creator | Participant | Donor)
│
├── /create                 # Create new poll (3-step wizard)
│
├── /poll/[id]              # Poll detail & voting page
│
├── /creator                # Creator Dashboard
│   ├── /creator/manage     # Manage all polls
│   ├── /creator/manage/[id]# Individual poll management
│   ├── /creator/distributions  # Reward distributions
│   └── /creator/questionnaires # Questionnaire management
│
├── /participant            # Participant Dashboard
│   ├── /participant/history    # Voting history
│   ├── /participant/rewards    # Rewards tracking
│   └── /participant/referrals  # Referral management
│
├── /donor                  # Donor Dashboard
│   ├── /donor/explore      # Browse & fund polls
│   ├── /donor/funded       # View funded polls
│   └── /donor/history      # Funding transaction history
│
└── /explore                # Public poll exploration
```

---

## Quick Reference: Role Capabilities

| Capability | Creator | Participant | Donor |
|------------|:-------:|:-----------:|:-----:|
| Create polls | ✓ | - | - |
| Fund at creation | ✓ | - | - |
| Fund existing polls | - | - | ✓ |
| Issue invites | ✓ | - | - |
| Vote on polls | - | ✓ | - |
| Claim rewards | - | ✓ | - |
| Distribute rewards | ✓ | - | - |
| View analytics | ✓ | ✓ | ✓ |
| Track impact | ✓ | - | ✓ |
| Tier progression | - | ✓ | - |
| Manage lifecycle | ✓ | - | - |
