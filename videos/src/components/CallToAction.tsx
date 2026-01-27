import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface CallToActionProps {
  text: string;
  url?: string;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  text,
  url = "aleopulse.onrender.com",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const buttonScale = spring({
    frame: frame - fps,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  const urlOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateRight: "clamp",
  });

  const urlY = interpolate(frame, [fps * 1.5, fps * 2], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Glow animation
  const glowIntensity = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [0.5, 1, 0.5]
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        justifyContent: "center",
        alignItems: "center",
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
            fontSize: 56,
            fontWeight: 600,
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            opacity: textOpacity,
            maxWidth: 1000,
          }}
        >
          {text}
        </div>

        <div
          style={{
            transform: `scale(${buttonScale})`,
            padding: "28px 72px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            borderRadius: 20,
            fontSize: 36,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            boxShadow: `0 0 ${60 * glowIntensity}px rgba(139, 92, 246, ${0.5 * glowIntensity})`,
          }}
        >
          Get Started
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: urlOpacity,
            transform: `translateY(${urlY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 40,
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            {url}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Try it free on testnet
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
