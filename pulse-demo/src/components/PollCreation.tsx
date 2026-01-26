import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface PollCreationProps {
  title?: string;
  pollTitle?: string;
  options?: string[];
}

export const PollCreation: React.FC<PollCreationProps> = ({
  title = "Create a Poll",
  pollTitle = "Team Lunch",
  options = ["Pizza", "Sushi", "Tacos", "Salad"],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: theme.colors.secondary,
            fontFamily: theme.fonts.heading,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>

        {/* Poll card */}
        <div
          style={{
            width: 500,
            padding: 32,
            borderRadius: 20,
            backgroundColor: "#18181b",
            border: `2px solid ${theme.colors.primary}40`,
            transform: `scale(${cardScale})`,
          }}
        >
          {/* Poll title input */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                color: theme.colors.muted,
                fontFamily: theme.fonts.body,
                marginBottom: 8,
              }}
            >
              Poll Title
            </div>
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 12,
                backgroundColor: "#27272a",
                border: `1px solid ${theme.colors.primary}60`,
                fontSize: 20,
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
              }}
            >
              {pollTitle}
            </div>
          </div>

          {/* Options */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 14,
                color: theme.colors.muted,
                fontFamily: theme.fonts.body,
                marginBottom: 8,
              }}
            >
              Options
            </div>
            {options.map((option, index) => {
              const optionDelay = fps * (0.5 + index * 0.15);
              const optionOpacity = interpolate(
                frame - optionDelay,
                [0, fps * 0.2],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              );
              const optionX = interpolate(
                frame - optionDelay,
                [0, fps * 0.2],
                [-20, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              );

              return (
                <div
                  key={option}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    backgroundColor: "#27272a",
                    marginBottom: 8,
                    fontSize: 16,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.body,
                    opacity: optionOpacity,
                    transform: `translateX(${optionX}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${theme.colors.muted}`,
                    }}
                  />
                  {option}
                </div>
              );
            })}
          </div>

          {/* Create button */}
          <div
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
              fontSize: 18,
              fontWeight: 600,
              color: "white",
              fontFamily: theme.fonts.heading,
              textAlign: "center",
              opacity: interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            Create Poll
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
