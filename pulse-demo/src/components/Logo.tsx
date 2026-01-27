import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";
import { chain } from "../config/chain";

interface LogoProps {
  showBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ showBadge = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const taglineOpacity = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [fps * 0.5, fps * 1.2], [20, 0], {
    extrapolateRight: "clamp",
  });

  const badgeOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const badgeScale = spring({
    frame: frame - fps,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const gradient = theme.logo.gradient
    ? `linear-gradient(135deg, ${theme.logo.gradient[0]} 0%, ${theme.logo.gradient[1]} 100%)`
    : theme.colors.primary;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #1a1a2e 100%)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {/* Network badge */}
        {showBadge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 20,
              backgroundColor: `${chain.primaryColor}15`,
              border: `1px solid ${chain.primaryColor}40`,
              opacity: badgeOpacity,
              transform: `scale(${badgeScale})`,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 10px #22c55e",
              }}
            />
            <span
              style={{
                fontSize: 16,
                color: theme.colors.muted,
                fontFamily: theme.fonts.body,
                fontWeight: 500,
              }}
            >
              Live on {chain.displayName} {chain.networkName}
            </span>
          </div>
        )}

        {/* Logo */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: theme.fonts.heading,
            letterSpacing: -4,
          }}
        >
          {theme.logo.text}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: theme.colors.muted,
            fontFamily: theme.fonts.body,
            letterSpacing: 2,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          {theme.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
