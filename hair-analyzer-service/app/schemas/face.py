"""Pydantic schemas for face analysis request, response, and intermediate metrics."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FaceMetrics(BaseModel):
    """Calculated metric measurements in pixel and ratio space."""

    face_length_to_width_ratio: float = Field(
        ...,
        description="Ratio of vertical face length to maximum cheekbone width.",
        examples=[1.12],
    )
    forehead_width_px: float = Field(
        ...,
        description="Distance in pixels between left and right temples (landmarks 54 and 284).",
        examples=[320.5],
    )
    cheekbone_width_px: float = Field(
        ...,
        description="Distance in pixels across zygomatic arches (landmarks 234 and 454).",
        examples=[315.2],
    )
    jaw_width_px: float = Field(
        ...,
        description="Distance in pixels between mandibular angles / gonions (landmarks 132 and 361).",
        examples=[310.8],
    )
    jaw_angle_degrees: float = Field(
        ...,
        description="Angle in degrees formed by (left jaw, chin tip, right jaw).",
        examples=[88.4],
    )

    model_config = ConfigDict(populate_by_name=True)


class FeaturesDetected(BaseModel):
    """Qualitative anatomical feature descriptions."""

    jaw_type: str = Field(
        ...,
        description="Morphological description of the jawline.",
        examples=["sharp_angular"],
    )
    forehead_type: str = Field(
        ...,
        description="Forehead proportion relative to cheekbone and jaw.",
        examples=["broad"],
    )
    chin_type: str = Field(
        ...,
        description="Chin profile classification.",
        examples=["square"],
    )

    model_config = ConfigDict(populate_by_name=True)


class HaircutGuidance(BaseModel):
    """Actionable barbershop haircut recommendations tailored to the face shape."""

    goal: str = Field(
        ...,
        description="Strategic aesthetic objective to flatter the client's proportions.",
        examples=[
            "Soften sharp corners or emphasize masculine jawline with textured top and clean faded sides."
        ],
    )
    best_categories: List[str] = Field(
        ...,
        description="Recommended haircut styles suited for this facial structure.",
        examples=[["Textured Crop", "Side Part Taper Fade", "Buzz Cut with Beard Fade"]],
    )
    to_avoid: List[str] = Field(
        ...,
        description="Haircut styles or details to avoid that emphasize unflattering dimensions.",
        examples=[["Boxy cuts with blunt fringe", "Heavy blunt bangs"]],
    )

    model_config = ConfigDict(populate_by_name=True)


class ProfileAnalysis(BaseModel):
    """Optional side-view profile and projection analysis."""

    profile_type: str = Field(
        ...,
        description="Side profile classification (e.g. straight, convex, concave).",
        examples=["straight_balanced"],
    )
    mandibular_angle_degrees: Optional[float] = Field(
        None,
        description="Estimated gonial angle from lateral profile.",
        examples=[120.5],
    )
    jawline_definition: str = Field(
        ...,
        description="Quality and sharpness of the profile jawline.",
        examples=["well_defined"],
    )
    notes: str = Field(
        ...,
        description="Side profile haircut guidance notes.",
        examples=["Strong jaw projection supports mid-to-high fades seamlessly."],
    )

    model_config = ConfigDict(populate_by_name=True)


class BackAnalysis(BaseModel):
    """Optional back-view crown and nape analysis."""

    crown_texture: str = Field(
        ...,
        description="Observed hair density and pattern at the crown.",
        examples=["medium_dense"],
    )
    nape_type: str = Field(
        ...,
        description="Nape hairline shape (e.g. tapered, blocked, rounded).",
        examples=["ideal_for_taper"],
    )
    notes: str = Field(
        ...,
        description="Back view haircut recommendations.",
        examples=["Clean skin taper recommended around the neckline."],
    )

    model_config = ConfigDict(populate_by_name=True)


class GeneratedClientHaircut(BaseModel):
    """Personalized haircut visualization generated directly on the client's face via Gemini AI."""

    id: str = Field(..., description="Unique haircut identifier.", examples=["sq-1"])
    name: str = Field(..., description="Haircut style name.", examples=["Textured French Crop"])
    subtitle: str = Field(..., description="Descriptive subtitle.", examples=["Modern Clean Drop Fade"])
    category: str = Field(..., description="Haircut category.", examples=["Crop Style"])
    generated_image_url: str = Field(
        ...,
        description="Base64 data URI or image URL of the client's own face styled with this haircut.",
    )
    fade_type: str = Field(..., description="Fade boundary recommendation.", examples=["Mid Drop Fade"])
    guard_number: str = Field(..., description="Recommended clipper guard.", examples=["#1.5 to #0.5"])
    top_length: str = Field(..., description="Length of top hair.", examples=["3 - 4 cm"])
    why_it_fits: str = Field(..., description="Geometric rationale for this client's facial structure.")
    styling_difficulty: str = Field(default="Mudah", description="Styling difficulty (Mudah/Sedang/Tinggi).")
    styling_tips: List[str] = Field(default_factory=list, description="Step-by-step daily styling tips.")
    recommended_products: List[str] = Field(default_factory=list, description="Barbershop styling products.")
    barber_notes: str = Field(..., description="Technical clipper & scissor notes for the barber.")

    model_config = ConfigDict(populate_by_name=True)


class FaceAnalysisData(BaseModel):
    """Data payload for face shape analysis result."""

    face_shape: str = Field(
        ...,
        description="Classified male face shape (oval, round, square, oblong, heart, diamond).",
        examples=["square"],
    )
    confidence_score: float = Field(
        ...,
        description="Confidence score between 0.0 and 1.0.",
        examples=[0.89],
    )
    metrics: FaceMetrics
    features_detected: FeaturesDetected
    haircut_guidance: HaircutGuidance
    client_lookbook: List[GeneratedClientHaircut] = Field(
        default_factory=list,
        description="6 to 8 tailored hairstyle variations rendered directly on the client's own face via Gemini AI.",
    )
    profile_analysis: Optional[ProfileAnalysis] = Field(
        default=None,
        description="Optional side-view analysis if side_image was provided.",
    )
    back_analysis: Optional[BackAnalysis] = Field(
        default=None,
        description="Optional back-view analysis if back_image was provided.",
    )

    model_config = ConfigDict(populate_by_name=True)


class FaceAnalysisResponse(BaseModel):
    """Standard success response wrapper."""

    status: str = Field(default="success", examples=["success"])
    data: FaceAnalysisData

    model_config = ConfigDict(populate_by_name=True)


class ErrorResponse(BaseModel):
    """Unified error response model."""

    status: str = Field(default="error", examples=["error"])
    detail: str = Field(
        ...,
        description="Descriptive explanation of the error.",
        examples=["No face detected in the front photo. Please align your face inside the frame."],
    )

    model_config = ConfigDict(populate_by_name=True)


class TryOnData(BaseModel):
    """Payload for virtual haircut try-on synthesis result."""

    haircut_id: Optional[str] = Field(default=None, description="Identifier of the haircut model.")
    haircut_name: Optional[str] = Field(default=None, description="Human readable haircut title.")
    after_image_base64: str = Field(
        ...,
        description="Base64 data URL (e.g. data:image/jpeg;base64,...) of the resulting synthesized photo.",
    )
    barber_notes: Optional[str] = Field(
        default=None,
        description="Key barber clipper guard and styling notes for this cut.",
    )
    is_simulation: bool = Field(
        default=False,
        description="Whether fallback simulation was used.",
    )

    model_config = ConfigDict(populate_by_name=True)


class TryOnResponse(BaseModel):
    """Response model for virtual haircut try-on endpoint."""

    status: str = Field(default="success", examples=["success"])
    data: TryOnData

    model_config = ConfigDict(populate_by_name=True)

