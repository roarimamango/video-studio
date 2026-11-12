// Usage: node scripts/transcribe.mjs public/voiceover.mp3 [model]
// Generates public/<name>.json captions (word-level) using local Whisper.cpp.
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const input = process.argv[2];
const model = process.argv[3] ?? "medium.en"; // tiny.en, base.en, small.en, medium.en, large-v3...
if (!input) {
  console.error("Usage: node scripts/transcribe.mjs <audio-or-video-file> [model]");
  process.exit(1);
}

const whisperPath = path.join(process.cwd(), "whisper.cpp");
const version = "1.5.5";

await installWhisperCpp({ to: whisperPath, version });
await downloadWhisperModel({ model, folder: whisperPath });

// Whisper needs 16kHz mono WAV
const wav = path.join(process.cwd(), "out", "transcribe-temp.wav");
fs.mkdirSync(path.dirname(wav), { recursive: true });
execSync(`ffmpeg -y -loglevel error -i "${input}" -ar 16000 -ac 1 "${wav}"`);

const whisperCppOutput = await transcribe({
  inputPath: wav,
  whisperPath,
  whisperCppVersion: version,
  model,
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput });

const outFile = path.join("public", path.basename(input).replace(/\.[^.]+$/, "") + ".json");
fs.writeFileSync(outFile, JSON.stringify(captions, null, 2));
fs.unlinkSync(wav);
console.log(`Wrote ${captions.length} captions to ${outFile}`);
