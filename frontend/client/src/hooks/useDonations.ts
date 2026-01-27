/**
 * Donations Hook for LeoPulse
 * Handles privacy-preserving donations with public, anonymous, and semi-anonymous modes
 */

import { useState, useCallback, useMemo } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useAleoWallet } from "@/hooks/useAleoWallet";
import { createIndexer } from "@/lib/aleo-indexer";
import {
  DONATION_PRIVACY,
  type DonationPrivacyMode,
  type DonationInput,
  type DonationReceipt,
  type PublicDonation,
  type PollDonationStats,
} from "@/types/poll";
import type { TransactionResult } from "@/types/poll";

// Local storage keys for nonce management
const DONATION_NONCE_PREFIX = "leopulse_donation_nonce_";
const DONATION_RECEIPTS_KEY = "leopulse_donation_receipts";

interface StoredDonationNonce {
  pollId: number;
  nonce: string;
  amount: number;
  privacyMode: DonationPrivacyMode;
  timestamp: number;
  commitmentHash?: string;
}

interface StoredDonationReceipt {
  pollId: number;
  amount: number;
  privacyMode: DonationPrivacyMode;
  commitmentHash: string;
  timestamp: number;
  isRevealed: boolean;
}

/**
 * Generate a cryptographically secure nonce for anonymous donations
 * Returns a scalar string in Aleo format
 */
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  // Convert to hex and format as Aleo scalar
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  // Aleo scalars are typically smaller, truncate to safe size
  return `${hex.slice(0, 62)}scalar`;
}

/**
 * Store nonce locally for later proof generation
 */
function storeNonce(address: string, data: StoredDonationNonce): void {
  try {
    const key = `${DONATION_NONCE_PREFIX}${address}`;
    const existing = localStorage.getItem(key);
    const nonces: StoredDonationNonce[] = existing ? JSON.parse(existing) : [];
    nonces.unshift(data);
    // Keep last 100 nonces
    localStorage.setItem(key, JSON.stringify(nonces.slice(0, 100)));
  } catch (error) {
    console.error("Failed to store donation nonce:", error);
  }
}

/**
 * Get stored nonces for an address
 */
function getStoredNonces(address: string): StoredDonationNonce[] {
  try {
    const key = `${DONATION_NONCE_PREFIX}${address}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Store donation receipt locally for later reveal or proof
 */
function storeDonationReceipt(address: string, receipt: StoredDonationReceipt): void {
  try {
    const key = `${DONATION_RECEIPTS_KEY}_${address}`;
    const existing = localStorage.getItem(key);
    const receipts: StoredDonationReceipt[] = existing ? JSON.parse(existing) : [];
    receipts.unshift(receipt);
    localStorage.setItem(key, JSON.stringify(receipts.slice(0, 100)));
  } catch (error) {
    console.error("Failed to store donation receipt:", error);
  }
}

/**
 * Get stored donation receipts for an address
 */
function getStoredReceipts(address: string): StoredDonationReceipt[] {
  try {
    const key = `${DONATION_RECEIPTS_KEY}_${address}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a receipt as revealed
 */
function markReceiptRevealed(address: string, commitmentHash: string): void {
  try {
    const key = `${DONATION_RECEIPTS_KEY}_${address}`;
    const existing = localStorage.getItem(key);
    if (!existing) return;

    const receipts: StoredDonationReceipt[] = JSON.parse(existing);
    const updated = receipts.map(r =>
      r.commitmentHash === commitmentHash ? { ...r, isRevealed: true } : r
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to mark receipt as revealed:", error);
  }
}

export function useDonations() {
  const { config } = useNetwork();
  const { connected, address, executeTransaction, getRecords } = useAleoWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = config.pollProgramId;

  // Create indexer for queries
  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  /**
   * Donate to a poll with specified privacy mode
   */
  const donate = useCallback(
    async (input: DonationInput): Promise<TransactionResult & { receipt?: DonationReceipt }> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected || !address) {
          throw new Error("Wallet not connected");
        }

        const { pollId, amount, privacyMode } = input;

        if (amount <= 0) {
          throw new Error("Amount must be greater than 0");
        }

        let txId: string | null | undefined;
        let commitmentHash: string | undefined;

        if (privacyMode === DONATION_PRIVACY.PUBLIC) {
          // Public donation - donor address visible
          txId = await executeTransaction({
            programId: contractAddress,
            functionName: "fund_poll_public",
            inputs: [`${pollId}u64`, `${amount}u64`],
          });
        } else {
          // Anonymous or Semi-Anonymous donation
          const nonce = generateNonce();
          const functionName = privacyMode === DONATION_PRIVACY.ANONYMOUS
            ? "fund_poll_anonymous"
            : "fund_poll_semi_anon";

          txId = await executeTransaction({
            programId: contractAddress,
            functionName,
            inputs: [`${pollId}u64`, `${amount}u64`, nonce],
          });

          // Store nonce locally for later proof generation
          // Note: The commitment hash is computed in the contract, we'd need to
          // compute it client-side to store it, or fetch it from the transaction
          storeNonce(address, {
            pollId,
            nonce,
            amount,
            privacyMode,
            timestamp: Date.now(),
          });

          // For semi-anonymous, also store as receipt for potential reveal
          if (privacyMode === DONATION_PRIVACY.SEMI_ANONYMOUS) {
            // Note: In production, we'd compute the commitment hash client-side
            // using the same BHP256 hash function as the contract
            storeDonationReceipt(address, {
              pollId,
              amount,
              privacyMode,
              commitmentHash: commitmentHash || `pending_${Date.now()}`,
              timestamp: Date.now(),
              isRevealed: false,
            });
          }
        }

        return {
          hash: txId || "",
          success: !!txId,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to donate";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, address, executeTransaction, contractAddress]
  );

  /**
   * Reveal a semi-anonymous donation
   * Requires the DonationReceipt record from the wallet
   */
  const revealDonation = useCallback(
    async (receiptData: string): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected || !address) {
          throw new Error("Wallet not connected");
        }

        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "reveal_donation",
          inputs: [receiptData],
        });

        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reveal donation";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, address, executeTransaction, contractAddress]
  );

  /**
   * Get donation statistics for a poll
   */
  const getPollDonationStats = useCallback(
    async (pollId: number): Promise<PollDonationStats> => {
      try {
        // Get total donations
        const totalValue = await indexer.getMappingValue(
          contractAddress,
          "poll_total_donations",
          `${pollId}u64`
        );
        const totalAmount = totalValue
          ? parseInt(totalValue.replace("u64", ""), 10)
          : 0;

        // Get total count
        const countValue = await indexer.getMappingValue(
          contractAddress,
          "poll_donation_count",
          `${pollId}u64`
        );
        const totalCount = countValue
          ? parseInt(countValue.replace("u64", ""), 10)
          : 0;

        // Get public donation count
        const publicCountValue = await indexer.getMappingValue(
          contractAddress,
          "public_donation_count",
          `${pollId}u64`
        );
        const publicCount = publicCountValue
          ? parseInt(publicCountValue.replace("u64", ""), 10)
          : 0;

        // Fetch public donations
        const publicDonations: PublicDonation[] = [];
        for (let i = 0; i < publicCount; i++) {
          try {
            // The key is BHP256::hash_to_field(poll_id as field + i as field)
            // We can't compute this client-side, so we'd need an indexer that tracks these
            // For now, we'll return empty array and rely on backend indexing
          } catch (err) {
            console.error(`Error fetching public donation ${i}:`, err);
          }
        }

        return {
          totalAmount,
          totalCount,
          publicDonations,
          publicCount,
          anonymousCount: totalCount - publicCount,
        };
      } catch (error) {
        console.error("Error fetching donation stats:", error);
        return {
          totalAmount: 0,
          totalCount: 0,
          publicDonations: [],
          publicCount: 0,
          anonymousCount: 0,
        };
      }
    },
    [indexer, contractAddress]
  );

  /**
   * Get user's DonationReceipt records from wallet
   */
  const getUserDonationReceipts = useCallback(
    async (): Promise<DonationReceipt[]> => {
      if (!connected || !getRecords) {
        return [];
      }

      try {
        const records = await getRecords(contractAddress);
        if (!records || !Array.isArray(records)) return [];

        const receipts: DonationReceipt[] = [];

        for (const record of records) {
          // Check if this is a DonationReceipt record
          if (record.recordName === "DonationReceipt" ||
              (record.data?.commitment_hash !== undefined && record.data?.privacy_mode !== undefined)) {
            try {
              const data = record.data || record;
              receipts.push({
                owner: data.owner || address || "",
                poll_id: parseInt(String(data.poll_id).replace("u64", ""), 10),
                amount: parseInt(String(data.amount).replace("u64", ""), 10),
                privacy_mode: parseInt(String(data.privacy_mode).replace("u8", ""), 10) as DonationPrivacyMode,
                donated_at: parseInt(String(data.donated_at).replace("u32", ""), 10),
                commitment_hash: String(data.commitment_hash).replace("field", ""),
              });
            } catch (parseError) {
              console.error("Error parsing DonationReceipt record:", parseError);
            }
          }
        }

        return receipts;
      } catch (error) {
        console.error("Error fetching DonationReceipt records:", error);
        return [];
      }
    },
    [connected, getRecords, contractAddress, address]
  );

  /**
   * Get locally stored donation nonces (for proof generation)
   */
  const getStoredDonationNonces = useCallback((): StoredDonationNonce[] => {
    if (!address) return [];
    return getStoredNonces(address);
  }, [address]);

  /**
   * Get locally stored donation receipts (for reveal tracking)
   */
  const getStoredDonationReceipts = useCallback((): StoredDonationReceipt[] => {
    if (!address) return [];
    return getStoredReceipts(address);
  }, [address]);

  return {
    // State
    loading,
    error,

    // Actions
    donate,
    revealDonation,

    // Queries
    getPollDonationStats,
    getUserDonationReceipts,
    getStoredDonationNonces,
    getStoredDonationReceipts,

    // Utilities
    generateNonce,
  };
}
