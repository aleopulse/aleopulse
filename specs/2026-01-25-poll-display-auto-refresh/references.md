# References for Poll Display Auto-Refresh

## Files Studied

### Dashboard.tsx
- **Location:** `client/src/pages/Dashboard.tsx`
- **Relevance:** Main file to modify for auto-refresh
- **Key patterns:** Uses useCallback for fetchPolls, useEffect for mount fetch

### useContract.ts
- **Location:** `client/src/hooks/useContract.ts`
- **Relevance:** Contains getAllPolls() that queries indexer
- **Key patterns:** Batched fetching, getPollCount + getPoll loop

### aleo-indexer.ts
- **Location:** `client/src/lib/aleo-indexer.ts`
- **Relevance:** API calls to Provable/Aleoscan
- **Key patterns:** Primary (Provable) + fallback (Aleoscan) pattern

### useAleoPolls.ts
- **Location:** `client/src/hooks/useAleoPolls.ts`
- **Relevance:** React Query configuration
- **Key patterns:** staleTime, queryKey structure
