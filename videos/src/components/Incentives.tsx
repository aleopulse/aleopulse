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

  const rotate = interpolate(frame - delay, [0, fps * 2], [0, 360], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
        border: `3px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale}) rotate(${rotate * 0.1}deg)`,
        boxShadow: `0 0 40px ${color}40`,
      }}
    >
      <span
        style={{
          fontSize: 36,
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

const FeatureItem: React.FC<{
  text: string;
  delay: number;
}> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideX = interpolate(frame - delay, [0, fps * 0.3], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#8b5cf6",
        }}
      />
      <span
        style={{
          fontSize: 28,
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const Incentives: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 100,
          padding: 80,
        }}
      >
        {/* Left side - Token visuals */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            <TokenIcon symbol="P" color="#a855f7" delay={fps * 0.2} />
            <TokenIcon symbol="$" color="#22c55e" delay={fps * 0.4} />
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
              opacity: interpolate(frame, [fps * 0.6, fps], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            PULSE & USDC Rewards
          </div>
        </div>

        {/* Right side - Features */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              opacity: titleOpacity,
              marginBottom: 20,
            }}
          >
            Incentivize Participation
          </div>

          <FeatureItem text="Fixed rewards per vote" delay={fps * 0.5} />
          <FeatureItem text="Equal split among voters" delay={fps * 0.7} />
          <FeatureItem text="Automatic on-chain distribution" delay={fps * 0.9} />
          <FeatureItem text="2% platform fee only" delay={fps * 1.1} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
