import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SlideTitle } from "./pitchdeck/SlideTitle";
import { SlideProblem } from "./pitchdeck/SlideProblem";
import { SlideMarket } from "./pitchdeck/SlideMarket";
import { SlideSolution } from "./pitchdeck/SlideSolution";
import { SlideHowItWorks } from "./pitchdeck/SlideHowItWorks";
import { SlideTraction } from "./pitchdeck/SlideTraction";
import { SlideCTA } from "./pitchdeck/SlideCTA";

// Scene timings (in seconds) - synced with voiceover transcript timestamps
// Total: ~150 seconds (2:30)
const TIMINGS = {
  title: { start: 0, duration: 15 },         // [0.00s - 15.00s] Hook + LeoPulse intro
  problem: { start: 15, duration: 25 },      // [15.00s - 40.00s] Trust crisis
  market: { start: 40, duration: 25 },       // [40.00s - 65.00s] Market opportunity
  solution: { start: 65, duration: 30 },     // [65.00s - 95.00s] LeoPulse solution
  howItWorks: { start: 95, duration: 25 },   // [95.00s - 120.00s] ZK flow explanation
  traction: { start: 120, duration: 20 },    // [120.00s - 140.00s] Traction & roadmap
  cta: { start: 140, duration: 10 },         // [140.00s - 150.00s] Call to action
};

export const PitchDeck: React.FC = () => {
  const { fps } = useVideoConfig();

  const toFrames = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Voiceover audio track - uncomment when audio is generated */}
      {/* <Audio src={staticFile("audio/pitchdeck.mp3")} /> */}

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
