import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface VotingFlowProps {
  title?: string;
  pollTitle?: string;
  options?: string[];
  selectedIndex?: number;
}

export const VotingFlow: React.FC<VotingFlowProps> = ({
  title = "Cast Your Vote",
  pollTitle = "Team Lunch",
  options = ["Pizza", "Sushi", "Tacos", "Salad"],
  selectedIndex = 1,
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

  // Selection animation
  const selectionFrame = fps * 2; // When selection happens
  const isSelected = frame >= selectionFrame;

  // Submit animation
  const submitFrame = fps * 3;
  const isSubmitting = frame >= submitFrame;
  const submitProgress = interpolate(
    frame - submitFrame,
    [0, fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

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
          {/* Poll title */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: theme.colors.text,
              fontFamily: theme.fonts.heading,
              marginBottom: 24,
            }}
          >
            {pollTitle}
          </div>

          {/* Options */}
          {options.map((option, index) => {
            const isThisSelected = isSelected && index === selectedIndex;
            const selectionScale = isThisSelected
              ? spring({
                  frame: frame - selectionFrame,
                  fps,
                  config: { damping: 12, stiffness: 200 },
                })
              : 1;

            return (
              <div
                key={option}
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  backgroundColor: isThisSelected ? `${theme.colors.primary}20` : "#27272a",
                  border: isThisSelected
                    ? `2px solid ${theme.colors.primary}`
                    : "2px solid transparent",
                  marginBottom: 12,
                  fontSize: 18,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.body,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transform: `scale(${selectionScale})`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${isThisSelected ? theme.colors.primary : theme.colors.muted}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isThisSelected && (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  )}
                </div>
                {option}
              </div>
            );
          })}

          {/* Submit button */}
          <div
            style={{
              position: "relative",
              padding: "16px 32px",
              borderRadius: 12,
              background: isSubmitting
                ? `linear-gradient(90deg, ${theme.colors.primary} ${submitProgress * 100}%, #27272a ${submitProgress * 100}%)`
                : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
              fontSize: 18,
              fontWeight: 600,
              color: "white",
              fontFamily: theme.fonts.heading,
              textAlign: "center",
              marginTop: 8,
              opacity: isSelected ? 1 : 0.5,
            }}
          >
            {submitProgress >= 1 ? "Vote Submitted!" : "Submit Vote"}
            {submitProgress >= 1 && (
              <span style={{ marginLeft: 8 }}>✓</span>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
