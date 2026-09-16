"""Unit tests for deterministic face shape classification and haircut guidance."""

import pytest
from app.services.classifier import FaceShapeClassifier


def test_classify_square_face():
    # Square: Face Length ≈ Cheekbone Width (ratio ~1.12), Forehead ≈ Cheekbone ≈ Jaw, sharp angular jaw
    metrics = {
        "face_length_to_width_ratio": 1.12,
        "forehead_width_px": 320.5,
        "cheekbone_width_px": 315.2,
        "jaw_width_px": 310.8,
        "jaw_angle_degrees": 88.4,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "square"
    assert result.confidence_score >= 0.80
    assert result.features_detected.jaw_type == "sharp_angular"
    assert "Textured Crop" in result.haircut_guidance.best_categories
    assert "Boxy cuts with blunt fringe" in result.haircut_guidance.to_avoid


def test_classify_oval_face():
    # Oval: Face Length > Cheekbone Width (~1.35x), Forehead >= Jaw, smooth jaw curve
    metrics = {
        "face_length_to_width_ratio": 1.38,
        "forehead_width_px": 300.0,
        "cheekbone_width_px": 310.0,
        "jaw_width_px": 260.0,
        "jaw_angle_degrees": 88.0,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "oval"
    assert result.confidence_score >= 0.80
    assert any("Pompadour" in cat for cat in result.haircut_guidance.best_categories)


def test_classify_round_face():
    # Round: Face Length ≈ Cheekbone Width (ratio 1.05), Cheekbone is the widest, rounded soft jaw
    metrics = {
        "face_length_to_width_ratio": 1.05,
        "forehead_width_px": 280.0,
        "cheekbone_width_px": 330.0,
        "jaw_width_px": 275.0,
        "jaw_angle_degrees": 96.5,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "round"
    assert result.confidence_score >= 0.80
    assert result.features_detected.chin_type == "rounded"


def test_classify_oblong_face():
    # Oblong: Face Length / Cheekbone Width > 1.5
    metrics = {
        "face_length_to_width_ratio": 1.62,
        "forehead_width_px": 290.0,
        "cheekbone_width_px": 280.0,
        "jaw_width_px": 270.0,
        "jaw_angle_degrees": 88.0,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "oblong"
    assert result.confidence_score >= 0.80
    assert "Sky-high quiffs" in result.haircut_guidance.to_avoid


def test_classify_heart_face():
    # Heart: Forehead significantly wider than jaw, pointed chin (acute angle < 85)
    metrics = {
        "face_length_to_width_ratio": 1.25,
        "forehead_width_px": 340.0,
        "cheekbone_width_px": 310.0,
        "jaw_width_px": 240.0,
        "jaw_angle_degrees": 78.5,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "heart"
    assert result.confidence_score >= 0.80
    assert result.features_detected.chin_type == "pointed"


def test_classify_diamond_face():
    # Diamond: Cheekbone noticeably wider than forehead and jaw, chin is pointed
    metrics = {
        "face_length_to_width_ratio": 1.30,
        "forehead_width_px": 260.0,
        "cheekbone_width_px": 340.0,
        "jaw_width_px": 245.0,
        "jaw_angle_degrees": 80.0,
    }
    result = FaceShapeClassifier.classify(metrics)
    assert result.face_shape == "diamond"
    assert result.confidence_score >= 0.80
    assert result.features_detected.chin_type == "pointed"
