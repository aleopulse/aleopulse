# Poll-Level Privacy — Shaping Notes

## Scope

Add the ability to create private polls that are only visible to invited participants:
1. Modify poll contract to support visibility setting
2. Add PollInvite record for access control
3. Update frontend to filter private polls
4. Add invite management UI

## Decisions

- **Fully on-chain approach** - Use Leo private records for invites
- PollInvite record owned by invitee (they can see their invites)
- Creator uses PollTicket to issue invites (proves ownership)
- Private polls tracked in public mapping (existence known, data accessible only to invited)
- Vote with invite consumes the PollInvite record

## Context

- **Visuals:** None
- **References:**
  - `contracts/aleo/poll/src/main.leo` - existing poll contract
  - Existing records: VoteReceipt, RewardTicket, PollTicket
- **Product alignment:** N/A

## Privacy Model

| Poll Visibility | Who Can See | Who Can Vote |
|-----------------|-------------|--------------|
| Public (0) | Everyone | Everyone |
| Private (1) | Creator + Invited | Invited only |

## Standards Applied

- Follow existing record patterns (VoteReceipt, PollTicket)
- Use same transition/finalize async pattern
