import torch
from transformers import T5EncoderModel, T5TokenizerFast
tok=T5TokenizerFast.from_pretrained("Lightricks/LTX-Video-0.9.5",subfolder="tokenizer")
enc=T5EncoderModel.from_pretrained("city96/t5-v1_1-xxl-encoder-bf16",torch_dtype=torch.bfloat16)
P={"girl":"A loose hand-drawn ink and watercolor sketch animation. A girl with short hair sitting on the ground hugging her knees slowly lifts her head, opens her eyes and looks up, her hair moving gently in the wind. Rough pencil lines, white paper background, fluid hand-drawn 2D animation.",
   "neg":"worst quality, inconsistent motion, blurry, jittery, distorted, photorealistic, 3d render, morphing, deformed face"}
out={}
for k,p in P.items():
  t=tok(p,padding="max_length",max_length=128,truncation=True,return_tensors="pt")
  with torch.no_grad(): e=enc(t.input_ids,attention_mask=t.attention_mask)[0]
  out[k]=(e,t.attention_mask)
torch.save(out,"embeds.pt");print({k:v[0].shape for k,v in out.items()})
