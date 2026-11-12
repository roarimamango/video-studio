# Video Studio

## 1. GrowKaz Stickman Studio (default)
In Claude Code, just say: *"Make a video from this voiceover"* (attach the audio), or run `/new-video`.
Finished videos land in `growkaz-stickman-studio/projects/<name>/out/`.

## 2. Remotion + Three.js (custom 3D)
```bash
npm install
npm run dev        # Remotion Studio (live preview in browser)
npm run render     # -> out/video.mp4
```
- 3D scene: `src/scenes/Scene3D.tsx` (animate with `useCurrentFrame()`, never `useFrame()`)
- Captions: `src/components/Captions.tsx`, data in `public/captions.json`
- Audio: drop files in `public/`, set `audioFile` prop
- Auto captions: `node scripts/transcribe.mjs public/voiceover.mp3`
- No GPU (servers): `REMOTION_GL=swangle npm run render`

## Setup on a new machine
```bash
npm install
cd growkaz-stickman-studio && npm install && npx playwright install chromium
pip install numpy scipy faster-whisper "av>=14,<17"
```
