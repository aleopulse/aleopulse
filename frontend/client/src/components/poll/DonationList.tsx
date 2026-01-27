/**
 * DonationList Component
 * Displays public donors and anonymous donation aggregates for a poll
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Eye,
  EyeOff,
  Users,
  Coins,
  ExternalLink,
} from "lucide-react";
import type { PublicDonation, PollDonationStats } from "@/types/poll";
import { getCoinSymbol, type CoinTypeId } from "@/lib/tokens";

interface DonationListProps {
  stats: PollDonationStats | null;
  coinTypeId: CoinTypeId;
  isLoading?: boolean;
  explorerUrl?: string;
}

function truncateAddress(address: string): string {
  if (!address || address.length < 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function DonorRow({
  donation,
  coinSymbol,
  explorerUrl,
}: {
  donation: PublicDonation;
  coinSymbol: string;
  explorerUrl?: string;
}) {
  const amount = donation.amount / 1e8;

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {truncateAddress(donation.donor)}
            </span>
            {explorerUrl && (
              <a
                href={`${explorerUrl}/address/${donation.donor}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Block #{donation.donated_at}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {amount.toFixed(4)} {coinSymbol}
        </Badge>
        <Eye className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function DonationSkeleton() {
  return (
    <div className="flex items-center justify-between py-2 px-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export function DonationList({
  stats,
  coinTypeId,
  isLoading = false,
  explorerUrl,
}: DonationListProps) {
  const coinSymbol = getCoinSymbol(coinTypeId);

  const totalAmount = stats?.totalAmount ?? 0;
  const totalCount = stats?.totalCount ?? 0;
  const publicCount = stats?.publicCount ?? 0;
  const anonymousCount = stats?.anonymousCount ?? 0;
  const publicDonations = stats?.publicDonations ?? [];

  // Summary stats
  const summaryItems = useMemo(() => [
    {
      label: "Total Donated",
      value: `${(totalAmount / 1e8).toFixed(4)} ${coinSymbol}`,
      icon: <Coins className="w-4 h-4" />,
    },
    {
      label: "Total Donors",
      value: totalCount.toString(),
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Public",
      value: publicCount.toString(),
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Anonymous",
      value: anonymousCount.toString(),
      icon: <EyeOff className="w-4 h-4" />,
    },
  ], [totalAmount, totalCount, publicCount, anonymousCount, coinSymbol]);

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <div className="space-y-2">
            <DonationSkeleton />
            <DonationSkeleton />
            <DonationSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No donations yet.</p>
            <p className="text-sm">Be the first to fund this poll!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Donations
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            {(totalAmount / 1e8).toFixed(2)} {coinSymbol}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg bg-muted/30 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </div>
              <p className="font-mono font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Public Donors List */}
        {publicDonations.length > 0 ? (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Public Donors ({publicCount})
            </h4>
            <div className="space-y-1">
              {publicDonations.map((donation, index) => (
                <DonorRow
                  key={`${donation.donor}-${donation.donated_at}-${index}`}
                  donation={donation}
                  coinSymbol={coinSymbol}
                  explorerUrl={explorerUrl}
                />
              ))}
            </div>
          </div>
        ) : publicCount === 0 && anonymousCount > 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              All {anonymousCount} donation{anonymousCount !== 1 ? "s" : ""}{" "}
              {anonymousCount !== 1 ? "are" : "is"} anonymous.
            </p>
          </div>
        ) : null}

        {/* Anonymous Count Note */}
        {anonymousCount > 0 && publicCount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/20 text-sm text-muted-foreground flex items-center gap-2">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>
              Plus {anonymousCount} anonymous donation{anonymousCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
