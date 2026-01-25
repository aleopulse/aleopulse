# LeoPulse Deployment Guide

## Prerequisites

- Node.js 18+
- Leo CLI (for contract development)
- SnarkOS CLI (for deployment)
- PostgreSQL database (or Neon account)
- Aleo wallet with testnet credits

---

## 1. Smart Contract Deployment

### Install Leo CLI

```bash
curl -L https://raw.githubusercontent.com/ProvableHQ/leo/mainnet/install.sh | sh
```

Verify installation:
```bash
leo --version
```

### Install SnarkOS CLI

```bash
curl -L https://raw.githubusercontent.com/ProvableHQ/snarkOS/mainnet/install.sh | sh
```

### Build Contracts

```bash
# Build Poll contract
cd contracts/poll
leo build

# Build Staking contract
cd ../staking
leo build

# Build Swap contract
cd ../swap
leo build
```

### Deploy Poll Contract

```bash
cd contracts/poll

snarkos developer deploy poll.aleo \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast"
```

Save the program ID (should be `poll.aleo` or custom if namespaced).

### Deploy Staking Contract

```bash
cd contracts/staking

snarkos developer deploy staking.aleo \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast"
```

### Deploy Swap Contract

```bash
cd contracts/swap

snarkos developer deploy swap.aleo \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast"
```

### Register PULSE Token

PULSE uses the official `token_registry.aleo`:

```bash
snarkos developer execute token_registry.aleo register_token \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" \
  -- \
  "<token_id_field>" \
  "[<name_field1>, <name_field2>, <name_field3>, <name_field4>]" \
  "[<symbol_field>]" \
  "8u8" \
  "100000000000000000u128" \
  "false" \
  "$ADMIN_ADDRESS"
```

### Initialize Contracts

After deployment, initialize each contract:

```bash
# Initialize poll contract
snarkos developer execute poll.aleo initialize \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" \
  -- "$ADMIN_ADDRESS"

# Initialize staking contract
snarkos developer execute staking.aleo initialize \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" \
  -- "$ADMIN_ADDRESS"

# Initialize swap contract
snarkos developer execute swap.aleo initialize \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" \
  -- "$STABLE_TOKEN_ID" "30u64"
```

---

## 2. Database Setup

### Option A: Neon PostgreSQL (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

### Option B: Local PostgreSQL

```bash
createdb leopulse
```

### Configure Environment

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Run Migrations

```bash
cd frontend
npx drizzle-kit push
```

---

## 3. Frontend Deployment

### Environment Variables

Create `.env` in `frontend/`:

```env
# Database
DATABASE_URL=postgresql://...

# Aleo Network
VITE_ALEO_NETWORK=testnet

# Program IDs
VITE_POLL_PROGRAM_ID=poll.aleo
VITE_STAKING_PROGRAM_ID=staking.aleo
VITE_SWAP_PROGRAM_ID=swap.aleo

# Token IDs
VITE_PULSE_TOKEN_ID=<registered_token_id>
VITE_STABLE_TOKEN_ID=<stable_token_id>

# API URLs
VITE_ALEOSCAN_API=https://api.testnet.aleoscan.io/v2
VITE_PROVABLE_API=https://api.explorer.provable.com/v1

# Gas Sponsorship (Coming Soon)
VITE_GAS_SPONSORSHIP_ENABLED=false
VITE_GAS_SPONSORSHIP_API=

# Admin Addresses
VITE_ADMIN_ADDRESSES=aleo1...
```

### Local Development

```bash
cd frontend
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

```bash
vercel --prod
```

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist/public
```

#### Render
1. Create Web Service
2. Build command: `npm run build`
3. Start command: `npm run start`
4. Add environment variables

---

## 4. Gas Sponsorship Service (Coming Soon)

The gas sponsorship service is a separate project at `/Users/east/workspace/leo/aleo-gs`.

### When Ready to Deploy

```bash
cd /path/to/aleo-gs

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with database URL, sponsor wallet key, etc.

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start service
npm run start
```

### Environment Variables for Gas Sponsorship

```env
DATABASE_URL=postgresql://...
SPONSOR_PRIVATE_KEY=APrivateKey1...
ALEO_NETWORK=testnet
PROVABLE_API_URL=https://api.explorer.provable.com/v1
ADMIN_API_KEY=<generate-secure-key>
PORT=3001
```

---

## 5. Post-Deployment

### Verify Contracts

Check deployed programs on [Provable Explorer](https://explorer.provable.com/):

```bash
# Check if program exists
curl "https://api.explorer.provable.com/v1/testnet/program/poll.aleo"

# Check mapping values
curl "https://api.explorer.provable.com/v1/testnet/program/poll.aleo/mapping/poll_count/0u8"
```

### Test Transactions

```bash
# Create a test poll
snarkos developer execute poll.aleo create_poll \
  --private-key $ALEO_PRIVATE_KEY \
  --query "https://api.explorer.provable.com/v1" \
  --priority-fee 1000 \
  --broadcast "https://api.explorer.provable.com/v1/testnet/transaction/broadcast" \
  -- \
  "<title_hash>" \
  "4u8" \
  "0u64" \
  "100u64" \
  "86400u64" \
  "1000000000u64" \
  "0u8" \
  "true"
```

### Setup PULSE Faucet (Testnet)

If using a faucet wrapper contract:

```bash
# Mint PULSE to faucet contract
snarkos developer execute token_registry.aleo mint_public \
  --private-key $ADMIN_PRIVATE_KEY \
  ...
```

---

## 6. Mainnet Deployment Checklist

- [ ] Audit smart contracts
- [ ] Deploy contracts to mainnet
- [ ] Update all program IDs in `.env`
- [ ] Change API URLs to mainnet
- [ ] Configure mainnet gas sponsorship (when ready)
- [ ] Register PULSE token on mainnet
- [ ] Mint PULSE to treasury
- [ ] Test all critical flows
- [ ] Set up monitoring/alerting
- [ ] Configure production database backups

---

## Troubleshooting

### Contract Deployment Fails

```bash
# Check account balance
curl "https://api.explorer.provable.com/v1/testnet/account/$ADDRESS/balance"

# Get testnet credits from faucet
# Visit https://faucet.aleo.org
```

### Transaction Not Found

Aleo transactions can take time to confirm. Check status:

```bash
curl "https://api.explorer.provable.com/v1/testnet/transaction/$TX_ID"
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Mapping Query Returns Null

- The key format must match exactly
- Use proper type suffixes (e.g., `0u8`, `123u64`)
- Check if the value was ever set

---

## Monitoring

### Contract State

Query mappings via API to monitor:
- Total polls created
- Total staked amount
- Pool reserves

### API Health

```bash
curl https://your-domain.com/api/health
```

### Explorer Links

- **Aleoscan**: https://aleoscan.io
- **Provable Explorer**: https://explorer.provable.com

---

*Last Updated: January 2025 (Aleo Migration)*
