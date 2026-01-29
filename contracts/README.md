# LeoPulse Smart Contracts

Leo smart contracts for the LeoPulse platform on Aleo blockchain.

## Structure

```
contracts/
├── poll/      # Polls with configurable privacy modes
├── pulse/     # PULSE token wrapper with testnet faucet
├── staking/   # PULSE staking with lock periods
├── swap/      # PULSE/Stablecoin AMM (constant product)
├── scripts/   # Helper utilities for token operations
├── Makefile   # Build and deploy commands
└── .env       # Private key configuration
```

## Programs

| Program | Description |
|---------|-------------|
| `leopulse_poll_v2.aleo` | Core polling with privacy modes, rewards, and invites |
| `pulse.aleo` | PULSE token wrapper with testnet faucet |
| `staking.aleo` | PULSE staking with lock periods |
| `swap.aleo` | PULSE/Stablecoin AMM (constant product) |

## Setup

1. Install Leo CLI:
   ```bash
   curl -L https://raw.githubusercontent.com/ProvableHQ/leo/mainnet/install.sh | sh
   ```

2. Configure your private key in `.env`:
   ```
   PRIVATE_KEY=APrivateKey1zkp...
   ```

3. Get testnet credits from [Aleo Faucet](https://faucet.aleo.org/)

## Commands

```bash
cd contracts

# Build all programs
make build

# Deploy all programs to testnet
make deploy-all

# Deploy individual program
make deploy-poll
make deploy-pulse
make deploy-staking
make deploy-swap

# Run a specific contract function
cd poll && leo run <function_name> <args>

# Clean build artifacts
make clean
```

## Deployment Order

Programs should be deployed in this order:
1. `pulse.aleo` - Token wrapper (no dependencies)
2. `poll.aleo` - Polls (references PULSE token)
3. `staking.aleo` - Staking (references PULSE token)
4. `swap.aleo` - AMM (references PULSE token)

## Network Configuration

| Network | Endpoint |
|---------|----------|
| Testnet | `https://api.explorer.provable.com/v1` |
| Mainnet | `https://api.explorer.provable.com/v1` |

## Explorer

View deployed programs and transactions:
- Testnet: https://testnet.aleoscan.io
- Mainnet: https://aleoscan.io

## Resources

- [Aleo Developer Docs](https://developer.aleo.org/)
- [Leo Language Guide](https://developer.aleo.org/leo/)
- [SnarkVM](https://github.com/AleoHQ/snarkVM)
