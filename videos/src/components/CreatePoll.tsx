import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const OptionCard: React.FC<{ label: string; delay: number; selected?: boolean }> = ({
  label,
  delay,
  selected,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideX = interpolate(frame - delay, [0, fps * 0.3], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 24px",
        backgroundColor: selected ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        border: selected ? "2px solid #8b5cf6" : "2px solid rgba(255, 255, 255, 0.1)",
        opacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: `2px solid ${selected ? "#8b5cf6" : "#71717a"}`,
          backgroundColor: selected ? "#8b5cf6" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "white",
            }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: 22,
          color: "#e4e4e7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
};

const PrivacyBadge: React.FC<{ mode: string; color: string; delay: number }> = ({
  mode,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        padding: "12px 24px",
        backgroundColor: `${color}20`,
        borderRadius: 12,
        border: `2px solid ${color}60`,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize: 18,
          color,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        {mode}
      </span>
    </div>
  );
};

export const CreatePoll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
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
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left side - Poll creation form mock */}
        <div
          style={{
            width: 500,
            padding: 40,
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transform: `scale(${cardScale})`,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            New Poll
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            What should we build next?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <OptionCard label="Mobile app" delay={fps * 0.4} />
            <OptionCard label="Desktop client" delay={fps * 0.5} selected />
            <OptionCard label="Browser extension" delay={fps * 0.6} />
          </div>
        </div>

        {/* Right side - Settings */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
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
            Create a Poll
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "#a1a1aa",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Choose Privacy Mode
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <PrivacyBadge mode="Anonymous" color="#22c55e" delay={fps * 0.8} />
              <PrivacyBadge mode="Semi-Private" color="#eab308" delay={fps * 1.0} />
              <PrivacyBadge mode="Identified" color="#3b82f6" delay={fps * 1.2} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
