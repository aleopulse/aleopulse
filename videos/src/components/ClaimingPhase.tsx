import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const StatusBadge: React.FC<{
  status: string;
  color: string;
  active: boolean;
  delay: number;
}> = ({ status, color, active, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const pulseIntensity = active
    ? interpolate((frame - delay) % fps, [0, fps / 2, fps], [1, 1.05, 1], {
        extrapolateLeft: "clamp",
      })
    : 1;

  return (
    <div
      style={{
        padding: "16px 32px",
        backgroundColor: active ? `${color}30` : "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        border: `3px solid ${active ? color : "rgba(255, 255, 255, 0.1)"}`,
        transform: `scale(${scale * pulseIntensity})`,
        boxShadow: active ? `0 0 30px ${color}40` : "none",
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: active ? color : "#71717a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {status}
      </span>
    </div>
  );
};

const Arrow: React.FC<{ delay: number; lit: boolean }> = ({ delay, lit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={lit ? "#8b5cf6" : "#3f3f46"}
        strokeWidth="2"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export const ClaimingPhase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Transition happens around 1.5 seconds
  const isTransitioned = frame > fps * 1.5;

  const subtitleOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
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
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
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
          Poll Status Transition
        </div>

        {/* Status flow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <StatusBadge
            status="ACTIVE"
            color="#22c55e"
            active={!isTransitioned}
            delay={fps * 0.4}
          />
          <Arrow delay={fps * 0.6} lit={isTransitioned} />
          <StatusBadge
            status="CLAIMING"
            color="#eab308"
            active={isTransitioned}
            delay={fps * 0.8}
          />
          <Arrow delay={fps * 1.0} lit={false} />
          <StatusBadge
            status="FINALIZED"
            color="#6366f1"
            active={false}
            delay={fps * 1.2}
          />
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: subtitleOpacity,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Creator enables reward claiming
          </span>
          <span
            style={{
              fontSize: 20,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Participants can now collect their tokens
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
