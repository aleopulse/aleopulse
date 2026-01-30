import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface TractionItemProps {
  text: string;
  delay: number;
}

const TractionItem: React.FC<TractionItemProps> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [fps * delay, fps * (delay + 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkScale = spring({
    frame: frame - fps * delay,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          color: "#fff",
          transform: `scale(${Math.min(checkScale, 1)})`,
          boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
        }}
      >
        ✓
      </div>
      <div style={{ fontSize: 24, color: "#fafafa", fontFamily: "system-ui" }}>{text}</div>
    </div>
  );
};

interface RoadmapPhaseProps {
  quarter: string;
  title: string;
  items: string[];
  delay: number;
  isHighlighted?: boolean;
}

const RoadmapPhase: React.FC<RoadmapPhaseProps> = ({ quarter, title, items, delay, isHighlighted }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [fps * delay, fps * (delay + 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - fps * delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <div
      style={{
        flex: 1,
        padding: 28,
        borderRadius: 20,
        background: isHighlighted
          ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)"
          : "rgba(255, 255, 255, 0.02)",
        border: isHighlighted
          ? "2px solid rgba(99, 102, 241, 0.4)"
          : "1px solid rgba(255, 255, 255, 0.1)",
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: isHighlighted ? "#6366f1" : "#71717a",
          fontWeight: 600,
          marginBottom: 8,
          fontFamily: "system-ui",
        }}
      >
        {quarter}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#fafafa",
          marginBottom: 20,
          fontFamily: "system-ui",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              fontSize: 18,
              color: "#a1a1aa",
              fontFamily: "system-ui",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: isHighlighted ? "#6366f1" : "#71717a" }}>•</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SlideTraction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Aleo stats appear when "$228 million" is mentioned (~18s into slide)
  const aleoOpacity = interpolate(frame, [fps * 18, fps * 19], [0, 1], {
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
          gap: 50,
          width: "100%",
          maxWidth: 1600,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          Built, Deployed, Growing
        </div>

        <div
          style={{
            display: "flex",
            gap: 60,
            width: "100%",
          }}
        >
          {/* Current Traction */}
          <div
            style={{
              flex: 1,
              padding: 36,
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#22c55e",
                marginBottom: 28,
                fontFamily: "system-ui",
              }}
            >
              Current Traction
            </div>
            {/* Synced with voiceover (26s total):
                0.5s: "live on Aleo testnet"
                2s: "all three privacy modes"
                4s: "private poll invitations"
                5s: "wallet integration complete" */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <TractionItem text="Live on Aleo Testnet" delay={0.5} />
              <TractionItem text="3 Privacy Modes Implemented" delay={2} />
              <TractionItem text="Private Poll Invite System" delay={4} />
              <TractionItem text="Leo Wallet Integration" delay={5} />
            </div>
          </div>

          {/* Roadmap */}
          <div
            style={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#fafafa",
                fontFamily: "system-ui",
              }}
            >
              Roadmap
            </div>
            {/* Synced with voiceover:
                9s: "Pulse token launch in Q1"
                11s: "enterprise features in Q2"
                13s: "scaling with mobile and partnerships through the rest of 2026" */}
            <div style={{ display: "flex", gap: 20 }}>
              <RoadmapPhase
                quarter="Q1 2026"
                title="Token Launch"
                items={["PULSE Token", "Reward System", "Staking"]}
                delay={9}
                isHighlighted
              />
              <RoadmapPhase
                quarter="Q2 2026"
                title="Enterprise"
                items={["API Access", "Analytics", "Compliance"]}
                delay={11}
              />
              <RoadmapPhase
                quarter="Q3-Q4 2026"
                title="Scale"
                items={["Mobile App", "SDK", "Partnerships"]}
                delay={13}
              />
            </div>
          </div>
        </div>

        {/* Aleo Stats */}
        <div
          style={{
            display: "flex",
            gap: 40,
            padding: "20px 40px",
            borderRadius: 16,
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            opacity: aleoOpacity,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#71717a", fontFamily: "system-ui" }}>Built on</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6", fontFamily: "system-ui" }}>
              ALEO
            </div>
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
          <AleoStat value="$228M" label="Raised" />
          <AleoStat value="167%" label="Dev Growth" />
          <AleoStat value="330+" label="Projects" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AleoStat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#fafafa", fontFamily: "system-ui" }}>
      {value}
    </div>
    <div style={{ fontSize: 14, color: "#71717a", fontFamily: "system-ui" }}>{label}</div>
  </div>
);
