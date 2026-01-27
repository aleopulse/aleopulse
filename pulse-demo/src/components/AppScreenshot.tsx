import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface AppScreenshotProps {
  src: string;
  alt?: string;
  scale?: number;
  position?: "center" | "right" | "left";
  showOverlay?: boolean;
  delay?: number;
}

export const AppScreenshot: React.FC<AppScreenshotProps> = ({
  src,
  alt,
  scale = 0.65,
  position = "center",
  showOverlay = false,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayedFrame = Math.max(0, frame - delay);

  const scaleAnim = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 100, stiffness: 200 },
  });

  const opacity = interpolate(delayedFrame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(delayedFrame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  const getPositionStyle = (): React.CSSProperties => {
    switch (position) {
      case "left":
        return { justifyContent: "flex-start", paddingLeft: 100 };
      case "right":
        return { justifyContent: "flex-end", paddingRight: 100 };
      default:
        return { justifyContent: "center" };
    }
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        ...getPositionStyle(),
      }}
    >
      <div
        style={{
          transform: `scale(${scaleAnim * scale}) translateY(${translateY}px)`,
          opacity,
        }}
      >
        <Img
          src={staticFile(`screenshots/${src}`)}
          alt={alt}
          style={{
            borderRadius: 16,
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              0 0 0 1px ${theme.colors.primary}20,
              0 0 100px ${theme.colors.primary}10
            `,
          }}
        />
        {showOverlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              background: `linear-gradient(180deg, transparent 60%, ${theme.colors.background}90 100%)`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

interface ScreenshotWithLabelProps extends AppScreenshotProps {
  label?: string;
}

export const ScreenshotWithLabel: React.FC<ScreenshotWithLabelProps> = ({
  label,
  ...props
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AppScreenshot {...props} />
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              borderRadius: 12,
              backgroundColor: `${theme.colors.primary}20`,
              border: `1px solid ${theme.colors.primary}40`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
