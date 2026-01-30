import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SlideTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dramatic reveal animation
  const hookOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hookScale = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const statOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const statY = interpolate(frame, [fps * 1.5, fps * 2], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoOpacity = interpolate(frame, [fps * 3, fps * 3.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame: frame - fps * 3,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
        }}
      >
        {/* Hook Statement */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -2,
            textAlign: "center",
            opacity: hookOpacity,
            transform: `scale(${hookScale})`,
            textShadow: "0 0 60px rgba(239, 68, 68, 0.5)",
          }}
        >
          "Anonymity is a Lie"
        </div>

        {/* Statistic */}
        <div
          style={{
            fontSize: 40,
            color: "#a1a1aa",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.5,
            opacity: statOpacity,
            transform: `translateY(${statY}px)`,
          }}
        >
          <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 48 }}>94%</span>{" "}
          of consumers won't buy from companies
          <br />
          that don't protect their data
        </div>

        {/* Logo */}
        <div
          style={{
            marginTop: 40,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -2,
            }}
          >
            LeoPulse
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Privacy-Preserving Polls on Aleo
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
