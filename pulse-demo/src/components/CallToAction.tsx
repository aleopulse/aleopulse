import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface CallToActionProps {
  text: string;
  buttonText?: string;
  subtitle?: string;
}

export const CallToAction: React.FC<CallToActionProps> = ({
  text,
  buttonText = "Get Started",
  subtitle = "Try it free",
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
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #1a1a2e 100%)`,
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
            color: theme.colors.text,
            fontFamily: theme.fonts.heading,
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
            background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
            borderRadius: 20,
            fontSize: 36,
            fontWeight: 700,
            color: "white",
            fontFamily: theme.fonts.heading,
            boxShadow: `0 0 ${60 * glowIntensity}px ${theme.colors.secondary}80`,
          }}
        >
          {buttonText}
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
              color: theme.colors.secondary,
              fontFamily: theme.fonts.body,
              fontWeight: 600,
            }}
          >
            {theme.url}
          </div>
          <div
            style={{
              fontSize: 20,
              color: theme.colors.muted,
              fontFamily: theme.fonts.body,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
