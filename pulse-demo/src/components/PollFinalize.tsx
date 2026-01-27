import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

interface PollFinalizeProps {
  title?: string;
  pollTitle?: string;
  results?: Array<{ option: string; votes: number; percentage: number }>;
  totalVotes?: number;
}

export const PollFinalize: React.FC<PollFinalizeProps> = ({
  title = "Results Finalized",
  pollTitle = "Team Lunch",
  results = [
    { option: "Pizza", votes: 12, percentage: 40 },
    { option: "Sushi", votes: 10, percentage: 33 },
    { option: "Tacos", votes: 5, percentage: 17 },
    { option: "Salad", votes: 3, percentage: 10 },
  ],
  totalVotes = 30,
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

  // Sort by votes descending
  const sortedResults = [...results].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults[0];

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

        {/* Results card */}
        <div
          style={{
            width: 600,
            padding: 32,
            borderRadius: 20,
            backgroundColor: "#18181b",
            border: `2px solid ${theme.colors.primary}40`,
            transform: `scale(${cardScale})`,
          }}
        >
          {/* Poll title and total votes */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: theme.colors.text,
                fontFamily: theme.fonts.heading,
              }}
            >
              {pollTitle}
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                backgroundColor: "#22c55e20",
                border: "1px solid #22c55e40",
                fontSize: 14,
                color: "#22c55e",
                fontFamily: theme.fonts.body,
                fontWeight: 500,
              }}
            >
              ✓ Finalized
            </div>
          </div>

          {/* Results */}
          {sortedResults.map((result, index) => {
            const delay = fps * (0.5 + index * 0.15);
            const barProgress = interpolate(
              frame - delay,
              [0, fps * 0.5],
              [0, result.percentage],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            const opacity = interpolate(
              frame - delay,
              [0, fps * 0.2],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            const isWinner = result.option === winner.option;

            return (
              <div
                key={result.option}
                style={{
                  marginBottom: 16,
                  opacity,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        color: isWinner ? theme.colors.primary : theme.colors.text,
                        fontFamily: theme.fonts.body,
                        fontWeight: isWinner ? 600 : 400,
                      }}
                    >
                      {result.option}
                    </span>
                    {isWinner && (
                      <span
                        style={{
                          fontSize: 14,
                          color: "#22c55e",
                        }}
                      >
                        Winner!
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      color: theme.colors.muted,
                      fontFamily: theme.fonts.body,
                    }}
                  >
                    {result.votes} votes ({result.percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#27272a",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barProgress}%`,
                      height: "100%",
                      borderRadius: 6,
                      background: isWinner
                        ? `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                        : theme.colors.muted,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Total votes */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #27272a",
              fontSize: 16,
              color: theme.colors.muted,
              fontFamily: theme.fonts.body,
              textAlign: "center",
            }}
          >
            Total: {totalVotes} votes
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
