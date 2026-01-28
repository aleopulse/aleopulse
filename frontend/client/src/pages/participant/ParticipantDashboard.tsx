import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { ParticipantLayout } from "@/components/layouts/ParticipantLayout";
import { PollCard } from "@/components/PollCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Vote,
  Clock,
  Coins,
  Zap,
  RefreshCcw,
  AlertCircle,
  ArrowUpRight,
  Gift,
  Loader2,
  Sparkles,
} from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { TierProgressBar } from "@/components/TierProgressBar";
import { TIER_VOTE_LIMITS, TIERS } from "@shared/schema";
import { useContract } from "@/hooks/useContract";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { usePolls } from "@/hooks/usePolls";
import { useUserPollStatus } from "@/hooks/useUserPollStatus";
import { isIndexerOptimizationEnabled } from "@/lib/feature-flags";
import type { PollWithMeta } from "@/types/poll";
import { POLL_STATUS, DISTRIBUTION_MODE } from "@/types/poll";
import { COIN_TYPES, getCoinSymbol, type CoinTypeId } from "@/lib/tokens";
import { useNetwork } from "@/contexts/NetworkContext";
import { showTransactionSuccessToast, showTransactionErrorToast } from "@/lib/transaction-feedback";

export default function ParticipantDashboard() {
  const { isConnected, address } = useWalletConnection();
  const { hasVoted, hasClaimed, claimReward, contractAddress } = useContract();
  const { config } = useNetwork();

  // Use optimized hooks when feature flag is enabled
  const { polls: cachedPolls, isLoading: pollsLoading, refresh: refreshPolls } = usePolls();
  const { votedPolls: indexedVotedPolls, claimedPolls: indexedClaimedPolls, isOptimized } = useUserPollStatus(address ?? undefined);

  // Local state for RPC-based status (fallback when optimization is disabled)
  const [rpcVotedPollIds, setRpcVotedPollIds] = useState<Set<number>>(new Set());
  const [rpcClaimedPollIds, setRpcClaimedPollIds] = useState<Set<number>>(new Set());
  const [isRpcStatusLoading, setIsRpcStatusLoading] = useState(false);
  const [claimingPollId, setClaimingPollId] = useState<number | null>(null);
  const [isBulkClaiming, setIsBulkClaiming] = useState(false);
  const [bulkClaimProgress, setBulkClaimProgress] = useState({ current: 0, total: 0 });

  // Mock tier data - in production, fetch from contract or user profile
  // TODO: Integrate with actual tier system when available
  const userTier = TIERS.BRONZE;
  const dailyVoteLimit = TIER_VOTE_LIMITS[userTier as keyof typeof TIER_VOTE_LIMITS] || 3;
  const votesToday = 0; // TODO: Track actual votes today
  const userPulseBalance = BigInt(0); // TODO: Fetch from wallet/contract
  const nextTierXp = BigInt(100 * 1e6); // Example threshold

  // Calculate time until daily vote reset (midnight UTC)
  const getResetCountdown = () => {
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const [resetCountdown, setResetCountdown] = useState(getResetCountdown());

  // Update countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setResetCountdown(getResetCountdown());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sorted polls
  const polls = useMemo(() => {
    return [...cachedPolls].sort((a, b) => b.id - a.id);
  }, [cachedPolls]);

  // Use indexed data when available, fall back to RPC data
  const votedPollIds = isOptimized ? indexedVotedPolls : rpcVotedPollIds;
  const claimedPollIds = isOptimized ? indexedClaimedPolls : rpcClaimedPollIds;

  // Fetch vote/claim status via RPC when optimization is disabled
  const fetchRpcStatus = useCallback(async () => {
    if (!contractAddress || !address || isOptimized) return;

    setIsRpcStatusLoading(true);
    try {
      const votedIds = new Set<number>();
      const claimedIds = new Set<number>();
      for (const poll of polls) {
        const voted = await hasVoted(poll.id);
        if (voted) {
          votedIds.add(poll.id);
          const claimed = await hasClaimed(poll.id);
          if (claimed) {
            claimedIds.add(poll.id);
          }
        }
      }
      setRpcVotedPollIds(votedIds);
      setRpcClaimedPollIds(claimedIds);
    } catch (error) {
      console.error("Failed to fetch vote status:", error);
    } finally {
      setIsRpcStatusLoading(false);
    }
  }, [contractAddress, address, polls, hasVoted, hasClaimed, isOptimized]);

  useEffect(() => {
    if (!isOptimized && polls.length > 0 && address) {
      fetchRpcStatus();
    }
  }, [isOptimized, polls.length, address, fetchRpcStatus]);

  const isLoading = pollsLoading || (!isOptimized && isRpcStatusLoading);

  // Refresh function
  const fetchPolls = useCallback(async () => {
    await refreshPolls();
    if (!isOptimized) {
      await fetchRpcStatus();
    }
  }, [refreshPolls, fetchRpcStatus, isOptimized]);

  // Get polls the user has voted on
  const votedPolls = useMemo(() => {
    return polls.filter((p) => votedPollIds.has(p.id));
  }, [polls, votedPollIds]);

  // Get polls available to claim
  const claimablePolls = useMemo(() => {
    return votedPolls.filter(
      (p) =>
        p.status === POLL_STATUS.CLAIMING &&
        p.distribution_mode === DISTRIBUTION_MODE.MANUAL_PULL &&
        !claimedPollIds.has(p.id) &&
        p.reward_pool > 0
    );
  }, [votedPolls, claimedPollIds]);

  // Get active polls the user hasn't voted on
  const availablePolls = useMemo(() => {
    return polls.filter((p) => p.isActive && !votedPollIds.has(p.id));
  }, [polls, votedPollIds]);

  // Calculate stats - group rewards by token type (exclude MOVE, only show PULSE and USDC)
  const stats = useMemo(() => {
    // Group pending rewards by coin type
    const pendingByToken: Record<string, number> = {};
    claimablePolls.forEach((p) => {
      // Skip MOVE (coin_type_id = 0), only aggregate PULSE and USDC
      if (p.coin_type_id === COIN_TYPES.MOVE) return;
      const perVoter = p.reward_per_vote > 0
        ? p.reward_per_vote / 1e6
        : p.totalVotes > 0
        ? (p.reward_pool / 1e6) / p.totalVotes
        : 0;
      const coinSymbol = getCoinSymbol(p.coin_type_id as CoinTypeId);
      pendingByToken[coinSymbol] = (pendingByToken[coinSymbol] || 0) + perVoter;
    });

    // Group claimed rewards by coin type (polls user has voted on and claimed)
    const earnedByToken: Record<string, number> = {};
    votedPolls.forEach((p) => {
      // Skip MOVE (coin_type_id = 0), only aggregate PULSE and USDC
      if (p.coin_type_id === COIN_TYPES.MOVE) return;
      if (claimedPollIds.has(p.id) && p.reward_pool > 0) {
        const perVoter = p.reward_per_vote > 0
          ? p.reward_per_vote / 1e6
          : p.totalVotes > 0
          ? (p.reward_pool / 1e6) / p.totalVotes
          : 0;
        const coinSymbol = getCoinSymbol(p.coin_type_id as CoinTypeId);
        earnedByToken[coinSymbol] = (earnedByToken[coinSymbol] || 0) + perVoter;
      }
    });

    return {
      pollsVoted: votedPolls.length,
      pendingByToken,
      earnedByToken,
      activePolls: availablePolls.length,
    };
  }, [votedPolls, claimablePolls, claimedPollIds, availablePolls]);

  // Handle claim reward
  const handleClaim = async (pollId: number, coinTypeId: CoinTypeId) => {
    setClaimingPollId(pollId);
    try {
      const result = await claimReward(pollId, coinTypeId);
      showTransactionSuccessToast(
        result.hash,
        "Reward Claimed!",
        "Your reward has been transferred to your wallet.",
        config.explorerUrl,
        result.sponsored
      );
      setRpcClaimedPollIds((prev: Set<number>) => new Set(prev).add(pollId));
    } catch (error) {
      console.error("Failed to claim:", error);
      showTransactionErrorToast("Failed to claim reward", error instanceof Error ? error : "Transaction failed");
    } finally {
      setClaimingPollId(null);
    }
  };

  // Handle bulk claim all rewards
  const handleBulkClaim = async () => {
    if (claimablePolls.length === 0) return;

    setIsBulkClaiming(true);
    setBulkClaimProgress({ current: 0, total: claimablePolls.length });

    const successfulClaims: number[] = [];
    const failedClaims: number[] = [];

    for (let i = 0; i < claimablePolls.length; i++) {
      const poll = claimablePolls[i];
      setBulkClaimProgress({ current: i + 1, total: claimablePolls.length });

      try {
        await claimReward(poll.id, poll.coin_type_id as CoinTypeId);
        successfulClaims.push(poll.id);
        setRpcClaimedPollIds((prev: Set<number>) => new Set(prev).add(poll.id));
      } catch (error) {
        console.error(`Failed to claim poll ${poll.id}:`, error);
        failedClaims.push(poll.id);
      }
    }

    setIsBulkClaiming(false);
    setBulkClaimProgress({ current: 0, total: 0 });

    if (successfulClaims.length > 0) {
      showTransactionSuccessToast(
        "",
        `Claimed ${successfulClaims.length} Rewards!`,
        failedClaims.length > 0
          ? `${failedClaims.length} claims failed. You can try them individually.`
          : "All rewards have been transferred to your wallet.",
        config.explorerUrl,
        false
      );
    } else if (failedClaims.length > 0) {
      showTransactionErrorToast(
        "Bulk claim failed",
        "Could not claim any rewards. Please try again."
      );
    }
  };

  // Render poll card
  const renderPollCard = (poll: PollWithMeta, hasVoted: boolean = false) => {
    const rewardPool = poll.reward_pool / 1e6;
    const coinSymbol = getCoinSymbol(poll.coin_type_id as CoinTypeId);
    return (
      <PollCard
        key={poll.id}
        id={poll.id.toString()}
        title={poll.title}
        description={poll.description}
        votes={poll.totalVotes}
        timeLeft={poll.timeRemaining}
        reward={rewardPool > 0 ? `${rewardPool.toFixed(2)} ${coinSymbol}` : undefined}
        status={poll.isActive ? "active" : "closed"}
        tags={[]}
        hasVoted={hasVoted}
      />
    );
  };

  // Loading skeleton
  const StatSkeleton = () => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );

  const PollSkeleton = () => (
    <Skeleton className="h-48 w-full rounded-xl" />
  );

  if (!isConnected) {
    return (
      <ParticipantLayout title="Participant Dashboard" description="Track your votes and rewards">
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-yellow-600 dark:text-yellow-400">
              Please connect your wallet to view your participant dashboard.
            </p>
          </CardContent>
        </Card>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout title="Participant Dashboard" description="Track your votes and rewards">
      {/* Hidden tour welcome target */}
      <div data-tour="participant-welcome" className="sr-only" />

      {/* Tier Progress Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <TierBadge tier={userTier} size="lg" showTooltip={true} />
            <div>
              <p className="text-sm text-muted-foreground">Daily Votes</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold font-mono">{votesToday}/{dailyVoteLimit}</p>
                <Progress
                  value={(votesToday / dailyVoteLimit) * 100}
                  className="w-20 h-2"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-[200px]">
            <TierProgressBar
              currentPulse={userPulseBalance}
              currentTier={userTier}
              showLabels={true}
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Resets in</p>
            <p className="font-mono text-lg font-bold">{resetCountdown}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div data-tour="participant-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Polls Voted</p>
                  <Vote className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold font-mono mt-2">{stats.pollsVoted}</p>
                <p className="text-xs text-muted-foreground mt-1">Total participation</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending Rewards</p>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  {Object.keys(stats.pendingByToken).length === 0 ? (
                    <p className="text-3xl font-bold font-mono">0</p>
                  ) : (
                    Object.entries(stats.pendingByToken).map(([token, amount]) => (
                      <p key={token} className="text-2xl font-bold font-mono">
                        {amount.toFixed(4)} <span className="text-base">{token}</span>
                      </p>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ready to claim</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <Coins className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  {Object.keys(stats.earnedByToken).length === 0 ? (
                    <p className="text-3xl font-bold font-mono">0</p>
                  ) : (
                    Object.entries(stats.earnedByToken).map(([token, amount]) => (
                      <p key={token} className="text-2xl font-bold font-mono">
                        {amount.toFixed(4)} <span className="text-base">{token}</span>
                      </p>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All time rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active Polls</p>
                  <Zap className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold font-mono mt-2">{stats.activePolls}</p>
                <p className="text-xs text-muted-foreground mt-1">Available to vote</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Claimable Rewards Section */}
      {claimablePolls.length > 0 && (
        <Card data-tour="claimable-rewards" className="mb-8 border-green-500/30 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Polls to Claim ({claimablePolls.length})
            </CardTitle>
            <Button
              onClick={handleBulkClaim}
              disabled={isBulkClaiming || claimingPollId !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {isBulkClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming {bulkClaimProgress.current}/{bulkClaimProgress.total}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Claim All
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claimablePolls.map((poll) => {
                const perVoter = poll.reward_per_vote > 0
                  ? poll.reward_per_vote / 1e6
                  : poll.totalVotes > 0
                  ? (poll.reward_pool / 1e6) / poll.totalVotes
                  : 0;
                const coinSymbol = getCoinSymbol(poll.coin_type_id as CoinTypeId);
                return (
                  <div
                    key={poll.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div>
                      <Link href={`/poll/${poll.id}`}>
                        <p className="font-medium hover:text-primary transition-colors">
                          {poll.title}
                        </p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        ~{perVoter.toFixed(4)} {coinSymbol} available
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleClaim(poll.id, poll.coin_type_id as CoinTypeId)}
                      disabled={claimingPollId === poll.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {claimingPollId === poll.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...
                        </>
                      ) : (
                        "Claim"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Votes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Votes</h2>
          <Link href="/participant/history">
            <Button variant="outline" size="sm">
              View All <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PollSkeleton />
            <PollSkeleton />
            <PollSkeleton />
          </div>
        ) : votedPolls.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't voted on any polls yet.
              </p>
              <Link href="/dashboard">
                <Button>
                  Explore Polls <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {votedPolls.slice(0, 3).map((poll) => (
              <div key={poll.id} className="relative">
                {renderPollCard(poll, true)}
                <Badge className="absolute top-3 right-3 bg-primary/80">
                  Voted
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Polls */}
      <div data-tour="recommended-polls">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended Polls</h2>
          <Button variant="outline" size="sm" onClick={fetchPolls}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PollSkeleton />
            <PollSkeleton />
            <PollSkeleton />
          </div>
        ) : availablePolls.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                No more polls available. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePolls
              .filter((p) => p.reward_pool > 0)
              .slice(0, 6)
              .map((poll) => renderPollCard(poll, false))}
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
}
