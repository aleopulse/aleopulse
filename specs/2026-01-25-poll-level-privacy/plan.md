# Poll-Level Privacy — Implementation Plan

## Overview

Add on-chain private polls using Leo's record system for access control.

## Contract Changes

### Task 1: Add visibility constants and update PollSettings

**File:** `contracts/aleo/poll/src/main.leo`

```leo
// New constants
const VISIBILITY_PUBLIC: u8 = 0u8;
const VISIBILITY_PRIVATE: u8 = 1u8;

// Update PollSettings struct
struct PollSettings {
    privacy_mode: u8,
    show_results_live: bool,
    require_receipt: bool,
    visibility: u8,  // NEW
}
```

### Task 2: Add PollInvite record

**File:** `contracts/aleo/poll/src/main.leo`

```leo
record PollInvite {
    owner: address,
    poll_id: u64,
    can_vote: bool,
    expires_block: u32,
}
```

### Task 3: Add private_polls mapping

**File:** `contracts/aleo/poll/src/main.leo`

```leo
mapping private_polls: u64 => bool;
```

Update `create_poll` finalizer to set mapping if visibility == PRIVATE.

### Task 4: Add invite_to_poll transition

**File:** `contracts/aleo/poll/src/main.leo`

```leo
transition invite_to_poll(
    ticket: PollTicket,
    invitee: address,
    can_vote: bool,
    expires_block: u32
) -> (PollInvite, PollTicket) {
    // Verify ticket ownership (implicit via record consumption)

    let invite: PollInvite = PollInvite {
        owner: invitee,
        poll_id: ticket.poll_id,
        can_vote: can_vote,
        expires_block: expires_block,
    };

    // Return new ticket to creator (so they can issue more invites)
    let new_ticket: PollTicket = PollTicket {
        owner: ticket.owner,
        poll_id: ticket.poll_id,
    };

    return (invite, new_ticket);
}
```

### Task 5: Add vote_private transition

**File:** `contracts/aleo/poll/src/main.leo`

```leo
transition vote_private(
    invite: PollInvite,
    option_index: u8
) -> (VoteReceipt, Future) {
    assert(invite.can_vote);

    let receipt: VoteReceipt = VoteReceipt {
        owner: invite.owner,
        poll_id: invite.poll_id,
        option_index: option_index,
    };

    return (receipt, finalize_vote_private(invite.poll_id, option_index, invite.owner));
}

async function finalize_vote_private(
    poll_id: u64,
    option_index: u8,
    voter: address
) {
    // Same logic as finalize_vote but for private polls
    // Check poll exists, is active, voter hasn't voted
    // Increment vote count
}
```

## Frontend Changes

### Task 6: Update CreatePoll with visibility selector

**File:** `client/src/pages/CreatePoll.tsx`

Add radio buttons for Public/Private:
- Globe icon for Public
- Lock icon for Private
- Store in form state, pass to contract call

### Task 7: Add POLL_VISIBILITY constant

**File:** `client/src/types/poll.ts`

```typescript
export const POLL_VISIBILITY = {
  PUBLIC: 0,
  PRIVATE: 1,
} as const;

export interface PollInvite {
  owner: string;
  poll_id: number;
  can_vote: boolean;
  expires_block: number;
}
```

### Task 8: Add inviteToPoll to useContract

**File:** `client/src/hooks/useContract.ts`

```typescript
const inviteToPoll = async (
  ticket: PollTicket,
  invitee: string,
  canVote: boolean,
  expiresBlock: number
) => {
  // Build and execute invite_to_poll transaction
};
```

### Task 9: Filter private polls in Dashboard

**File:** `client/src/pages/Dashboard.tsx`

1. Query `private_polls` mapping for each poll
2. For private polls, check if user has PollInvite record
3. Only show polls user can access

### Task 10: Add invite management UI

**File:** `client/src/components/poll/InviteManager.tsx`

Create InviteManager component with:
- Address input with Aleo address validation (`/^aleo1[a-z0-9]{58}$/`)
- Expiration selector with presets (1,000 / 5,000 / 10,000 / 50,000 / 100,000 blocks) + custom
- "Can Vote" checkbox (default: true, uncheck for view-only access)
- Send Invite button with transaction feedback
- Collapsible list of sent invites with status (Active/Pending/Expired)
- Local storage persistence for invite tracking (`poll-invites-{pollId}`)

**Integration in ManagePoll.tsx:**
- Conditionally render InviteManager when `pollSettings?.visibility === POLL_VISIBILITY.PRIVATE`
- Positioned after Voters List section

### Task 11: Add PollSettings and PollTicket types

**File:** `client/src/types/poll.ts`

```typescript
export interface PollSettings {
  privacy_mode: number;      // 0=Anonymous, 1=Semi-Private, 2=Identified
  show_results_live: boolean;
  require_receipt: boolean;
  visibility: number;        // 0=Public, 1=Private (invite-only)
}

export interface PollTicket {
  owner: string;
  poll_id: number;
}
```

### Task 12: Add contract read functions

**File:** `client/src/hooks/useContract.ts`

```typescript
// Fetch and parse poll_settings mapping
const getPollSettings = async (pollId: number): Promise<PollSettings | null>

// Fetch user's PollInvite records from wallet
const getUserPollInvites = async (): Promise<PollInvite[]>

// Fetch user's PollTicket records (for creators)
const getPollTickets = async (): Promise<PollTicket[]>
```

### Task 13: Dashboard filtering for private polls

**File:** `client/src/pages/Dashboard.tsx`

Filtering logic:
1. Fetch poll settings for all polls to get visibility
2. Fetch user's PollInvite records if connected
3. For each poll:
   - If `visibility === PUBLIC (0)` → show
   - If `visibility === PRIVATE (1)`:
     - If user is creator → show
     - If user has valid (non-expired) PollInvite → show
     - Otherwise → hide

Helper functions:
- `hasValidInvite(pollId)` - check invite exists and not expired
- `isPollPrivate(pollId)` - check visibility setting
- `canAccessPoll(poll)` - combine logic

### Task 14: PollCard visual indicators

**File:** `client/src/components/PollCard.tsx`

Add props:
```typescript
isPrivate?: boolean;  // Whether poll is invite-only
hasInvite?: boolean;  // Whether user has valid invite
```

Visual indicators:
- Private + no invite: Yellow Lock icon + "Private" badge
- Private + has invite: Green Mail icon + "Invited" badge
- Public: No indicator

## Verification

### Contract Verification
1. Create private poll, verify `private_polls[poll_id] = true`
2. Issue invite, verify PollInvite record created for invitee
3. Vote_private creates VoteReceipt correctly

### Frontend Verification
1. **Dashboard Filtering:**
   - Create a private poll → verify creator sees it in their dashboard
   - As non-invited user → verify poll NOT visible in participant dashboard
   - Invite a user → verify poll now appears in their dashboard
   - After invite expires → verify poll hidden again

2. **Invite Management:**
   - Navigate to ManagePoll for a private poll → verify InviteManager visible
   - Enter valid Aleo address → verify Send Invite button enabled
   - Enter invalid address → verify validation error
   - Send invite → verify transaction toast and invite added to list
   - Check invite status → verify Active/Expired badge correct

3. **Visual Indicators:**
   - Private poll without invite → verify Lock icon + "Private" badge
   - Private poll with invite → verify Mail icon + "Invited" badge
   - Public poll → verify no privacy indicator

### E2E Test Scenarios
```typescript
// private-polls.spec.ts
test('private poll hidden from non-invited users')
test('private poll visible to creator')
test('InviteManager shown for private polls')
test('InviteManager hidden for public polls')
test('PollCard shows Private badge for invite-only polls')
test('PollCard shows Invited badge when user has valid invite')
```
