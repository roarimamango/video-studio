import torch, time, sys
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
torch.set_num_threads(4)
pipe=StableDiffusionXLPipeline.from_pretrained("cagliostrolab/animagine-xl-4.0", torch_dtype=torch.bfloat16, use_safetensors=True)
pipe.scheduler=EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
STYLE="sketch, ink (medium), watercolor (medium), traditional media, rough lines, loose linework, white background, minimalist, muted colors, masterpiece, "
NEG="cel shading, anime coloring, 3d, realistic, shiny, glossy, digital painting, dark background, text, watermark, signature, lowres, bad anatomy, bad hands, worst quality, low quality"
shots=[
 ("selye_rat", STYLE+"1boy, young scientist, 1930s, round glasses, lab coat, necktie, kneeling on the floor, gently holding a small white rat in his palms, curious gentle expression, a few glass flasks nearby, full body", 1216, 832, 21),
 ("alone_chest", STYLE+"1girl, short hair, sweater, sitting alone on the ground, hugging her knees, eyes closed, calm, small red heart on her chest, full body, lots of empty space", 1216, 832, 7),
]
for name,p,w,h,sd in shots:
  t=time.time()
  pipe(prompt=p,negative_prompt=NEG,width=w,height=h,num_inference_steps=24,guidance_scale=5.5,generator=torch.Generator().manual_seed(sd)).images[0].save(name+".png")
  print(name, f"{time.time()-t:.0f}s", flush=True)
print("DONE", flush=True)
