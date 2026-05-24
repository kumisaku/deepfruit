# Dokumentasi Teknis — DeepFruit

**Aplikasi Web Deteksi Kelayakan Buah Berbasis Computer Vision**  
Proyek Kuliah | Universitas | 2026

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Model AI](#3-model-ai)
4. [Backend](#4-backend)
5. [Frontend](#5-frontend)
6. [Deployment](#6-deployment)
7. [Alur Deteksi End-to-End](#7-alur-deteksi-end-to-end)
8. [Batasan Sistem](#8-batasan-sistem)

---

## 1. Gambaran Umum

DeepFruit adalah aplikasi web yang memungkinkan pengguna mendeteksi kelayakan konsumsi buah (segar atau busuk) hanya dengan mengunggah foto. Sistem menggunakan model Computer Vision berbasis deep learning untuk menganalisis gambar dan mengembalikan hasil dalam hitungan detik.

**Fitur utama:**
- Upload foto buah dari perangkat atau kamera
- Deteksi otomatis: segar atau busuk
- Skor keyakinan model (confidence score)
- Status "Tidak Yakin" jika model tidak cukup yakin (confidence < 60%)
- Riwayat analisis dalam sesi berjalan
- Antarmuka berbahasa Indonesia

**URL Aplikasi:**
- Frontend: `https://deepfruit.vercel.app`
- Backend API: `https://deepfruit.onrender.com`
- API Docs: `https://deepfruit.onrender.com/docs`

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    USER (Browser)                   │
│              React + Vite (Vercel)                  │
└────────────────────────┬────────────────────────────┘
                         │ POST /predict
                         │ (multipart/form-data)
                         ▼
┌─────────────────────────────────────────────────────┐
│               BACKEND (Render - Docker)             │
│                  FastAPI / Python                   │
│                                                     │
│  1. Validasi file gambar                            │
│  2. Preprocessing (resize 224×224)                  │
│  3. Inferensi model                                 │
│  4. Parse hasil → JSON response                     │
└────────────────────────┬────────────────────────────┘
                         │ tf.keras.models.predict()
                         ▼
┌─────────────────────────────────────────────────────┐
│              MODEL AI (MobileNetV2)                 │
│         fruit_model.keras + class_names.json        │
└─────────────────────────────────────────────────────┘
```

### Struktur Folder Proyek

```
deepfruit/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── App.jsx    # Seluruh UI (4 halaman)
│   │   └── api.js     # Pemanggilan backend
│   └── package.json
├── backend/           # FastAPI Python
│   ├── main.py        # Endpoint /predict
│   └── requirements.txt
├── ml/                # Script training
│   ├── train.py       # Transfer learning MobileNetV2
│   └── DeepFruit_Training.ipynb  # Notebook Google Colab
├── model/             # Hasil training (tidak di-push manual)
│   ├── fruit_model.keras
│   └── class_names.json
└── Dockerfile         # Konfigurasi container backend
```

---

## 3. Model AI

### Algoritma
**Transfer Learning** dengan arsitektur **MobileNetV2** yang telah di-pre-train menggunakan dataset ImageNet (1.4 juta gambar, 1000 kelas).

### Dataset
- **Sumber:** Fruits Fresh and Rotten for Classification (Kaggle)
- **Ukuran:** ±1.1 GB
- **Jumlah kelas:** 6 kelas

| Label Dataset | Status | Buah |
|---|---|---|
| `freshapples` | Segar | Apel |
| `rottenapples` | Busuk | Apel |
| `freshbanana` | Segar | Pisang |
| `rottenbanana` | Busuk | Pisang |
| `freshoranges` | Segar | Jeruk |
| `rottenoranges` | Busuk | Jeruk |

### Arsitektur Model

```
Input (224×224×3)
    ↓
Data Augmentation (RandomFlip, RandomRotation, RandomZoom)
    ↓
Rescaling (0–255 → -1 sampai 1)
    ↓
MobileNetV2 Base (pre-trained, 154 layer)
    ↓
GlobalAveragePooling2D
    ↓
Dropout (0.2)
    ↓
Dense (6 unit, softmax)
    ↓
Output: probabilitas 6 kelas
```

### Proses Training (2 Fase)

**Phase 1 — Melatih Classification Head (10 epoch)**
- Base model MobileNetV2 dibekukan (tidak dilatih)
- Hanya layer baru yang dilatih: Pooling, Dropout, Dense
- Learning rate: `1e-3`
- Loss: `categorical_crossentropy`
- Optimizer: `Adam`

**Phase 2 — Fine-tuning (5 epoch tambahan)**
- Membuka 30 layer terakhir MobileNetV2 untuk dilatih
- Layer awal (fitur generik) tetap dibekukan
- Learning rate diturunkan ke `1e-5` untuk menghindari overfitting
- Total epoch: 15

### Konfigurasi Training

| Parameter | Nilai |
|---|---|
| Image size | 224 × 224 piksel |
| Batch size | 32 |
| Initial epochs | 10 |
| Fine-tune epochs | 5 |
| Optimizer | Adam |
| Loss function | Categorical Crossentropy |
| Platform | Google Colab (GPU T4) |

### Confidence Threshold

Jika probabilitas tertinggi model **< 0.60 (60%)**, sistem mengembalikan status **"Tidak Yakin"** dan tidak memaksakan tebakan. Ini mencegah model memberikan hasil yang salah dengan penuh keyakinan saat menerima gambar yang buruk atau bukan buah.

---

## 4. Backend

### Teknologi
- **Framework:** FastAPI 0.115.0 (Python)
- **Server:** Uvicorn 0.30.6
- **Library ML:** TensorFlow / Keras (inferensi model)
- **Image processing:** Pillow, NumPy

### Endpoint API

#### `GET /health`
Mengecek status backend dan apakah model sudah termuat.

**Response:**
```json
{
  "status": "ok",
  "classes": ["freshapples", "freshbanana", ...],
  "threshold": 0.6
}
```

#### `POST /predict`
Menerima file gambar dan mengembalikan hasil deteksi.

**Request:** `multipart/form-data` dengan field `file` (file gambar)

**Response — Berhasil:**
```json
{
  "status": "fresh",
  "label": "freshapples",
  "confidence": 0.9321,
  "layak": true,
  "fruit": "apples",
  "skin_integrity": "Sangat Baik",
  "color_uniformity": 93.2,
  "all_scores": {
    "freshapples": 0.9321,
    "rottenapples": 0.0412,
    ...
  }
}
```

**Response — Tidak Yakin (confidence < 60%):**
```json
{
  "status": "uncertain",
  "label": "freshapples",
  "confidence": 0.4821,
  "layak": null,
  "fruit": "apples",
  "message": "Model tidak cukup yakin..."
}
```

### Preprocessing Gambar
1. Baca byte gambar dari request
2. Convert ke mode RGB (menangani PNG transparan, CMYK, dsb.)
3. Resize ke 224×224 piksel
4. Convert ke array NumPy float32
5. Tambah dimensi batch: shape `(1, 224, 224, 3)`
6. Scaling pixel sudah dilakukan oleh layer `Rescaling` di dalam model

### Parse Label
Fungsi `parse_label()` memecah nama kelas dataset menjadi status dan nama buah:
- `"freshapples"` → status: `fresh`, buah: `apples`
- `"rottenbanana"` → status: `rotten`, buah: `banana`

### CORS
Backend mengizinkan semua origin (`allow_origins=["*"]`) agar frontend di Vercel bisa berkomunikasi dengan backend di Render.

---

## 5. Frontend

### Teknologi
- **Framework:** React 18 + Vite 5
- **Icons:** Lucide React
- **Styling:** CSS murni (inline di App.jsx)
- **Font:** Plus Jakarta Sans (Google Fonts)

### Halaman (Single Page Application)

| Halaman | Deskripsi |
|---|---|
| **Beranda** | Landing page, penjelasan fitur, cara kerja singkat |
| **Deteksi** | Upload gambar, analisis, tampil hasil |
| **Cara Kerja** | Penjelasan teknis proses deteksi |
| **Panduan Buah** | Indikator visual segar/busuk per jenis buah |

### Alur Halaman Deteksi
1. User drag-and-drop atau pilih file gambar
2. Preview gambar ditampilkan di dropzone
3. Klik tombol **Analisis Kesegaran**
4. Progress bar animasi selama menunggu respons
5. Hasil tampil di panel kanan:
   - Foto asli dengan overlay grade
   - Skor kualitas (%)
   - Integritas Kulit & Keseragaman Warna
   - Wawasan AI (rekomendasi penyimpanan)
6. Riwayat analisis diperbarui otomatis

### State Management
Menggunakan React `useState` — tanpa localStorage, tanpa Redux. Data hanya ada selama sesi browser berjalan.

### Desain
- Warna utama: hijau `#15803d`
- Latar: biru-putih `#f4f6fa`
- Heading: navy `#0d1b2a`

---

## 6. Deployment

### Infrastruktur

| Komponen | Platform | Tipe |
|---|---|---|
| Frontend | Vercel | Static hosting |
| Backend | Render | Docker container |
| Source code | GitHub | Git repository |
| Training | Google Colab | Notebook (GPU T4) |

### Docker (Backend)

Backend di-containerisasi menggunakan Docker untuk memastikan environment yang konsisten di server Render.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN pip install keras tensorflow-cpu fastapi uvicorn pillow python-multipart numpy

COPY backend/ ./backend/
COPY model/ ./model/

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Alasan menggunakan Docker:**
- Render free tier menggunakan CPU ARM64 yang tidak memiliki binary TensorFlow pre-built
- Docker dengan base image `python:3.11-slim` (x86_64) memastikan TensorFlow dapat terinstall

### Environment Variables

| Variabel | Platform | Nilai |
|---|---|---|
| `VITE_API_URL` | Vercel | `https://deepfruit.onrender.com/predict` |
| `MODEL_DIR` | Render | `../model` (default) |

### CI/CD
Setiap `git push` ke branch `main` secara otomatis memicu:
- **Vercel:** rebuild dan redeploy frontend
- **Render:** rebuild Docker image dan redeploy backend

---

## 7. Alur Deteksi End-to-End

```
1. User upload foto (JPG/PNG)
         ↓
2. Frontend kirim POST request ke /predict
   Content-Type: multipart/form-data
         ↓
3. Backend validasi: pastikan file adalah gambar
         ↓
4. Preprocessing:
   - Buka gambar dengan Pillow
   - Convert ke RGB
   - Resize ke 224×224
   - Convert ke NumPy array float32
   - Shape: (1, 224, 224, 3)
         ↓
5. Inferensi: model.predict(batch)
   Output: array probabilitas [0.03, 0.91, 0.02, 0.01, 0.02, 0.01]
         ↓
6. Ambil indeks probabilitas tertinggi (argmax)
   Confidence = 0.91 → label = "freshapples"
         ↓
7. Cek threshold:
   - 0.91 ≥ 0.60 → lanjut
   - Jika < 0.60 → kembalikan status "uncertain"
         ↓
8. Parse label:
   "freshapples" → status: "fresh", fruit: "apples"
         ↓
9. Hitung estimasi metrik UI:
   - skin_integrity: "Sangat Baik" (fresh + confidence > 0.85)
   - color_uniformity: 91.0% (dari confidence × 100)
         ↓
10. Kembalikan JSON response ke frontend
         ↓
11. Frontend render hasil:
    - Foto asli dengan overlay grade
    - Skor kualitas, integritas kulit, keseragaman warna
    - Wawasan AI dan rekomendasi
```

---

## 8. Batasan Sistem

### Batasan Model
- Model hanya mengenali **3 jenis buah**: apel, pisang, jeruk
- Foto buah selain 3 jenis tersebut dapat menghasilkan prediksi tidak akurat
- Model dilatih pada kondisi foto tertentu — hasil terbaik dengan:
  - Latar polos / tidak ramai
  - Pencahayaan cukup
  - Satu buah per gambar
  - Jarak dekat, fokus tajam

### Batasan Metrik Tambahan
Metrik **Integritas Kulit** dan **Keseragaman Warna** yang ditampilkan di UI **bukan** output langsung dari model AI. Keduanya adalah estimasi sederhana yang diturunkan dari skor confidence:

```python
skin_integrity = "Sangat Baik" if fresh and confidence > 0.85 else ("Baik" if fresh else "Menurun")
color_uniformity = round(confidence * 100, 1)
```

Catatan ini sudah ditampilkan di UI sebagai disclaimer untuk menjaga kejujuran sistem.

### Batasan Infrastruktur
- Render free tier akan **"tidur"** setelah 15 menit tidak ada request — request pertama setelah idle bisa membutuhkan waktu 20–30 detik
- Tidak ada autentikasi pengguna — siapa saja bisa mengakses API

### Yang Belum Diimplementasi (Future Work)
- Deteksi lebih banyak jenis buah (strawberry, mango, grape, dll.)
- Grade kualitas A–C berdasarkan model terpisah
- Estimasi masa simpan
- Analisis kandungan nutrisi
- Autentikasi dan riwayat permanen per pengguna

---

*Dokumentasi ini dibuat sebagai referensi teknis proyek DeepFruit.*
