import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface TextSceneProps {
  title?: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

export const TextScene: React.FC<TextSceneProps> = ({
  title,
  text,
  backgroundColor = "#0a0a0a",
  textColor = "#fafafa",
}) => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [15, 35], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          maxWidth: 1400,
        }}
      >
        {title && (
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              opacity: titleOpacity,
              textAlign: "center",
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: 42,
            color: textColor,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.5,
            textAlign: "center",
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
