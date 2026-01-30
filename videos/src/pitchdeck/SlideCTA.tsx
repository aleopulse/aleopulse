import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SlideCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Synced with voiceover (12s total):
  // 0-5s: "Privacy matters...Join us in building the future of honest feedback"
  // 5-16s: "Visit aleo.dpolls.ai, Aleo Pulse where every opinion is valued without sacrificing privacy."
  const taglineOpacity = interpolate(frame, [fps * 3, fps * 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [fps * 3, fps * 4], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Contact appears when "aleo.dpolls.ai" is mentioned (~9s)
  const contactOpacity = interpolate(frame, [fps * 9, fps * 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing glow effect
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.3, 0.6],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99, 102, 241, ${glowIntensity}) 0%, transparent 70%)`,
          filter: "blur(100px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
            opacity: logoOpacity,
          }}
        >
          Join the Privacy Revolution
        </div>

        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -3,
              textShadow: `0 0 80px rgba(99, 102, 241, ${glowIntensity})`,
            }}
          >
            AleoPulse
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            padding: "20px 48px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            "Where every opinion is valued
            <br />
            <span style={{ color: "#8b5cf6", fontWeight: 600 }}>without sacrificing privacy.</span>"
          </div>
        </div>

        {/* Contact */}
        <div
          style={{
            display: "flex",
            gap: 48,
            opacity: contactOpacity,
            marginTop: 20,
          }}
        >
          <ContactItem icon="🌐" text="aleo.dpolls.ai" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ContactItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 24px",
      borderRadius: 30,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}
  >
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span
      style={{
        fontSize: 20,
        color: "#a1a1aa",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {text}
    </span>
  </div>
);
