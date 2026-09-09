import torch
import soundfile as sf

from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer


MODEL_NAME = "ai4bharat/indic-parler-tts"

device = "cuda" if torch.cuda.is_available() else "cpu"

print("Using device:", device)
print("Loading Indic Parler-TTS model...")

model = ParlerTTSForConditionalGeneration.from_pretrained(
    MODEL_NAME
).to(device)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

description_tokenizer = AutoTokenizer.from_pretrained(
    model.config.text_encoder._name_or_path
)

print("Model loaded successfully!")

# Santhali text
text = "ᱡᱚᱦᱟᱨ"

# Santali female speaker: Pushpa
description = (
    "Pushpa's voice is clear and natural, "
    "speaking Santali at a moderate speed. "
    "The recording is very high quality with no background noise."
)

input_ids = description_tokenizer(
    description,
    return_tensors="pt"
).input_ids.to(device)

prompt_input_ids = tokenizer(
    text,
    return_tensors="pt"
).input_ids.to(device)

print("Generating Santali speech...")

with torch.no_grad():
    generation = model.generate(
        input_ids=input_ids,
        prompt_input_ids=prompt_input_ids
    )

audio = generation.cpu().numpy().squeeze()

sf.write(
    "santhali_test.wav",
    audio,
    model.config.sampling_rate
)

print("Santali speech generated successfully!")
print("Saved as: santhali_test.wav")