import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface TextSceneProps {
  title?: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

export const TextScene: React.FC<TextSceneProps> = ({
  title,
  text,
  backgroundColor = "#0a0a0a",
  textColor = "#fafafa",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [fps * 0.3, fps * 0.8], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Gradient background
  const gradientPosition = interpolate(frame, [0, fps * 3], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientPosition * 0.5}deg, ${backgroundColor} 0%, #1a1a2e ${gradientPosition}%, ${backgroundColor} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          maxWidth: 1400,
        }}
      >
        {title && (
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "system-ui, sans-serif",
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              textAlign: "center",
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: 44,
            color: textColor,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.6,
            textAlign: "center",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
