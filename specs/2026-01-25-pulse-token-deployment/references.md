# References for PULSE Token Deployment

## Contract

### main.leo (PULSE Token)
- **Location:** `contracts/aleo/pulse/src/main.leo`
- **Key functions:**
  - `initialize()` - one-time setup
  - `mint_all_to_treasury()` - mint max supply
  - `faucet()` - testnet claims
- **Data structures:**
  - `TokenConfig` mapping at key 0u8

## Frontend Integration

### faucet.ts
- **Location:** `client/src/lib/faucet.ts`
- **Functions:**
  - `claimPulseFaucet()` - execute faucet transition
  - `checkFaucetClaimed()` - query claim status

### tokens.ts
- **Location:** `client/src/lib/tokens.ts`
- **Configuration:**
  - Token ID: 1field
  - Decimals: 8
  - Symbol: PULSE
