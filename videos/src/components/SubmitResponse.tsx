import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const ShieldIcon: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const glowIntensity = interpolate(
    (frame - delay) % (fps * 2),
    [0, fps, fps * 2],
    [0.5, 1, 0.5],
    { extrapolateLeft: "clamp" }
  );

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        filter: `drop-shadow(0 0 ${30 * glowIntensity}px rgba(34, 197, 94, ${0.6 * glowIntensity}))`,
      }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22c55e"
        strokeWidth="1.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" />
      </svg>
    </div>
  );
};

const VoteOption: React.FC<{
  label: string;
  delay: number;
  isVoting?: boolean;
}> = ({ label, delay, isVoting }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const voteProgress = isVoting
    ? interpolate(frame - delay - fps, [0, fps * 0.5], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 28px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        border: isVoting ? "2px solid #22c55e" : "2px solid rgba(255, 255, 255, 0.1)",
        opacity,
        overflow: "hidden",
        minWidth: 300,
      }}
    >
      {isVoting && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${voteProgress}%`,
            backgroundColor: "rgba(34, 197, 94, 0.2)",
          }}
        />
      )}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: `2px solid ${isVoting ? "#22c55e" : "#71717a"}`,
          backgroundColor: isVoting ? "#22c55e" : "transparent",
          position: "relative",
          zIndex: 1,
        }}
      />
      <span
        style={{
          fontSize: 22,
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const SubmitResponse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const zkTextOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 100,
          alignItems: "center",
        }}
      >
        {/* Left side - Vote options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              opacity: titleOpacity,
            }}
          >
            Vote Privately
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <VoteOption label="Option A" delay={fps * 0.4} />
            <VoteOption label="Option B" delay={fps * 0.5} isVoting />
            <VoteOption label="Option C" delay={fps * 0.6} />
          </div>
        </div>

        {/* Right side - ZK Shield */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          <ShieldIcon delay={fps * 0.8} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: zkTextOpacity,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#22c55e",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Zero-Knowledge Proof
            </span>
            <span
              style={{
                fontSize: 18,
                color: "#71717a",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Identity & choice protected
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
