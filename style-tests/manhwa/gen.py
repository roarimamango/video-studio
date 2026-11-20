import torch, time, sys
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler
torch.set_num_threads(4)
t0=time.time()
pipe=StableDiffusionXLPipeline.from_pretrained("cagliostrolab/animagine-xl-4.0", torch_dtype=torch.bfloat16, use_safetensors=True)
pipe.scheduler=EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
print(f"loaded {time.time()-t0:.0f}s", flush=True)
STYLE="manhwa, korean webtoon, semi-realistic, sharp lineart, cel shading, cinematic lighting, masterpiece, high score, absurdres, "
NEG="lowres, bad anatomy, bad hands, extra fingers, missing fingers, text, speech bubble, watermark, signature, username, blurry, worst quality, low quality, low score, bad score, average score, chibi, cropped head"
shots=[
 ("selye_lab", STYLE+"1boy, young scientist, 1930s, slicked-back black hair, round glasses, white lab coat, necktie, startled, chasing a white rat on the floor, holding broom, old laboratory, glass flasks, wire cages, sunlight through window, wide shot", 1216, 832),
 ("selye_close", STYLE+"1boy, young scientist, 1930s, slicked-back black hair, round glasses, white lab coat, necktie, serious expression, looking at test tube in hand, upper body, old laboratory, rim light, warm window light", 832, 1216),
]
for name,p,w,h in shots:
  t=time.time()
  img=pipe(prompt=p,negative_prompt=NEG,width=w,height=h,num_inference_steps=24,guidance_scale=5.5,generator=torch.Generator().manual_seed(1936)).images[0]
  img.save(f"/home/user/video-studio/style-tests/manhwa/{name}.png"); print(f"{name} {time.time()-t:.0f}s", flush=True)
print("DONE", flush=True)
