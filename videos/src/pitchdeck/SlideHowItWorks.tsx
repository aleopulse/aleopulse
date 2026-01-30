import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface FlowStepProps {
  icon: string;
  title: string;
  subtitle: string;
  delay: number;
  isLast?: boolean;
}

const FlowStep: React.FC<FlowStepProps> = ({ icon, title, subtitle, delay, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [fps * delay, fps * (delay + 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - fps * delay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const arrowOpacity = interpolate(
    frame,
    [fps * (delay + 0.3), fps * (delay + 0.5)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity,
          transform: `scale(${Math.min(scale, 1)})`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "2px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: 22,
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
            fontSize: 16,
            color: "#71717a",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            maxWidth: 140,
          }}
        >
          {subtitle}
        </div>
      </div>

      {!isLast && (
        <div
          style={{
            fontSize: 40,
            color: "#6366f1",
            opacity: arrowOpacity,
            marginBottom: 40,
          }}
        >
          →
        </div>
      )}
    </div>
  );
};

export const SlideHowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const provenOpacity = interpolate(frame, [fps * 3, fps * 3.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hiddenOpacity = interpolate(frame, [fps * 4, fps * 4.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const aleoOpacity = interpolate(frame, [fps * 5, fps * 5.5], [0, 1], {
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
            fontSize: 56,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          How Zero-Knowledge Voting Works
        </div>

        {/* Flow Diagram */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <FlowStep
            icon="👤"
            title="Voter"
            subtitle="Selects option"
            delay={0.6}
          />
          <FlowStep
            icon="🔐"
            title="ZK Proof"
            subtitle="Generated locally"
            delay={1.0}
          />
          <FlowStep
            icon="✓"
            title="Verify"
            subtitle="On-chain check"
            delay={1.4}
          />
          <FlowStep
            icon="📊"
            title="Count"
            subtitle="Anonymously"
            delay={1.8}
            isLast
          />
        </div>

        {/* Privacy Guarantee */}
        <div
          style={{
            display: "flex",
            gap: 60,
            marginTop: 20,
          }}
        >
          {/* What's Proven */}
          <div
            style={{
              padding: 32,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              opacity: provenOpacity,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#22c55e",
                marginBottom: 16,
                fontFamily: "system-ui",
              }}
            >
              What's Proven:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CheckItem text="You're eligible to vote" />
              <CheckItem text="Your vote is valid" />
              <CheckItem text="No double-voting" />
            </div>
          </div>

          {/* What's Hidden */}
          <div
            style={{
              padding: 32,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              opacity: hiddenOpacity,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#6366f1",
                marginBottom: 16,
                fontFamily: "system-ui",
              }}
            >
              What's Hidden:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <LockItem text="Who you are" />
              <LockItem text="How you voted" />
            </div>
          </div>
        </div>

        {/* Powered by Aleo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: aleoOpacity,
            padding: "12px 28px",
            borderRadius: 30,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <div style={{ fontSize: 18, color: "#71717a", fontFamily: "system-ui" }}>
            Powered by
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6", fontFamily: "system-ui" }}>
            ALEO
          </div>
          <div style={{ fontSize: 16, color: "#6366f1", fontFamily: "system-ui" }}>
            • The math guarantees it
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#fff",
      }}
    >
      ✓
    </div>
    <div style={{ fontSize: 20, color: "#fafafa", fontFamily: "system-ui" }}>{text}</div>
  </div>
);

const LockItem: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ fontSize: 24 }}>🔒</div>
    <div style={{ fontSize: 20, color: "#fafafa", fontFamily: "system-ui" }}>{text}</div>
  </div>
);
