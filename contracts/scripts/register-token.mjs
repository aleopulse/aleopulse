#!/usr/bin/env node
/**
 * Register a new PULSE token on token_registry.aleo
 *
 * Usage:
 *   node scripts/register-token.mjs
 *
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

// Token parameters
const TOKEN_ID = "100field";
const NAME = "297750254928u128";      // "PULSE" encoded
const SYMBOL = "297750254928u128";    // "PULSE" encoded
const DECIMALS = "6u8";
const MAX_SUPPLY = "100000000000000000u128";
const EXTERNAL_AUTH_REQUIRED = "false";
const ZERO_ADDRESS = "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc";

async function main() {
  console.log("Initializing Aleo account...");

  const account = new Account({ privateKey: PRIVATE_KEY });
  console.log("Account address:", account.address().to_string());

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

  console.log("\nRegistering token with parameters:");
  console.log("  token_id:", TOKEN_ID);
  console.log("  name:", NAME, '("PULSE")');
  console.log("  symbol:", SYMBOL, '("PULSE")');
  console.log("  decimals:", DECIMALS);
  console.log("  max_supply:", MAX_SUPPLY);

  const inputs = [
    TOKEN_ID,
    NAME,
    SYMBOL,
    DECIMALS,
    MAX_SUPPLY,
    EXTERNAL_AUTH_REQUIRED,
    ZERO_ADDRESS,
  ];

  console.log("\nExecuting token_registry.aleo/register_token...");
  console.log("This may take a few minutes...\n");

  try {
    const txId = await programManager.execute({
      programName: "token_registry.aleo",
      functionName: "register_token",
      inputs,
      priorityFee: 0,
      privateFee: false,
    });

    console.log("\n✅ Transaction submitted successfully!");
    console.log("Transaction ID:", txId);
    console.log("\nView on explorer:");
    console.log(`https://testnet.aleoscan.io/transaction?id=${txId}`);
  } catch (error) {
    console.error("\n❌ Transaction failed:", error.message || error);
    process.exit(1);
  }
}

main();
