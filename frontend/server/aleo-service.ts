/**
 * Aleo Service - Backend transaction execution
 * Used for admin operations like faucet minting
 */

import {
  Account,
  ProgramManager,
  AleoNetworkClient,
  NetworkRecordProvider,
  AleoKeyProvider,
} from "@provablehq/sdk";

// Token registry program on Aleo
const TOKEN_REGISTRY_PROGRAM = "token_registry.aleo";

// Faucet amount: 1000 PULSE with 6 decimals (matching token_registry)
const FAUCET_AMOUNT = "1000000000u128";

// No authorization required (max u32 value for public tokens)
const NO_AUTH_REQUIRED = "4294967295u32";

interface MintResult {
  success: boolean;
  txId?: string;
  error?: string;
}

/**
 * Get the API host URL (SDK adds /testnet automatically)
 */
function getApiHost(): string {
  return process.env.ALEO_API_URL || "https://api.explorer.provable.com/v1";
}

/**
 * Get the faucet minter account from environment
 */
function getMinterAccount(): Account {
  const privateKey = process.env.FAUCET_MINTER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FAUCET_MINTER_PRIVATE_KEY environment variable not set");
  }
  return new Account({ privateKey });
}

/**
 * Mint PULSE tokens to a recipient via token_registry.aleo
 * This is called after a user successfully claims from the faucet
 */
export async function mintPulseToRecipient(
  recipientAddress: string,
  tokenId: string = "100field"
): Promise<MintResult> {
  try {
    console.log(`[aleo-service] Minting PULSE to ${recipientAddress}`);

    const minterAccount = getMinterAccount();
    const apiHost = getApiHost();

    // Create key provider with caching
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);

    // Create network client and record provider for fee records
    const networkClient = new AleoNetworkClient(apiHost);
    const recordProvider = new NetworkRecordProvider(minterAccount, networkClient);

    // Create program manager with host URL
    const programManager = new ProgramManager(
      apiHost,
      keyProvider,
      recordProvider
    );
    programManager.setAccount(minterAccount);

    // Execute mint_public on token_registry.aleo
    // Function signature: mint_public(token_id: field, recipient: address, amount: u128, authorized_until: u32)
    const inputs = [
      tokenId,
      recipientAddress,
      FAUCET_AMOUNT,
      NO_AUTH_REQUIRED,
    ];

    console.log(`[aleo-service] Calling ${TOKEN_REGISTRY_PROGRAM}/mint_public with inputs:`, inputs);

    // Execute the transaction
    // priorityFee: 0 for minimum fee (base fee only)
    const txId = await programManager.execute({
      programName: TOKEN_REGISTRY_PROGRAM,
      functionName: "mint_public",
      inputs,
      priorityFee: 0,
      privateFee: false,
    });

    console.log(`[aleo-service] Mint transaction submitted: ${txId}`);

    return {
      success: true,
      txId: txId as string,
    };
  } catch (error) {
    console.error("[aleo-service] Mint error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during mint",
    };
  }
}

/**
 * Check if the minter account has the required role
 * Returns the minter address for verification
 */
export function getMinterAddress(): string | null {
  try {
    const account = getMinterAccount();
    return account.address().to_string();
  } catch {
    return null;
  }
}

/**
 * Verify the faucet minting is properly configured
 */
export function verifyFaucetConfig(): { configured: boolean; minterAddress: string | null; error?: string } {
  const minterAddress = getMinterAddress();

  if (!minterAddress) {
    return {
      configured: false,
      minterAddress: null,
      error: "FAUCET_MINTER_PRIVATE_KEY not configured",
    };
  }

  return {
    configured: true,
    minterAddress,
  };
}

/**
 * Query token balance from token_registry.aleo
 *
 * The token_registry uses BHP256::hash_to_field(TokenOwner { account, token_id }) as the mapping key.
 * Since we can't easily compute BHP256 hashes client-side, we use the Aleoscan indexer API
 * which tracks balance updates from transactions.
 */
export async function getTokenBalance(
  address: string,
  tokenId: string = "100field"
): Promise<{ balance: string; exists: boolean }> {
  const aleoscanApi = process.env.ALEOSCAN_API_URL || "https://api.testnet.aleoscan.io/v2";

  try {
    // Try Aleoscan's mapping values endpoint which lists all entries
    // and allows us to filter by value content
    const response = await fetch(
      `${aleoscanApi}/mapping/list_program_mapping_values/${TOKEN_REGISTRY_PROGRAM}/authorized_balances?limit=1000`
    );

    if (response.ok) {
      const data = await response.json();
      const results = data.result || [];

      // Search for a balance entry matching the address and token ID
      for (const entry of results) {
        const value = entry.value || "";
        // Balance struct format: { token_id: 100field, account: aleo1..., balance: 1000000u128, authorized_until: 4294967295u32 }
        if (value.includes(`account: ${address}`) && value.includes(`token_id: ${tokenId}`)) {
          const balanceMatch = value.match(/balance:\s*(\d+)u128/);
          if (balanceMatch) {
            return { balance: balanceMatch[1], exists: true };
          }
        }
      }
    }

    // If not found in authorized_balances, try the regular balances mapping
    const balancesResponse = await fetch(
      `${aleoscanApi}/mapping/list_program_mapping_values/${TOKEN_REGISTRY_PROGRAM}/balances?limit=1000`
    );

    if (balancesResponse.ok) {
      const data = await balancesResponse.json();
      const results = data.result || [];

      for (const entry of results) {
        const value = entry.value || "";
        if (value.includes(`account: ${address}`) && value.includes(`token_id: ${tokenId}`)) {
          const balanceMatch = value.match(/balance:\s*(\d+)u128/);
          if (balanceMatch) {
            return { balance: balanceMatch[1], exists: true };
          }
        }
      }
    }

    return { balance: "0", exists: false };
  } catch (error) {
    console.error("[aleo-service] Balance query error:", error);
    return { balance: "0", exists: false };
  }
}
