import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface TextSceneProps {
  title?: string;
  text: string;
  titleGradient?: boolean;
}

export const TextScene: React.FC<TextSceneProps> = ({
  title,
  text,
  titleGradient = true,
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

  // Animated gradient background
  const gradientPosition = interpolate(frame, [0, fps * 3], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientPosition * 0.5}deg, ${theme.colors.background} 0%, #1a1a2e ${gradientPosition}%, ${theme.colors.background} 100%)`,
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
              background: titleGradient
                ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                : theme.colors.text,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: theme.fonts.heading,
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
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
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
