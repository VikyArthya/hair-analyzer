"""Geometric and trigonometric calculations for facial landmarks."""

from typing import Dict, Tuple, List, Union
import numpy as np


class FaceGeometryCalculator:
    """Computes Euclidean distances, proportional ratios, and angles from facial landmarks."""

    # Canonical MediaPipe Face Mesh landmark indices
    FOREHEAD_RIGHT_TEMPLE = 54   # Right temple (subject right / image left)
    FOREHEAD_LEFT_TEMPLE = 284   # Left temple (subject left / image right)
    CHEEKBONE_RIGHT = 234        # Right zygomatic arch
    CHEEKBONE_LEFT = 454         # Left zygomatic arch
    JAW_RIGHT_GONION = 132       # Right mandibular angle
    JAW_LEFT_GONION = 361        # Left mandibular angle
    FOREHEAD_TOP = 10            # Trichion (mid top forehead)
    CHIN_TIP = 152               # Gnathion (chin tip)

    # Secondary landmarks for head pose & eye alignment
    LEFT_EYE_OUTER = 263
    RIGHT_EYE_OUTER = 33
    LEFT_EYE_INNER = 362
    RIGHT_EYE_INNER = 133
    NOSE_TIP = 1
    MOUTH_LEFT = 291
    MOUTH_RIGHT = 61

    @staticmethod
    def euclidean_distance_2d(
        p1: Union[Tuple[float, float], np.ndarray],
        p2: Union[Tuple[float, float], np.ndarray],
    ) -> float:
        """Calculate standard 2D Euclidean distance between two points."""
        return float(np.hypot(p2[0] - p1[0], p2[1] - p1[1]))

    @classmethod
    def calculate_angle_3points(
        cls,
        p_start: Union[Tuple[float, float], np.ndarray],
        p_vertex: Union[Tuple[float, float], np.ndarray],
        p_end: Union[Tuple[float, float], np.ndarray],
    ) -> float:
        """Calculate the angle in degrees at p_vertex between rays (p_vertex -> p_start) and (p_vertex -> p_end)."""
        v1 = np.array([p_start[0] - p_vertex[0], p_start[1] - p_vertex[1]], dtype=np.float64)
        v2 = np.array([p_end[0] - p_vertex[0], p_end[1] - p_vertex[1]], dtype=np.float64)

        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)

        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0

        dot = np.dot(v1, v2)
        cos_angle = np.clip(dot / (norm_v1 * norm_v2), -1.0, 1.0)
        angle_rad = np.arccos(cos_angle)
        return float(np.degrees(angle_rad))

    @classmethod
    def calculate_roll_angle(
        cls,
        landmarks: Dict[int, Tuple[float, float]],
    ) -> float:
        """Calculate roll tilt angle in degrees based on eye corner slope.

        Positive angle indicates counter-clockwise tilt, negative indicates clockwise tilt.
        """
        p_right_eye = landmarks.get(cls.RIGHT_EYE_OUTER)
        p_left_eye = landmarks.get(cls.LEFT_EYE_OUTER)

        if not p_right_eye or not p_left_eye:
            return 0.0

        dx = p_left_eye[0] - p_right_eye[0]
        dy = p_left_eye[1] - p_right_eye[1]
        return float(np.degrees(np.arctan2(dy, dx)))

    @classmethod
    def rotate_points_2d(
        cls,
        points: Dict[int, Tuple[float, float]],
        angle_degrees: float,
        center: Tuple[float, float],
    ) -> Dict[int, Tuple[float, float]]:
        """Rotate a dictionary of 2D points around a center point by -angle_degrees to deskew."""
        rad = -np.radians(angle_degrees)
        cos_val = np.cos(rad)
        sin_val = np.sin(rad)
        cx, cy = center

        rotated: Dict[int, Tuple[float, float]] = {}
        for idx, (x, y) in points.items():
            tx = x - cx
            ty = y - cy
            rx = tx * cos_val - ty * sin_val + cx
            ry = tx * sin_val + ty * cos_val + cy
            rotated[idx] = (float(rx), float(ry))
        return rotated

    @classmethod
    def extract_canonical_metrics(
        cls,
        landmarks: Dict[int, Tuple[float, float]],
        auto_deskew: bool = True,
    ) -> Dict[str, float]:
        """Extract canonical distances, ratios, and jaw angles from 468 landmark points.

        Key Mathematical Logic:
        1. Forehead Width: Distance between left and right temples (landmarks 54 vs 284).
        2. Cheekbone Width: Maximum distance between zygomatic arches (landmarks 234 vs 454).
        3. Jawline Width: Distance between mandibular angles (gonions: landmarks 132 vs 361).
        4. Face Length: Vertical distance from top of forehead (landmark 10) to chin tip (landmark 152).
        5. Chin Sharpness / Jaw Angle: Angle formed by (left jaw, chin tip, right jaw).
        """
        pts = landmarks
        if auto_deskew:
            roll = cls.calculate_roll_angle(pts)
            if abs(roll) > 0.5:
                # Use nose tip or centroid as rotation center
                center = pts.get(cls.NOSE_TIP, (0.0, 0.0))
                pts = cls.rotate_points_2d(pts, roll, center)

        # 1. Forehead Width (temples 54 vs 284)
        p_fh_r = pts[cls.FOREHEAD_RIGHT_TEMPLE]
        p_fh_l = pts[cls.FOREHEAD_LEFT_TEMPLE]
        forehead_width = cls.euclidean_distance_2d(p_fh_r, p_fh_l)

        # 2. Cheekbone Width (zygomatic arches 234 vs 454)
        p_cb_r = pts[cls.CHEEKBONE_RIGHT]
        p_cb_l = pts[cls.CHEEKBONE_LEFT]
        cheekbone_width = cls.euclidean_distance_2d(p_cb_r, p_cb_l)

        # 3. Jawline Width (gonions 132 vs 361)
        p_jaw_r = pts[cls.JAW_RIGHT_GONION]
        p_jaw_l = pts[cls.JAW_LEFT_GONION]
        jaw_width = cls.euclidean_distance_2d(p_jaw_r, p_jaw_l)

        # 4. Face Length (top of forehead 10 to chin tip 152)
        p_top = pts[cls.FOREHEAD_TOP]
        p_chin = pts[cls.CHIN_TIP]
        face_length = cls.euclidean_distance_2d(p_top, p_chin)

        # 5. Chin Sharpness / Jaw Angle (left jaw 361, chin tip 152, right jaw 132)
        jaw_angle = cls.calculate_angle_3points(p_jaw_l, p_chin, p_jaw_r)

        # Proportions
        length_to_width_ratio = face_length / cheekbone_width if cheekbone_width > 0 else 1.0
        forehead_to_cheekbone_ratio = forehead_width / cheekbone_width if cheekbone_width > 0 else 1.0
        jaw_to_cheekbone_ratio = jaw_width / cheekbone_width if cheekbone_width > 0 else 1.0
        forehead_to_jaw_ratio = forehead_width / jaw_width if jaw_width > 0 else 1.0

        return {
            "face_length_to_width_ratio": round(float(length_to_width_ratio), 2),
            "forehead_width_px": round(float(forehead_width), 1),
            "cheekbone_width_px": round(float(cheekbone_width), 1),
            "jaw_width_px": round(float(jaw_width), 1),
            "jaw_angle_degrees": round(float(jaw_angle), 1),
            "face_length_px": round(float(face_length), 1),
            "forehead_to_cheekbone_ratio": round(float(forehead_to_cheekbone_ratio), 3),
            "jaw_to_cheekbone_ratio": round(float(jaw_to_cheekbone_ratio), 3),
            "forehead_to_jaw_ratio": round(float(forehead_to_jaw_ratio), 3),
        }
