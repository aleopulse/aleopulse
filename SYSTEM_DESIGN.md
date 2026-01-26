# LeoPulse System Design

**Enhanced Architecture for Latent Demand Segments**

---

## Executive Summary

This document outlines system enhancements to LeoPulse based on identified latent demand across 8 market segments. The design extends the current poll/questionnaire/rewards system with new modules while maintaining backward compatibility.

**Design Principles:**
1. **Segment-first features** - Each enhancement maps to a specific demand segment
2. **Composable modules** - Features can be mixed/matched per use case
3. **Privacy by default** - ZK capabilities remain the core differentiator
4. **Progressive complexity** - Simple for B2C, powerful for enterprise

---

## Current System Summary

### Existing Roles

| Role | Capabilities |
|------|--------------|
| **Creator** | Create polls, questionnaires, seasons, quests, projects; manage rewards |
| **Participant** | Vote, complete questionnaires, earn rewards, build streaks |
| **Donor** | Fund polls with tokens |
| **Collaborator** | Project-level RBAC (Owner/Admin/Editor/Viewer) |

### Existing Features

| Feature | Status |
|---------|--------|
| Privacy modes (Anonymous/Semi-Private/Identified) | ✅ |
| Visibility modes (Public/Private-Invite) | ✅ |
| Multi-token rewards (MOVE/PULSE/USDC) | ✅ |
| Questionnaires (survey bundles) | ✅ |
| Tier system with staking | ✅ |
| Seasons & Quests | ✅ |
| Projects & Collaboration | ✅ |
| Referral system | ✅ |

---

## Enhanced System Architecture

### New Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATFORM ROLES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   CREATOR   │  │ PARTICIPANT │  │    DONOR    │             │
│  │  (existing) │  │  (existing) │  │  (existing) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     NEW SEGMENT-SPECIFIC ROLES                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ DAO_ADMIN   │  │ RESEARCHER  │  │  HR_ADMIN   │             │
│  │             │  │             │  │             │             │
│  │ - Proposals │  │ - Studies   │  │ - Org units │             │
│  │ - Quorum    │  │ - Protocols │  │ - Campaigns │             │
│  │ - Delegates │  │ - IRB docs  │  │ - Reports   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  REPORTER   │  │   PANELIST  │  │ INTEGRATOR  │             │
│  │             │  │             │  │             │             │
│  │ - Anonymous │  │ - Profile   │  │ - API keys  │             │
│  │ - Evidence  │  │ - Verified  │  │ - Webhooks  │             │
│  │ - Follow-up │  │ - Rated     │  │ - SDK       │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module 1: DAO Governance Module

**Target Segment:** DAO Governance Communities

### New Entities

```typescript
// Database Schema Extensions

// DAO Space - Container for DAO governance
interface DAOSpace {
  id: number;
  slug: string;                    // "uniswap", "aave"
  name: string;
  description: string;
  logoUrl: string;

  // Governance settings
  votingTokenAddress: string;      // Token for voting power
  votingTokenNetwork: string;      // "aleo" | "ethereum" | etc
  quorumType: "fixed" | "percentage";
  quorumValue: number;             // Fixed amount or percentage
  votingPeriodBlocks: number;      // Default voting duration

  // Delegation settings
  delegationEnabled: boolean;
  delegationDepth: number;         // Max delegation chain (1-3)

  // Permissions
  proposalThreshold: bigint;       // Min tokens to propose
  votingThreshold: bigint;         // Min tokens to vote

  // Privacy defaults
  defaultPrivacyMode: number;      // 0=Anonymous, 1=Semi, 2=Identified
  allowPrivacyOverride: boolean;   // Per-proposal override

  creatorAddress: string;
  createdAt: Date;
  status: "active" | "archived";
}

// Proposal - Enhanced poll for governance
interface Proposal {
  id: number;
  spaceId: number;
  onChainPollId: number;           // Links to existing poll

  // Proposal metadata
  proposalNumber: number;          // Sequential within space
  title: string;
  description: string;             // Markdown supported
  discussionUrl: string;           // Forum/Discord link

  // Proposal type
  proposalType: "simple" | "executable" | "signal";
  executionPayload?: string;       // For executable proposals

  // Lifecycle
  status: "draft" | "pending" | "active" | "passed" | "rejected" | "executed" | "cancelled";
  createdAt: Date;
  startBlock: number;
  endBlock: number;
  executedAt?: Date;

  // Results
  quorumReached: boolean;
  finalVotesFor: bigint;
  finalVotesAgainst: bigint;
  finalVotesAbstain: bigint;

  // Creator
  proposerAddress: string;
}

// Delegation - Vote power delegation
interface Delegation {
  id: number;
  spaceId: number;

  delegatorAddress: string;        // Who is delegating
  delegateAddress: string;         // Who receives delegation

  // Delegation scope
  scope: "full" | "category" | "proposal";
  categoryIds?: number[];          // If scope=category
  proposalId?: number;             // If scope=proposal

  // Amount
  delegationType: "full" | "partial";
  delegatedAmount?: bigint;        // If partial

  // Validity
  validFrom: Date;
  validUntil?: Date;               // null = indefinite
  revokedAt?: Date;

  createdAt: Date;
}

// Voting Power Snapshot
interface VotingPowerSnapshot {
  id: number;
  spaceId: number;
  proposalId: number;
  voterAddress: string;

  // Power breakdown
  tokenBalance: bigint;            // Direct holdings
  stakedBalance: bigint;           // Staked tokens
  delegatedPower: bigint;          // Received delegations
  totalVotingPower: bigint;        // Sum

  snapshotBlock: number;
  snapshotAt: Date;
}
```

### New Smart Contract Functions

```leo
// Add to poll contract or new governance.aleo

// Weighted voting (by token balance)
transition vote_weighted(
    poll_id: u64,
    option_index: u8,
    voting_power: u64,
    power_proof: field          // ZK proof of token ownership
) -> VoteReceipt {
    // Verify voting power proof
    // Record weighted vote
    // Return receipt
}

// Delegated voting
transition vote_as_delegate(
    poll_id: u64,
    option_index: u8,
    delegation_proof: field,    // ZK proof of valid delegation
    delegated_power: u64
) -> VoteReceipt {
    // Verify delegation is valid
    // Cast vote with delegated power
    // Return receipt
}
```

### API Endpoints

```
# DAO Space Management
POST   /api/dao/spaces                    - Create DAO space
GET    /api/dao/spaces                    - List all spaces
GET    /api/dao/spaces/:slug              - Get space details
PUT    /api/dao/spaces/:slug              - Update space
GET    /api/dao/spaces/:slug/members      - Get members & voting power

# Proposals
POST   /api/dao/spaces/:slug/proposals    - Create proposal
GET    /api/dao/spaces/:slug/proposals    - List proposals
GET    /api/dao/proposals/:id             - Get proposal details
PUT    /api/dao/proposals/:id/status      - Update status
POST   /api/dao/proposals/:id/execute     - Execute passed proposal

# Delegation
POST   /api/dao/spaces/:slug/delegations  - Create delegation
GET    /api/dao/delegations/:address      - Get user's delegations
DELETE /api/dao/delegations/:id           - Revoke delegation
GET    /api/dao/spaces/:slug/delegates    - Get top delegates

# Voting Power
GET    /api/dao/spaces/:slug/power/:address  - Get voting power
POST   /api/dao/proposals/:id/snapshot       - Create power snapshot
```

---

## Module 2: Research Panel Module

**Target Segments:** Market Research, Academic Researchers

### New Entities

```typescript
// Research Study - Container for research projects
interface ResearchStudy {
  id: number;
  creatorAddress: string;

  // Study metadata
  title: string;
  description: string;
  studyType: "market_research" | "academic" | "product_feedback" | "political";

  // Compliance
  irbApproved: boolean;
  irbNumber?: string;
  irbExpiryDate?: Date;
  consentFormUrl?: string;
  dataRetentionDays: number;       // Auto-delete after N days

  // Participant requirements
  minAge?: number;
  maxAge?: number;
  requiredCountries?: string[];    // ISO codes
  requiredLanguages?: string[];
  customScreeningQuestions?: JSON;

  // Incentive structure
  compensationType: "per_completion" | "lottery" | "tiered";
  compensationAmount: bigint;
  compensationToken: string;
  maxParticipants: number;

  // Status
  status: "draft" | "recruiting" | "active" | "analyzing" | "completed" | "archived";
  createdAt: Date;
  publishedAt?: Date;
  completedAt?: Date;
}

// Research Panel - Verified participant pool
interface PanelMember {
  id: number;
  walletAddress: string;

  // Verified demographics (encrypted/hashed)
  ageRangeVerified: boolean;
  countryVerified: boolean;
  languagesVerified: boolean;

  // Verification proofs (ZK)
  ageRangeProof?: string;          // ZK proof of age range
  countryProof?: string;           // ZK proof of residence

  // Panel stats
  studiesCompleted: number;
  studiesDisqualified: number;
  averageCompletionTime: number;   // seconds
  qualityScore: number;            // 0-100

  // Reputation
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod?: string;     // "zpass" | "worldcoin" | "manual"

  joinedAt: Date;
  lastActiveAt: Date;
  status: "active" | "suspended" | "banned";
}

// Study Participation
interface StudyParticipation {
  id: number;
  studyId: number;
  walletAddress: string;

  // Screening
  screeningPassed: boolean;
  screeningAnswers?: JSON;

  // Progress
  startedAt: Date;
  completedAt?: Date;
  timeSpentSeconds: number;

  // Quality metrics
  attentionChecksPassed: number;
  attentionChecksFailed: number;
  responseConsistency: number;     // 0-100

  // Compensation
  compensationEarned: bigint;
  compensationClaimed: boolean;
  claimTxHash?: string;

  status: "screening" | "in_progress" | "completed" | "disqualified" | "abandoned";
}

// Attention Check - Quality assurance
interface AttentionCheck {
  id: number;
  studyId: number;
  pollId: number;                  // Embedded in which poll

  checkType: "trap_question" | "time_check" | "consistency" | "captcha";
  expectedAnswer?: number;         // For trap questions
  minTimeSeconds?: number;         // For time checks

  position: number;                // Order in study
}
```

### Quality Assurance Features

```typescript
// Fraud Detection System
interface FraudSignal {
  walletAddress: string;
  signalType:
    | "speed_completion"           // Too fast
    | "straight_lining"            // Same answer for all
    | "inconsistent_responses"     // Contradictory answers
    | "attention_check_fail"       // Failed trap question
    | "suspicious_pattern"         // ML-detected
    | "duplicate_device";          // Device fingerprint match

  severity: "low" | "medium" | "high";
  details: JSON;
  detectedAt: Date;
}

// Response Validation Rules
interface ValidationRule {
  studyId: number;
  ruleType:
    | "min_time_per_question"
    | "max_time_per_question"
    | "consistency_check"
    | "open_text_quality"
    | "attention_check";

  parameters: JSON;
  action: "flag" | "warn" | "disqualify";
}
```

### API Endpoints

```
# Study Management
POST   /api/research/studies              - Create study
GET    /api/research/studies              - List studies
GET    /api/research/studies/:id          - Get study details
PUT    /api/research/studies/:id          - Update study
POST   /api/research/studies/:id/publish  - Publish for recruitment
POST   /api/research/studies/:id/close    - Close recruitment

# Panel Management
GET    /api/research/panel                - Get panel members
POST   /api/research/panel/invite         - Invite to panel
GET    /api/research/panel/:address       - Get member profile
PUT    /api/research/panel/:address       - Update member
POST   /api/research/panel/verify         - Submit verification

# Participation
POST   /api/research/studies/:id/screen   - Screen participant
POST   /api/research/studies/:id/start    - Start participation
PUT    /api/research/studies/:id/progress - Update progress
POST   /api/research/studies/:id/complete - Complete study
GET    /api/research/studies/:id/results  - Get anonymized results

# Quality & Fraud
GET    /api/research/studies/:id/quality  - Get quality metrics
GET    /api/research/fraud/:address       - Get fraud signals
POST   /api/research/fraud/report         - Report suspicious activity
```

---

## Module 3: Enterprise HR Module

**Target Segment:** Enterprise Employee Feedback

### New Entities

```typescript
// Organization - Enterprise container
interface Organization {
  id: number;
  name: string;
  slug: string;

  // Branding
  logoUrl?: string;
  primaryColor?: string;

  // Settings
  defaultAnonymityLevel: "full" | "department" | "team";
  minimumGroupSize: number;        // Min respondents for results (default: 5)
  dataRetentionMonths: number;

  // Compliance
  gdprEnabled: boolean;
  hipaaEnabled: boolean;
  soc2Enabled: boolean;

  // Admin
  ownerAddress: string;
  createdAt: Date;
  status: "active" | "suspended";

  // Billing (future)
  plan: "free" | "pro" | "enterprise";
  billingEmail?: string;
}

// Organization Unit - Departments, teams, etc.
interface OrgUnit {
  id: number;
  orgId: number;
  parentUnitId?: number;           // For hierarchy

  name: string;
  unitType: "company" | "division" | "department" | "team" | "location";

  // For minimum group size enforcement
  memberCount: number;

  createdAt: Date;
  status: "active" | "archived";
}

// Employee (anonymized)
interface OrgMember {
  id: number;
  orgId: number;

  // Identity (hashed for privacy)
  walletAddress: string;
  employeeIdHash?: string;         // Hash of employee ID
  emailHash?: string;              // Hash of work email

  // Unit assignments
  unitIds: number[];               // Can belong to multiple

  // Verification
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod: "email_domain" | "sso" | "invite_code" | "manual";

  // Participation
  surveysCompleted: number;
  lastResponseAt?: Date;

  joinedAt: Date;
  status: "active" | "inactive" | "removed";
}

// Feedback Campaign - Time-bound survey initiative
interface FeedbackCampaign {
  id: number;
  orgId: number;

  // Campaign details
  name: string;
  description: string;
  campaignType:
    | "engagement"                 // Regular engagement survey
    | "pulse"                      // Quick pulse check
    | "onboarding"                 // New hire feedback
    | "exit"                       // Exit interview
    | "360"                        // 360-degree feedback
    | "dei"                        // DEI survey
    | "custom";

  // Targeting
  targetUnitIds?: number[];        // null = entire org
  targetRoles?: string[];
  excludeUnitIds?: number[];

  // Timing
  startDate: Date;
  endDate: Date;
  reminderSchedule?: JSON;         // {"days_before_end": [7, 3, 1]}

  // Privacy
  anonymityLevel: "full" | "department" | "team";
  minimumResponses: number;        // Hide results until N responses

  // Content
  questionnaireId: number;         // Links to questionnaire

  // Results
  responseCount: number;
  responseRate: number;            // Percentage

  createdBy: string;
  createdAt: Date;
  status: "draft" | "scheduled" | "active" | "completed" | "archived";
}

// Anonymous Response Aggregation
interface AggregatedResult {
  campaignId: number;
  unitId?: number;                 // null = org-wide
  questionId: number;

  // Aggregated metrics (only shown if >= minimumGroupSize)
  responseCount: number;

  // For rating questions
  averageRating?: number;
  ratingDistribution?: JSON;       // {"1": 5, "2": 10, ...}

  // For choice questions
  choiceDistribution?: JSON;       // {"option_1": 25, "option_2": 30}

  // For text questions
  themes?: string[];               // AI-extracted themes
  sentimentScore?: number;         // -1 to 1

  // Comparison
  previousPeriodChange?: number;   // vs last survey
  benchmarkComparison?: number;    // vs industry

  lastUpdated: Date;
}
```

### Privacy Enforcement

```typescript
// K-Anonymity enforcement
function enforceKAnonymity(
  results: AggregatedResult[],
  k: number = 5                    // Minimum group size
): AggregatedResult[] {
  return results.filter(r => r.responseCount >= k);
}

// Differential privacy for sensitive metrics
function addNoise(
  value: number,
  epsilon: number = 0.1           // Privacy budget
): number {
  const noise = laplacian(1 / epsilon);
  return value + noise;
}
```

### API Endpoints

```
# Organization Management
POST   /api/hr/organizations              - Create org
GET    /api/hr/organizations/:slug        - Get org details
PUT    /api/hr/organizations/:slug        - Update org
GET    /api/hr/organizations/:slug/units  - Get org structure

# Org Units
POST   /api/hr/organizations/:slug/units  - Create unit
PUT    /api/hr/units/:id                  - Update unit
DELETE /api/hr/units/:id                  - Archive unit

# Members
POST   /api/hr/organizations/:slug/members/invite  - Invite members
GET    /api/hr/organizations/:slug/members         - List members
POST   /api/hr/members/verify             - Verify membership

# Campaigns
POST   /api/hr/organizations/:slug/campaigns  - Create campaign
GET    /api/hr/campaigns/:id                  - Get campaign
PUT    /api/hr/campaigns/:id                  - Update campaign
POST   /api/hr/campaigns/:id/launch           - Launch campaign
POST   /api/hr/campaigns/:id/remind           - Send reminders

# Results (privacy-enforced)
GET    /api/hr/campaigns/:id/results          - Get aggregated results
GET    /api/hr/campaigns/:id/results/:unitId  - Get unit results
GET    /api/hr/campaigns/:id/trends           - Get trend analysis
GET    /api/hr/campaigns/:id/themes           - Get AI themes
```

---

## Module 4: Anonymous Reporting Module

**Target Segment:** Whistleblower / Anonymous Reporting

### New Entities

```typescript
// Reporting Channel - Org's anonymous reporting endpoint
interface ReportingChannel {
  id: number;
  orgId?: number;                  // null = public channel

  name: string;
  description: string;
  channelType:
    | "ethics_hotline"
    | "compliance"
    | "harassment"
    | "fraud"
    | "safety"
    | "general";

  // Settings
  allowAnonymous: boolean;         // Allow fully anonymous
  allowPseudonymous: boolean;      // Allow reply without identity
  requireEvidence: boolean;

  // Handlers
  handlerAddresses: string[];      // Who can view reports
  escalationRules?: JSON;

  // Compliance
  retentionDays: number;
  legalHoldEnabled: boolean;

  createdAt: Date;
  status: "active" | "suspended";
}

// Anonymous Report
interface AnonymousReport {
  id: number;
  channelId: number;

  // Anonymity
  reporterType: "anonymous" | "pseudonymous" | "identified";
  pseudonymId?: string;            // For follow-up without identity
  reporterAddressHash?: string;    // Hashed for pseudonymous

  // Content
  category: string;
  subject: string;
  description: string;             // Encrypted at rest

  // Evidence (stored off-chain, referenced by hash)
  evidenceHashes?: string[];       // IPFS or encrypted blob hashes
  evidenceCount: number;

  // Metadata (for pattern detection, not identification)
  submittedAt: Date;
  submittedVia: "web" | "mobile" | "api";

  // Handling
  status: "new" | "under_review" | "investigating" | "resolved" | "dismissed";
  assignedTo?: string;
  priority: "low" | "medium" | "high" | "critical";

  // Resolution
  resolvedAt?: Date;
  resolutionSummary?: string;
  outcomeCategory?: string;

  // On-chain proof
  submissionTxHash: string;        // Proves timestamp
  contentHash: string;             // Proves content integrity
}

// Secure Follow-up (anonymous two-way communication)
interface SecureMessage {
  id: number;
  reportId: number;

  // Direction
  direction: "reporter_to_handler" | "handler_to_reporter";
  senderType: "anonymous" | "handler";

  // Content
  message: string;                 // Encrypted
  attachmentHashes?: string[];

  // Delivery
  sentAt: Date;
  readAt?: Date;

  // On-chain
  messageHash: string;
}
```

### Smart Contract Functions

```leo
// Submit anonymous report on-chain
transition submit_report(
    channel_id: u64,
    content_hash: field,           // Hash of encrypted content
    evidence_hashes: [field; 5],   // Up to 5 evidence hashes
    timestamp: u64
) -> ReportReceipt {
    // Record report submission
    // Generate unique report ID
    // Return receipt (proves submission without identity)
}

// Verify report integrity
transition verify_report(
    report_id: u64,
    content_hash: field
) -> bool {
    // Check if hash matches on-chain record
    // Returns true if content is unaltered
}
```

### API Endpoints

```
# Channels
POST   /api/reporting/channels            - Create channel
GET    /api/reporting/channels            - List channels
GET    /api/reporting/channels/:id        - Get channel details

# Reports (anonymous submission)
POST   /api/reporting/submit              - Submit report
GET    /api/reporting/reports/:pseudonym  - Get my reports (pseudonymous)
GET    /api/reporting/reports/:id/status  - Check status

# Handler endpoints (authenticated)
GET    /api/reporting/channels/:id/reports  - List reports
PUT    /api/reporting/reports/:id           - Update report
POST   /api/reporting/reports/:id/assign    - Assign handler

# Secure messaging
POST   /api/reporting/reports/:id/messages  - Send message
GET    /api/reporting/reports/:id/messages  - Get messages
```

---

## Module 5: Integration SDK Module

**Target Segment:** Aleo Ecosystem Projects, Developers

### SDK Architecture

```typescript
// LeoPulse SDK for Aleo dApps

interface LeoPulseSDK {
  // Configuration
  init(config: SDKConfig): void;

  // Poll operations
  polls: {
    create(params: CreatePollParams): Promise<Poll>;
    get(pollId: string): Promise<Poll>;
    vote(pollId: string, optionIndex: number): Promise<VoteReceipt>;
    getResults(pollId: string): Promise<PollResults>;
  };

  // Governance operations
  governance: {
    createSpace(params: CreateSpaceParams): Promise<DAOSpace>;
    createProposal(spaceSlug: string, params: ProposalParams): Promise<Proposal>;
    vote(proposalId: string, choice: "for" | "against" | "abstain"): Promise<VoteReceipt>;
    delegate(params: DelegationParams): Promise<Delegation>;
  };

  // Webhooks
  webhooks: {
    register(url: string, events: WebhookEvent[]): Promise<Webhook>;
    list(): Promise<Webhook[]>;
    delete(webhookId: string): Promise<void>;
  };

  // Events
  on(event: SDKEvent, callback: Function): void;
  off(event: SDKEvent, callback: Function): void;
}

// Webhook events
type WebhookEvent =
  | "poll.created"
  | "poll.vote"
  | "poll.closed"
  | "proposal.created"
  | "proposal.passed"
  | "proposal.rejected"
  | "reward.claimed";

// SDK Events
type SDKEvent =
  | "connected"
  | "disconnected"
  | "transaction.pending"
  | "transaction.confirmed"
  | "error";
```

### API Key Management

```typescript
// API Key for programmatic access
interface APIKey {
  id: number;
  ownerAddress: string;

  name: string;
  keyHash: string;                 // Hashed API key
  keyPrefix: string;               // First 8 chars for identification

  // Permissions
  permissions: {
    polls: "read" | "write" | "admin";
    governance: "read" | "write" | "admin";
    research: "read" | "write" | "admin";
    webhooks: "read" | "write";
  };

  // Rate limits
  rateLimit: number;               // Requests per minute
  dailyLimit: number;              // Requests per day

  // Usage tracking
  requestCount: number;
  lastUsedAt?: Date;

  // Lifecycle
  createdAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  status: "active" | "expired" | "revoked";
}

// Webhook configuration
interface Webhook {
  id: number;
  apiKeyId: number;

  url: string;
  events: WebhookEvent[];

  // Security
  secret: string;                  // For signature verification

  // Status
  isActive: boolean;
  failureCount: number;
  lastTriggeredAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;

  createdAt: Date;
}
```

### API Endpoints

```
# API Keys
POST   /api/developers/keys               - Create API key
GET    /api/developers/keys               - List API keys
DELETE /api/developers/keys/:id           - Revoke API key
GET    /api/developers/keys/:id/usage     - Get usage stats

# Webhooks
POST   /api/developers/webhooks           - Register webhook
GET    /api/developers/webhooks           - List webhooks
PUT    /api/developers/webhooks/:id       - Update webhook
DELETE /api/developers/webhooks/:id       - Delete webhook
POST   /api/developers/webhooks/:id/test  - Test webhook

# SDK endpoints (API key authenticated)
POST   /api/v1/polls                      - Create poll
GET    /api/v1/polls/:id                  - Get poll
POST   /api/v1/polls/:id/vote             - Vote on poll
GET    /api/v1/polls/:id/results          - Get results

POST   /api/v1/governance/spaces          - Create space
POST   /api/v1/governance/proposals       - Create proposal
POST   /api/v1/governance/vote            - Cast vote
```

---

## Module 6: Earner Discovery Module

**Target Segment:** Crypto Survey Earners (B2C)

### New Entities

```typescript
// Earner Profile (B2C-focused)
interface EarnerProfile {
  walletAddress: string;

  // Public profile
  username?: string;
  avatarUrl?: string;
  bio?: string;

  // Earning stats (public)
  totalEarned: bigint;
  pollsCompleted: number;
  questionnairesCompleted: number;
  studiesCompleted: number;

  // Reputation
  reliabilityScore: number;        // 0-100
  speedScore: number;              // 0-100
  qualityScore: number;            // 0-100
  overallRating: number;           // 0-5 stars

  // Badges
  badges: Badge[];

  // Preferences
  preferredCategories?: string[];
  preferredRewardTokens?: string[];
  minRewardAmount?: bigint;

  // Discovery
  isDiscoverable: boolean;         // Show in leaderboards

  joinedAt: Date;
  lastActiveAt: Date;
}

// Badge system
interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;

  // Requirements
  requirement:
    | { type: "polls_completed", count: number }
    | { type: "earned_amount", amount: bigint }
    | { type: "streak_days", days: number }
    | { type: "quality_score", score: number }
    | { type: "referrals", count: number }
    | { type: "special", eventId: string };

  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  earnedAt?: Date;
}

// Opportunity Feed - Personalized earning opportunities
interface EarningOpportunity {
  id: number;

  // Source
  sourceType: "poll" | "questionnaire" | "study" | "quest";
  sourceId: number;

  // Display
  title: string;
  description: string;
  category: string;

  // Earning potential
  rewardAmount: bigint;
  rewardToken: string;
  estimatedTimeMinutes: number;
  rewardPerMinute: number;         // Calculated efficiency

  // Requirements
  requiredTier?: number;
  requiredBadges?: string[];

  // Availability
  spotsRemaining?: number;
  expiresAt?: Date;

  // Relevance
  matchScore: number;              // 0-100 based on preferences

  createdAt: Date;
}
```

### API Endpoints

```
# Earner Profile
GET    /api/earner/profile/:address       - Get profile
PUT    /api/earner/profile                - Update profile
GET    /api/earner/badges/:address        - Get badges
GET    /api/earner/stats/:address         - Get earning stats

# Discovery Feed
GET    /api/earner/opportunities          - Get personalized feed
GET    /api/earner/opportunities/trending - Get trending opportunities
GET    /api/earner/opportunities/new      - Get new opportunities
GET    /api/earner/opportunities/expiring - Get expiring soon

# Leaderboards
GET    /api/earner/leaderboard/earnings   - Top earners
GET    /api/earner/leaderboard/quality    - Top quality scores
GET    /api/earner/leaderboard/streak     - Top streaks
```

---

## Database Schema Summary

### New Tables by Module

```
DAO Governance Module:
- dao_spaces
- proposals
- delegations
- voting_power_snapshots

Research Panel Module:
- research_studies
- panel_members
- study_participations
- attention_checks
- fraud_signals
- validation_rules

Enterprise HR Module:
- organizations
- org_units
- org_members
- feedback_campaigns
- aggregated_results

Anonymous Reporting Module:
- reporting_channels
- anonymous_reports
- secure_messages

Integration SDK Module:
- api_keys
- webhooks
- webhook_logs

Earner Discovery Module:
- earner_profiles
- badges
- earning_opportunities
```

---

## Implementation Roadmap

### Phase 1: Foundation (Month 1-2)

| Priority | Feature | Segment |
|----------|---------|---------|
| P0 | API Key management | Aleo Ecosystem |
| P0 | Webhook system | Aleo Ecosystem |
| P0 | SDK v1 (polls only) | Aleo Ecosystem |
| P1 | Earner profiles | B2C Earners |
| P1 | Opportunity feed | B2C Earners |
| P1 | Badge system | B2C Earners |

### Phase 2: DAO Governance (Month 2-3)

| Priority | Feature | Segment |
|----------|---------|---------|
| P0 | DAO Spaces | DAO Governance |
| P0 | Proposals (linked to polls) | DAO Governance |
| P0 | Basic delegation | DAO Governance |
| P1 | Weighted voting | DAO Governance |
| P1 | Quorum enforcement | DAO Governance |
| P2 | Executable proposals | DAO Governance |

### Phase 3: Research & Enterprise (Month 3-4)

| Priority | Feature | Segment |
|----------|---------|---------|
| P0 | Research studies | Market Research |
| P0 | Panel management | Market Research |
| P0 | Attention checks | Market Research |
| P1 | Organizations | Enterprise HR |
| P1 | Feedback campaigns | Enterprise HR |
| P1 | K-anonymity enforcement | Enterprise HR |
| P2 | AI theme extraction | Enterprise HR |

### Phase 4: Compliance & Reporting (Month 4-5)

| Priority | Feature | Segment |
|----------|---------|---------|
| P0 | Reporting channels | Whistleblower |
| P0 | Anonymous submission | Whistleblower |
| P0 | On-chain proof | Whistleblower |
| P1 | Secure messaging | Whistleblower |
| P1 | IRB compliance tools | Academic |
| P2 | Evidence management | Whistleblower |

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LEOPULSE PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        FRONTEND LAYER                             │   │
│  │                                                                   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │  B2C    │ │   DAO   │ │Research │ │Enterprise│ │Reporting│    │   │
│  │  │ Earner  │ │Governance│ │ Panel  │ │   HR    │ │ Channel │    │   │
│  │  │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                         API LAYER                                 │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐     │   │
│  │  │                    Core APIs (existing)                  │     │   │
│  │  │  /polls  /questionnaires  /seasons  /quests  /referrals │     │   │
│  │  └─────────────────────────────────────────────────────────┘     │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐     │   │
│  │  │                    New Module APIs                       │     │   │
│  │  │  /dao  /research  /hr  /reporting  /developers  /earner │     │   │
│  │  └─────────────────────────────────────────────────────────┘     │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       DATA LAYER                                  │   │
│  │                                                                   │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │   │
│  │  │   PostgreSQL   │  │     IPFS       │  │   Aleo Chain   │     │   │
│  │  │                │  │                │  │                │     │   │
│  │  │ - Users        │  │ - Evidence     │  │ - Polls        │     │   │
│  │  │ - Profiles     │  │ - Documents    │  │ - Votes        │     │   │
│  │  │ - Progress     │  │ - Large files  │  │ - Rewards      │     │   │
│  │  │ - Analytics    │  │                │  │ - Proofs       │     │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘     │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                        INTEGRATION LAYER                                 │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    SDK     │  │  Webhooks  │  │   OAuth    │  │    SSO     │        │
│  │            │  │            │  │            │  │            │        │
│  │ TypeScript │  │ Event push │  │ Social     │  │ Enterprise │        │
│  │ React      │  │ Real-time  │  │ login      │  │ SAML/OIDC  │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: Feature-to-Segment Mapping

| Segment | Key Features | Priority |
|---------|--------------|----------|
| **DAO Governance** | Spaces, Proposals, Delegation, Weighted voting, Quorum | HIGH |
| **Market Research** | Studies, Panel, Quality checks, Fraud detection | HIGH |
| **Enterprise HR** | Organizations, Campaigns, K-anonymity, AI themes | HIGH |
| **Academic** | IRB compliance, Consent, Data retention, Protocols | MEDIUM |
| **Aleo Ecosystem** | SDK, API keys, Webhooks, Documentation | HIGH |
| **Whistleblower** | Channels, Anonymous submit, Evidence, Secure messages | MEDIUM |
| **Corporate Voting** | Weighted votes, Proxy, Audit trails | LOW |
| **B2C Earners** | Profiles, Badges, Feed, Leaderboards | MEDIUM |

---

*System Design for LeoPulse Latent Demand*
*Last Updated: 2026-01-26*
