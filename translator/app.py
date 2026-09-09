from flask import Flask, request, jsonify
from flask_cors import CORS

from translator import translate

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Python Translation API is running!"
    })


@app.route("/translate", methods=["POST"])
def translation():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    text = data.get("text")
    source_language = data.get("sourceLanguage")
    target_language = data.get("targetLanguage")

    if not text or not source_language or not target_language:
        return jsonify({
            "error": "Text, source language and target language are required"
        }), 400

    try:

        result = translate(
            text,
            source_language,
            target_language
        )

        return jsonify({
            "text": text,
            "sourceLanguage": source_language,
            "targetLanguage": target_language,
            "translation": result
        })

    except Exception as error:

        print("Translation error:", error)

        return jsonify({
            "error": "Translation failed"
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001
    )