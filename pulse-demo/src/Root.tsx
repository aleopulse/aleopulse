import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";
import { TOTAL_DURATION, FPS } from "./config/timings";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={TOTAL_DURATION * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
