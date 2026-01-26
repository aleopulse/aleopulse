import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const Token: React.FC<{ delay: number; offsetX: number; offsetY: number }> = ({
  delay,
  offsetX,
  offsetY,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const x = interpolate(progress, [0, 1], [offsetX, 0]);
  const y = interpolate(progress, [0, 1], [offsetY, 0]);
  const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 1]);
  const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1.2, 1]);

  return (
    <div
      style={{
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        P
      </span>
    </div>
  );
};

const WalletIcon: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const glowIntensity = interpolate(
    Math.max(0, frame - delay - fps),
    [0, fps * 0.5, fps],
    [0.3, 1, 0.3],
    { extrapolateRight: "extend" }
  );

  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: 32,
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
        border: "3px solid #8b5cf6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${40 * glowIntensity}px rgba(139, 92, 246, ${0.5 * glowIntensity})`,
        position: "relative",
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="1.5"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
      </svg>
      <span
        style={{
          fontSize: 18,
          color: "#a1a1aa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Your Wallet
      </span>
    </div>
  );
};

export const ClaimRewards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const amountOpacity = interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
    extrapolateRight: "clamp",
  });

  const amount = Math.floor(
    interpolate(frame, [fps * 1.5, fps * 2.5], [0, 500], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Token positions (flying toward wallet)
  const tokenPositions = [
    { offsetX: -200, offsetY: -100, delay: fps * 0.8 },
    { offsetX: -250, offsetY: 50, delay: fps * 0.9 },
    { offsetX: -180, offsetY: 120, delay: fps * 1.0 },
    { offsetX: -300, offsetY: -50, delay: fps * 1.1 },
    { offsetX: -220, offsetY: 80, delay: fps * 1.2 },
  ];

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
          gap: 50,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#22c55e",
            fontFamily: "system-ui, sans-serif",
            opacity: titleOpacity,
          }}
        >
          Claim Your Rewards
        </div>

        {/* Wallet with flying tokens */}
        <div style={{ position: "relative" }}>
          <WalletIcon delay={fps * 0.4} />
          {tokenPositions.map((pos, i) => (
            <Token
              key={i}
              delay={pos.delay}
              offsetX={pos.offsetX}
              offsetY={pos.offsetY}
            />
          ))}
        </div>

        {/* Amount claimed */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: amountOpacity,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#fafafa",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            +{amount} PULSE
          </span>
          <span
            style={{
              fontSize: 20,
              color: "#22c55e",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Claimed successfully
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
