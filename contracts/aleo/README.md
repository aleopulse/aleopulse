# LeoPulse Aleo Contracts

This workspace contains all Leo smart contracts for the LeoPulse platform.

## Programs

| Program | Description |
|---------|-------------|
| `pulse.aleo` | PULSE token wrapper with testnet faucet |
| `poll.aleo` | Polls with configurable privacy modes |
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
# Build all programs
make build

# Deploy all programs to testnet
make deploy-all

# Deploy individual program
make deploy-pulse
make deploy-poll
make deploy-staking
make deploy-swap

# Check account balance
make check-balance

# Clean build artifacts
make clean
```

## Deployment Order

Programs should be deployed in this order:
1. `pulse.aleo` - Token wrapper (no dependencies)
2. `poll.aleo` - Polls (references PULSE token)
3. `staking.aleo` - Staking (references PULSE token)
4. `swap.aleo` - AMM (references PULSE token)

## Program IDs

After deployment, note your program IDs:
- `pulse.aleo` - PULSE token operations
- `poll.aleo` - Poll creation and voting
- `staking.aleo` - Stake and unstake PULSE
- `swap.aleo` - Swap PULSE/Stablecoin

## Network Configuration

| Network | Endpoint |
|---------|----------|
| Testnet | `https://api.explorer.provable.com/v1` |
| Mainnet | `https://api.explorer.provable.com/v1` |

## Explorer

View deployed programs and transactions:
- Testnet: https://testnet.aleoscan.io
- Mainnet: https://aleoscan.io
