# 💈 BarberVision AI: Hair Analyzer & Haircut Advisor Pro

Sistem cerdas berbasis Computer Vision & AI untuk industri barbershop. Sistem ini mendeteksi 468 titik landmark wajah menggunakan **MediaPipe Face Mesh**, menghitung proporsi geometris wajah pria secara matematis, mengoreksi sudut kemiringan kepala, dan mengklasifikasikan bentuk wajah (Square, Oval, Round, Oblong, Heart, Diamond) guna memberikan rekomendasi potongan rambut presisi beserta panduan teknis *clipper guard* untuk barber.

---

## 🏗️ Arsitektur Proyek

Proyek ini terdiri dari dua komponen modular:

```
hair-analyzer/
├── hair-analyzer-service/       # Backend Computer Vision Microservice (FastAPI + MediaPipe)
│   ├── app/
│   │   ├── main.py              # Entrypoint API, CORS, Lifespan caching, Exception handlers
│   │   ├── core/config.py       # Pengaturan Pydantic v2 & variabel .env
│   │   ├── schemas/face.py      # Kontrak schema request & response
│   │   └── services/
│   │       ├── face_mesh.py     # Ekstraksi 468 titik landmark & estimasi pose solvePnP
│   │       ├── geometry.py      # Kalkulasi jarak Euclidean, rasio, dan sudut rahang
│   │       └── classifier.py    # Mesin aturan penentu 6 bentuk wajah & rekomendasi
│   ├── tests/                   # 20 automated tests unit & integration (pytest)
│   ├── Dockerfile               # Konfigurasi container Docker production
│   ├── requirements.txt         # Pinned dependencies (MediaPipe 0.10.14)
│   ├── .env                     # File konfigurasi backend
│   └── .env.example
│
├── haircut-advisor-web/         # Frontend Web App Barbershop (Next.js 15 + Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Dashboard utama & katalog browser bentuk wajah
│   │   │   ├── scan/page.tsx    # Wizard pemotretan 3 sudut (Depan, Samping, Belakang)
│   │   │   └── result/page.tsx  # Hasil diagnosis, perbandingan visual & mode barber
│   │   ├── components/
│   │   │   ├── camera/          # Viewfinder kamera & SVG silhouette overlay interaktif
│   │   │   └── consultation/    # Kartu preview foto, kartu gaya rambut, modal fullscreen
│   │   ├── hooks/useCamera.ts   # Custom hook kontrol kamera HTML5 (flip, flash/torch)
│   │   ├── services/api.ts      # Integrasi HTTP multipart ke backend FastAPI
│   │   └── data/haircutCatalog.ts # Database katalog model rambut & spesifikasi clipper
│   ├── .env.local               # File konfigurasi frontend
│   └── .env.example
│
├── PANDUAN_MENJALANKAN.md       # Panduan lengkap step-by-step menjalankan proyek
└── README.md                    # Dokumentasi umum repositori
```

---

## ⚡ Quick Start (Jalan Cepat)

Untuk panduan instalasi mendalam dan troubleshooting, buka [PANDUAN_MENJALANKAN.md](file:///d:/File%20Viky/Projek%20Mandiri/hair-analyzer/PANDUAN_MENJALANKAN.md).

### 1. Jalankan Backend (FastAPI - Port 8000)
Buka terminal PowerShell:
```pwsh
cd "d:\File Viky\Projek Mandiri\hair-analyzer\hair-analyzer-service"

# Aktifkan virtual environment yang sudah tersedia
.\.venv\Scripts\activate

# Jalankan server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Jalankan Frontend (Next.js 15 - Port 3000)
Buka terminal baru:
```pwsh
cd "d:\File Viky\Projek Mandiri\hair-analyzer\haircut-advisor-web"

# Jalankan server development
npm run dev
```
- Akses Aplikasi Web: [http://localhost:3000](http://localhost:3000)

---

## 📐 Fitur Unggulan

1. **MediaPipe 468 Landmarks & Geometric Engine**:
   - Menghitung lebar pelipis (dahi), lebar tulang pipi (*zygomatic arch*), lebar sudut rahang (*gonions*), panjang wajah vertikal, dan sudut lancip dagu.
2. **Koreksi Kemiringan Kepala (*Head Pose & Tilt Normalization*)**:
   - Kemiringan roll $\le 25^\circ$ dinormalisasi/ditegakkan secara otomatis (*affine deskewing*).
   - Kemiringan ekstrem $> 25^\circ$ ditolak dengan pesan edukatif untuk memposisikan ulang wajah lurus ke kamera.
3. **Kamera Khusus Kursi Barbershop**:
   - Default kamera belakang (*environment*) untuk memotret klien di kursi.
   - Dilengkapi *interactive SVG silhouette guide* untuk 3 sudut: **Tampak Depan**, **Tampak Samping**, dan **Tampak Belakang**.
   - Dilengkapi opsi unggah file dari galeri jika perangkat tidak memiliki webcam.
4. **Mode Konsultasi Kursi Barber (*"Tunjukkan ke Barber"*)**:
   - Tampilan layar penuh bebas gangguan dengan perbandingan *side-by-side* foto klien vs model referensi.
   - Menyertakan nomor sepatu cukur (*clipper guard*), teknik *fade*, petunjuk *scissors texture*, dan rekomendasi pomade/clay.

---

## 🧪 Pengujian Otomatis

Backend dilengkapi dengan 20 skenario pengujian komprehensif:
```pwsh
cd "d:\File Viky\Projek Mandiri\hair-analyzer\hair-analyzer-service"
.\.venv\Scripts\pytest tests -v
```
Hasil: **20/20 tests passed**.
