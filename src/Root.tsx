import { Composition } from "remotion";
import { MyVideo, myVideoSchema } from "./MyVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={300} // 10 seconds @ 30fps
      fps={30}
      width={1920}
      height={1080}
      schema={myVideoSchema}
      defaultProps={{
        title: "Hello, 3D World",
        color: "#4f8cff",
        audioFile: "music.mp3",
        captionsFile: "captions.json",
      }}
    />
  );
};
