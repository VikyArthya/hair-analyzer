"""Unit and integration tests for virtual haircut try-on endpoint."""

import io
from unittest.mock import patch, MagicMock
import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_image_bytes(color=(140, 100, 80), width=240, height=240) -> bytes:
    """Helper to generate a valid encoded JPEG image buffer."""
    img = np.full((height, width, 3), color, dtype=np.uint8)
    success, encoded = cv2.imencode(".jpg", img)
    assert success
    return encoded.tobytes()


def test_try_on_missing_customer_image():
    """Missing customer_image should return 422."""
    response = client.post("/api/v1/try-on", files={})
    assert response.status_code == 422


def test_try_on_empty_customer_image():
    """Empty image bytes should return 422."""
    files = {"customer_image": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
    response = client.post("/api/v1/try-on", files=files)
    assert response.status_code == 422


def test_try_on_success_with_fallback():
    """Valid customer image and metadata should return 200 with base64 result."""
    img_bytes = create_test_image_bytes()
    files = {"customer_image": ("customer.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    data = {
        "haircut_id": "sq-1",
        "haircut_name": "Textured Crop Fade",
        "barber_notes": "#1.5 guard on sides, choppy texture on top",
    }
    response = client.post("/api/v1/try-on", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    assert "data" in res
    assert res["data"]["haircut_id"] == "sq-1"
    assert res["data"]["haircut_name"] == "Textured Crop Fade"
    assert res["data"]["after_image_base64"].startswith("data:image/jpeg;base64,")
    assert res["data"]["barber_notes"] == "#1.5 guard on sides, choppy texture on top"


def test_try_on_mocked_hf_success(tmp_path):
    """When Hugging Face returns a synthesized image, it should be encoded into after_image_base64."""
    # Create fake synthesized image file
    fake_after_path = str(tmp_path / "synthesized.jpg")
    fake_bytes = create_test_image_bytes(color=(200, 50, 50))
    with open(fake_after_path, "wb") as f:
        f.write(fake_bytes)

    img_bytes = create_test_image_bytes()
    files = {"customer_image": ("customer.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    data = {
        "haircut_id": "ov-1",
        "haircut_name": "Classic Pompadour",
    }

    with patch(
        "app.services.try_on.virtual_try_on_service._run_hf_inference",
        return_value=fake_bytes,
    ):
        response = client.post("/api/v1/try-on", files=files, data=data)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "success"
        assert res["data"]["is_simulation"] is False
        assert res["data"]["after_image_base64"].startswith("data:image/jpeg;base64,")

