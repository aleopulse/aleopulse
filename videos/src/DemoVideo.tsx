import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Logo } from "./components/Logo";
import { CreatePoll } from "./components/CreatePoll";
import { FundPoll } from "./components/FundPoll";
import { SubmitResponse } from "./components/SubmitResponse";
import { ClaimingPhase } from "./components/ClaimingPhase";
import { ClaimRewards } from "./components/ClaimRewards";
import { Finalize } from "./components/Finalize";

// Scene timings (in seconds) - synced with voiceover audio
// Poll lifecycle: Create → Fund → Vote → Claiming → Claim Rewards → Finalize
const TIMINGS = {
  intro: { start: 0, duration: 5 },
  createPoll: { start: 5, duration: 10 },
  fundPoll: { start: 15, duration: 10 },
  submitResponse: { start: 25, duration: 10 },
  claimingPhase: { start: 35, duration: 10 },
  claimRewards: { start: 45, duration: 7 },
  finalize: { start: 52, duration: 8 },
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

      {/* Scene 2: Create Poll */}
      <Sequence
        from={toFrames(TIMINGS.createPoll.start)}
        durationInFrames={toFrames(TIMINGS.createPoll.duration)}
      >
        <CreatePoll />
      </Sequence>

      {/* Scene 3: Fund Poll */}
      <Sequence
        from={toFrames(TIMINGS.fundPoll.start)}
        durationInFrames={toFrames(TIMINGS.fundPoll.duration)}
      >
        <FundPoll />
      </Sequence>

      {/* Scene 4: Submit Response (Vote) */}
      <Sequence
        from={toFrames(TIMINGS.submitResponse.start)}
        durationInFrames={toFrames(TIMINGS.submitResponse.duration)}
      >
        <SubmitResponse />
      </Sequence>

      {/* Scene 5: Claiming Phase */}
      <Sequence
        from={toFrames(TIMINGS.claimingPhase.start)}
        durationInFrames={toFrames(TIMINGS.claimingPhase.duration)}
      >
        <ClaimingPhase />
      </Sequence>

      {/* Scene 6: Claim Rewards */}
      <Sequence
        from={toFrames(TIMINGS.claimRewards.start)}
        durationInFrames={toFrames(TIMINGS.claimRewards.duration)}
      >
        <ClaimRewards />
      </Sequence>

      {/* Scene 7: Finalize & CTA */}
      <Sequence
        from={toFrames(TIMINGS.finalize.start)}
        durationInFrames={toFrames(TIMINGS.finalize.duration)}
      >
        <Finalize />
      </Sequence>
    </AbsoluteFill>
  );
};
