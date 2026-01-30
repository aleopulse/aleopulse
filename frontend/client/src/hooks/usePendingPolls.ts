/**
 * Hook for managing pending polls (optimistic UI)
 * Provides instant feedback while waiting for on-chain confirmation
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { toast } from "sonner";

export interface PendingPoll {
  id: string;
  walletAddress: string;
  txHash: string | null;
  title: string;
  description: string | null;
  options: string[];
  rewardPerVote: string;
  maxVoters: number;
  durationBlocks: number;
  fundAmount: string;
  tokenId: string;
  privacyMode: number;
  visibility: number;
  status: number;
  onChainId: number | null;
  network: string;
  createdAt: string;
  confirmedAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  expiresAt: string | null;
}

export const PENDING_POLL_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  FAILED: 2,
} as const;

interface CreatePendingPollInput {
  txHash?: string;
  title: string;
  description?: string;
  options: string[];
  rewardPerVote: number | bigint;
  maxVoters: number;
  durationBlocks: number;
  fundAmount: number | bigint;
  tokenId?: string;
  privacyMode?: number;
  visibility?: number;
}

export function usePendingPolls() {
  const { network } = useNetwork();
  const { address } = useWalletConnection();
  const [pendingPolls, setPendingPolls] = useState<PendingPoll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch pending polls from database
  const fetchPendingPolls = useCallback(async () => {
    if (!address) {
      setPendingPolls([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/polls/pending/${address}?network=${network}`
      );
      const data = await response.json();

      if (data.success) {
        setPendingPolls(data.data || []);
      }
    } catch (error) {
      console.error("[usePendingPolls] Failed to fetch pending polls:", error);
    }
  }, [address, network]);

  // Create a pending poll (called after wallet approval)
  const createPendingPoll = useCallback(
    async (input: CreatePendingPollInput): Promise<PendingPoll | null> => {
      console.log("[usePendingPolls] createPendingPoll called with:", {
        address,
        network,
        txHash: input.txHash,
        title: input.title,
      });

      if (!address) {
        console.error("[usePendingPolls] No wallet connected - address is:", address);
        return null;
      }

      setIsLoading(true);

      try {
        const requestBody = {
          walletAddress: address,
          txHash: input.txHash,
          title: input.title,
          description: input.description,
          options: input.options,
          rewardPerVote: input.rewardPerVote.toString(),
          maxVoters: input.maxVoters,
          durationBlocks: input.durationBlocks,
          fundAmount: input.fundAmount.toString(),
          tokenId: input.tokenId || "100field",
          privacyMode: input.privacyMode || 0,
          visibility: input.visibility || 0,
          network,
        };
        console.log("[usePendingPolls] Sending request to /api/polls/pending:", requestBody);

        const response = await fetch("/api/polls/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        console.log("[usePendingPolls] Response status:", response.status);
        const data = await response.json();
        console.log("[usePendingPolls] Response data:", data);

        if (data.success) {
          console.log("[usePendingPolls] Created pending poll:", data.data.id);
          setPendingPolls((prev) => [data.data, ...prev]);
          return data.data;
        } else {
          console.error("[usePendingPolls] Failed to create pending poll:", data.error);
          return null;
        }
      } catch (error) {
        console.error("[usePendingPolls] Error creating pending poll:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, network]
  );

  // Mark a pending poll as confirmed
  const confirmPendingPoll = useCallback(
    async (pendingPollId: string, onChainId: number) => {
      try {
        const response = await fetch(`/api/polls/pending/${pendingPollId}/confirm`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onChainId }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(`[usePendingPolls] Confirmed poll ${pendingPollId} -> on-chain ${onChainId}`);
          setPendingPolls((prev) =>
            prev.filter((p) => p.id !== pendingPollId)
          );
          toast.success("Poll confirmed on-chain!", {
            description: "Your poll is now live and accepting votes.",
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error("[usePendingPolls] Error confirming poll:", error);
        return false;
      }
    },
    []
  );

  // Mark a pending poll as failed
  const failPendingPoll = useCallback(
    async (pendingPollId: string, errorMessage?: string) => {
      try {
        const response = await fetch(`/api/polls/pending/${pendingPollId}/fail`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorMessage }),
        });

        const data = await response.json();

        if (data.success) {
          console.log(`[usePendingPolls] Failed poll ${pendingPollId}: ${errorMessage}`);
          setPendingPolls((prev) =>
            prev.map((p) =>
              p.id === pendingPollId
                ? { ...p, status: PENDING_POLL_STATUS.FAILED, errorMessage: errorMessage || null }
                : p
            )
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("[usePendingPolls] Error marking poll as failed:", error);
        return false;
      }
    },
    []
  );

  // Delete/dismiss a pending poll
  const dismissPendingPoll = useCallback(
    async (pendingPollId: string) => {
      try {
        const response = await fetch(`/api/polls/pending/${pendingPollId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });

        const data = await response.json();

        if (data.success) {
          setPendingPolls((prev) => prev.filter((p) => p.id !== pendingPollId));
          return true;
        }
        return false;
      } catch (error) {
        console.error("[usePendingPolls] Error dismissing poll:", error);
        return false;
      }
    },
    [address]
  );

  // Check if a pending poll has been confirmed on-chain
  const checkOnChainConfirmation = useCallback(
    async (pendingPoll: PendingPoll, currentPollCount: number) => {
      // If we have a txHash, we could query the transaction status
      // For now, we check if poll count increased and match by title/creator

      // Simple heuristic: if poll count increased, check if any new poll matches
      // This will be called by the Dashboard when it fetches on-chain polls
      return false;
    },
    []
  );

  // Fetch on mount and when address/network changes
  useEffect(() => {
    fetchPendingPolls();
  }, [fetchPendingPolls]);

  // Poll for updates every 10 seconds while there are pending polls
  useEffect(() => {
    if (pendingPolls.length > 0) {
      pollingRef.current = setInterval(() => {
        fetchPendingPolls();
      }, 10000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pendingPolls.length, fetchPendingPolls]);

  return {
    pendingPolls,
    isLoading,
    createPendingPoll,
    confirmPendingPoll,
    failPendingPoll,
    dismissPendingPoll,
    fetchPendingPolls,
    checkOnChainConfirmation,
  };
}
