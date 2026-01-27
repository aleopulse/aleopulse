import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../config/theme";

type PrivacyMode = "anonymous" | "semi" | "identified";

interface PrivacyModeCardProps {
  title: string;
  description: string;
  mode: PrivacyMode;
  color: string;
  delay: number;
}

const PrivacyIcon: React.FC<{ mode: PrivacyMode; color: string }> = ({
  mode,
  color,
}) => {
  const icons = {
    anonymous: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    semi: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    identified: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  };

  return icons[mode];
};

const PrivacyModeCard: React.FC<PrivacyModeCardProps> = ({
  title,
  description,
  mode,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const opacity = interpolate(frame - delay, [0, fps * 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 32,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 24,
        border: `2px solid ${color}40`,
        width: 320,
        opacity,
        transform: `translateY(${interpolate(slideUp, [0, 1], [40, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <PrivacyIcon mode={mode} color={color} />
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: theme.colors.text,
          fontFamily: theme.fonts.heading,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 18,
          color: theme.colors.muted,
          fontFamily: theme.fonts.body,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>
  );
};

interface PrivacyModesProps {
  title?: string;
  modes?: Array<{
    title: string;
    description: string;
    mode: PrivacyMode;
    color: string;
  }>;
}

const DEFAULT_MODES = [
  {
    title: "Anonymous",
    description: "Complete privacy. Votes are hidden on-chain.",
    mode: "anonymous" as const,
    color: "#22c55e",
  },
  {
    title: "Semi-Private",
    description: "Participation visible, choices hidden.",
    mode: "semi" as const,
    color: "#eab308",
  },
  {
    title: "Identified",
    description: "Full transparency when needed.",
    mode: "identified" as const,
    color: "#3b82f6",
  },
];

export const PrivacyModes: React.FC<PrivacyModesProps> = ({
  title = "Flexible Privacy Modes",
  modes = DEFAULT_MODES,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.background,
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
            fontSize: 56,
            fontWeight: 700,
            color: theme.colors.secondary,
            fontFamily: theme.fonts.heading,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          {modes.map((mode, index) => (
            <PrivacyModeCard
              key={mode.mode}
              title={mode.title}
              description={mode.description}
              mode={mode.mode}
              color={mode.color}
              delay={fps * (0.3 + index * 0.2)}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
