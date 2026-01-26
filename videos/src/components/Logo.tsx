import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          LeoPulse
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: 2,
          }}
        >
          Privacy-Preserving Polls on Aleo
        </div>
      </div>
    </AbsoluteFill>
  );
};
