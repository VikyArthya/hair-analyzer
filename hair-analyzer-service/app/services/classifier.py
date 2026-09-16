"""Deterministic face shape classification rule engine and haircut recommendations."""

from typing import Dict, Any, List, Tuple
from app.schemas.face import (
    FaceMetrics,
    FeaturesDetected,
    HaircutGuidance,
    FaceAnalysisData,
)


class FaceShapeClassifier:
    """Classifies male face shapes based on canonical facial landmark metrics."""

    HAIRCUT_DATABASE: Dict[str, Dict[str, Any]] = {
        "square": {
            "goal": "Soften sharp corners or emphasize masculine jawline with textured top and clean faded sides.",
            "best_categories": [
                "Textured Crop",
                "Side Part Taper Fade",
                "Buzz Cut with Beard Fade",
                "French Crop with Low Fade",
            ],
            "to_avoid": [
                "Boxy cuts with blunt fringe",
                "Heavy blunt bangs",
                "Flat geometric tops",
            ],
        },
        "oval": {
            "goal": "Maintain natural facial balance and symmetry by keeping hair swept off the forehead.",
            "best_categories": [
                "Classic Pompadour",
                "Mid Fade with Slick Back",
                "Modern Quiff",
                "Tapered Side Part",
            ],
            "to_avoid": [
                "Full blunt fringes that shorten face length",
                "Overly heavy sideburns",
            ],
        },
        "round": {
            "goal": "Create vertical illusion and angular definition with volume on top and close-cut sides.",
            "best_categories": [
                "High Skin Fade with Textured Pompadour",
                "Faux Hawk",
                "Side Part Quiff",
                "Spiky Textured Top",
            ],
            "to_avoid": [
                "Buzz cuts with no height",
                "Curtain bangs",
                "Wide round afro styles",
            ],
        },
        "oblong": {
            "goal": "Avoid excessive vertical height and balance elongated proportions with textured fringes and fuller sides.",
            "best_categories": [
                "Textured Crew Cut with Scissor Sides",
                "Side Swept Fringe",
                "Layered Taper",
                "Low Drop Fade",
            ],
            "to_avoid": [
                "Sky-high quiffs",
                "Extreme skin fades that elongate the face",
                "Long center-parted locks",
            ],
        },
        "heart": {
            "goal": "Balance a broad forehead and narrow pointed chin with medium-length textures or fuller side volume.",
            "best_categories": [
                "Mid-Length Textured Waves",
                "Curtain Fringe",
                "Classic Crew Cut",
                "Side-Swept Undercut with Light Beard",
            ],
            "to_avoid": [
                "High top fades that add width to the upper face",
                "Slicked-back styles accentuating temple width",
            ],
        },
        "diamond": {
            "goal": "Soften prominent cheekbones and broaden the forehead and jaw with textured layers and fringes.",
            "best_categories": [
                "Messy Textured Crop with Fringe",
                "Side Swept Quiff",
                "Layered Scissor Cut",
                "Beard-Enhanced Taper",
            ],
            "to_avoid": [
                "Severe skin fades with no top texture",
                "Extreme tight buzz cuts that emphasize cheekbone angularity",
            ],
        },
    }

    @classmethod
    def detect_features(cls, metrics: Dict[str, float]) -> FeaturesDetected:
        """Derive qualitative anatomical feature descriptions."""
        length_to_width = metrics["face_length_to_width_ratio"]
        forehead_px = metrics["forehead_width_px"]
        cheekbone_px = metrics["cheekbone_width_px"]
        jaw_px = metrics["jaw_width_px"]
        jaw_angle = metrics["jaw_angle_degrees"]

        # 1. Jaw type
        if jaw_angle <= 85.0:
            jaw_type = "pointed_tapered"
        elif 85.0 < jaw_angle <= 93.0 and (jaw_px / cheekbone_px) >= 0.88:
            jaw_type = "sharp_angular"
        elif jaw_angle > 93.0:
            jaw_type = "rounded_soft"
        else:
            jaw_type = "smooth_curved"

        # 2. Forehead type
        fh_cb_ratio = forehead_px / cheekbone_px if cheekbone_px > 0 else 1.0
        if fh_cb_ratio >= 0.96:
            forehead_type = "broad"
        elif fh_cb_ratio <= 0.85:
            forehead_type = "narrow"
        else:
            forehead_type = "average"

        # 3. Chin type
        if jaw_angle < 84.0:
            chin_type = "pointed"
        elif 84.0 <= jaw_angle <= 92.0 and (jaw_px / cheekbone_px) >= 0.88:
            chin_type = "square"
        elif jaw_angle > 95.0:
            chin_type = "rounded"
        else:
            chin_type = "tapered"

        return FeaturesDetected(
            jaw_type=jaw_type,
            forehead_type=forehead_type,
            chin_type=chin_type,
        )

    @classmethod
    def classify(cls, metrics: Dict[str, float]) -> FaceAnalysisData:
        """Classify the face shape deterministically according to facial metric ratios and angles."""
        ratio = metrics["face_length_to_width_ratio"]
        forehead = metrics["forehead_width_px"]
        cheekbone = metrics["cheekbone_width_px"]
        jaw = metrics["jaw_width_px"]
        jaw_angle = metrics["jaw_angle_degrees"]

        forehead_to_jaw = forehead / jaw if jaw > 0 else 1.0
        forehead_to_cb = forehead / cheekbone if cheekbone > 0 else 1.0
        jaw_to_cb = jaw / cheekbone if cheekbone > 0 else 1.0

        scores: Dict[str, float] = {
            "oblong": 0.0,
            "oval": 0.0,
            "round": 0.0,
            "square": 0.0,
            "heart": 0.0,
            "diamond": 0.0,
        }

        # 1. Oblong/Long Rule: Face Length / Cheekbone Width > 1.5
        if ratio >= 1.50:
            scores["oblong"] += 70.0 + min((ratio - 1.50) * 100.0, 25.0)
            # Uniform vertical width bonus
            max_w = max(forehead, cheekbone, jaw)
            min_w = min(forehead, cheekbone, jaw)
            if max_w > 0 and ((max_w - min_w) / max_w) <= 0.15:
                scores["oblong"] += 15.0
        elif ratio >= 1.40:
            scores["oblong"] += (ratio - 1.40) * 300.0

        # 2. Square Rule:
        # Face Length ≈ Cheekbone Width (ratio 1.0 - 1.2),
        # Forehead, Cheekbone, and Jawline widths very similar, sharp angular jaw
        if 0.95 <= ratio <= 1.25:
            scores["square"] += 25.0
            # Width uniformity bonus
            max_w = max(forehead, cheekbone, jaw)
            min_w = min(forehead, cheekbone, jaw)
            diff_ratio = (max_w - min_w) / max_w if max_w > 0 else 0.0
            if diff_ratio <= 0.08:
                scores["square"] += 35.0
            elif diff_ratio <= 0.15:
                scores["square"] += 20.0

            # Sharp angular jaw bonus (jaw angle near 85-92, jaw width broad)
            if 82.0 <= jaw_angle <= 94.0:
                scores["square"] += 25.0
            if jaw_to_cb >= 0.90:
                scores["square"] += 15.0

        # 3. Round Rule:
        # Face Length ≈ Cheekbone Width (ratio 1.0 - 1.15),
        # Jawline rounded, Cheekbone width is the widest
        if 0.95 <= ratio <= 1.20:
            scores["round"] += 25.0
            if cheekbone > forehead and cheekbone > jaw:
                scores["round"] += 30.0
            if jaw_angle > 90.0:
                scores["round"] += 25.0
            if jaw_to_cb < 0.92:
                scores["round"] += 15.0

        # 4. Oval Rule:
        # Face Length > Cheekbone Width (~1.3x - 1.5x),
        # Forehead Width >= Jawline Width, jaw curve is smooth
        if 1.25 <= ratio < 1.52:
            scores["oval"] += 35.0
            if forehead >= jaw:
                scores["oval"] += 25.0
            if 83.0 <= jaw_angle <= 98.0:
                scores["oval"] += 20.0
            if 0.75 <= jaw_to_cb <= 0.92:
                scores["oval"] += 15.0

        # 5. Heart Rule:
        # Forehead width significantly wider than Jawline, chin is pointed (acute angle)
        if forehead_to_jaw >= 1.10:
            scores["heart"] += 35.0
            if forehead_to_jaw >= 1.18:
                scores["heart"] += 15.0
        if jaw_angle < 85.0:
            scores["heart"] += 35.0
        if ratio >= 1.15:
            scores["heart"] += 10.0

        # 6. Diamond Rule:
        # Cheekbone noticeably wider than both Forehead and Jawline, chin is pointed
        if forehead_to_cb <= 0.88 and jaw_to_cb <= 0.85:
            scores["diamond"] += 45.0
        elif cheekbone > forehead * 1.06 and cheekbone > jaw * 1.08:
            scores["diamond"] += 35.0
        if jaw_angle < 86.0:
            scores["diamond"] += 35.0

        # Deterministic selection with highest score
        best_shape = max(scores, key=scores.get)
        max_score = scores[best_shape]

        # Calculate a normalized confidence score between 0.70 and 0.98
        if max_score >= 80.0:
            confidence = round(min(0.85 + (max_score - 80.0) * 0.003, 0.97), 2)
        elif max_score >= 50.0:
            confidence = round(0.78 + (max_score - 50.0) * 0.002, 2)
        else:
            confidence = 0.72

        features = cls.detect_features(metrics)
        guidance_dict = cls.HAIRCUT_DATABASE.get(
            best_shape, cls.HAIRCUT_DATABASE["oval"]
        )

        haircut_guidance = HaircutGuidance(
            goal=guidance_dict["goal"],
            best_categories=guidance_dict["best_categories"],
            to_avoid=guidance_dict["to_avoid"],
        )

        face_metrics = FaceMetrics(
            face_length_to_width_ratio=metrics["face_length_to_width_ratio"],
            forehead_width_px=metrics["forehead_width_px"],
            cheekbone_width_px=metrics["cheekbone_width_px"],
            jaw_width_px=metrics["jaw_width_px"],
            jaw_angle_degrees=metrics["jaw_angle_degrees"],
        )

        return FaceAnalysisData(
            face_shape=best_shape,
            confidence_score=confidence,
            metrics=face_metrics,
            features_detected=features,
            haircut_guidance=haircut_guidance,
        )
