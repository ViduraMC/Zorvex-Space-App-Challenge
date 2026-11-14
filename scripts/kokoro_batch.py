"""Synthesise many lines in one run (the model loads once). Used by scripts/voices.ts.

Input: a JSON file with [{"text", "voice", "speed", "out"}]. Writes one WAV per line.
Model files are the ones the HyperFrames CLI downloads on its first `hyperframes tts` run.
"""
import json
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

CACHE = os.path.join(os.path.expanduser("~"), ".cache", "hyperframes", "tts")


def main() -> None:
    jobs = json.load(open(sys.argv[1], encoding="utf-8"))
    kokoro = Kokoro(os.path.join(CACHE, "models", "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices", "voices-v1.0.bin"))
    for job in jobs:
        lang = "en-gb" if job["voice"].startswith("b") else "en-us"
        samples, rate = kokoro.create(job["text"], voice=job["voice"], speed=job.get("speed", 1.0), lang=lang)
        sf.write(job["out"], samples, rate)
        print(f"  {job['voice']:<11} {os.path.basename(job['out'])}", flush=True)


if __name__ == "__main__":
    main()
