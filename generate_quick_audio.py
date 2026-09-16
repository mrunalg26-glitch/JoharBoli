import urllib.request
import json
from pathlib import Path

audio_dir = Path(r"D:\SIH26042\frontend\public\quick-audio")
audio_dir.mkdir(parents=True, exist_ok=True)

items = [
    ("word-01", "ᱡᱚᱦᱟᱨ"),
    ("word-02", "ᱥᱟᱹᱨᱦᱟᱣ"),
    ("word-03", "ᱫᱟᱜ"),
    ("word-04", "ᱥᱠᱩᱞ"),
    ("word-05", "ᱯᱩᱛᱷᱤ"),
    ("word-06", "ᱚᱲᱟᱜ"),
    ("word-07", "ᱠᱩᱲᱤ"),
    ("word-08", "ᱜᱚᱲᱚ"),
    ("word-09", "ᱧᱩᱛᱩᱢ"),
    ("word-10", "ᱵᱮᱥ"),

    ("sentence-01", "ᱡᱚᱦᱟᱨ ᱾"),
    ("sentence-02", "ᱟᱢ ᱥᱮᱞᱮᱫ ᱢᱮᱱᱟᱢᱟ?"),
    ("sentence-03", "ᱤᱧᱟᱹᱜ ᱧᱩᱛᱩᱢ ᱢᱨᱩᱱᱟᱞ ᱠᱟᱱᱟ ᱾"),
    ("sentence-04", "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱚᱠᱟ ᱠᱟᱱᱟ?"),
    ("sentence-05", "ᱥᱟᱹᱨᱦᱟᱣ ᱾"),
    ("sentence-06", "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱮᱢ ᱜᱚᱲᱚ ᱢᱮ ᱾"),
    ("sentence-07", "ᱱᱚᱣᱟ ᱚᱠᱟ ᱠᱟᱱᱟ?"),
    ("sentence-08", "ᱤᱧ ᱫᱟᱜ ᱥᱟᱵ ᱢᱮᱱᱟᱜᱼᱟ ᱾"),
    ("sentence-09", "ᱤᱧ ᱥᱠᱩᱞ ᱥᱮᱫ ᱠᱟᱱᱟᱹᱧ ᱾"),
    ("sentence-10", "ᱱᱚᱣᱟ ᱤᱧᱟᱹᱜ ᱚᱲᱟᱜ ᱠᱟᱱᱟ ᱾"),
]

for name, text in items:
    print(f"Generating {name}...")

    data = json.dumps({
        "text": text,
        "language": "Santhali"
    }, ensure_ascii=False).encode("utf-8")

    request = urllib.request.Request(
        "http://127.0.0.1:5002/tts",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            audio = response.read()

        output = audio_dir / f"{name}.wav"
        output.write_bytes(audio)

        print(f"  OK -> {output.name}")

    except Exception as e:
        print(f"  ERROR -> {e}")

print("\nFinished.")
