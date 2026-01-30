import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { PitchDeck } from "./PitchDeck";

// DemoVideo: 45 seconds at 30fps
const DEMO_DURATION_SECONDS = 45;
// PitchDeck: 150 seconds (2:30) at 30fps
const PITCHDECK_DURATION_SECONDS = 150;
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
