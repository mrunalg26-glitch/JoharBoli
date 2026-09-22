from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

import torch
import soundfile as sf
import os
import hashlib


# ==============================
# CPU OPTIMIZATION
# ==============================

torch.set_num_threads(10)
torch.set_num_interop_threads(2)

print("PyTorch CPU threads:", torch.get_num_threads())


# ==============================
# APP
# ==============================

app = Flask(__name__)
CORS(app)


# ==============================
# DEVICE
# ==============================

device = "cuda:0" if torch.cuda.is_available() else "cpu"

print("Using device:", device)
print("Loading Indic Parler-TTS model...")


# ==============================
# MODEL
# ==============================

MODEL_NAME = "ai4bharat/indic-parler-tts"

from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer


model = ParlerTTSForConditionalGeneration.from_pretrained(
    MODEL_NAME
).to(device)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

description_tokenizer = AutoTokenizer.from_pretrained(
    model.config.text_encoder._name_or_path
)

print("Indic Parler-TTS loaded successfully!")


# ==============================
# SPEAKER DESCRIPTIONS
# ==============================

SPEAKER_DESCRIPTIONS = {

    "English": (
        "A clear English speaker speaks naturally at a moderate speed "
        "with high quality audio and no background noise."
    ),

    "Marathi": (
        "A clear Marathi speaker speaks naturally at a moderate speed "
        "with high quality audio and no background noise."
    ),

    "Santhali": (
        "Pushpa's voice is clear and natural, "
        "speaking Santali at a moderate speed. "
        "The recording is very high quality with no background noise."
    )
}


# ==============================
# CACHE DIRECTORY
# ==============================

CACHE_DIR = os.path.join(
    os.path.dirname(__file__),
    "tts_cache"
)

os.makedirs(
    CACHE_DIR,
    exist_ok=True
)

print("TTS cache directory:", CACHE_DIR)


# ==============================
# CREATE CACHE KEY
# ==============================

def get_cache_file(text, language):

    cache_key = f"{language}:{text}"

    filename = hashlib.sha256(
        cache_key.encode("utf-8")
    ).hexdigest()

    return os.path.join(
        CACHE_DIR,
        filename + ".wav"
    )


# ==============================
# HOME
# ==============================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "SIH26042 TTS Server is running!"
    })


# ==============================
# TTS
# ==============================

@app.route("/tts", methods=["POST"])
def text_to_speech():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is required"
        }), 400


    text = data.get("text")
    language = data.get("language")


    if not text or not language:

        return jsonify({
            "error": "Text and language are required"
        }), 400


    if language not in SPEAKER_DESCRIPTIONS:

        return jsonify({
            "error": "Unsupported language"
        }), 400


    text = text.strip()

    cache_file = get_cache_file(
        text,
        language
    )


    # ==============================
    # CHECK CACHE
    # ==============================

    if os.path.exists(cache_file):

        print(
            f"Using cached speech: {language} -> {text}"
        )

        return send_file(
            cache_file,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="translation.wav"
        )


    # ==============================
    # GENERATE NEW AUDIO
    # ==============================

    try:

        description = SPEAKER_DESCRIPTIONS[
            language
        ]


        description_inputs = (
            description_tokenizer(
                description,
                return_tensors="pt"
            ).to(device)
        )


        prompt_inputs = tokenizer(
            text,
            return_tensors="pt"
        ).to(device)


        print(
            f"Generating speech: {language} -> {text}"
        )


        with torch.inference_mode():

            generation = model.generate(

                input_ids=
                    description_inputs.input_ids,

                attention_mask=
                    description_inputs.attention_mask,

                prompt_input_ids=
                    prompt_inputs.input_ids,

                prompt_attention_mask=
                    prompt_inputs.attention_mask,

                do_sample=True,

                return_dict_in_generate=True
            )


        # ==============================
        # EXTRACT AUDIO
        # ==============================

        if (
            hasattr(generation, "sequences")
            and hasattr(generation, "audios_length")
        ):

            audio = generation.sequences[
                0,
                :generation.audios_length[0]
            ]

        else:

            audio = generation


        audio = (
            audio
            .to(torch.float32)
            .cpu()
            .numpy()
            .squeeze()
        )


        print(
            "Generated audio samples:",
            len(audio)
        )


        print(
            "Audio max amplitude:",
            float(abs(audio).max())
        )


        # ==============================
        # SAVE TO CACHE
        # ==============================

        sf.write(
            cache_file,
            audio,
            model.config.sampling_rate
        )


        print(
            "Saved new speech to cache:"
        )

        print(cache_file)


        # ==============================
        # RETURN AUDIO
        # ==============================

        return send_file(
            cache_file,
            mimetype="audio/wav",
            as_attachment=False,
            download_name="translation.wav"
        )


    except Exception as error:

        print(
            "TTS error:",
            error
        )

        return jsonify({
            "error": "Speech generation failed"
        }), 500


# ==============================
# START SERVER
# ==============================

if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5002))

    app.run(
        host="0.0.0.0",
        port=port
    )