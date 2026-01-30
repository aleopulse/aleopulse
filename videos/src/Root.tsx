import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { PitchDeck } from "./PitchDeck";

// DemoVideo: 45 seconds at 30fps
const DEMO_DURATION_SECONDS = 45;
// PitchDeck: 133 seconds (2:13) at 30fps - matches pitchdeck_v2.mp3 audio (132.6s)
const PITCHDECK_DURATION_SECONDS = 133;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={DEMO_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PitchDeck"
        component={PitchDeck}
        durationInFrames={PITCHDECK_DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
