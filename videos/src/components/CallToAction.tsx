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
  url = "leopulse.io",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const buttonScale = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
    },
  });

  const urlOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });

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
            padding: "24px 64px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            borderRadius: 16,
            fontSize: 32,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Get Started
        </div>

        <div
          style={{
            fontSize: 36,
            color: "#a1a1aa",
            fontFamily: "system-ui, sans-serif",
            opacity: urlOpacity,
          }}
        >
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
