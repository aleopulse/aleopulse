# References for Poll-Level Privacy

## Contract Patterns

### Existing Records
- **VoteReceipt** - `{ owner, poll_id, option_index }`
- **RewardTicket** - `{ owner, poll_id, amount, token_id }`
- **PollTicket** - `{ owner, poll_id }` - proves poll ownership

### Transition Pattern
All transitions follow:
```leo
transition name(...) -> (Record, Future) {
    // Create record
    return (record, finalize_name(...));
}

async function finalize_name(...) {
    // Update mappings
}
```

### Privacy Modes (for reference)
- PRIVACY_ANONYMOUS (0) - votes in private records only
- PRIVACY_SEMI_PRIVATE (1) - identity public, choice private
- PRIVACY_IDENTIFIED (2) - both public

## Frontend Patterns

### useAleoWallet.ts Transaction Pattern
```typescript
const executeTx = async (functionName: string, inputs: string[]) => {
  const tx = await sdk.createTransaction({
    programId: config.pollProgramId,
    functionName,
    inputs,
    fee: 100000,
  });
  return await wallet.requestExecution(tx);
};
```

### Record Fetching
Use `wallet.requestRecords(programId)` to get user's records.
Filter by record type to find PollInvite records.
