# Technicolor style test: same shots as the sketch version, vintage 1940s cartoon look
import torch, time, os
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
STYLE = ("retro artstyle, 1940s (style), vintage cartoon, technicolor, painted background, gouache, saturated colors, "
         "rich red and teal, warm lighting, rounded shapes, masterpiece, ")
NEG = ("sketch, monochrome, greyscale, 3d, realistic, photo, modern, cel shading, text, letters, watermark, signature, "
       "lowres, bad anatomy, bad hands, extra fingers, worst quality, low quality")
SHOTS = [
 ("selye_chase", "1boy, young man, slicked-back dark hair, round glasses, white lab coat, necktie, running, swinging a broom, "
                 "chasing a small white rat across a 1930s laboratory, flasks, panicked, comedic, full body", 112),
 ("ad_man", "1man, 1950s man in suit relaxing in armchair, smoking a cigarette, contented smile, living room, vintage advertisement", 140),
 ("you_bed", "1girl, young woman, short messy dark hair, oversized cream sweater, lying in bed awake at night, holding glowing phone, "
             "moonlight through window, blue night", 201),
]
torch.set_num_threads(4)
pipe = StableDiffusionXLPipeline.from_pretrained("cagliostrolab/animagine-xl-4.0", torch_dtype=torch.bfloat16, use_safetensors=True)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config); pipe.set_progress_bar_config(disable=True)
for sid, body, seed in SHOTS:
    if os.path.exists(sid + ".png"): continue
    t = time.time()
    pipe(prompt=STYLE + body, negative_prompt=NEG, width=1344, height=768, num_inference_steps=24, guidance_scale=6.0,
         generator=torch.Generator().manual_seed(seed)).images[0].save(sid + ".png")
    print(sid, f"{time.time() - t:.0f}s", flush=True)
print("ALL_DONE", flush=True)
