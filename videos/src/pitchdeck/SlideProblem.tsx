import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface ProblemCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [fps * delay, fps * (delay + 0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = spring({
    frame: frame - fps * delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div
      style={{
        flex: 1,
        padding: 32,
        borderRadius: 20,
        backgroundColor: "rgba(99, 102, 241, 0.05)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
      }}
    >
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#ef4444",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#a1a1aa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>
  );
};

export const SlideProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, fps * 0.5], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const statsOpacity = interpolate(frame, [fps * 4, fps * 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
          width: "100%",
          maxWidth: 1600,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          The Trust Crisis in Data Collection
        </div>

        {/* Problem Cards */}
        <div
          style={{
            display: "flex",
            gap: 40,
            width: "100%",
          }}
        >
          <ProblemCard
            icon="🔓"
            title="False Anonymity"
            description="IP addresses & device fingerprints stored by every platform"
            delay={0.8}
          />
          <ProblemCard
            icon="😰"
            title="Response Bias"
            description="26% of employees fear retaliation from 'anonymous' feedback"
            delay={1.2}
          />
          <ProblemCard
            icon="💔"
            title="Data Breaches"
            description="50%+ of consumers avoid companies after breaches"
            delay={1.6}
          />
        </div>

        {/* Bottom Stats */}
        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 20,
            opacity: statsOpacity,
          }}
        >
          <StatBadge value="89%" label="concerned about privacy" />
          <StatBadge value="$2.1B" label="GDPR fines (2024)" />
          <StatBadge value="48%" label="stopped shopping over privacy" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "16px 32px",
      borderRadius: 12,
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    }}
  >
    <div
      style={{
        fontSize: 36,
        fontWeight: 700,
        color: "#ef4444",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: 16,
        color: "#a1a1aa",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {label}
    </div>
  </div>
);
