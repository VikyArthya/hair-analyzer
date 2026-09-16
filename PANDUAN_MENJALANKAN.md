# 📖 Panduan Lengkap Menjalankan BarberVision AI Pro

Dokumen ini berisi panduan tahap demi tahap untuk menjalankan sistem **BarberVision AI** di komputer lokal (Windows/macOS/Linux) serta cara mengaksesnya dari **iPad / Smartphone** di kursi barbershop.

---

## 📋 Daftar Isi
1. [Prasyarat Sistem (Prerequisites)](#1-prasyarat-sistem-prerequisites)
2. [Konfigurasi Environment (.env)](#2-konfigurasi-environment-env)
3. [Tahap 1: Menjalankan Backend (FastAPI Microservice)](#3-tahap-1-menjalankan-backend-fastapi-microservice)
4. [Tahap 2: Menjalankan Frontend (Next.js 15 Web App)](#4-tahap-2-menjalankan-frontend-nextjs-15-web-app)
5. [Tahap 3: Cara Akses dari iPad / Smartphone (Satu Jaringan Wi-Fi)](#5-tahap-3-cara-akses-dari-ipad--smartphone-satu-jaringan-wi-fi)
6. [Tahap 4: Menjalankan Menggunakan Docker (Opsional)](#6-tahap-4-menjalankan-menggunakan-docker-opsional)
7. [Troubleshooting & Solusi Masalah Umum](#7-troubleshooting--solusi-masalah-umum)

---

## 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan komputer Anda telah terinstal:
- **Python**: Versi 3.10 atau lebih baru ([Unduh Python](https://www.python.org/downloads/))
- **Node.js**: Versi 18+ atau 20+ ([Unduh Node.js](https://nodejs.org/))
- **Web Browser Modern**: Google Chrome, Microsoft Edge, atau Safari (mendukung fitur kamera HTML5 MediaDevices).

---

## 2. Konfigurasi Environment (.env)

Proyek ini telah dilengkapi file `.env` default dan file contoh `.env.example`.

### A. Backend (`hair-analyzer-service/.env`)
Lokasi file: `hair-analyzer-service/.env`
```ini
PROJECT_NAME=hair-analyzer-service
VERSION=1.0.0
DEBUG=false
API_V1_STR=/api/v1
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","*"]
MAX_TILT_DEGREES=25.0
AUTO_DESKEW_ROLL=true
STATIC_IMAGE_MODE=true
MAX_NUM_FACES=1
REFINE_LANDMARKS=true
MIN_DETECTION_CONFIDENCE=0.5
MIN_TRACKING_CONFIDENCE=0.5
MAX_IMAGE_SIZE_BYTES=15728640
```

### B. Frontend (`haircut-advisor-web/.env.local`)
Lokasi file: `haircut-advisor-web/.env.local`
```ini
# Arahkan ke endpoint backend FastAPI
NEXT_PUBLIC_API_URL=http://localhost:8000
```
> **Catatan:** Jika Anda mengakses aplikasi web dari iPad atau smartphone di jaringan lokal yang sama, ganti `localhost` pada `NEXT_PUBLIC_API_URL` dengan alamat IP lokal komputer Anda (contoh: `http://192.168.1.50:8000`).

---

## 3. Tahap 1: Menjalankan Backend (FastAPI Microservice)

Backend bertugas memproses foto dengan MediaPipe, menghitung rasio geometri wajah, dan menentukan rekomendasi gaya rambut.

### Langkah-langkah:
1. Buka terminal **PowerShell** atau **Command Prompt**.
2. Masuk ke folder backend:
   ```pwsh
   cd "d:\File Viky\Projek Mandiri\hair-analyzer\hair-analyzer-service"
   ```

3. *(Jika baru pertama kali di komputer baru atau virtual environment belum ada)*:
   ```pwsh
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Aktifkan virtual environment** (yang sudah dibuat sebelumnya):
   ```pwsh
   .\.venv\Scripts\activate
   ```
   *(Tanda `(.venv)` akan muncul di sebelah kiri baris terminal).*

5. **Jalankan server FastAPI dengan Uvicorn**:
   ```pwsh
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Verifikasi Backend Aktif**:
   - Buka browser dan buka: [http://localhost:8000/health](http://localhost:8000/health)
   - Anda akan melihat respon:
     ```json
     {"status": "healthy", "service": "hair-analyzer-service", "version": "1.0.0"}
     ```
   - Dokumentasi interaktif Swagger UI dapat diakses di: [http://localhost:8000/docs](http://localhost:8000/docs)

7. *(Opsional) Menjalankan Unit Test*:
   Untuk memastikan seluruh logika kalkulasi landmark dan klasifikasi wajah berfungsi 100%:
   ```pwsh
   .\.venv\Scripts\pytest tests -v
   ```
   *(Hasil: 20 passed)*

---

## 4. Tahap 2: Menjalankan Frontend (Next.js 15 Web App)

Frontend adalah antarmuka web interaktif yang digunakan barber untuk mengambil 3 sudut foto klien dan menampilkan hasil rekomendasi.

### Langkah-langkah:
1. Buka jendela terminal **PowerShell BARU** (biarkan terminal backend tetap berjalan).
2. Masuk ke folder frontend:
   ```pwsh
   cd "d:\File Viky\Projek Mandiri\hair-analyzer\haircut-advisor-web"
   ```

3. *(Jika baru pertama kali atau package belum terpasang)*:
   ```pwsh
   npm install
   ```

4. **Jalankan server development Next.js**:
   ```pwsh
   npm run dev
   ```

5. **Buka Aplikasi di Browser**:
   - Buka: [http://localhost:3000](http://localhost:3000)
   - Anda akan melihat halaman Dashboard Barbershop dengan tombol utama **"Mulai Konsultasi Klien Baru"**.

6. **Alur Pemakaian**:
   - Klik **"Mulai Konsultasi Klien Baru"** (akan membuka halaman `/scan`).
   - Berikan izin kamera ketika browser memintanya.
   - Ambil foto **Tampak Depan** (Wajib). Pastikan mata sejajar dengan garis horizontal biru dan dagu berada di dalam batas panduan.
   - Ambil foto **Tampak Samping** dan **Tampak Belakang** (Opsional).
   - Klik **"Analisis Bentuk Wajah & Rekomendasi"**.
   - Sistem akan memproses dan mengarahkan ke halaman `/result`.
   - Di halaman hasil, klik **"Tunjukkan ke Barber"** untuk membuka tampilan layar penuh (*chair consultation mode*) yang menampilkan nomor sepatu cukur (*clipper guard*), tipe fade, dan rekomendasi produk styling.

---

## 5. Tahap 3: Cara Akses dari iPad / Smartphone (Satu Jaringan Wi-Fi)

Jika Anda ingin menggunakan tablet (iPad) atau smartphone saat melayani klien di kursi barber:

1. **Pastikan Komputer dan iPad Terhubung ke Wi-Fi yang Sama**.
2. **Cari Tahu Alamat IP Komputer Anda**:
   Buka terminal di komputer dan ketik:
   ```pwsh
   ipconfig
   ```
   Cari baris **IPv4 Address** pada Wi-Fi Anda (misalkan: `192.168.1.25`).
3. **Ubah Konfigurasi Frontend**:
   Buka file `haircut-advisor-web/.env.local` dan ubah:
   ```ini
   NEXT_PUBLIC_API_URL=http://192.168.1.25:8000
   ```
   *(Ganti `192.168.1.25` dengan IP komputer Anda).*
4. **Jalankan Frontend dengan Bind ke Semua Host**:
   ```pwsh
   npm run dev -- -H 0.0.0.0
   ```
5. **Buka di Browser iPad / Smartphone**:
   Ketik alamat berikut di Safari atau Chrome pada iPad:
   ```
   http://192.168.1.25:3000
   ```
   *(Aplikasi siap digunakan langsung di kursi barbershop).*

> 💡 **Tips Izin Kamera di Mobile:** Browser smartphone biasanya membatasi akses webcam pada koneksi HTTP biasa non-localhost. Jika kamera tidak terbuka di IP lokal, Anda dapat:
> - Menggunakan fitur **"Unggah Foto dari Galeri"** yang sudah tersedia langsung di dalam viewfinder kamera aplikasi.
> - Atau gunakan tunneling aman HTTPS gratis seperti `ngrok` atau `localtunnel` (`npx localtunnel --port 3000`).

---

## 6. Tahap 4: Menjalankan Menggunakan Docker (Opsional)

Jika Anda ingin mendeploy backend ke server atau menjalankan di lingkungan container Docker:

### Build Docker Image Backend:
```bash
cd hair-analyzer-service
docker build -t hair-analyzer-service:latest .
```

### Jalankan Container:
```bash
docker run -d --name hair-analyzer-app -p 8000:8000 hair-analyzer-service:latest
```

Cek container status:
```bash
curl http://localhost:8000/health
```

---

## 7. Troubleshooting & Solusi Masalah Umum

### Q1: Error `Port 8000 is already in use` atau `Port 3000 is already in use`
**Penyebab**: Port sedang digunakan oleh proses lain.
**Solusi**:
- Untuk backend, jalankan di port lain:
  ```pwsh
  python -m uvicorn app.main:app --reload --port 8008
  ```
  *(Lalu sesuaikan `NEXT_PUBLIC_API_URL=http://localhost:8008` di frontend).*
- Untuk frontend, Next.js akan otomatis menawarkan port berikutnya (misal 3001).

### Q2: Error `No face detected in the front photo. Please align your face inside the frame.` (HTTP 422)
**Penyebab**: Foto terlalu gelap, wajah terpotong, atau tidak ada wajah yang terdeteksi oleh algoritma Face Mesh.
**Solusi**:
- Pastikan pencahayaan di depan wajah klien cukup terang.
- Posisikan wajah tepat di dalam oval panduan SVG pada layar kamera.
- Ambil foto ulang dengan tombol **"Foto Ulang Tampak Depan"**.

### Q3: Error `Face tilt detected exceeding 25 degrees` (HTTP 422)
**Penyebab**: Klien menengadah terlalu tinggi, menunduk, atau menoleh lebih dari 25 derajat pada foto depan.
**Solusi**:
- Arahkan klien untuk melihat lurus tepat ke arah lensa kamera sebelum menekan tombol shutter.
*(Sistem secara otomatis menolak sudut miring ekstrem untuk mencegah kesalahan rasio proporsi lebar dahi dan rahang).*

### Q4: Kamera di browser laptop/PC tidak mau menyala
**Penyebab**: Izin kamera diblokir oleh browser atau sedang dipakai oleh aplikasi lain (Zoom, Teams, dsb.).
**Solusi**:
- Klik ikon gembok / kamera di sebelah kiri URL browser (`localhost:3000`), pilih **Izinkan Kamera** (Allow Camera).
- Tutup aplikasi lain yang sedang memakai webcam.
- Sebagai alternatif, klik tombol **"Unggah Foto dari Galeri"** (ikon upload) di sudut kiri bawah tombol jepret untuk mengunggah file foto portrait dari komputer.
