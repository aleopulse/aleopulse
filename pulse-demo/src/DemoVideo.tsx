import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { theme } from "./config/theme";
import { TIMINGS, toFrames } from "./config/timings";
import { Logo } from "./components/Logo";
import { TextScene } from "./components/TextScene";
import { PrivacyModes } from "./components/PrivacyModes";
import { Incentives } from "./components/Incentives";
import { CallToAction } from "./components/CallToAction";
import { AppScreenshot } from "./components/AppScreenshot";

export const DemoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
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
          text="Traditional surveys expose your identity. Your votes and opinions are never truly private."
        />
      </Sequence>

      {/* Scene 3: The Solution */}
      <Sequence
        from={toFrames(TIMINGS.solution.start)}
        durationInFrames={toFrames(TIMINGS.solution.duration)}
      >
        <TextScene
          title="The Solution"
          text="LeoPulse uses zero-knowledge proofs to verify participation without revealing your identity or choices."
        />
        {/* Hero screenshot overlay */}
        <AppScreenshot
          src="hero.png"
          position="right"
          scale={0.45}
          delay={fps * 0.5}
        />
      </Sequence>

      {/* Scene 4: Privacy Modes */}
      <Sequence
        from={toFrames(TIMINGS.privacy.start)}
        durationInFrames={toFrames(TIMINGS.privacy.duration)}
      >
        <PrivacyModes />
      </Sequence>

      {/* Scene 4b: Create poll screenshot overlay (second half of privacy section) */}
      <Sequence
        from={toFrames(TIMINGS.privacy.start + TIMINGS.privacy.duration * 0.5)}
        durationInFrames={toFrames(TIMINGS.privacy.duration * 0.5)}
      >
        <AppScreenshot src="create-poll.png" position="right" scale={0.4} />
      </Sequence>

      {/* Scene 5: Incentives */}
      <Sequence
        from={toFrames(TIMINGS.incentives.start)}
        durationInFrames={toFrames(TIMINGS.incentives.duration)}
      >
        <Incentives
          subtitle="PULSE & USDC Rewards"
          features={[
            "Fixed rewards per vote",
            "Equal split among voters",
            "Automatic on-chain distribution",
            "2% platform fee only",
          ]}
        />
        {/* Rewards screenshot overlay */}
        <AppScreenshot src="rewards.png" position="right" scale={0.4} delay={fps * 0.3} />
      </Sequence>

      {/* Scene 6: Call to Action */}
      <Sequence
        from={toFrames(TIMINGS.cta.start)}
        durationInFrames={toFrames(TIMINGS.cta.duration)}
      >
        {/* Dashboard screenshot as subtle background */}
        <AppScreenshot src="dashboard.png" scale={0.5} showOverlay />
        <CallToAction text="Start creating private polls today." />
      </Sequence>
    </AbsoluteFill>
  );
};
