import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SlideMarket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Market circles animation - synced with voiceover (23s total):
  // 0-5s: "$4 billion today, growing to $12 billion" -> TAM
  // 5-12s: "37% year over year" -> SAM, employee engagement
  // 12-16s: "decentralized governance market" -> Web3
  // 16-23s: "Aleo Pulse sits at the intersection" -> SOM, drivers
  const tamScale = spring({
    frame: frame - fps * 0.5,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const samScale = spring({
    frame: frame - fps * 8,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const web3Scale = spring({
    frame: frame - fps * 12,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const somScale = spring({
    frame: frame - fps * 18,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const driversOpacity = interpolate(frame, [fps * 20, fps * 21], [0, 1], {
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
            background: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          A Multi-Billion Dollar Opportunity
        </div>

        {/* Market Visualization */}
        <div
          style={{
            display: "flex",
            gap: 80,
            alignItems: "center",
          }}
        >
          {/* Concentric Circles */}
          <div
            style={{
              position: "relative",
              width: 500,
              height: 500,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* TAM */}
            <div
              style={{
                position: "absolute",
                width: 480,
                height: 480,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
                border: "2px solid rgba(34, 197, 94, 0.3)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 30,
                transform: `scale(${Math.min(tamScale, 1)})`,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>$12.02B</div>
                <div style={{ fontSize: 16, color: "#71717a" }}>TAM (2032)</div>
              </div>
            </div>

            {/* Web3 Governance */}
            <div
              style={{
                position: "absolute",
                width: 360,
                height: 360,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
                border: "2px solid rgba(99, 102, 241, 0.3)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 25,
                transform: `scale(${Math.min(web3Scale, 1)})`,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>$7.73B</div>
                <div style={{ fontSize: 14, color: "#71717a" }}>Web3 Gov (2035)</div>
              </div>
            </div>

            {/* SAM */}
            <div
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)",
                border: "2px solid rgba(139, 92, 246, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${Math.min(samScale, 1)})`,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#8b5cf6" }}>$1.5B</div>
                <div style={{ fontSize: 14, color: "#71717a" }}>SAM</div>
              </div>
            </div>

            {/* SOM */}
            <div
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)",
                border: "2px solid rgba(168, 85, 247, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${Math.min(somScale, 1)})`,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#a855f7" }}>$50M</div>
                <div style={{ fontSize: 12, color: "#71717a" }}>Y3</div>
              </div>
            </div>
          </div>

          {/* Market Details - synced with voiceover:
              3s: "$4 billion today, growing to $12 billion"
              5s: "37% year over year" (employee engagement)
              12s: "decentralized governance market" */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <MarketRow
              color="#22c55e"
              value="$4.13B → $12.02B"
              label="Survey Software Market"
              cagr="14.3%"
              delay={3}
            />
            <MarketRow
              color="#8b5cf6"
              value="$2.14B"
              label="Employee Engagement"
              cagr="+37% YoY"
              delay={5}
            />
            <MarketRow
              color="#6366f1"
              value="$0.35B → $7.73B"
              label="Decentralized Voting"
              cagr="32.5%"
              delay={12}
            />
          </div>
        </div>

        {/* Growth Drivers */}
        <div
          style={{
            display: "flex",
            gap: 40,
            opacity: driversOpacity,
          }}
        >
          <GrowthBadge value="+37%" label="Anonymous Tools YoY" />
          <GrowthBadge value="+32.5%" label="DAO Governance CAGR" />
          <GrowthBadge value="+15.7%" label="Healthcare Surveys CAGR" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MarketRow: React.FC<{
  color: string;
  value: string;
  label: string;
  cagr: string;
  delay: number;
}> = ({ color, value, label, cagr, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [fps * delay, fps * (delay + 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fafafa", fontFamily: "system-ui" }}>
          {value}
        </div>
        <div style={{ fontSize: 18, color: "#71717a", fontFamily: "system-ui" }}>
          {label} <span style={{ color }}>(CAGR {cagr})</span>
        </div>
      </div>
    </div>
  );
};

const GrowthBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 24px",
      borderRadius: 30,
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
    }}
  >
    <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e", fontFamily: "system-ui" }}>
      {value}
    </div>
    <div style={{ fontSize: 16, color: "#a1a1aa", fontFamily: "system-ui" }}>{label}</div>
  </div>
);
