import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";

// Total duration: 45 seconds at 30fps (synced with voiceover transcript)
const DURATION_SECONDS = 45;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={DURATION_SECONDS * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
