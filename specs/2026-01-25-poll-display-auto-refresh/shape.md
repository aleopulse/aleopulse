# Poll Display Auto-Refresh — Shaping Notes

## Scope

Fix the issue where newly created polls don't appear on the dashboard due to:
1. Indexer API lag (10-30 seconds behind blockchain)
2. No auto-refresh on dashboard
3. No pending transaction tracking after poll creation

## Decisions

- Use interval-based polling (15s normal, 5s when pending tx)
- Store pending transaction in sessionStorage (survives page navigation)
- Show visual feedback while waiting for poll to appear
- Reduce React Query stale time to improve responsiveness

## Context

- **Visuals:** None
- **References:**
  - `client/src/pages/Dashboard.tsx` - current poll fetching
  - `client/src/hooks/useContract.ts` - getAllPolls() implementation
  - `client/src/lib/aleo-indexer.ts` - API calls to Provable/Aleoscan
- **Product alignment:** N/A (no product docs)

## Standards Applied

- None specific (no standards folder exists)
