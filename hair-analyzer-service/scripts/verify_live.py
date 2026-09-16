import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import cv2
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

def run_verification():
    print("--- 1. Testing Health Endpoint ---")
    with TestClient(app) as client:
        health_resp = client.get("/health")
        print(f"Status Code: {health_resp.status_code}")
        print(f"Response: {health_resp.json()}\n")
        assert health_resp.status_code == 200

        print("--- 2. Testing Root Endpoint ---")
        root_resp = client.get("/")
        print(f"Status Code: {root_resp.status_code}")
        print(f"Response: {root_resp.json()}\n")
        assert root_resp.status_code == 200

        print("--- 3. Testing Missing File Validation (422) ---")
        err_resp = client.post("/api/v1/analyze-face", files={})
        print(f"Status Code: {err_resp.status_code}")
        print(f"Response: {err_resp.json()}\n")
        assert err_resp.status_code == 422

        print("--- 4. Testing Blank Image (No Face Detected 422) ---")
        blank_img = np.full((300, 300, 3), 128, dtype=np.uint8)
        _, encoded = cv2.imencode(".jpg", blank_img)
        no_face_resp = client.post(
            "/api/v1/analyze-face",
            files={"front_image": ("blank.jpg", encoded.tobytes(), "image/jpeg")},
        )
        print(f"Status Code: {no_face_resp.status_code}")
        print(f"Response: {no_face_resp.json()}\n")
        assert no_face_resp.status_code == 422
        assert "No face detected in the front photo" in no_face_resp.json()["detail"]

        print("--- 5. End-to-End Synthetic Face Classification Contract ---")
        from unittest.mock import patch
        sample_metrics = {
            "face_length_to_width_ratio": 1.12,
            "forehead_width_px": 320.5,
            "cheekbone_width_px": 315.2,
            "jaw_width_px": 310.8,
            "jaw_angle_degrees": 88.4,
        }
        with patch("app.services.face_mesh.face_mesh_service.process_front_image", return_value=sample_metrics):
            success_resp = client.post(
                "/api/v1/analyze-face",
                files={"front_image": ("front.jpg", encoded.tobytes(), "image/jpeg")},
            )
            print(f"Status Code: {success_resp.status_code}")
            import json
            print(f"Response JSON:\n{json.dumps(success_resp.json(), indent=2)}\n")
            assert success_resp.status_code == 200
            data = success_resp.json()["data"]
            assert data["face_shape"] == "square"
            assert data["confidence_score"] > 0.8
            assert data["metrics"]["face_length_to_width_ratio"] == 1.12

        print("=== ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_verification()
