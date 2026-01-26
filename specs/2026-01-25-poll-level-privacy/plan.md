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

Create new components:
- `InviteParticipantDialog` - form to invite by address
- `MyInvitesPanel` - list user's received invites
- `PollInviteList` - creator's view of issued invites

## Verification

1. Create private poll, verify `private_polls[poll_id] = true`
2. Confirm private poll doesn't appear in public dashboard
3. Issue invite, verify PollInvite record created
4. Invited user can see and vote on poll
5. Vote_private creates VoteReceipt correctly
