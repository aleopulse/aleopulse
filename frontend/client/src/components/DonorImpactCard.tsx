import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Coins, TrendingUp, Target } from "lucide-react";

interface DonorImpactMetrics {
  participantsReached: number;
  totalDistributed: number;
  totalDistributedSymbol: string;
  completionRate: number;
  pollsCompleted: number;
  pollsFunded: number;
}

interface DonorImpactCardProps {
  metrics: DonorImpactMetrics;
  isLoading?: boolean;
}

export function DonorImpactCard({ metrics, isLoading = false }: DonorImpactCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          Your Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Participants Reached */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Participants Reached</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {metrics.participantsReached.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Unique voters across your funded polls
            </p>
          </div>

          {/* Total Distributed */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Distributed</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {metrics.totalDistributed.toFixed(2)}
              <span className="text-sm ml-1 font-normal">{metrics.totalDistributedSymbol}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rewards claimed from your funding
            </p>
          </div>

          {/* Completion Rate */}
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Completion Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold font-mono">
                {metrics.completionRate.toFixed(0)}%
              </p>
              <span className="text-xs text-muted-foreground">
                ({metrics.pollsCompleted}/{metrics.pollsFunded})
              </span>
            </div>
            <Progress value={metrics.completionRate} className="mt-2 h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for individual metric display (for compact usage)
interface ImpactMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}

export function ImpactMetric({ icon, label, value, subtext }: ImpactMetricProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted/50">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold font-mono">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground">{subtext}</p>
        )}
      </div>
    </div>
  );
}
