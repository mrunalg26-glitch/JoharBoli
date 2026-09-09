from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit.processor import IndicProcessor
import torch

MODEL_NAME = "ai4bharat/indictrans2-indic-indic-dist-320M"

print("Loading IndicTrans2 Indic-Indic model...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    trust_remote_code=True
)

processor = IndicProcessor(inference=True)

print("IndicTrans2 Indic-Indic model loaded successfully!")

LANGUAGE_CODES = {
    "Hindi": "hin_Deva",
    "Marathi": "mar_Deva",
    "Santhali": "sat_Olck",
    "English": "eng_Latn"
}

def translate(text, source_language, target_language):

    if source_language not in LANGUAGE_CODES:
        raise ValueError("Unsupported source language")

    if target_language not in LANGUAGE_CODES:
        raise ValueError("Unsupported target language")

    if source_language == target_language:
        return text

    source_code = LANGUAGE_CODES[source_language]
    target_code = LANGUAGE_CODES[target_language]

    batch = processor.preprocess_batch(
        [text],
        src_lang=source_code,
        tgt_lang=target_code
    )

    inputs = tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt"
    )

    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            max_length=256,
            num_beams=5
        )

    decoded = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True
    )

    translations = processor.postprocess_batch(
        decoded,
        lang=target_code
    )

    return translations[0]