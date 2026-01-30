import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface ValuePropProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const ValueProp: React.FC<ValuePropProps> = ({ icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [fps * delay, fps * (delay + 0.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - fps * delay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <div
      style={{
        flex: 1,
        padding: 36,
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
      }}
    >
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#a1a1aa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
};

export const SlideSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // "Built on Aleo's zero-knowledge technology" mentioned at ~5s
  const aleoOpacity = interpolate(frame, [fps * 5, fps * 5.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "built the trust layer" at ~18s
  const differentiatorOpacity = interpolate(frame, [fps * 18, fps * 19], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const differentiatorY = interpolate(frame, [fps * 18, fps * 19], [20, 0], {
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            AleoPulse
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Proven Privacy, Not Promises
          </div>
        </div>

        {/* Value Props Grid - synced with voiceover (22s total):
            4s: "mathematically proven" -> ZK Proofs
            9s: "verified on-chain" -> On-Chain Verification
            13s: "three privacy modes" -> Privacy Modes
            14s: "Pulse token incentives" -> PULSE Incentives */}
        <div
          style={{
            display: "flex",
            gap: 32,
            width: "100%",
          }}
        >
          <ValueProp
            icon="🔐"
            title="Zero-Knowledge Proofs"
            description="Mathematical guarantee of anonymity"
            delay={4}
          />
          <ValueProp
            icon="📊"
            title="On-Chain Verification"
            description="Tamper-proof, auditable results"
            delay={9}
          />
          <ValueProp
            icon="🎚️"
            title="Flexible Privacy Modes"
            description="Anonymous, Semi-Private, Identified"
            delay={13}
          />
          <ValueProp
            icon="💰"
            title="PULSE Incentives"
            description="Reward honest participation"
            delay={14}
          />
        </div>

        {/* Differentiator */}
        <div
          style={{
            padding: "24px 48px",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            opacity: differentiatorOpacity,
            transform: `translateY(${differentiatorY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            "Anonymity is <span style={{ color: "#6366f1", fontWeight: 700 }}>cryptographically proven</span>, not just promised."
          </div>
        </div>

        {/* Built on Aleo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: aleoOpacity,
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#71717a",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Built on
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            ALEO
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              fontSize: 14,
              color: "#3b82f6",
              fontFamily: "system-ui",
            }}
          >
            ZK-Native L1
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
