# Video Studio

Workspace for making animated videos. Two toolchains live here:

| Folder | What | Use for |
|---|---|---|
| `growkaz-stickman-studio/` | **GrowKaz Stickman Studio** (plugin `growkaz-stickman`, in `plugins/`) | **Default for all new videos.** Voiceover → cinematic stick-figure video (2D canvas + Three.js), Whisper timestamps, styles, generated music/SFX. |
| `src/` (Remotion + @remotion/three) | Custom Remotion project | Only when explicitly asked for a Remotion / custom 3D composition. |

## Default workflow for a new video
Use the `growkaz-stickman` plugin skills: `make-2d-video` (full pipeline), or the stages
`/new-video` → `/video-styles` → `/render-video` → `/video-sound`.
The studio is already installed at `growkaz-stickman-studio/` — do not re-copy the kit over it (it would not touch `projects/`, but skip it anyway). Run `python3 tools/doctor.py` there if something seems off.

## Environment notes (cloud container)
- No GPU: rendering uses SwiftShader (software WebGL); slower but works.
- `growkaz-stickman-studio/package.json` pins `playwright` to the version whose Chromium is preinstalled (1.63.0) instead of the kit's 1.56.0.
- Python deps: `pip install numpy scipy faster-whisper "av>=14,<17"` (av 17+ breaks faster-whisper 1.2.1).
- Whisper models download from Hugging Face on first use (~500 MB for `small`).
- Remotion renders here need: `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell REMOTION_GL=swangle`
- Use `python3` (not `python`).
