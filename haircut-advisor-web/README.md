# BarberVision AI Web App (Haircut Advisor) 💈✂️

A mobile and tablet-first web application for barbershops built with **Next.js 15+ (App Router)**, **TypeScript**, and **Tailwind CSS**. It enables barbers to capture 3 guided portrait angles (Front, Side, Back) of a client directly at the barber chair, connects with the FastAPI MediaPipe face analyzer service, and delivers tailored haircut recommendations with technical clipper specs.

---

## Key Features & UX Design

- **Dark-Mode-First Barbershop Aesthetic**: High-contrast zinc and warm amber/gold (`#E5B869`) palette optimized for tablet and phone screens under barbershop chair lighting.
- **Interactive Multi-Angle Silhouette Overlays**:
  - **Tampak Depan (Front)**: Oval head boundary, horizontal eye horizon guide, vertical symmetry axis, and chin alignment bracket.
  - **Tampak Samping (Side / Profile)**: Mandibular gonion angle marker, nose-to-chin profile contour, and ear position guide.
  - **Tampak Belakang (Back)**: Head crown boundary, occipital bone landmark, and neck nape taper guide line.
- **Hardware-Accelerated Camera Hook (`useCamera`)**:
  - Default rear camera (`environment`) for barbers photographing clients.
  - 1-touch camera flipping and torch/flash toggle.
  - Instant file upload fallback button for uploading pre-saved portraits.
- **AI Scanning Status Screen**: Real-time scanning line animation and progressive status messages during MediaPipe 468 landmark processing.
- **Chair Consultation Mode ("Tunjukkan ke Barber")**: Full-screen, distraction-free view designed to be shown directly to the barber and client, featuring side-by-side comparison, clipper guard numbers (`#1.5 to #3`), fade type, point-cutting instructions, and recommended styling products.
- **Resilient Fallback**: Gracefully handles network pauses or offline backend services with intelligent simulation, ensuring zero disruptions at the chair.

---

## Directory Structure

```
haircut-advisor-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Dark theme wrapper, persistent branding & navigation
│   │   ├── page.tsx             # Dashboard: Hero CTA, Recent Scans, Face Shape Catalog
│   │   ├── scan/
│   │   │   └── page.tsx         # Guided 3-angle capture wizard & scanning animation
│   │   └── result/
│   │       └── page.tsx         # Recommendation screen, metric breakdown & share
│   ├── components/
│   │   ├── camera/
│   │   │   ├── CameraCapture.tsx    # Live viewfinder, controls & shutter
│   │   │   └── SilhouetteOverlay.tsx # Responsive SVG guides for Front, Side, Back
│   │   ├── consultation/
│   │   │   ├── AnglePreviewCard.tsx # Thumbnail preview cards with retake action
│   │   │   ├── HaircutCard.tsx      # Curated haircut recommendation cards
│   │   │   └── BarberDisplayModal.tsx # Fullscreen consultation modal
│   │   └── ui/                  # Shadcn-style primitives (Button, Badge, Card, Skeleton)
│   ├── hooks/
│   │   └── useCamera.ts         # MediaDevices stream, flip, torch & snapshot logic
│   ├── services/
│   │   └── api.ts               # Multipart POST to FastAPI backend with fallback
│   ├── data/
│   │   └── haircutCatalog.ts    # Rich database of 6 face shapes & haircut models
│   └── types/
│       └── index.ts             # TypeScript interfaces for API & consultation
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Quickstart & Local Development

### 1. Start the FastAPI Analyzer Service (Port 8000)
In a separate terminal:
```bash
cd hair-analyzer-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Start Next.js Development Server (Port 3000)
```bash
cd haircut-advisor-web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser, tablet, or smartphone.

### 3. Production Build & Test
```bash
npm run build
npm run start
```
