import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface RewardsClaimProps {
  title?: string;
  rewardAmount?: string;
  tokenSymbol?: string;
  tokenColor?: string;
}

export const RewardsClaim: React.FC<RewardsClaimProps> = ({
  title = "Claim Your Reward",
  rewardAmount = "50",
  tokenSymbol = "P",
  tokenColor = "#a855f7",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Animation phases
  const claimStart = fps * 2;
  const claimEnd = fps * 4;
  const isClaiming = frame >= claimStart && frame < claimEnd;
  const isClaimed = frame >= claimEnd;

  const claimProgress = interpolate(
    frame,
    [claimStart, claimEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const successScale = spring({
    frame: frame - claimEnd,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Token animation
  const tokenRotate = interpolate(frame, [0, fps * 6], [0, 360], {
    extrapolateRight: "extend",
  });

  const tokenFloat = Math.sin(frame / fps * Math.PI) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: theme.colors.secondary,
            fontFamily: theme.fonts.heading,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>

        {/* Reward card */}
        <div
          style={{
            width: 450,
            padding: 40,
            borderRadius: 24,
            backgroundColor: "#18181b",
            border: `2px solid ${tokenColor}40`,
            transform: `scale(${cardScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Token icon */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${tokenColor}40 0%, ${tokenColor}20 100%)`,
              border: `3px solid ${tokenColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotate(${tokenRotate * 0.1}deg) translateY(${tokenFloat}px)`,
              boxShadow: `0 0 40px ${tokenColor}40`,
            }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: tokenColor,
                fontFamily: theme.fonts.heading,
              }}
            >
              {tokenSymbol}
            </span>
          </div>

          {/* Amount */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: theme.colors.text,
              fontFamily: theme.fonts.heading,
            }}
          >
            {rewardAmount} {tokenSymbol}
          </div>

          {/* Status */}
          <div
            style={{
              fontSize: 20,
              color: theme.colors.muted,
              fontFamily: theme.fonts.body,
            }}
          >
            {!isClaiming && !isClaimed && "Reward Available"}
            {isClaiming && "Claiming..."}
            {isClaimed && "Claimed!"}
          </div>

          {/* Progress bar during claiming */}
          {isClaiming && (
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                backgroundColor: "#27272a",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${claimProgress * 100}%`,
                  height: "100%",
                  backgroundColor: tokenColor,
                  borderRadius: 4,
                  transition: "width 0.1s ease-out",
                }}
              />
            </div>
          )}

          {/* Success checkmark */}
          {isClaimed && (
            <div
              style={{
                fontSize: 64,
                color: "#22c55e",
                transform: `scale(${successScale})`,
              }}
            >
              ✓
            </div>
          )}

          {/* Claim button (before claiming) */}
          {!isClaiming && !isClaimed && (
            <div
              style={{
                padding: "16px 48px",
                borderRadius: 12,
                background: `linear-gradient(135deg, ${tokenColor} 0%, ${theme.colors.secondary} 100%)`,
                fontSize: 20,
                fontWeight: 600,
                color: "white",
                fontFamily: theme.fonts.heading,
              }}
            >
              Claim Reward
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
