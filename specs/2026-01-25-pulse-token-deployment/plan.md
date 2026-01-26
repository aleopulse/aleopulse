# PULSE Token Deployment — Implementation Plan

## Overview

Create deployment documentation and verify token initialization.

## Tasks

### Task 1: Verify contract deployment status

Query testnet to check if leopulse_token.aleo exists:
```bash
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo"
```

### Task 2: Create PULSE_DEPLOYMENT.md

**File:** `docs/PULSE_DEPLOYMENT.md`

Document complete deployment process:

#### Prerequisites
- Leo CLI installed
- Aleo credits for fees (~0.5 ALEO)
- Treasury wallet address

#### Step 1: Build Contract
```bash
cd contracts/aleo/pulse
leo build
```

#### Step 2: Deploy to Testnet
```bash
snarkos developer deploy leopulse_token.aleo \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 10000000
```

#### Step 3: Initialize Token
```bash
leo run initialize \
  1field \
  aleo1... \  # Treasury address
  ...         # Name/symbol fields
```

#### Step 4: Register with token_registry.aleo
```bash
snarkos developer execute token_registry.aleo register_token \
  --inputs "1field" "8u8" "leopulse_token.aleo" \
  ...
```

#### Step 5: Mint to Treasury
```bash
leo run mint_all_to_treasury
```

#### Step 6: Verify
Query config mapping to confirm initialization:
```bash
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo/mapping/config/0u8"
```

### Task 3: Test faucet flow

After initialization:
1. Call faucet from test wallet
2. Verify balance in token_registry
3. Confirm claim count updated

## Verification

- Config mapping shows initialized = true
- Treasury balance shows max supply
- Faucet claims work (1000 PULSE per claim)
