# DeepFruit — Deteksi Kelayakan Buah dengan Computer Vision

Aplikasi web untuk mendeteksi apakah sebuah buah **layak konsumsi (segar)** atau
**tidak (busuk)** dari fotonya, menggunakan model deep learning (CNN). Proyek ini
terdiri dari tiga bagian yang saling terhubung:

```
Browser (React/Vite)  ──unggah foto──▶  Backend (FastAPI)  ──▶  Model AI (MobileNetV2)
        ◀──── { status, confidence } ───────────┘
```

## Struktur Proyek
```
deepfruit/
├── frontend/          # Aplikasi web (React + Vite)
│   ├── src/
│   │   ├── App.jsx    # Seluruh UI: Beranda, Deteksi, Cara Kerja, Panduan
│   │   ├── api.js     # Pemanggilan ke backend
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/           # API server (FastAPI)
│   ├── main.py        # Endpoint /predict
│   └── requirements.txt
├── ml/                # Pelatihan model
│   ├── train.py       # Transfer learning MobileNetV2
│   └── requirements.txt
├── model/             # (dibuat setelah training) fruit_model.keras + class_names.json
└── README.md
```

## Cara Menjalankan

### 1. Latih model (sekali saja, di Google Colab — ada GPU gratis)
1. Unduh dataset "fresh vs rotten" dari Kaggle, susun jadi `data/train/<kelas>/`
   dan `data/test/<kelas>/` (satu folder per kelas, mis. `freshapple`, `rottenapple`).
2. Buka Colab, set Runtime → GPU, jalankan `ml/train.py`.
3. Unduh folder `model/` hasilnya, taruh di root proyek (sejajar `backend/`).

### 2. Jalankan backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Tes di `http://localhost:8000/docs` (bisa upload gambar langsung di sana).

### 3. Jalankan frontend
```bash
cd frontend
npm install
npm run dev
```
Buka `http://localhost:5173`. Halaman **Deteksi** akan memanggil backend.
Kalau backend belum jalan, tombol "Lihat contoh hasil" tetap menampilkan tampilan hasil.

## Tentang Model AI

**Tugas model:** klasifikasi gambar 2 kategori — **segar vs busuk** — beserta skor
keyakinan (confidence). Bisa mencakup banyak jenis buah; jumlah kelas terdeteksi
otomatis dari struktur folder dataset.

**Arsitektur:** transfer learning dengan **MobileNetV2** (pra-latih ImageNet) +
lapisan klasifikasi baru. Dipilih karena ringan, cepat, dan akurasinya tinggi pada
dataset buah (penelitian melaporkan ~95–98%).

**Penanganan ketidakpastian:** jika confidence < `0.60` (lihat `CONFIDENCE_THRESHOLD`
di `backend/main.py`), sistem mengembalikan status **"Tidak Yakin"** dan tidak
memaksakan tebakan. Ini mencegah model salah dengan percaya diri saat diberi foto
buruk atau bukan buah.

## Batasan Jujur & Pengembangan Lanjut

Bagian ini sengaja ditulis terbuka karena penting secara akademis:

1. **Metrik tambahan adalah estimasi.** Tampilan "Integritas Kulit" dan
   "Keseragaman Warna" diturunkan secara sederhana dari skor model, **bukan** output
   model terpisah. Model dasar hanya menghasilkan label segar/busuk + confidence.
2. **Generalisasi terbatas.** Model dilatih pada dataset foto studio (latar bersih,
   pencahayaan baik). Akurasi bisa menurun pada foto HP sehari-hari (latar ramai,
   cahaya kurang, beberapa buah). Disarankan menguji dengan foto sendiri.
3. **Grade (A–C), estimasi masa simpan, profil nutrisi, analisis spektral** yang
   tampil di UI adalah elemen desain/simulasi, belum didukung model. Ini cocok
   dijadikan **future work**: melatih model multi-output dengan dataset berlabel
   lebih kaya.

Untuk meningkatkan: tambah augmentasi data, perbanyak variasi gambar nyata,
kalibrasi confidence, dan kembangkan model multi-output untuk kematangan & grade.
