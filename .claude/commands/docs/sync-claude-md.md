# Sync CLAUDE.md

Update the project's CLAUDE.md file to reflect current codebase state.

## When to Use

Run `/docs:sync-claude-md` when:
- Contract schemas have changed (new records, mappings, structs)
- New commands or scripts have been added
- Project structure has changed
- New agents or skills have been added
- Deployment configuration has changed

## Process

### Step 1: Analyze Current State

Gather information about the current codebase:

1. **Contract programs** - Read `contracts/aleo/*/program.json` to get program names and versions
2. **Contract records** - Parse `contracts/aleo/*/src/main.leo` for record definitions
3. **Contract mappings** - Parse for mapping definitions
4. **Frontend config** - Check `frontend/.env` for program IDs and configuration
5. **Available agents** - List files in `.claude/agents/`
6. **Available skills** - List files in `.claude/commands/`
7. **Package scripts** - Read `frontend/package.json` for npm scripts

### Step 2: Read Current CLAUDE.md

Read the existing `/CLAUDE.md` file to understand current documentation.

### Step 3: Identify Differences

Compare current codebase state with documented state. Look for:
- Missing or outdated program IDs
- New or removed records/mappings
- Changed commands or scripts
- New agents or skills
- Structural changes

### Step 4: Propose Updates

Present proposed changes to the user using AskUserQuestion:

```
I found the following differences between CLAUDE.md and the current codebase:

## Contract Changes
- Program ID changed: leopulse_poll.aleo → leopulse_poll_v2.aleo
- New record: PollInvite
- New mapping: private_polls

## New Features
- Poll visibility modes (public/private)

## Other Changes
- [list any other changes]

Should I update CLAUDE.md with these changes?
```

### Step 5: Apply Updates

If approved, use the Edit tool to update CLAUDE.md with the new information.

Preserve the existing structure and style. Only update sections that have changed.

### Step 6: Confirm

After updating, summarize what was changed:

```
Updated CLAUDE.md:
- Updated poll program ID to leopulse_poll_v2.aleo
- Added PollInvite record documentation
- Added private_polls mapping documentation
- Added visibility modes section
```

## What to Update

### Leo Contract Patterns Section

Keep this section updated with:
- Current privacy modes
- Current visibility modes (if applicable)
- Poll lifecycle states
- All record types with brief descriptions
- All mapping types with brief descriptions

### Commands Section

Keep this section updated with:
- Leo contract commands (build, deploy, execute)
- Frontend dev/build commands
- Test commands
- Any new npm scripts

### Custom Agents Section

Keep this section updated with:
- List of all agents in `.claude/agents/`
- Brief description of each

### Project Structure Section

Only update if directory structure has significantly changed.

## Tips

- Don't over-document - CLAUDE.md should be concise
- Focus on information Claude needs to work effectively
- Preserve formatting and style consistency
- Only update sections that have actually changed
