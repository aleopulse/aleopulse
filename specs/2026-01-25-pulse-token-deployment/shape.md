# PULSE Token Deployment — Shaping Notes

## Scope

Document the complete deployment and initialization process for the PULSE token:
1. Verify contract deployment status
2. Initialize token with treasury address
3. Mint tokens to treasury
4. Configure faucet for testnet

## Decisions

- Create comprehensive deployment guide in docs/
- Include verification steps for each phase
- Document troubleshooting for common issues

## Context

- **Visuals:** None
- **References:**
  - `contracts/aleo/pulse/src/main.leo` - token contract
  - `client/src/lib/faucet.ts` - faucet integration
  - `client/src/lib/tokens.ts` - token configuration
- **Product alignment:** N/A

## Token Specifications

- **Program ID:** leopulse_token.aleo
- **Token ID:** 1field
- **Decimals:** 8
- **Max Supply:** 1,000,000,000 PULSE (100,000,000,000,000,000u128)
- **Faucet Amount:** 1,000 PULSE per claim
- **Max Faucet Claims:** 10 per address
