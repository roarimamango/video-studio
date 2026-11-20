import torch, time
from diffusers import LTXImageToVideoPipeline
from diffusers.utils import export_to_video
from PIL import Image
torch.set_num_threads(4)
t0=time.time()
pipe=LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video-0.9.5",text_encoder=None,tokenizer=None,torch_dtype=torch.bfloat16)
print(f"loaded {time.time()-t0:.0f}s",flush=True)
E=torch.load("embeds.pt")
img=Image.open("../sketch/alone_chest.png").convert("RGB").resize((768,512),Image.LANCZOS)
last=[time.time()]
def cb(p,i,t,kw):
  print(f"step {i} {time.time()-last[0]:.0f}s",flush=True); last[0]=time.time(); return kw
frames=pipe(image=img,prompt_embeds=E["girl"][0],prompt_attention_mask=E["girl"][1],
  negative_prompt_embeds=E["neg"][0],negative_prompt_attention_mask=E["neg"][1],
  width=768,height=512,num_frames=97,num_inference_steps=30,guidance_scale=3.0,
  decode_timestep=0.05,decode_noise_scale=0.025,
  generator=torch.Generator().manual_seed(42),callback_on_step_end=cb).frames[0]
export_to_video(frames,"girl_action.mp4",fps=24);print(f"DONE {time.time()-t0:.0f}s",flush=True)
