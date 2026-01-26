# Poll Display Auto-Refresh — Implementation Plan

## Overview

Fix poll display lag by adding auto-refresh and pending transaction tracking.

## Tasks

### Task 1: Add auto-refresh interval to Dashboard

**File:** `client/src/pages/Dashboard.tsx`

Add interval-based polling:
- Normal refresh: every 15 seconds
- Aggressive refresh: every 5 seconds when pending tx exists
- Clear interval on unmount

### Task 2: Store pending transaction after poll creation

**File:** `client/src/pages/CreatePoll.tsx`

After successful poll creation:
- Store transaction ID in `sessionStorage.setItem("pending-poll-tx", txId)`
- Continue with existing redirect flow

### Task 3: Detect and clear pending transactions

**File:** `client/src/pages/Dashboard.tsx`

On mount and after each fetch:
- Check `sessionStorage.getItem("pending-poll-tx")`
- If poll count increases, clear pending tx and show success toast
- Update polling interval based on pending state

### Task 4: Add pending transaction banner

**File:** `client/src/pages/Dashboard.tsx`

When pending tx exists, show:
- Loading indicator with transaction link
- "Your poll is being indexed..." message
- Auto-dismiss when poll appears

### Task 5: Reduce stale time in useAleoPolls

**File:** `client/src/hooks/useAleoPolls.ts`

Update query configuration:
- Change `staleTime` from 30000 to 10000
- Add `refetchInterval: 15000`

## Verification

1. Create a poll and observe dashboard
2. Poll should appear within 30 seconds without manual refresh
3. Pending banner should show during indexer sync
4. Browser console should show refetch logs
