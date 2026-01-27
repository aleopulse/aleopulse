import { useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Vote,
  Plus,
  Heart,
  Clock,
  ArrowUpRight,
  CheckCircle,
  Gift,
  TrendingUp,
} from "lucide-react";
import type { PollWithMeta } from "@/types/poll";
import { POLL_STATUS } from "@/types/poll";
import { getCoinSymbol, type CoinTypeId } from "@/lib/tokens";

interface ActivityItem {
  id: string;
  type: "vote" | "create" | "fund" | "claim" | "received";
  pollId: number;
  pollTitle: string;
  timestamp: number;
  amount?: number;
  tokenSymbol?: string;
}

interface UnifiedActivityDashboardProps {
  polls: PollWithMeta[];
  votedPollIds: Set<number>;
  claimedPollIds: Set<number>;
  fundedPollIds: Set<number>;
  userAddress?: string;
  isLoading?: boolean;
}

export function UnifiedActivityDashboard({
  polls,
  votedPollIds,
  claimedPollIds,
  fundedPollIds,
  userAddress,
  isLoading = false,
}: UnifiedActivityDashboardProps) {
  // Build a unified activity timeline
  const activityItems = useMemo(() => {
    const items: ActivityItem[] = [];

    polls.forEach((poll) => {
      const coinSymbol = getCoinSymbol(poll.coin_type_id as CoinTypeId);
      const rewardPerVoter = poll.reward_per_vote > 0
        ? poll.reward_per_vote / 1e8
        : poll.totalVotes > 0
        ? (poll.reward_pool / 1e8) / poll.totalVotes
        : 0;

      // Check if user created this poll
      if (userAddress && poll.creator.toLowerCase() === userAddress.toLowerCase()) {
        items.push({
          id: `create-${poll.id}`,
          type: "create",
          pollId: poll.id,
          pollTitle: poll.title,
          timestamp: poll.end_time - 86400, // Approximate creation time
          amount: poll.reward_pool / 1e8,
          tokenSymbol: coinSymbol,
        });
      }

      // Check if user voted on this poll
      if (votedPollIds.has(poll.id)) {
        items.push({
          id: `vote-${poll.id}`,
          type: "vote",
          pollId: poll.id,
          pollTitle: poll.title,
          timestamp: poll.end_time - 43200, // Approximate vote time
        });
      }

      // Check if user claimed reward from this poll
      if (claimedPollIds.has(poll.id)) {
        items.push({
          id: `claim-${poll.id}`,
          type: "claim",
          pollId: poll.id,
          pollTitle: poll.title,
          timestamp: poll.end_time,
          amount: rewardPerVoter,
          tokenSymbol: coinSymbol,
        });
      }

      // Check if user funded this poll
      if (fundedPollIds.has(poll.id)) {
        items.push({
          id: `fund-${poll.id}`,
          type: "fund",
          pollId: poll.id,
          pollTitle: poll.title,
          timestamp: poll.end_time - 86400,
        });
      }
    });

    // Sort by timestamp descending (newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [polls, votedPollIds, claimedPollIds, fundedPollIds, userAddress]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      totalVotes: votedPollIds.size,
      totalCreated: polls.filter(
        (p) => userAddress && p.creator.toLowerCase() === userAddress.toLowerCase()
      ).length,
      totalFunded: fundedPollIds.size,
      totalClaimed: claimedPollIds.size,
    };
  }, [polls, votedPollIds, claimedPollIds, fundedPollIds, userAddress]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "vote":
        return <Vote className="w-4 h-4 text-blue-500" />;
      case "create":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "fund":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "claim":
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case "received":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getActivityLabel = (type: ActivityItem["type"]) => {
    switch (type) {
      case "vote":
        return "Voted on";
      case "create":
        return "Created";
      case "fund":
        return "Funded";
      case "claim":
        return "Claimed from";
      case "received":
        return "Received from";
    }
  };

  const getActivityBadge = (type: ActivityItem["type"]) => {
    switch (type) {
      case "vote":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/50">Participant</Badge>;
      case "create":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">Creator</Badge>;
      case "fund":
        return <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/50">Donor</Badge>;
      case "claim":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/50">Reward</Badge>;
      case "received":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/50">Received</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Votes Cast</span>
            </div>
            <p className="text-2xl font-bold font-mono mt-2">{stats.totalVotes}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Polls Created</span>
            </div>
            <p className="text-2xl font-bold font-mono mt-2">{stats.totalCreated}</p>
          </CardContent>
        </Card>

        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-sm text-muted-foreground">Polls Funded</span>
            </div>
            <p className="text-2xl font-bold font-mono mt-2">{stats.totalFunded}</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Rewards Claimed</span>
            </div>
            <p className="text-2xl font-bold font-mono mt-2">{stats.totalClaimed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <Badge variant="secondary">{activityItems.length} activities</Badge>
        </CardHeader>
        <CardContent>
          {activityItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet. Start by voting on a poll or creating one!</p>
              <div className="flex justify-center gap-2 mt-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <Vote className="w-4 h-4 mr-2" /> Explore Polls
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Create Poll
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activityItems.slice(0, 10).map((item) => (
                <Link key={item.id} href={`/poll/${item.pollId}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                    <div className="p-2 rounded-full bg-muted">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {getActivityLabel(item.type)}
                        </span>
                        {getActivityBadge(item.type)}
                      </div>
                      <p className="font-medium truncate">{item.pollTitle}</p>
                    </div>
                    {item.amount && item.amount > 0 && (
                      <div className="text-right">
                        <p className="font-mono font-medium text-green-500">
                          +{item.amount.toFixed(4)} {item.tokenSymbol}
                        </p>
                      </div>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
              {activityItems.length > 10 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View all {activityItems.length} activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
