/**
 * Faucet utility for LeoPulse on Aleo testnet
 * Claims PULSE tokens from the leopulse_token.aleo faucet function
 */

import { useAleoWallet } from "@/hooks/useAleoWallet";

interface FaucetResult {
  success: boolean;
  txId?: string;
  error?: string;
}

/**
 * Claim PULSE tokens from the testnet faucet
 * This calls the `faucet` transition on the leopulse_token.aleo program
 */
export async function claimPulseFaucet(
  executeTransaction: ReturnType<typeof useAleoWallet>["executeTransaction"],
  pulseProgramId: string
): Promise<FaucetResult> {
  try {
    const txId = await executeTransaction({
      programId: pulseProgramId,
      functionName: "faucet",
      inputs: [],
      fee: 100000, // 0.1 credits
    });

    if (!txId) {
      return {
        success: false,
        error: "Transaction failed - no transaction ID returned",
      };
    }

    return {
      success: true,
      txId,
    };
  } catch (error) {
    console.error("Faucet claim error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown faucet error",
    };
  }
}

/**
 * Check if an account has already claimed from faucet
 * Queries the `claimed` mapping on the leopulse_token.aleo program
 */
export async function checkFaucetClaimed(
  address: string,
  pulseProgramId: string,
  provableApiUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${provableApiUrl}/testnet/program/${pulseProgramId}/mapping/claimed/${address}`
    );

    if (!response.ok) {
      // 404 means not claimed yet
      if (response.status === 404) {
        return false;
      }
      throw new Error(`Failed to check faucet status: ${response.status}`);
    }

    const data = await response.json();
    return data === "true";
  } catch (error) {
    console.error("Error checking faucet status:", error);
    return false;
  }
}

/**
 * Get Aleo testnet faucet URL for credits
 * Note: For native Aleo credits, users should use the official Aleo faucet
 */
export function getAleoFaucetUrl(): string {
  return "https://faucet.aleo.org/";
}
