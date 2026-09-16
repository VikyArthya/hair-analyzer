"""Unit tests for geometric and trigonometric calculations."""

import pytest
import numpy as np
from app.services.geometry import FaceGeometryCalculator


def test_euclidean_distance():
    p1 = (100.0, 100.0)
    p2 = (103.0, 104.0)
    dist = FaceGeometryCalculator.euclidean_distance_2d(p1, p2)
    assert dist == pytest.approx(5.0)


def test_angle_3points_right_angle():
    # Right angle: (0, 10) to (0, 0) to (10, 0)
    p_start = (0.0, 10.0)
    p_vertex = (0.0, 0.0)
    p_end = (10.0, 0.0)
    angle = FaceGeometryCalculator.calculate_angle_3points(p_start, p_vertex, p_end)
    assert angle == pytest.approx(90.0, abs=0.1)


def test_angle_3points_acute_angle():
    # Equilateral triangle vertex: 60 degrees
    p_vertex = (0.0, 0.0)
    p_start = (10.0, 0.0)
    p_end = (5.0, 5.0 * np.sqrt(3))
    angle = FaceGeometryCalculator.calculate_angle_3points(p_start, p_vertex, p_end)
    assert angle == pytest.approx(60.0, abs=0.1)


def test_roll_calculation_and_deskew():
    # Simulated eye outer landmarks tilted by 10 degrees
    p_right_eye = (100.0, 100.0)
    rad = np.radians(10.0)
    dx = 100.0 * np.cos(rad)
    dy = 100.0 * np.sin(rad)
    p_left_eye = (100.0 + dx, 100.0 + dy)

    landmarks = {
        FaceGeometryCalculator.RIGHT_EYE_OUTER: p_right_eye,
        FaceGeometryCalculator.LEFT_EYE_OUTER: p_left_eye,
    }

    roll = FaceGeometryCalculator.calculate_roll_angle(landmarks)
    assert roll == pytest.approx(10.0, abs=0.2)

    # Rotate points back
    center = p_right_eye
    rotated = FaceGeometryCalculator.rotate_points_2d(landmarks, roll, center)
    rotated_roll = FaceGeometryCalculator.calculate_roll_angle(rotated)
    assert rotated_roll == pytest.approx(0.0, abs=0.2)


def test_extract_canonical_metrics():
    # Build a simulated canonical face coordinate map
    # Forehead: width 300 (x: 150 to 450, y: 150)
    # Cheekbone: width 320 (x: 140 to 460, y: 260)
    # Jaw: width 280 (x: 160 to 440, y: 380)
    # Top: y=80, Chin: y=500 -> length = 420
    landmarks = {
        FaceGeometryCalculator.FOREHEAD_RIGHT_TEMPLE: (150.0, 150.0),
        FaceGeometryCalculator.FOREHEAD_LEFT_TEMPLE: (450.0, 150.0),
        FaceGeometryCalculator.CHEEKBONE_RIGHT: (140.0, 260.0),
        FaceGeometryCalculator.CHEEKBONE_LEFT: (460.0, 260.0),
        FaceGeometryCalculator.JAW_RIGHT_GONION: (160.0, 380.0),
        FaceGeometryCalculator.JAW_LEFT_GONION: (440.0, 380.0),
        FaceGeometryCalculator.FOREHEAD_TOP: (300.0, 80.0),
        FaceGeometryCalculator.CHIN_TIP: (300.0, 500.0),
        FaceGeometryCalculator.RIGHT_EYE_OUTER: (200.0, 200.0),
        FaceGeometryCalculator.LEFT_EYE_OUTER: (400.0, 200.0),
        FaceGeometryCalculator.NOSE_TIP: (300.0, 250.0),
    }

    metrics = FaceGeometryCalculator.extract_canonical_metrics(landmarks, auto_deskew=True)
    assert metrics["forehead_width_px"] == pytest.approx(300.0, abs=1.0)
    assert metrics["cheekbone_width_px"] == pytest.approx(320.0, abs=1.0)
    assert metrics["jaw_width_px"] == pytest.approx(280.0, abs=1.0)
    assert metrics["face_length_to_width_ratio"] == pytest.approx(420.0 / 320.0, abs=0.05)
    assert 70.0 <= metrics["jaw_angle_degrees"] <= 120.0
