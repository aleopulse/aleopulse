import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const TokenIcon: React.FC<{ symbol: string; color: string; delay: number }> = ({
  symbol,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const float = Math.sin((frame - delay) * 0.1) * 5;

  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
        border: `3px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) translateY(${float}px)`,
        boxShadow: `0 0 30px ${color}40`,
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {symbol}
      </span>
    </div>
  );
};

const RewardOption: React.FC<{
  label: string;
  description: string;
  delay: number;
  selected?: boolean;
}> = ({
  label,
  description,
  delay,
  selected,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideY = interpolate(frame - delay, [0, fps * 0.3], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        padding: "20px 28px",
        backgroundColor: selected ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        border: selected ? "2px solid #8b5cf6" : "2px solid rgba(255, 255, 255, 0.1)",
        opacity,
        transform: `translateY(${slideY}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 16,
          color: "#71717a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {description}
      </span>
    </div>
  );
};

export const FundPoll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Animated amount
  const amount = Math.floor(interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
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
          gap: 50,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#8b5cf6",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          Fund Your Poll
        </div>

        {/* Token icons */}
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <TokenIcon symbol="P" color="#a855f7" delay={fps * 0.3} />
          <div
            style={{
              fontSize: 36,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            +
          </div>
          <TokenIcon symbol="$" color="#22c55e" delay={fps * 0.5} />
        </div>

        {/* Amount display */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
            opacity: interpolate(frame, [fps * 0.5, fps], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {amount.toLocaleString()} PULSE
        </div>

        {/* Reward options */}
        <div style={{ display: "flex", gap: 24 }}>
          <RewardOption
            label="Fixed per Vote"
            description="100 PULSE per participant"
            delay={fps * 0.8}
            selected
          />
          <RewardOption
            label="Split Pool"
            description="Divide equally among voters"
            delay={fps * 1.0}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
