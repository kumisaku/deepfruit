# Konteks Proyek: DeepFruit

Aplikasi web deteksi kelayakan buah (segar vs busuk) dari foto, memakai
Computer Vision. Proyek kuliah — utamakan solusi yang sederhana, jelas, dan jujur.
Semua teks UI berbahasa Indonesia.

## Arsitektur
Browser (React/Vite) → Backend (FastAPI /predict) → Model AI (MobileNetV2)

## Struktur
- `frontend/` — React + Vite. Seluruh UI ada di `src/App.jsx` (satu file, 4 halaman:
  Beranda, Deteksi, Cara Kerja, Panduan). Pemanggilan backend lewat `src/api.js`.
  Styling memakai blok `<style>` CSS di dalam App.jsx (bukan Tailwind/CSS modules).
- `backend/` — FastAPI. Endpoint `/predict` di `main.py`. Memuat `../model/`.
- `ml/` — `train.py` (transfer learning MobileNetV2, jalan di Google Colab).
- `model/` — dibuat setelah training: `fruit_model.keras` + `class_names.json`.

## Cara menjalankan
- Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000`
- Frontend: `cd frontend && npm install && npm run dev` (buka http://localhost:5173)
- Training dilakukan TERPISAH di Colab (butuh GPU), bukan di mesin lokal.

## Scope model — JANGAN diperluas tanpa diminta
- Model HANYA klasifikasi 2 kelas: **segar (fresh) vs busuk (rotten)** + confidence.
- Bisa banyak jenis buah; jumlah kelas terdeteksi otomatis dari folder dataset.
- Jika confidence < 0.60 (`CONFIDENCE_THRESHOLD` di backend), kembalikan status
  "uncertain" / "Tidak Yakin" — JANGAN paksakan tebakan.
- Metrik "Integritas Kulit" & "Keseragaman Warna" di UI adalah ESTIMASI turunan
  dari confidence, BUKAN output model terpisah. Pertahankan catatan kaki yang
  menyatakan ini. Jangan menambah klaim palsu (grade, masa simpan, nutrisi =
  future work, bukan kemampuan model sekarang).

## Konvensi
- Teks UI dan komentar penting: Bahasa Indonesia.
- Jangan pakai localStorage di frontend (cukup React state).
- Jaga desain tetap konsisten: hijau #15803d, latar biru-putih #f4f6fa,
  font Plus Jakarta Sans, heading navy.

## Status & sisa pekerjaan
- [x] Frontend 4 halaman selesai
- [x] Backend /predict + threshold "Tidak Yakin"
- [x] Script training siap
- [ ] Latih model di Colab → taруh hasil di `model/`
- [ ] Sesuaikan `parse_label()` di backend dengan penamaan kelas dataset asli
- [ ] Uji end-to-end dengan foto HP sungguhan
