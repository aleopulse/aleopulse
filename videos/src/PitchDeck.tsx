import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SlideTitle } from "./pitchdeck/SlideTitle";
import { SlideProblem } from "./pitchdeck/SlideProblem";
import { SlideMarket } from "./pitchdeck/SlideMarket";
import { SlideSolution } from "./pitchdeck/SlideSolution";
import { SlideHowItWorks } from "./pitchdeck/SlideHowItWorks";
import { SlideTraction } from "./pitchdeck/SlideTraction";
import { SlideCTA } from "./pitchdeck/SlideCTA";

// Scene timings (in seconds) - synced with voiceover transcript timestamps
// Total: ~133 seconds (2:13) - matches pitchdeck_v2.mp3 duration (132.6s)
const TIMINGS = {
  title: { start: 0, duration: 14 },         // [0.00s - 14.00s] Hook: "94% of consumers..." + "Aleo Pulse changes that"
  problem: { start: 14, duration: 18 },      // [14.00s - 32.00s] Trust crisis, privacy stats, "trust is broken"
  market: { start: 32, duration: 23 },       // [32.00s - 55.00s] $4B→$12B market, converging markets
  solution: { start: 55, duration: 20 },     // [55.00s - 75.00s] ZK-proven anonymity, on-chain verification
  howItWorks: { start: 75, duration: 18 },   // [75.00s - 93.00s] ZK proof flow: "Here's how it works..."
  traction: { start: 93, duration: 24 },     // [93.00s - 117.00s] Live on testnet, roadmap, Aleo backing
  cta: { start: 117, duration: 16 },         // [117.00s - 133.00s] "Join us", aleo.dpolls.ai tagline
};

export const PitchDeck: React.FC = () => {
  const { fps } = useVideoConfig();

  const toFrames = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Voiceover audio track */}
      <Audio src={staticFile("audio/pitchdeck_v2.mp3")} />

      {/* Slide 1: Title & Hook */}
      <Sequence
        from={toFrames(TIMINGS.title.start)}
        durationInFrames={toFrames(TIMINGS.title.duration)}
      >
        <SlideTitle />
      </Sequence>

      {/* Slide 2: The Problem */}
      <Sequence
        from={toFrames(TIMINGS.problem.start)}
        durationInFrames={toFrames(TIMINGS.problem.duration)}
      >
        <SlideProblem />
      </Sequence>

      {/* Slide 3: Market Opportunity */}
      <Sequence
        from={toFrames(TIMINGS.market.start)}
        durationInFrames={toFrames(TIMINGS.market.duration)}
      >
        <SlideMarket />
      </Sequence>

      {/* Slide 4: The Solution */}
      <Sequence
        from={toFrames(TIMINGS.solution.start)}
        durationInFrames={toFrames(TIMINGS.solution.duration)}
      >
        <SlideSolution />
      </Sequence>

      {/* Slide 5: How It Works */}
      <Sequence
        from={toFrames(TIMINGS.howItWorks.start)}
        durationInFrames={toFrames(TIMINGS.howItWorks.duration)}
      >
        <SlideHowItWorks />
      </Sequence>

      {/* Slide 6: Traction & Roadmap */}
      <Sequence
        from={toFrames(TIMINGS.traction.start)}
        durationInFrames={toFrames(TIMINGS.traction.duration)}
      >
        <SlideTraction />
      </Sequence>

      {/* Slide 7: Call to Action */}
      <Sequence
        from={toFrames(TIMINGS.cta.start)}
        durationInFrames={toFrames(TIMINGS.cta.duration)}
      >
        <SlideCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
