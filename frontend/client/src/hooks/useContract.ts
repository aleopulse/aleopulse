/**
 * Contract Hook for LeoPulse on Aleo
 * Provides poll contract interactions via the Aleo wallet adapter
 */

import { useState, useCallback, useMemo } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useAleoWallet } from "@/hooks/useAleoWallet";
import { useAleoPolls } from "@/hooks/useAleoPolls";
import { createIndexer } from "@/lib/aleo-indexer";
import { POLL_STATUS, formatPollStatus, formatBlocksRemaining } from "@/lib/contract";
import { COIN_TYPES, formatTokenAmount } from "@/lib/tokens";
import { fieldToString } from "@/lib/aleo-encoding";

import type { Poll, PollWithMeta, CreatePollInput, VoteInput, TransactionResult, PlatformConfig, PollSettings, PollInvite, PollTicket } from "@/types/poll";
import { POLL_VISIBILITY } from "@/types/poll";

// Extended transaction result with sponsorship info
export interface TransactionResultWithSponsorship extends TransactionResult {
  sponsored?: boolean;
}

export function useContract() {
  const { config, network } = useNetwork();
  const { connected, address, executeTransaction, createPoll: createPollTx, vote: voteTx, getRecords } = useAleoWallet();
  const { usePollCount, usePoll, refreshPolls } = useAleoPolls();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = config.pollProgramId;

  // Get the active wallet address
  const activeAddress = address;

  // Create indexer for queries
  const indexer = useMemo(
    () => createIndexer(config.explorerApiUrl, config.provableApiUrl),
    [config.explorerApiUrl, config.provableApiUrl]
  );

  // Get current block height for time calculations
  const getCurrentBlock = useCallback(async (): Promise<number> => {
    const height = await indexer.getBlockHeight();
    return height ?? 0;
  }, [indexer]);

  // Helper to enrich poll with computed fields
  const enrichPoll = useCallback(
    async (poll: Poll): Promise<PollWithMeta> => {
      const currentBlock = await getCurrentBlock();
      const numericVotes = poll.votes.map((v) => Number(v));
      const totalVotes = numericVotes.reduce((sum, v) => sum + v, 0);
      const votePercentages = numericVotes.map((v) =>
        totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0
      );

      const isActive = poll.status === POLL_STATUS.ACTIVE && poll.end_time > currentBlock;

      return {
        ...poll,
        totalVotes,
        isActive,
        timeRemaining: formatBlocksRemaining(poll.end_time, currentBlock),
        votePercentages,
      };
    },
    [getCurrentBlock]
  );

  // Create a new poll
  const createPoll = useCallback(
    async (input: CreatePollInput): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        console.log("[useContract] Creating poll with input:", {
          title: input.title,
          options: input.options,
          rewardPerVote: input.rewardPerVote,
          maxVoters: input.maxVoters,
          durationSecs: input.durationSecs,
          fundAmount: input.fundAmount,
          tokenId: config.pulseTokenId,
        });

        const txId = await createPollTx({
          title: input.title,
          description: input.description,
          options: input.options,
          privacyMode: input.privacyMode ?? 0, // 0=Anonymous, 1=Semi-Private, 2=Identified
          showResultsLive: true,
          rewardPerVote: BigInt(input.rewardPerVote),
          maxVoters: BigInt(input.maxVoters),
          durationBlocks: input.durationSecs, // Treating seconds as blocks (~1 sec/block)
          fundAmount: BigInt(input.fundAmount),
          tokenId: config.pulseTokenId,
          visibility: input.visibility ?? 0, // 0=Public, 1=Private
        });

        console.log("[useContract] Transaction submitted, txId:", txId);

        return { hash: txId || "", success: !!txId };
      } catch (err) {
        console.error("[useContract] Create poll failed:", err);
        const message = err instanceof Error ? err.message : "Failed to create poll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, createPollTx, config.pulseTokenId]
  );

  // Create multiple polls in a batch (stub - not fully implemented)
  const createPollsBatch = useCallback(
    async (inputs: CreatePollInput[]): Promise<TransactionResultWithSponsorship & { pollIds: number[] }> => {
      setLoading(true);
      setError(null);

      try {
        // For now, create polls sequentially
        const pollIds: number[] = [];
        let lastTxId = "";

        for (const input of inputs) {
          const result = await createPoll(input);
          lastTxId = result.hash;
        }

        return { hash: lastTxId, success: true, pollIds };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create polls batch";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createPoll]
  );

  // Vote on a poll
  const vote = useCallback(
    async (input: VoteInput): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await voteTx(BigInt(input.pollId), input.optionIndex);
        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to vote";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, voteTx]
  );

  // Bulk vote on multiple polls
  const bulkVote = useCallback(
    async (pollIds: number[], optionIndices: number[]): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        if (pollIds.length !== optionIndices.length) {
          throw new Error("Poll IDs and option indices must have the same length");
        }

        // Call bulk_vote transition
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "bulk_vote",
          inputs: [
            JSON.stringify(pollIds.map((id) => `${id}u64`)),
            JSON.stringify(optionIndices.map((idx) => `${idx}u8`)),
          ],
        });

        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit bulk votes";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, executeTransaction, contractAddress]
  );

  // Issue invite to a private poll (requires PollTicket record)
  const inviteToPoll = useCallback(
    async (
      pollTicketData: string, // Serialized PollTicket record
      inviteeAddress: string,
      canVote: boolean,
      expiresBlock: number
    ): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "invite_to_poll",
          inputs: [
            pollTicketData, // The PollTicket record
            inviteeAddress,
            canVote ? "true" : "false",
            `${expiresBlock}u32`,
          ],
        });

        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to issue invite";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, executeTransaction, contractAddress]
  );

  // Vote on a private poll using PollInvite record
  const votePrivate = useCallback(
    async (
      pollInviteData: string, // Serialized PollInvite record
      optionIndex: number
    ): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        if (!connected) {
          throw new Error("Wallet not connected");
        }

        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "vote_private",
          inputs: [pollInviteData, `${optionIndex}u8`],
        });

        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to vote on private poll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [connected, executeTransaction, contractAddress]
  );

  // Check if a poll is private
  const isPollPrivate = useCallback(
    async (pollId: number): Promise<boolean> => {
      const value = await indexer.getMappingValue(contractAddress, "private_polls", `${pollId}u64`);
      return value === "true";
    },
    [indexer, contractAddress]
  );

  // Get poll settings (visibility, privacy mode, etc.)
  const getPollSettings = useCallback(
    async (pollId: number): Promise<PollSettings | null> => {
      try {
        const value = await indexer.getMappingValue(contractAddress, "poll_settings", `${pollId}u64`);
        if (!value) return null;

        // Parse PollSettings struct: { privacy_mode: Xu8, show_results_live: true/false, require_receipt: true/false, visibility: Yu8 }
        const match = value.match(/\{([^}]+)\}/);
        if (!match) return null;

        const content = match[1];
        const fields: Record<string, string> = {};

        const pairs = content.split(",").map((p) => p.trim());
        for (const pair of pairs) {
          const colonIndex = pair.indexOf(":");
          if (colonIndex > -1) {
            const key = pair.slice(0, colonIndex).trim();
            const val = pair.slice(colonIndex + 1).trim();
            if (key && val) {
              fields[key] = val;
            }
          }
        }

        return {
          privacy_mode: parseInt(fields.privacy_mode?.replace("u8", "") || "0", 10),
          show_results_live: fields.show_results_live === "true",
          require_receipt: fields.require_receipt === "true",
          visibility: parseInt(fields.visibility?.replace("u8", "") || "0", 10),
        };
      } catch (error) {
        console.error("Error fetching poll settings:", error);
        return null;
      }
    },
    [indexer, contractAddress]
  );

  // Get user's PollInvite records for accessible private polls
  const getUserPollInvites = useCallback(
    async (): Promise<PollInvite[]> => {
      if (!connected || !getRecords) {
        return [];
      }

      try {
        const records = await getRecords(contractAddress);
        if (!records || !Array.isArray(records)) return [];

        const invites: PollInvite[] = [];

        for (const record of records) {
          // Check if this is a PollInvite record
          if (record.recordName === "PollInvite" || record.data?.poll_id !== undefined) {
            try {
              const data = record.data || record;
              invites.push({
                owner: data.owner || address || "",
                poll_id: parseInt(String(data.poll_id).replace("u64", ""), 10),
                can_vote: data.can_vote === true || data.can_vote === "true",
                expires_block: parseInt(String(data.expires_block).replace("u32", ""), 10),
              });
            } catch (parseError) {
              console.error("Error parsing PollInvite record:", parseError);
            }
          }
        }

        return invites;
      } catch (error) {
        console.error("Error fetching PollInvite records:", error);
        return [];
      }
    },
    [connected, getRecords, contractAddress, address]
  );

  // Get user's PollTicket records (for poll creators to issue invites)
  const getPollTickets = useCallback(
    async (): Promise<PollTicket[]> => {
      if (!connected || !getRecords) {
        return [];
      }

      try {
        const records = await getRecords(contractAddress);
        if (!records || !Array.isArray(records)) return [];

        const tickets: PollTicket[] = [];

        for (const record of records) {
          // Check if this is a PollTicket record
          if (record.recordName === "PollTicket" || (record.data?.poll_id !== undefined && record.data?.can_vote === undefined)) {
            try {
              const data = record.data || record;
              // PollTicket has owner and poll_id, but no can_vote or expires_block
              if (data.can_vote === undefined && data.expires_block === undefined) {
                tickets.push({
                  owner: data.owner || address || "",
                  poll_id: parseInt(String(data.poll_id).replace("u64", ""), 10),
                });
              }
            } catch (parseError) {
              console.error("Error parsing PollTicket record:", parseError);
            }
          }
        }

        return tickets;
      } catch (error) {
        console.error("Error fetching PollTicket records:", error);
        return [];
      }
    },
    [connected, getRecords, contractAddress, address]
  );

  // Start claims on a poll
  const startClaims = useCallback(
    async (pollId: number, distributionMode: number): Promise<TransactionResult> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "start_claims",
          inputs: [`${pollId}u64`, `${distributionMode}u8`],
        });
        return { hash: txId || "", success: !!txId };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start claims";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Close a poll
  const closePoll = useCallback(
    async (pollId: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "close_poll",
          inputs: [`${pollId}u64`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to close poll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Fund an existing poll
  const fundPoll = useCallback(
    async (pollId: number, amount: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "fund_poll",
          inputs: [`${pollId}u64`, `${amount}u128`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fund poll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Claim reward
  const claimReward = useCallback(
    async (pollId: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "claim_reward",
          inputs: [`${pollId}u64`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to claim reward";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Distribute rewards (creator function)
  const distributeRewards = useCallback(
    async (pollId: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "distribute_rewards",
          inputs: [`${pollId}u64`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to distribute rewards";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Withdraw remaining funds
  const withdrawRemaining = useCallback(
    async (pollId: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "withdraw_remaining",
          inputs: [`${pollId}u64`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to withdraw funds";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // Finalize a poll
  const finalizePoll = useCallback(
    async (pollId: number, _coinType?: number): Promise<TransactionResultWithSponsorship> => {
      setLoading(true);
      setError(null);

      try {
        const txId = await executeTransaction({
          programId: contractAddress,
          functionName: "finalize_poll",
          inputs: [`${pollId}u64`],
        });
        return { hash: txId || "", success: !!txId, sponsored: false };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to finalize poll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeTransaction, contractAddress]
  );

  // ==================== View Functions ====================

  // Get poll count
  const getPollCount = useCallback(async (): Promise<number> => {
    const value = await indexer.getMappingValue(contractAddress, "poll_count", "0u8");
    return value ? parseInt(value.replace("u64", ""), 10) : 0;
  }, [indexer, contractAddress]);

  // Parse PollInfo struct from Aleo mapping value
  const parsePollFromMapping = useCallback((value: string, pollId: number): Poll | null => {
    if (!value) return null;

    try {
      // Aleo struct format: { field1: value1, field2: value2, ... }
      const match = value.match(/\{([^}]+)\}/);
      if (!match) return null;

      const content = match[1];
      const fields: Record<string, string> = {};

      // Parse field: value pairs
      const pairs = content.split(",").map((p) => p.trim());
      for (const pair of pairs) {
        const colonIndex = pair.indexOf(":");
        if (colonIndex > -1) {
          const key = pair.slice(0, colonIndex).trim();
          const val = pair.slice(colonIndex + 1).trim();
          if (key && val) {
            fields[key] = val;
          }
        }
      }

      return {
        id: pollId,
        creator: fields.creator || "",
        title: fieldToString(fields.title || "0field"),
        description: fieldToString(fields.description || "0field"),
        options: [], // Loaded separately
        votes: [], // Loaded from vote_counts mapping
        voters: [],
        reward_per_vote: parseInt(fields.reward_per_vote?.replace("u64", "") || "0", 10),
        reward_pool: parseInt(fields.reward_pool?.replace("u64", "") || "0", 10),
        max_voters: parseInt(fields.max_voters?.replace("u64", "") || "0", 10),
        distribution_mode: parseInt(fields.distribution_mode?.replace("u8", "") || "255", 10),
        claimed: [],
        rewards_distributed: false,
        end_time: parseInt(fields.end_block?.replace("u32", "") || "0", 10),
        status: parseInt(fields.status?.replace("u8", "") || "0", 10),
        coin_type_id: 1, // PULSE by default
        closed_at: parseInt(fields.closed_at?.replace("u32", "") || "0", 10),
      };
    } catch (error) {
      console.error("Error parsing poll:", error);
      return null;
    }
  }, []);

  // Get a single poll by ID
  const getPoll = useCallback(
    async (pollId: number): Promise<PollWithMeta | null> => {
      try {
        const value = await indexer.getMappingValue(contractAddress, "polls", `${pollId}u64`);
        if (!value) return null;

        const poll = parsePollFromMapping(value, pollId);
        if (!poll) return null;

        // The contract stores options with hashed keys (BHP256::hash_to_field)
        // We can't easily compute these hashes client-side, so we fetch all poll_options
        // and filter by poll_id. This is less efficient but works.
        try {
          const allOptions = await indexer.getMappingValues(contractAddress, "poll_options", { limit: 100 });
          const pollOptions: { index: number; text: string }[] = [];

          for (const opt of allOptions) {
            // Parse the PollOption struct: { poll_id: Xu64, index: Yu8, text: Zfield }
            const match = opt.value.match(/poll_id:\s*(\d+)u64.*index:\s*(\d+)u8.*text:\s*(\d+)field/);
            if (match) {
              const optPollId = parseInt(match[1], 10);
              const optIndex = parseInt(match[2], 10);
              const optText = fieldToString(match[3] + "field");

              if (optPollId === pollId) {
                pollOptions.push({ index: optIndex, text: optText });
              }
            }
          }

          // Sort by index and extract texts
          pollOptions.sort((a, b) => a.index - b.index);
          poll.options = pollOptions.map(o => o.text);

          // Fetch vote counts for each option
          // Vote counts also use hashed keys, so fetch all and filter
          const allVoteCounts = await indexer.getMappingValues(contractAddress, "vote_counts", { limit: 100 });
          const votes: number[] = new Array(poll.options.length).fill(0);

          // Note: vote_counts keys are same hashed keys as poll_options
          // Since we can't match them directly, we'll try to get total_voters instead
          const totalVotersValue = await indexer.getMappingValue(contractAddress, "total_voters", `${pollId}u64`);
          const totalVoters = totalVotersValue ? parseInt(totalVotersValue.replace("u64", ""), 10) : 0;

          // For now, set votes array with placeholder (actual per-option counts need hash matching)
          poll.votes = votes;

        } catch (optError) {
          console.error("Error fetching poll options:", optError);
          // Fallback: leave options empty
          poll.options = [];
          poll.votes = [];
        }

        return enrichPoll(poll);
      } catch (error) {
        console.error("Error fetching poll:", error);
        return null;
      }
    },
    [indexer, contractAddress, parsePollFromMapping, enrichPoll]
  );

  // Get all polls
  const getAllPolls = useCallback(async (): Promise<PollWithMeta[]> => {
    try {
      const count = await getPollCount();
      if (count === 0) return [];

      const polls: PollWithMeta[] = [];

      // Fetch polls in parallel (batch of 10)
      const batchSize = 10;
      for (let i = 0; i < count; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, count); j++) {
          batch.push(getPoll(j));
        }
        const results = await Promise.all(batch);
        polls.push(...results.filter((p): p is PollWithMeta => p !== null));
      }

      return polls;
    } catch (error) {
      console.error("Error fetching all polls:", error);
      return [];
    }
  }, [getPollCount, getPoll]);

  // Check if user has voted
  // NOTE: The contract uses `has_voted` mapping with BHP256 hash key which is hard to compute client-side.
  // This RPC query is unreliable. Prefer using useHasVoted hook from useVoteStatus.ts which uses indexer events.
  const hasVoted = useCallback(
    async (pollId: number, voterAddress?: string): Promise<boolean> => {
      const addr = voterAddress || activeAddress;
      if (!addr) return false;

      // Query the has_voted mapping - note: key should be BHP256 hash but we approximate
      // This may return false negatives; indexer-based approach is more reliable
      const key = `${pollId}u64_${addr}`;
      const value = await indexer.getMappingValue(contractAddress, "has_voted", key);
      return value === "true";
    },
    [indexer, contractAddress, activeAddress]
  );

  // Check if user has claimed reward
  const hasClaimed = useCallback(
    async (pollId: number, claimerAddress?: string): Promise<boolean> => {
      const addr = claimerAddress || activeAddress;
      if (!addr) return false;

      const key = `${pollId}u64_${addr}`;
      const value = await indexer.getMappingValue(contractAddress, "claimed", key);
      return value === "true";
    },
    [indexer, contractAddress, activeAddress]
  );

  // Get platform config (stub)
  const getPlatformConfig = useCallback(async (): Promise<PlatformConfig | null> => {
    const value = await indexer.getMappingValue(contractAddress, "platform_config", "0u8");
    if (!value) return null;

    // Parse the config struct
    return {
      feeBps: 100, // Default 1%
      treasury: "",
      totalFeesCollected: 0,
      claimPeriodSecs: 604800, // 7 days
    };
  }, [indexer, contractAddress]);

  // Get claim period
  const getClaimPeriod = useCallback(async (): Promise<number> => {
    const config = await getPlatformConfig();
    return config?.claimPeriodSecs ?? 604800;
  }, [getPlatformConfig]);

  // Check if poll can be finalized
  const canFinalizePoll = useCallback(async (pollId: number): Promise<boolean> => {
    // Would need to check poll status and claim period
    return false;
  }, []);

  // ==================== Questionnaire Functions (stubs) ====================

  const createQuestionnairePool = useCallback(
    async (
      _pollIds: number[],
      _rewardPerCompletion: bigint | number,
      _maxCompleters: number,
      _durationSecs: number,
      _fundAmount: bigint | number,
      _tokenAddress?: string,
      _coinTypeId?: number
    ): Promise<TransactionResult> => {
      throw new Error("Not implemented");
    },
    []
  );

  const markQuestionnaireCompleted = useCallback(
    async (_poolId: number, _completer?: string): Promise<TransactionResult> => {
      throw new Error("Not implemented");
    },
    []
  );

  const startQuestionnaireClaims = useCallback(
    async (_poolId: number): Promise<TransactionResult> => {
      throw new Error("Not implemented");
    },
    []
  );

  const claimQuestionnaireReward = useCallback(
    async (_poolId: number): Promise<TransactionResult> => {
      throw new Error("Not implemented");
    },
    []
  );

  const hasCompletedQuestionnaire = useCallback(
    async (_poolId: number, _address?: string): Promise<boolean> => false,
    []
  );

  const getQuestionnairePool = useCallback(
    async (_poolId: number): Promise<{
      reward_pool: number;
      reward_per_completion: number;
      completers: string[];
      claimed: string[];
      status: number;
      end_time: number;
    } | null> => null,
    []
  );

  const getQuestionnairePoolCount = useCallback(
    async (): Promise<number> => 0,
    []
  );

  const hasClaimedQuestionnaire = useCallback(
    async (_poolId: number, _address?: string): Promise<boolean> => false,
    []
  );

  // Admin stub
  const initializeFAVault = useCallback(
    async (_coinType: number): Promise<TransactionResult> => {
      throw new Error("Not implemented");
    },
    []
  );

  const isFAStoreInitialized = useCallback(
    async (_coinType: number): Promise<boolean> => false,
    []
  );

  return {
    // State
    loading,
    error,
    contractAddress,
    // Wallet info
    isPrivyWallet: false, // No Privy on Aleo
    activeAddress,

    // Write functions
    createPoll,
    createPollsBatch,
    vote,
    bulkVote,
    inviteToPoll,
    votePrivate,
    startClaims,
    closePoll,
    fundPoll,
    claimReward,
    distributeRewards,
    withdrawRemaining,
    finalizePoll,

    // Questionnaire pool write functions
    createQuestionnairePool,
    markQuestionnaireCompleted,
    startQuestionnaireClaims,
    claimQuestionnaireReward,

    // Read functions
    getPoll,
    getPollCount,
    hasVoted,
    hasClaimed,
    getAllPolls,
    getPlatformConfig,
    getClaimPeriod,
    canFinalizePoll,
    isFAStoreInitialized,
    isPollPrivate,
    getPollSettings,
    getUserPollInvites,
    getPollTickets,

    // Questionnaire pool read functions
    hasCompletedQuestionnaire,
    getQuestionnairePool,
    getQuestionnairePoolCount,
    hasClaimedQuestionnaire,

    // Admin functions
    initializeFAVault,

    // Helpers
    enrichPoll,
    refreshPolls,
  };
}
