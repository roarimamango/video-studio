"""Small ElevenLabs helper. The key is injected by the network proxy (no env var needed)."""
import json, subprocess, sys
API = "https://api.elevenlabs.io/v1"

def tts(voice_id, text, out, stability=0.5, model="eleven_v3"):
    body = {"text": text, "model_id": model, "voice_settings": {"stability": stability}}
    r = subprocess.run(["curl", "-s", "-o", out, "-w", "%{http_code}", "-X", "POST",
                        f"{API}/text-to-speech/{voice_id}?output_format=mp3_44100_128",
                        "-H", "Content-Type: application/json", "-d", json.dumps(body)],
                       capture_output=True, text=True)
    if r.stdout != "200":
        raise RuntimeError(f"{out}: HTTP {r.stdout} {open(out, errors='ignore').read()[:300]}")
    return out
