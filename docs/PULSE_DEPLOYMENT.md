# PULSE Token Deployment Guide

Complete guide for deploying and initializing the PULSE token on Aleo testnet.

## Overview

PULSE is the native token for the LeoPulse polls and surveys platform. It uses the Aleo token registry pattern for interoperability.

### Token Specifications

| Property | Value |
|----------|-------|
| Program ID | `leopulse_token.aleo` |
| Token ID | `1field` |
| Decimals | 8 |
| Max Supply | 1,000,000,000 PULSE (1e17 microtokens) |
| Faucet Amount | 1,000 PULSE per claim |
| Max Faucet Claims | 10 per address |

## Prerequisites

- [Leo CLI](https://developer.aleo.org/leo/installation) installed (v2.0+)
- [snarkOS CLI](https://developer.aleo.org/testnet/getting_started/installation) installed
- Aleo testnet wallet with at least 1 ALEO for transaction fees
- Private key exported as environment variable

```bash
# Set your private key
export PRIVATE_KEY="APrivateKey1..."

# Verify Leo installation
leo --version
```

## Deployment Steps

### Step 1: Build the Contract

```bash
cd contracts/aleo/pulse
leo build
```

Expected output:
```
       Leo Compiled 'leopulse_token.aleo' into Aleo instructions
```

### Step 2: Deploy to Testnet

```bash
snarkos developer deploy leopulse_token.aleo \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 10000000
```

Note the transaction ID and wait for confirmation (usually 30-60 seconds).

### Step 3: Verify Deployment

```bash
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo"
```

You should see the program source code in the response.

### Step 4: Initialize Token

Prepare the initialization parameters:

```bash
# Token ID (using 1field for PULSE)
TOKEN_ID="1field"

# Treasury address (receives all minted tokens)
TREASURY_ADDRESS="aleo1..." # Your treasury wallet address

# Name fields (encode "Pulse Token" as 4 field elements)
# Using simple encoding: each field represents up to 31 characters
NAME_FIELD_1="8388670108882731360817323266field"  # "Pulse"
NAME_FIELD_2="0field"
NAME_FIELD_3="0field"
NAME_FIELD_4="0field"

# Symbol field (encode "PULSE")
SYMBOL_FIELD="5787995field"  # "PULSE"
```

Execute initialization:

```bash
snarkos developer execute leopulse_token.aleo initialize \
  "$TOKEN_ID" \
  "$TREASURY_ADDRESS" \
  "$NAME_FIELD_1" \
  "$NAME_FIELD_2" \
  "$NAME_FIELD_3" \
  "$NAME_FIELD_4" \
  "$SYMBOL_FIELD" \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 5000000
```

### Step 5: Verify Initialization

```bash
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo/mapping/config/0u8"
```

Expected response includes:
```json
{
  "token_id": "1field",
  "treasury": "aleo1...",
  "is_initialized": "true",
  "minting_disabled": "false",
  "total_minted": "0u128"
}
```

### Step 6: Register with Token Registry (Optional)

If using the standard Aleo token registry for interoperability:

```bash
snarkos developer execute token_registry.aleo register_token \
  "1field" \
  "8u8" \
  "leopulse_token.aleo" \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 5000000
```

### Step 7: Mint Tokens to Treasury

For mainnet (one-time full mint):

```bash
snarkos developer execute leopulse_token.aleo mint_all_to_treasury \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 5000000
```

This disables further minting and sets `total_minted` to MAX_SUPPLY.

**Important:** After calling `mint_all_to_treasury`, you must also execute the actual mint via `token_registry.aleo/mint_public`:

```bash
snarkos developer execute token_registry.aleo mint_public \
  "$TREASURY_ADDRESS" \
  "1field" \
  "100000000000000000u128" \
  --private-key $PRIVATE_KEY \
  --query https://api.explorer.provable.com/v1/testnet \
  --broadcast https://api.explorer.provable.com/v1/testnet/transaction/broadcast \
  --fee 5000000
```

## Faucet Operations (Testnet Only)

The faucet allows testnet users to claim 1,000 PULSE tokens (up to 10 times per address).

### User Claiming from Faucet

1. **Frontend Flow:** Users click "Claim PULSE" which calls:
   ```typescript
   // From useContract hook
   await claimPulseFaucet();
   ```

2. **Contract State Update:** The `faucet()` transition:
   - Increments `faucet_claims[user_address]`
   - Updates `total_minted` in config
   - Frontend then calls `token_registry.aleo/mint_public` to actually mint

### Check Faucet Status

```bash
# Check user's claim count
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo/mapping/faucet_claims/aleo1..."

# Check max claims setting
curl "https://api.explorer.provable.com/v1/testnet/program/leopulse_token.aleo/mapping/max_faucet_claims/0u8"
```

## Verification Checklist

After deployment, verify these conditions:

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Program deployed | `curl .../program/leopulse_token.aleo` | Returns program source |
| Config initialized | `curl .../mapping/config/0u8` | `is_initialized: true` |
| Treasury set | `curl .../mapping/config/0u8` | `treasury: <your_address>` |
| Max faucet claims | `curl .../mapping/max_faucet_claims/0u8` | `10u64` |
| Faucet works | Test claim from frontend | Balance increases |

## Frontend Configuration

Update the network configuration to point to the deployed contract:

```typescript
// client/src/lib/network-config.ts
export const TESTNET_CONFIG = {
  pulseTokenProgramId: "leopulse_token.aleo",
  pulseTokenId: "1field",
  // ...
};
```

## Troubleshooting

### "Program already exists"
The contract is already deployed. No action needed.

### "Mapping::contains failed"
Initialization was already called. Verify with config query.

### "assert_eq failed"
- For `mint_all_to_treasury`: Ensure caller is the treasury address
- For `faucet`: User exceeded max claims

### Transaction pending too long
- Check transaction status on explorer
- Ensure sufficient fee (at least 5 ALEO for complex transactions)
- Retry with higher fee if network is congested

## Security Notes

1. **Private Key Security:** Never commit private keys. Use environment variables.
2. **Treasury Address:** Use a secure multi-sig or hardware wallet for mainnet treasury.
3. **One-time Mint:** `mint_all_to_treasury()` permanently disables minting.
4. **Faucet is testnet only:** The faucet should be disabled before mainnet by calling `mint_all_to_treasury()`.

## Related Documentation

- [Aleo Developer Docs](https://developer.aleo.org/)
- [Leo Language Reference](https://developer.aleo.org/leo/)
- [Token Registry Standard](https://github.com/AleoHQ/token-registry)
