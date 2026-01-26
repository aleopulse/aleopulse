import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface TokenIconProps {
  symbol: string;
  color: string;
  delay: number;
}

const TokenIcon: React.FC<TokenIconProps> = ({ symbol, color, delay }) => {
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
          fontFamily: theme.fonts.heading,
        }}
      >
        {symbol}
      </span>
    </div>
  );
};

interface FeatureItemProps {
  text: string;
  delay: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ text, delay }) => {
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
          backgroundColor: theme.colors.secondary,
        }}
      />
      <span
        style={{
          fontSize: 28,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
        }}
      >
        {text}
      </span>
    </div>
  );
};

interface IncentivesProps {
  title?: string;
  subtitle?: string;
  tokens?: Array<{ symbol: string; color: string }>;
  features?: string[];
}

export const Incentives: React.FC<IncentivesProps> = ({
  title = "Incentivize Participation",
  subtitle = "Token Rewards",
  tokens = [
    { symbol: "P", color: "#a855f7" },
    { symbol: "$", color: "#22c55e" },
  ],
  features = [
    "Fixed rewards per vote",
    "Equal split among voters",
    "Automatic on-chain distribution",
    "Low platform fee",
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [fps * 0.6, fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
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
            {tokens.map((token, i) => (
              <TokenIcon
                key={token.symbol}
                symbol={token.symbol}
                color={token.color}
                delay={fps * 0.2 * (i + 1)}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 20,
              color: theme.colors.muted,
              fontFamily: theme.fonts.body,
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
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
              color: theme.colors.secondary,
              fontFamily: theme.fonts.heading,
              opacity: titleOpacity,
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {features.map((feature, i) => (
            <FeatureItem
              key={feature}
              text={feature}
              delay={fps * (0.5 + 0.2 * i)}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
