"""
DeepFruit — backend API (FastAPI)
=================================
Memuat model terlatih dan menyediakan endpoint /predict yang dipanggil frontend.

Scope model (sengaja dibuat sederhana & jujur untuk proyek kuliah):
  - Model hanya mengklasifikasikan SEGAR vs BUSUK + skor keyakinan (confidence).
  - Jika keyakinan di bawah CONFIDENCE_THRESHOLD, hasilnya "uncertain"
    (Tidak Yakin) -> sistem TIDAK memaksakan tebakan. Ini mencegah model
    pede salah saat diberi foto yang buruk / bukan buah.
  - Metrik tambahan (integritas kulit, keseragaman warna) adalah ESTIMASI
    sederhana yang diturunkan dari skor model, bukan output terpisah.

Cara menjalankan:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    Tes di browser: http://localhost:8000/docs
"""

import io
import json
import os

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

MODEL_DIR = os.environ.get("MODEL_DIR", "../model")
IMG_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.60  # di bawah ini -> "Tidak Yakin"

app = FastAPI(title="DeepFruit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

# --- Muat model + label sekali saat startup (lazy — tidak crash jika belum ada) ---
_model = None
_class_names = None


def _load_model():
    """Muat model dan label saat pertama kali dibutuhkan."""
    global _model, _class_names
    if _model is not None:
        return _model, _class_names
    model_path = os.path.join(MODEL_DIR, "fruit_model.keras")
    label_path = os.path.join(MODEL_DIR, "class_names.json")
    if not os.path.exists(model_path) or not os.path.exists(label_path):
        raise FileNotFoundError(
            f"Model belum tersedia di '{MODEL_DIR}/'. "
            "Latih model di Google Colab terlebih dahulu, lalu salin "
            "fruit_model.keras dan class_names.json ke folder model/."
        )
    _model = tf.keras.models.load_model(model_path)
    with open(label_path) as f:
        _class_names = json.load(f)
    return _model, _class_names


def preprocess(image_bytes: bytes) -> np.ndarray:
    """Ubah byte gambar jadi array (1,224,224,3) nilai 0..255.
    Model melakukan scaling-nya sendiri (layer Rescaling saat training)."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    return np.expand_dims(np.asarray(img, dtype=np.float32), axis=0)


def parse_label(label: str):
    """Pisahkan label dataset (mis. 'rottenbanana') jadi status + nama buah.
    Sesuaikan jika dataset kalian memakai penamaan berbeda."""
    low = label.lower()
    if low.startswith("fresh"):
        return "fresh", low.replace("fresh", "")
    if low.startswith("rotten") or low.startswith("stale"):
        return "rotten", low.replace("rotten", "").replace("stale", "")
    return "unknown", label


@app.get("/health")
def health():
    model_ready = os.path.exists(os.path.join(MODEL_DIR, "fruit_model.keras"))
    classes = _class_names if _class_names is not None else []
    return {"status": "ok" if model_ready else "model_missing", "classes": classes, "threshold": CONFIDENCE_THRESHOLD}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Mohon unggah file gambar.")
    try:
        batch = preprocess(await file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="Gambar tidak bisa dibaca.")

    try:
        model, CLASS_NAMES = _load_model()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat model: {str(e)}")

    probs = model.predict(batch, verbose=0)[0]
    top = int(np.argmax(probs))
    confidence = float(probs[top])
    label = CLASS_NAMES[top]
    status, fruit = parse_label(label)

    # Keyakinan rendah -> jangan paksa tebakan
    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "status": "uncertain",
            "label": label,
            "confidence": round(confidence, 4),
            "layak": None,
            "fruit": fruit.strip(),
            "message": "Model tidak cukup yakin. Coba foto ulang dengan latar polos "
                       "dan pencahayaan baik, satu buah per gambar.",
        }

    fresh = status == "fresh"
    return {
        "status": status,
        "label": label,
        "confidence": round(confidence, 4),
        "layak": fresh,
        "fruit": fruit.strip(),
        # estimasi sederhana dari confidence (UI-only, bukan output model terpisah)
        "skin_integrity": "Sangat Baik" if fresh and confidence > 0.85 else ("Baik" if fresh else "Menurun"),
        "color_uniformity": round(confidence * 100, 1),
        "all_scores": {CLASS_NAMES[i]: round(float(p), 4) for i, p in enumerate(probs)},
    }
