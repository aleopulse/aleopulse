import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Logo: React.FC = () => {
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

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
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
        {/* Live badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 20,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
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
              color: "#a1a1aa",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            Live on Aleo Testnet
          </span>
        </div>

        {/* Logo */}
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -4,
          }}
        >
          LeoPulse
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: "#a1a1aa",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: 2,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          Privacy-Preserving Polls on Aleo
        </div>
      </div>
    </AbsoluteFill>
  );
};
