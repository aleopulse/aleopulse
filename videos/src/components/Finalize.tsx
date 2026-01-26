import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CheckIcon: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  const strokeProgress = interpolate(frame - delay, [fps * 0.2, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
        border: "4px solid #22c55e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: "0 0 40px rgba(34, 197, 94, 0.4)",
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22c55e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M20 6L9 17l-5-5"
          strokeDasharray={30}
          strokeDashoffset={30 * (1 - strokeProgress)}
        />
      </svg>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string; delay: number }> = ({
  label,
  value,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideY = interpolate(frame - delay, [0, fps * 0.3], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <span
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 18,
          color: "#71717a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const Finalize: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaScale = spring({
    frame: frame - fps * 2,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

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
            fontSize: 52,
            fontWeight: 700,
            color: "#8b5cf6",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          Poll Finalized
        </div>

        <CheckIcon delay={fps * 0.4} />

        {/* Stats row */}
        <div style={{ display: "flex", gap: 80 }}>
          <StatItem label="Total Votes" value="142" delay={fps * 0.8} />
          <StatItem label="Rewards Claimed" value="14,200 P" delay={fps * 1.0} />
          <StatItem label="Status" value="Closed" delay={fps * 1.2} />
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: ctaOpacity,
            marginTop: 20,
          }}
        >
          <div
            style={{
              transform: `scale(${ctaScale})`,
              padding: "20px 56px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: 16,
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              boxShadow: `0 0 ${40 * glowIntensity}px rgba(139, 92, 246, ${0.5 * glowIntensity})`,
            }}
          >
            Try LeoPulse Today
          </div>
          <span
            style={{
              fontSize: 28,
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            aleopulse.onrender.com
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
