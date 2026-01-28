import { cn } from "@/lib/utils";
import { TIER_NAMES, TIER_PULSE_THRESHOLDS, TIERS } from "@shared/schema";

interface TierProgressBarProps {
  currentPulse: bigint | number;
  currentTier: number;
  className?: string;
  showLabels?: boolean;
}

const tierGradients = {
  [TIERS.BRONZE]: "from-amber-600 to-amber-800",
  [TIERS.SILVER]: "from-slate-400 to-slate-600",
  [TIERS.GOLD]: "from-yellow-400 to-yellow-600",
  [TIERS.PLATINUM]: "from-cyan-400 to-cyan-600",
};

export function TierProgressBar({
  currentPulse,
  currentTier,
  className,
  showLabels = true,
}: TierProgressBarProps) {
  const pulseAmount = typeof currentPulse === "bigint" ? currentPulse : BigInt(currentPulse);
  const nextTier = Math.min(currentTier + 1, TIERS.PLATINUM);

  // Max tier reached
  if (currentTier >= TIERS.PLATINUM) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse"
          />
        </div>
        {showLabels && (
          <p className="text-xs text-cyan-500 font-medium text-center">
            Max tier reached!
          </p>
        )}
      </div>
    );
  }

  const currentThreshold = BigInt(TIER_PULSE_THRESHOLDS[currentTier as keyof typeof TIER_PULSE_THRESHOLDS] || 0);
  const nextThreshold = BigInt(TIER_PULSE_THRESHOLDS[nextTier as keyof typeof TIER_PULSE_THRESHOLDS] || 0);
  const nextTierName = TIER_NAMES[nextTier as keyof typeof TIER_NAMES] || "Unknown";

  // Calculate progress
  const range = nextThreshold - currentThreshold;
  const progress = range > 0n
    ? Number(((pulseAmount - currentThreshold) * 100n) / range)
    : 0;
  const progressClamped = Math.max(0, Math.min(100, progress));

  const pulseNeeded = nextThreshold - pulseAmount;
  const pulseNeededDisplay = pulseNeeded > 0n
    ? (Number(pulseNeeded) / 1e6).toLocaleString()
    : "0";

  const gradient = tierGradients[nextTier as keyof typeof tierGradients] || "from-primary to-accent";

  return (
    <div className={cn("space-y-1 min-w-[120px]", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${progressClamped}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">→ {nextTierName}</span>
          <span className="font-mono text-muted-foreground">
            {pulseNeeded > 0n ? `${pulseNeededDisplay} needed` : "Ready!"}
          </span>
        </div>
      )}
    </div>
  );
}
