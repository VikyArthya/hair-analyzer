"""Application settings and environment configuration."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core configuration for hair-analyzer-service."""

    PROJECT_NAME: str = "hair-analyzer-service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # CORS configuration
    CORS_ORIGINS: List[str] = ["*"]

    # MediaPipe Face Mesh configuration
    STATIC_IMAGE_MODE: bool = True
    MAX_NUM_FACES: int = 1
    REFINE_LANDMARKS: bool = True
    MIN_DETECTION_CONFIDENCE: float = 0.5
    MIN_TRACKING_CONFIDENCE: float = 0.5

    # Face orientation constraints
    MAX_TILT_DEGREES: float = 25.0
    AUTO_DESKEW_ROLL: bool = True

    # Image processing limits
    MAX_IMAGE_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB

    # Virtual Hair Try-On (Hugging Face / HairFastGAN)
    HF_TOKEN: str = ""
    HAIRFASTGAN_SPACE: str = "AIRI-Institute/HairFastGAN"
    TRYON_TIMEOUT_SECONDS: int = 90

    # Google Gemini AI Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_IMAGE_MODEL: str = "gemini-2.5-flash-image"
    GEMINI_VISION_MODEL: str = "gemini-2.5-flash"
    DEFAULT_STYLES_COUNT: int = 6

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
