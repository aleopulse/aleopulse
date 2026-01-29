#!/usr/bin/env node
/**
 * Grant MINTER_ROLE to an address for the PULSE token
 *
 * Usage:
 *   node scripts/set-minter-role.mjs <minter_address>
 *
 * The caller must be the token admin (the address that registered the token).
 * Reads PRIVATE_KEY from ../.env (contracts/aleo/.env)
 */

import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from contracts/aleo directory
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

// Dynamic import after dotenv is loaded
const { Account, ProgramManager, AleoKeyProvider, AleoNetworkClient, NetworkRecordProvider } = await import("@provablehq/sdk");

// Read private key from environment - NEVER hardcode private keys
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY not found in contracts/aleo/.env");
  console.error("Add: PRIVATE_KEY=APrivateKey1zkp...");
  process.exit(1);
}

const API_HOST = process.env.ENDPOINT || "https://api.explorer.provable.com/v1";

// Token and role constants
const TOKEN_ID = "100field";  // PULSE token ID
const MINTER_ROLE = "1u8";    // MINTER_ROLE constant from token_registry

// Get minter address from command line
const minterAddress = process.argv[2];
if (!minterAddress || !minterAddress.startsWith("aleo1")) {
  console.error("Usage: node scripts/set-minter-role.mjs <minter_address>");
  console.error("Example: node scripts/set-minter-role.mjs aleo1abc...xyz");
  process.exit(1);
}

async function main() {
  console.log("Initializing Aleo account...");

  const account = new Account({ privateKey: PRIVATE_KEY });
  const adminAddress = account.address().to_string();
  console.log("Admin address (caller):", adminAddress);
  console.log("Minter address (recipient):", minterAddress);

  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const networkClient = new AleoNetworkClient(API_HOST);
  const recordProvider = new NetworkRecordProvider(account, networkClient);

  const programManager = new ProgramManager(
    API_HOST,
    keyProvider,
    recordProvider
  );
  programManager.setAccount(account);

  console.log("\nSetting MINTER_ROLE for PULSE token:");
  console.log("  token_id:", TOKEN_ID);
  console.log("  account:", minterAddress);
  console.log("  role:", MINTER_ROLE, "(MINTER_ROLE)");

  const inputs = [
    TOKEN_ID,
    minterAddress,
    MINTER_ROLE,
  ];

  console.log("\nExecuting token_registry.aleo/set_role...");
  console.log("This may take a few minutes...\n");

  try {
    const txId = await programManager.execute({
      programName: "token_registry.aleo",
      functionName: "set_role",
      inputs,
      priorityFee: 0,
      privateFee: false,
    });

    console.log("\n✅ Transaction submitted successfully!");
    console.log("Transaction ID:", txId);
    console.log("\nView on explorer:");
    console.log(`https://testnet.aleoscan.io/transaction?id=${txId}`);
    console.log("\nOnce confirmed, the minter address can call mint_public for PULSE tokens.");
  } catch (error) {
    console.error("\n❌ Transaction failed:", error.message || error);
    process.exit(1);
  }
}

main();
