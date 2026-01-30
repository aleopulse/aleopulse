import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, Link } from "wouter";
import { PollCard } from "@/components/PollCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Filter, Search, RefreshCcw, AlertCircle, Loader2, ExternalLink, LayoutGrid, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UnifiedActivityDashboard } from "@/components/UnifiedActivityDashboard";
import { useContract } from "@/hooks/useContract";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useNetwork } from "@/contexts/NetworkContext";
import { useBlockHeight } from "@/hooks/useAleoPolls";
import { usePendingPolls, PENDING_POLL_STATUS, type PendingPoll } from "@/hooks/usePendingPolls";
import type { PollWithMeta, PollSettings, PollInvite } from "@/types/poll";
import { POLL_VISIBILITY } from "@/types/poll";
import { getCoinSymbol, type CoinTypeId } from "@/lib/tokens";
import { toast } from "sonner";

const PENDING_POLL_TX_KEY = "pending-poll-tx";
const DASHBOARD_VIEW_KEY = "leopulse_dashboard_view";
const NORMAL_REFRESH_INTERVAL = 15000; // 15 seconds
const AGGRESSIVE_REFRESH_INTERVAL = 5000; // 5 seconds when pending tx

export default function Dashboard() {
  const [location] = useLocation();
  const { isConnected, address } = useWalletConnection();
  const { getAllPolls, getPollCount, contractAddress, getPollSettings, getUserPollInvites } = useContract();
  const { config } = useNetwork();
  const { data: currentBlock } = useBlockHeight();
  const { pendingPolls, confirmPendingPoll, dismissPendingPoll, fetchPendingPolls } = usePendingPolls();

  // Debug: log pending polls state
  useEffect(() => {
    console.log("[Dashboard] pendingPolls state:", pendingPolls);
  }, [pendingPolls]);

  const [role, setRole] = useState<"creator" | "participant">("creator");
  const [polls, setPolls] = useState<PollWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const previousPollCountRef = useRef<number>(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unified view toggle state
  const [isUnifiedView, setIsUnifiedView] = useState(() => {
    const stored = localStorage.getItem(DASHBOARD_VIEW_KEY);
    return stored === "unified";
  });

  // Save view preference to localStorage
  const handleViewToggle = (unified: boolean) => {
    setIsUnifiedView(unified);
    localStorage.setItem(DASHBOARD_VIEW_KEY, unified ? "unified" : "classic");
  };

  // Mock voted/claimed/funded poll IDs for unified view (in production, fetch from indexer)
  const [votedPollIds] = useState<Set<number>>(new Set());
  const [claimedPollIds] = useState<Set<number>>(new Set());
  const [fundedPollIds] = useState<Set<number>>(new Set());

  // State for poll visibility and user invites
  const [pollSettingsMap, setPollSettingsMap] = useState<Map<number, PollSettings>>(new Map());
  const [userInvites, setUserInvites] = useState<PollInvite[]>([]);

  // Check for pending transaction on mount
  useEffect(() => {
    const storedTx = sessionStorage.getItem(PENDING_POLL_TX_KEY);
    if (storedTx) {
      console.log("[Dashboard] Found pending transaction:", storedTx);
      console.log("[Dashboard] Explorer URL:", `${config.explorerUrl}/transaction/${storedTx}`);
      setPendingTxId(storedTx);
    }
  }, [config.explorerUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam === "participant") setRole("participant");
  }, [location]);

  // Fetch all polls
  const fetchPolls = useCallback(async (showLoading = true) => {
    if (!contractAddress) {
      setIsLoading(false);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const allPolls = await getAllPolls();
      // Sort by ID descending (newest first)
      const sortedPolls = allPolls.sort((a, b) => b.id - a.id);

      console.log("[Dashboard] Fetched polls:", {
        count: sortedPolls.length,
        previousCount: previousPollCountRef.current,
        pendingTxId,
        polls: sortedPolls.map(p => ({ id: p.id, creator: p.creator, title: p.title })),
      });

      // Check if poll count increased (new poll appeared)
      if (pendingTxId && sortedPolls.length > previousPollCountRef.current) {
        // New poll appeared, clear pending transaction
        console.log("[Dashboard] New poll detected! Clearing pending tx.");
        sessionStorage.removeItem(PENDING_POLL_TX_KEY);
        setPendingTxId(null);
        toast.success("Your poll is now live!", {
          description: "Your poll has been indexed and is visible to participants.",
        });
      }

      previousPollCountRef.current = sortedPolls.length;
      setPolls(sortedPolls);

      // Fetch poll settings for all polls (to determine visibility)
      const settingsPromises = sortedPolls.map(async (poll) => {
        const settings = await getPollSettings(poll.id);
        return { pollId: poll.id, settings };
      });
      const settingsResults = await Promise.all(settingsPromises);
      const newSettingsMap = new Map<number, PollSettings>();
      settingsResults.forEach(({ pollId, settings }) => {
        if (settings) {
          newSettingsMap.set(pollId, settings);
        }
      });
      setPollSettingsMap(newSettingsMap);

      // Fetch user invites if connected
      if (isConnected) {
        const invites = await getUserPollInvites();
        setUserInvites(invites);
      }
    } catch (error) {
      console.error("Failed to fetch polls:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAllPolls, contractAddress, pendingTxId, getPollSettings, getUserPollInvites, isConnected]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // Check if any pending polls have been confirmed on-chain
  useEffect(() => {
    if (pendingPolls.length === 0 || polls.length === 0) return;

    pendingPolls.forEach((pendingPoll) => {
      if (pendingPoll.status !== PENDING_POLL_STATUS.PENDING) return;

      // Look for a matching poll that appeared on-chain
      // Match by title and creator (both normalized)
      const matchingPoll = polls.find((onChainPoll) => {
        const titleMatch = onChainPoll.title.toLowerCase() === pendingPoll.title.toLowerCase();
        const creatorMatch = onChainPoll.creator.toLowerCase() === pendingPoll.walletAddress.toLowerCase();
        return titleMatch && creatorMatch;
      });

      if (matchingPoll) {
        console.log("[Dashboard] Found matching on-chain poll for pending:", {
          pendingId: pendingPoll.id,
          onChainId: matchingPoll.id,
          title: matchingPoll.title,
        });
        confirmPendingPoll(pendingPoll.id, matchingPoll.id);
      }
    });
  }, [pendingPolls, polls, confirmPendingPoll]);

  // Auto-refresh interval - faster when pending tx exists
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval based on pending state
    const interval = pendingTxId ? AGGRESSIVE_REFRESH_INTERVAL : NORMAL_REFRESH_INTERVAL;
    refreshIntervalRef.current = setInterval(() => {
      fetchPolls(false); // Don't show loading spinner on auto-refresh
    }, interval);

    // Cleanup on unmount or when pendingTxId changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [pendingTxId, fetchPolls]);

  // Helper: Check if user has valid invite for a poll
  const hasValidInvite = useCallback(
    (pollId: number): boolean => {
      const invite = userInvites.find((inv) => inv.poll_id === pollId);
      if (!invite) return false;
      // Check if invite is still valid (not expired)
      if (currentBlock && invite.expires_block <= currentBlock) return false;
      return true;
    },
    [userInvites, currentBlock]
  );

  // Helper: Check if poll is private
  const isPollPrivate = useCallback(
    (pollId: number): boolean => {
      const settings = pollSettingsMap.get(pollId);
      return settings?.visibility === POLL_VISIBILITY.PRIVATE;
    },
    [pollSettingsMap]
  );

  // Helper: Check if user can access a poll (public OR has valid invite OR is creator)
  const canAccessPoll = useCallback(
    (poll: PollWithMeta): boolean => {
      const isPrivate = isPollPrivate(poll.id);
      if (!isPrivate) return true; // Public polls are accessible to everyone

      // Private poll access: creator or valid invite
      const isCreator = address && poll.creator.toLowerCase() === address.toLowerCase();
      if (isCreator) return true;

      return hasValidInvite(poll.id);
    },
    [isPollPrivate, hasValidInvite, address]
  );

  // Filter polls by status and creator, excluding inaccessible private polls
  const accessiblePolls = polls.filter(canAccessPoll);
  const activePolls = accessiblePolls.filter((p) => p.isActive);
  const closedPolls = accessiblePolls.filter((p) => !p.isActive);

  // Filter by creator for creator view (creators see all their polls)
  const myPolls = polls.filter(
    (p) => address && p.creator.toLowerCase() === address.toLowerCase()
  );
  const myActivePolls = myPolls.filter((p) => p.isActive);
  const myClosedPolls = myPolls.filter((p) => !p.isActive);

  // Search filter
  const filterBySearch = (pollList: PollWithMeta[]) => {
    if (!searchQuery.trim()) return pollList;
    const query = searchQuery.toLowerCase();
    return pollList.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  };

  // Calculate stats - group rewards by token type
  const stats = useMemo(() => {
    const relevantPolls = role === "creator" ? myPolls : polls;
    const rewardsByToken: Record<string, number> = {};
    relevantPolls.forEach((p) => {
      const coinSymbol = getCoinSymbol(p.coin_type_id as CoinTypeId);
      rewardsByToken[coinSymbol] = (rewardsByToken[coinSymbol] || 0) + (p.reward_pool / 1e6);
    });

    return {
      activePolls: role === "creator" ? myActivePolls.length : activePolls.length,
      totalVotes: relevantPolls.reduce((sum, p) => sum + p.totalVotes, 0),
      rewardsByToken,
      pollCount: relevantPolls.length,
    };
  }, [role, myPolls, polls, myActivePolls, activePolls]);

  // Get the polls to display based on role
  const getDisplayPolls = (tab: "active" | "completed") => {
    const basePollsActive = role === "creator" ? myActivePolls : activePolls;
    const basePollsClosed = role === "creator" ? myClosedPolls : closedPolls;
    return filterBySearch(tab === "active" ? basePollsActive : basePollsClosed);
  };

  // Render poll card from PollWithMeta
  const renderPollCard = (poll: PollWithMeta) => {
    const rewardPool = poll.reward_pool / 1e6;
    const coinSymbol = getCoinSymbol(poll.coin_type_id as CoinTypeId);
    const isPrivate = isPollPrivate(poll.id);
    const hasInvite = hasValidInvite(poll.id);
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
        isPrivate={isPrivate}
        hasInvite={hasInvite}
      />
    );
  };

  // Render pending poll card (optimistic UI)
  const renderPendingPollCard = (pendingPoll: PendingPoll) => {
    const rewardPool = parseFloat(pendingPoll.fundAmount) / 1e6;
    const isFailed = pendingPoll.status === PENDING_POLL_STATUS.FAILED;

    return (
      <div
        key={`pending-${pendingPoll.id}`}
        className={`relative group rounded-xl border ${
          isFailed
            ? "border-red-500/50 bg-red-500/5"
            : "border-primary/50 bg-primary/5"
        } p-4 transition-all hover:shadow-lg`}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isFailed ? (
            <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" /> Failed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" /> Confirming...
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg pr-24 line-clamp-2 mb-2">
          {pendingPoll.title}
        </h3>

        {/* Description */}
        {pendingPoll.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {pendingPoll.description}
          </p>
        )}

        {/* Options Preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pendingPoll.options.slice(0, 3).map((opt, idx) => (
            <span
              key={idx}
              className="text-xs bg-muted/50 px-2 py-0.5 rounded"
            >
              {opt}
            </span>
          ))}
          {pendingPoll.options.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{pendingPoll.options.length - 3} more
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>0 votes</span>
          {rewardPool > 0 && (
            <span className="font-mono text-accent">
              {rewardPool.toFixed(2)} PULSE
            </span>
          )}
        </div>

        {/* Error message for failed polls */}
        {isFailed && pendingPoll.errorMessage && (
          <p className="mt-2 text-xs text-red-500 line-clamp-2">
            {pendingPoll.errorMessage}
          </p>
        )}

        {/* Actions for failed polls */}
        {isFailed && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => dismissPendingPoll(pendingPoll.id)}
            >
              Dismiss
            </Button>
            <Link href="/create">
              <Button size="sm" className="text-xs">
                Try Again
              </Button>
            </Link>
          </div>
        )}

        {/* Transaction link */}
        {pendingPoll.txHash && config.explorerUrl && (
          <a
            href={`${config.explorerUrl}/transaction/${pendingPoll.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View Transaction <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  };

  // Filter pending polls for current user's creator view
  const myPendingPolls = pendingPolls.filter(
    (p) => p.status === PENDING_POLL_STATUS.PENDING || p.status === PENDING_POLL_STATUS.FAILED
  );

  // Loading skeleton
  const PollSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">
            {role === "creator" ? "Creator Dashboard" : "Explore Polls"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {role === "creator"
              ? "Manage your active polls and analyze responses."
              : "Participate in active polls and earn rewards."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-muted/30">
            <LayoutGrid className={`w-4 h-4 ${!isUnifiedView ? "text-primary" : "text-muted-foreground"}`} />
            <Switch
              checked={isUnifiedView}
              onCheckedChange={handleViewToggle}
              className="data-[state=checked]:bg-primary"
            />
            <Activity className={`w-4 h-4 ${isUnifiedView ? "text-primary" : "text-muted-foreground"}`} />
            <Label className="text-xs text-muted-foreground cursor-pointer" onClick={() => handleViewToggle(!isUnifiedView)}>
              {isUnifiedView ? "Unified" : "Classic"}
            </Label>
          </div>

          {!isUnifiedView && (
            <div className="flex gap-2">
              <Button
                variant={role === "creator" ? "default" : "outline"}
                onClick={() => setRole("creator")}
                size="sm"
              >
                Creator View
              </Button>
              <Button
                variant={role === "participant" ? "default" : "outline"}
                onClick={() => setRole("participant")}
                size="sm"
              >
                Participant View
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Unified Activity View */}
      {isUnifiedView ? (
        <UnifiedActivityDashboard
          polls={polls}
          votedPollIds={votedPollIds}
          claimedPollIds={claimedPollIds}
          fundedPollIds={fundedPollIds}
          userAddress={address ?? undefined}
          isLoading={isLoading}
        />
      ) : (
        <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Polls",
            value: isLoading ? "-" : stats.activePolls.toString(),
            change: role === "creator" ? "Your polls" : "On network",
          },
          {
            label: "Total Votes",
            value: isLoading ? "-" : stats.totalVotes.toLocaleString(),
            change: role === "creator" ? "On your polls" : "All polls",
          },
          {
            label: "Rewards Pool",
            value: isLoading ? "-" : (
              Object.keys(stats.rewardsByToken).length === 0 ? "0" :
              Object.entries(stats.rewardsByToken).map(([token, amount]) =>
                `${amount.toFixed(2)} ${token}`
              ).join(" + ")
            ),
            change: "Total distributed",
          },
          {
            label: "Total Polls",
            value: isLoading ? "-" : stats.pollCount.toString(),
            change: role === "creator" ? "Created by you" : "On network",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold font-mono mt-1">{stat.value}</p>
            <p className="text-xs text-accent mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            className="pl-10 bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={() => fetchPolls()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {role === "creator" && (
            <Link href="/create">
              <Button className="flex-1 md:flex-none bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Create Poll
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* No contract warning */}
      {!contractAddress && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Contract not available on this network. Please switch to testnet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending transaction banner */}
      {pendingTxId && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Your poll is being indexed...
                </p>
                <p className="text-xs text-muted-foreground">
                  Aleo transactions can take 1-5 minutes to finalize. Auto-refreshing every 5s.
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                  TX: {pendingTxId.slice(0, 20)}...{pendingTxId.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {config.explorerUrl && (
                <a
                  href={`${config.explorerUrl}/transaction/${pendingTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View Transaction <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => {
                  sessionStorage.removeItem(PENDING_POLL_TX_KEY);
                  setPendingTxId(null);
                  toast.info("Pending transaction cleared", {
                    description: "You can try creating the poll again.",
                  });
                }}
                className="text-xs text-muted-foreground hover:text-foreground ml-2"
              >
                ✕ Clear
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="active">
            Active ({role === "creator" ? myActivePolls.length + myPendingPolls.length : activePolls.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({role === "creator" ? myClosedPolls.length : closedPolls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PollSkeleton />
              <PollSkeleton />
              <PollSkeleton />
            </div>
          ) : getDisplayPolls("active").length === 0 && myPendingPolls.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {role === "creator"
                    ? "You haven't created any active polls yet."
                    : "No active polls found."}
                </p>
                {role === "creator" && (
                  <Link href="/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Create Your First Poll
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show pending polls first (only in creator view) */}
              {role === "creator" && myPendingPolls.map(renderPendingPollCard)}
              {getDisplayPolls("active").map(renderPollCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PollSkeleton />
              <PollSkeleton />
              <PollSkeleton />
            </div>
          ) : getDisplayPolls("completed").length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No completed polls found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getDisplayPolls("completed").map(renderPollCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}
