"""Unit tests for Gemini AI Lookbook Generator."""

import pytest
import numpy as np
import cv2
from app.services.gemini_generator import gemini_lookbook_generator


def create_test_jpeg_bytes() -> bytes:
    """Create sample dummy JPEG image bytes."""
    img = np.full((320, 240, 3), (120, 100, 80), dtype=np.uint8)
    _, enc = cv2.imencode(".jpg", img)
    return enc.tobytes()


@pytest.mark.anyio
async def test_lookbook_generator_produces_styles():
    """Verify that lookbook generator yields 6 to 8 items tailored to face shape."""
    img_bytes = create_test_jpeg_bytes()
    lookbook = await gemini_lookbook_generator.generate_lookbook_async(
        client_image_bytes=img_bytes,
        face_shape="oval",
        max_styles=6,
    )

    assert len(lookbook) == 6
    for item in lookbook:
        assert item.id.startswith("ov-")
        assert len(item.name) > 0
        assert item.generated_image_url.startswith("data:image/") or item.generated_image_url.startswith("http")
        assert len(item.why_it_fits) > 0
        assert len(item.barber_notes) > 0


@pytest.mark.anyio
async def test_lookbook_generator_different_shapes():
    """Verify lookbook templates match given face shape."""
    img_bytes = create_test_jpeg_bytes()
    square_lookbook = await gemini_lookbook_generator.generate_lookbook_async(
        client_image_bytes=img_bytes,
        face_shape="square",
        max_styles=6,
    )
    assert len(square_lookbook) == 6
    names = [s.name for s in square_lookbook]
    assert any("Fade" in name or "Crop" in name or "Pompadour" in name for name in names)
