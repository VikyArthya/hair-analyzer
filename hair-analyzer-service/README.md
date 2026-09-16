# Hair Analyzer Service 💈📐

A high-performance, modular FastAPI microservice that extracts facial landmarks via MediaPipe Face Mesh (CPU-optimized) and deterministically classifies male face shapes to recommend tailored haircut styles for barbershops.

---

## Architecture Overview

```
hair-analyzer-service/
├── app/
│   ├── __init__.py
│   ├── main.py                  # CORS, lifespan, global exception handlers, API routes
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py            # Pydantic v2 settings & environment variables
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── face.py              # Pydantic schemas for request & response
│   └── services/
│       ├── __init__.py
│       ├── face_mesh.py         # MediaPipe Face Mesh (468 landmarks) & head pose
│       ├── geometry.py          # Euclidean distances, ratios, and chin angles
│       └── classifier.py        # Deterministic face-shape rule engine & barber advice
├── tests/
│   ├── __init__.py
│   ├── test_geometry.py         # Unit tests for geometric formulas
│   ├── test_classifier.py       # Unit tests for shape prototypes
│   └── test_api.py              # Integration tests for FastAPI endpoints
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## Key Mathematical Logic

### Canonical MediaPipe Landmarks
Landmarks are mapped to 3D/2D pixel coordinates:
1. **Forehead Width**: Euclidean distance between left and right temples (Landmarks `54` vs `284`).
2. **Cheekbone Width**: Maximum distance between zygomatic arches (Landmarks `234` vs `454`).
3. **Jawline Width**: Distance between mandibular angles / gonions (Landmarks `132` vs `361`).
4. **Face Length**: Vertical distance from trichion (Landmark `10`) to gnathion / chin tip (Landmark `152`).
5. **Chin Sharpness / Jaw Angle**: Angle $\theta$ at chin tip ($P_{152}$) subtended by gonions ($P_{132}$ and $P_{361}$):
   $$\vec{v}_1 = P_{132} - P_{152}, \quad \vec{v}_2 = P_{361} - P_{152}$$
   $$\theta = \arccos\left(\frac{\vec{v}_1 \cdot \vec{v}_2}{\|\vec{v}_1\| \|\vec{v}_2\|}\right) \times \frac{180^\circ}{\pi}$$

### Head Pose & Tilt Normalization
- **Severe Tilt Check**: Using `cv2.solvePnP` with standard 3D anthropometric facial landmarks, head pose angles $(\text{pitch}, \text{yaw}, \text{roll})$ are estimated. If any angle exceeds $25^\circ$, the API returns `HTTP 422` prompting the user to retake the photo facing the camera.
- **Roll Deskewing**: If in-plane roll is $\le 25^\circ$, the landmarks are automatically deskewed around the face center to ensure horizontal alignment and metric fidelity.

---

## Face Shape Classification Rules

| Face Shape | Key Ratio ($\frac{\text{Face Length}}{\text{Cheekbone Width}}$) | Proportions & Features | Chin / Jaw Angle |
| :--- | :--- | :--- | :--- |
| **Oval** | $1.3\times - 1.5\times$ | Forehead $\ge$ Jawline; smooth curves; cheekbones widest | Moderate ($85^\circ - 95^\circ$) |
| **Round** | $1.0\times - 1.15\times$ | Cheekbones widest; soft rounded jawline | Obtuse / Soft ($> 92^\circ$) |
| **Square** | $1.0\times - 1.2\times$ | Forehead $\approx$ Cheekbone $\approx$ Jawline; sharp mandibular angles | Angular ($84^\circ - 92^\circ$) |
| **Oblong / Long** | $> 1.5\times$ | Elongated vertical proportions; uniform width down face | Balanced |
| **Heart** | $1.15\times - 1.35\times$ | Forehead noticeably wider than Jawline; tapered chin | Acute / Pointed ($< 85^\circ$) |
| **Diamond** | $1.15\times - 1.4\times$ | Cheekbones significantly wider than Forehead and Jawline | Acute / Pointed ($< 86^\circ$) |

---

## API Specification

### Endpoint: `POST /api/v1/analyze-face`

#### Request: `multipart/form-data`
- `front_image` (**Required**): Front-facing portrait image (JPG, PNG, WebP).
- `side_image` (*Optional*): Side-profile photo for profile and mandibular projection.
- `back_image` (*Optional*): Back-of-head photo for crown hair density and neckline taper.

#### Response: `200 OK` (JSON)
```json
{
  "status": "success",
  "data": {
    "face_shape": "square",
    "confidence_score": 0.89,
    "metrics": {
      "face_length_to_width_ratio": 1.12,
      "forehead_width_px": 320.5,
      "cheekbone_width_px": 315.2,
      "jaw_width_px": 310.8,
      "jaw_angle_degrees": 88.4
    },
    "features_detected": {
      "jaw_type": "sharp_angular",
      "forehead_type": "broad",
      "chin_type": "square"
    },
    "haircut_guidance": {
      "goal": "Soften sharp corners or emphasize masculine jawline with textured top and clean faded sides.",
      "best_categories": [
        "Textured Crop",
        "Side Part Taper Fade",
        "Buzz Cut with Beard Fade"
      ],
      "to_avoid": [
        "Boxy cuts with blunt fringe",
        "Heavy blunt bangs"
      ]
    }
  }
}
```

#### Error Handling:
- `422 Unprocessable Entity`: No face detected (`"No face detected in the front photo. Please align your face inside the frame."`) or head tilted $> 25^\circ$.
- `400 Bad Request`: Corrupted image or unsupported image format.
- `413 Payload Too Large`: Image file exceeds 15 MB.

---

## Quickstart & Local Setup

### 1. Environment Setup
```bash
cd hair-analyzer-service
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Run the Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger UI documentation is available at:
`http://localhost:8000/docs`

### 3. Run Tests
```bash
pytest tests/ -v
```

---

## Docker Deployment

Build and run using Docker:
```bash
docker build -t hair-analyzer-service .
docker run -d -p 8000:8000 --name hair-analyzer hair-analyzer-service
```

Health check:
```bash
curl http://localhost:8000/health
```
