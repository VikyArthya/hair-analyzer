"""Integration and endpoint tests for hair-analyzer-service."""

import io
import pytest
import cv2
import numpy as np
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app

client = TestClient(app)


def create_test_image_bytes(color=(128, 128, 128), width=200, height=200) -> bytes:
    """Helper to generate a valid encoded JPEG image buffer."""
    img = np.full((height, width, 3), color, dtype=np.uint8)
    success, encoded = cv2.imencode(".jpg", img)
    assert success
    return encoded.tobytes()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "hair-analyzer-service"


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "hair-analyzer-service"
    assert "analyze_endpoint" in data


def test_analyze_face_missing_front_image():
    response = client.post("/api/v1/analyze-face", files={})
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"


def test_analyze_face_corrupt_image():
    corrupt_bytes = b"not-a-valid-image-content"
    files = {"front_image": ("corrupt.jpg", io.BytesIO(corrupt_bytes), "image/jpeg")}
    response = client.post("/api/v1/analyze-face", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert "Unable to decode image" in data["detail"]


def test_analyze_face_no_face_detected():
    blank_img_bytes = create_test_image_bytes()
    files = {"front_image": ("blank.jpg", io.BytesIO(blank_img_bytes), "image/jpeg")}
    response = client.post("/api/v1/analyze-face", files=files)
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert "No face detected in the front photo" in data["detail"]


def test_analyze_face_success_contract():
    mock_metrics = {
        "face_length_to_width_ratio": 1.12,
        "forehead_width_px": 320.5,
        "cheekbone_width_px": 315.2,
        "jaw_width_px": 310.8,
        "jaw_angle_degrees": 88.4,
    }

    dummy_image = create_test_image_bytes()
    files = {"front_image": ("portrait.jpg", io.BytesIO(dummy_image), "image/jpeg")}

    with patch(
        "app.services.face_mesh.face_mesh_service.process_front_image",
        return_value=mock_metrics,
    ):
        response = client.post("/api/v1/analyze-face", files=files)
        assert response.status_code == 200
        payload = response.json()

        # Check response contract matches requested schema
        assert payload["status"] == "success"
        data = payload["data"]
        assert data["face_shape"] == "square"
        assert isinstance(data["confidence_score"], float)

        metrics = data["metrics"]
        assert metrics["face_length_to_width_ratio"] == 1.12
        assert metrics["forehead_width_px"] == 320.5
        assert metrics["cheekbone_width_px"] == 315.2
        assert metrics["jaw_width_px"] == 310.8
        assert metrics["jaw_angle_degrees"] == 88.4

        features = data["features_detected"]
        assert features["jaw_type"] == "sharp_angular"
        assert features["forehead_type"] == "broad"
        assert features["chin_type"] == "square"

        guidance = data["haircut_guidance"]
        assert "goal" in guidance
        assert isinstance(guidance["best_categories"], list)
        assert len(guidance["best_categories"]) > 0
        assert isinstance(guidance["to_avoid"], list)
        assert len(guidance["to_avoid"]) > 0


def test_analyze_face_with_optional_views():
    mock_metrics = {
        "face_length_to_width_ratio": 1.38,
        "forehead_width_px": 300.0,
        "cheekbone_width_px": 310.0,
        "jaw_width_px": 260.0,
        "jaw_angle_degrees": 88.0,
    }

    dummy_image = create_test_image_bytes()
    files = {
        "front_image": ("front.jpg", io.BytesIO(dummy_image), "image/jpeg"),
        "side_image": ("side.jpg", io.BytesIO(dummy_image), "image/jpeg"),
        "back_image": ("back.jpg", io.BytesIO(dummy_image), "image/jpeg"),
    }

    with patch(
        "app.services.face_mesh.face_mesh_service.process_front_image",
        return_value=mock_metrics,
    ):
        response = client.post("/api/v1/analyze-face", files=files)
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "success"
        data = payload["data"]
        assert data["face_shape"] == "oval"
        assert data["profile_analysis"] is not None
        assert data["back_analysis"] is not None


def test_analyze_face_severe_tilt():
    dummy_image = create_test_image_bytes()
    files = {"front_image": ("front.jpg", io.BytesIO(dummy_image), "image/jpeg")}

    with patch(
        "app.services.face_mesh.face_mesh_service.extract_landmarks",
        return_value={i: (float(i), float(i)) for i in range(468)},
    ), patch(
        "app.services.face_mesh.face_mesh_service.estimate_head_pose",
        return_value=(0.0, 32.5, 5.0),  # Yaw is 32.5 degrees (> 25)
    ):
        response = client.post("/api/v1/analyze-face", files=files)
        assert response.status_code == 422
        payload = response.json()
        assert payload["status"] == "error"
        assert "Face tilt detected exceeding 25 degrees" in payload["detail"]


def test_analyze_face_too_large():
    from app.core.config import settings
    oversized = b"x" * (settings.MAX_IMAGE_SIZE_BYTES + 1024)
    files = {"front_image": ("huge.jpg", io.BytesIO(oversized), "image/jpeg")}
    response = client.post("/api/v1/analyze-face", files=files)
    assert response.status_code == 413
    payload = response.json()
    assert payload["status"] == "error"
    assert "exceeds maximum allowed size" in payload["detail"]

