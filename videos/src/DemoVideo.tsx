import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Logo } from "./components/Logo";
import { TextScene } from "./components/TextScene";
import { CallToAction } from "./components/CallToAction";

// Scene timings (in seconds) - synced with voiceover audio
// intro: 4.3s, problem: 6.5s, solution: 6.2s, features: 15.2s, cta: 5.1s
const TIMINGS = {
  intro: { start: 0, duration: 5 },
  problem: { start: 5, duration: 7 },
  solution: { start: 12, duration: 7 },
  features: { start: 19, duration: 17 },
  cta: { start: 36, duration: 9 }, // Extended for CTA to linger
};

export const DemoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  const toFrames = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Voiceover audio track */}
      <Audio src={staticFile("audio/full-demo.mp3")} />

      {/* Scene 1: Logo Intro */}
      <Sequence
        from={toFrames(TIMINGS.intro.start)}
        durationInFrames={toFrames(TIMINGS.intro.duration)}
      >
        <Logo />
      </Sequence>

      {/* Scene 2: The Problem */}
      <Sequence
        from={toFrames(TIMINGS.problem.start)}
        durationInFrames={toFrames(TIMINGS.problem.duration)}
      >
        <TextScene
          title="The Problem"
          text="Traditional surveys expose your identity. Your votes, opinions, and responses are never truly private."
        />
      </Sequence>

      {/* Scene 3: The Solution */}
      <Sequence
        from={toFrames(TIMINGS.solution.start)}
        durationInFrames={toFrames(TIMINGS.solution.duration)}
      >
        <TextScene
          title="The Solution"
          text="LeoPulse uses zero-knowledge proofs to verify your participation without revealing your identity or your choices."
        />
      </Sequence>

      {/* Scene 4: Features */}
      <Sequence
        from={toFrames(TIMINGS.features.start)}
        durationInFrames={toFrames(TIMINGS.features.duration)}
      >
        <TextScene
          title="Flexible Privacy Modes"
          text="Anonymous voting for complete privacy. Semi-private mode reveals participation but hides choices. Identified mode provides full transparency when needed."
        />
      </Sequence>

      {/* Scene 5: Call to Action */}
      <Sequence
        from={toFrames(TIMINGS.cta.start)}
        durationInFrames={toFrames(TIMINGS.cta.duration)}
      >
        <CallToAction text="Start creating private polls today." />
      </Sequence>
    </AbsoluteFill>
  );
};
