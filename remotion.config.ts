import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// WebGL (Three.js) renderer for headless Chrome:
//  - "angle"   = uses your GPU (fast, best on Mac/Windows/Linux with a GPU)
//  - "swangle" = software rendering (works anywhere, e.g. servers without a GPU, but slower)
// Override with: REMOTION_GL=swangle npm run render
Config.setChromiumOpenGlRenderer(
  (process.env.REMOTION_GL as "angle" | "swangle" | undefined) ?? "angle",
);

// Optional: use an existing Chrome instead of letting Remotion download one.
// Set REMOTION_BROWSER=/path/to/chrome-headless-shell (only needed in restricted environments).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
