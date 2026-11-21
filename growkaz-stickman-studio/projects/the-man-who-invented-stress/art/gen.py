# Resumable batch: generates art/raw/<id>.png for every shot that doesn't exist yet.  usage: python3 gen.py [id-prefix ...]
import torch, time, os, sys
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
from shots import SHOTS, STYLE, NEG
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'raw')
want = [s for s in SHOTS if not sys.argv[1:] or any(s[0].startswith(a) for a in sys.argv[1:])]
todo = [s for s in want if not os.path.exists(os.path.join(OUT, s[0] + '.png'))]
print(f"{len(todo)} to generate", flush=True)
if not todo: sys.exit()
torch.set_num_threads(4)
pipe = StableDiffusionXLPipeline.from_pretrained("cagliostrolab/animagine-xl-4.0", torch_dtype=torch.bfloat16, use_safetensors=True)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
for sid, act, body, seed, action in todo:
    t = time.time()
    img = pipe(prompt=STYLE + body, negative_prompt=NEG, width=1344, height=768, num_inference_steps=24, guidance_scale=5.5,
               generator=torch.Generator().manual_seed(seed)).images[0]
    img.save(os.path.join(OUT, sid + '.png.tmp.png')); os.replace(os.path.join(OUT, sid + '.png.tmp.png'), os.path.join(OUT, sid + '.png'))
    print(f"{sid} {time.time()-t:.0f}s", flush=True)
print("ALL_DONE", flush=True)
