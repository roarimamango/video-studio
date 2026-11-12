import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { Scene3D } from "./scenes/Scene3D";
import { Captions } from "./components/Captions";

export const myVideoSchema = z.object({
  title: z.string(),
  color: zColor(),
  audioFile: z.string(), // file in /public, "" to disable
  captionsFile: z.string(), // JSON file in /public, "" to disable
});

export const MyVideo: React.FC<z.infer<typeof myVideoSchema>> = ({
  title,
  color,
  audioFile,
  captionsFile,
}) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20, 70, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0f1a" }}>
      {/* 1. Three.js layer */}
      <Scene3D color={color} />

      {/* 2. Title overlay */}
      <Sequence durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 100 }}>
          <h1 style={{ color: "white", fontFamily: "sans-serif", fontSize: 96, opacity: titleOpacity, margin: 0 }}>
            {title}
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* 3. Captions */}
      {captionsFile ? <Captions src={staticFile(captionsFile)} /> : null}

      {/* 4. Audio */}
      {audioFile ? <Audio src={staticFile(audioFile)} volume={0.6} /> : null}
    </AbsoluteFill>
  );
};
