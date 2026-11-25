"""Generate each scene of the ElevenLabs paste sheet as one Eleven v3 dialogue.
Usage: python3 gen_scenes.py [scene-prefix ...] [--take N]"""
import json, re, subprocess, sys, os
SHEET = "../../../../voiceover-scripts/the-man-who-invented-stress_ELEVENLABS.md"
CAST = {"NARRATOR": "dSByRdUbTGloB7TFA1qD", "YOU": "3YXAuwCx7wB8kSkKCqsu", "SELYE": "tMSJwjBGNGcJ7WVIJhg4",
        "UPHOLSTERER": "TTyZrDYo6LQowrH8mixJ", "FRIEDMAN": "pNInz6obpgDQGcFmaJgB", "AD VOICE": "QMJTqaMXmGnG8TCm8WQG"}
args = [a for a in sys.argv[1:] if not a.startswith("--")]
take = int(sys.argv[sys.argv.index("--take") + 1]) if "--take" in sys.argv else 1
if "--take" in sys.argv: args = [a for a in args if a != str(take)]
scenes, cur = {}, None
for line in open(SHEET):
    m = re.match(r"## (\d\d_\w+)\.mp3", line)
    if m: cur = m.group(1); scenes[cur] = []; continue
    if line.startswith("**") or line.startswith("---"): cur = None if line.startswith("---") else cur
    m = re.match(r"(NARRATOR|YOU|SELYE|UPHOLSTERER|FRIEDMAN|AD VOICE): (.+)", line.strip())
    if cur and m: scenes[cur].append({"text": m.group(2), "voice_id": CAST[m.group(1)]})
os.makedirs("scenes", exist_ok=True)
json.dump(scenes, open("scenes/lines.json", "w"), indent=1)
for name, inputs in scenes.items():
    if args and not any(name.startswith(a) for a in args): continue
    out = f"scenes/{name}_t{take}.mp3"
    if os.path.exists(out): continue
    body = {"inputs": inputs, "model_id": "eleven_v3", "settings": {"stability": 0.5}}
    code = subprocess.run(["curl", "-s", "-o", out + ".part", "-w", "%{http_code}", "-X", "POST",
                           "https://api.elevenlabs.io/v1/text-to-dialogue?output_format=mp3_44100_128",
                           "-H", "Content-Type: application/json", "-d", json.dumps(body)],
                          capture_output=True, text=True).stdout
    if code != "200":
        print(name, "HTTP", code, open(out + ".part", errors="ignore").read()[:400]); os.remove(out + ".part"); continue
    os.replace(out + ".part", out)
    print(name, len(inputs), "lines", sum(len(i["text"]) for i in inputs), "chars ->", out, flush=True)
