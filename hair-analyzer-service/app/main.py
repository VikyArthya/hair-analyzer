"""Main FastAPI application for hair-analyzer-service."""

from contextlib import asynccontextmanager
from typing import Optional
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Request,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.schemas.face import (
    FaceAnalysisResponse,
    ErrorResponse,
)
from app.services.face_mesh import face_mesh_service
from app.services.classifier import FaceShapeClassifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for warm-up and resource teardown."""
    # Startup: Initialize MediaPipe Face Mesh model
    face_mesh_service.initialize()
    yield
    # Shutdown: Clean up Face Mesh resources
    face_mesh_service.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-ready computer vision microservice detecting facial landmarks "
        "and classifying male face shapes to recommend tailored haircut styles for barbershops."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI/Starlette HTTPExceptions with standard JSON envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic/FastAPI request validation errors."""
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{loc}: {msg}")
    detail = "; ".join(error_messages) or "Request validation failed."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"status": "error", "detail": detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions."""
    detail = str(exc) if settings.DEBUG else "An unexpected internal server error occurred."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "detail": detail},
    )


@app.get(
    "/health",
    tags=["System"],
    summary="Service Health Check",
    response_model=dict,
)
async def health_check():
    """Returns the operational status of the service."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get(
    "/",
    tags=["System"],
    summary="Root Service Info",
    response_model=dict,
)
async def root():
    """Root info endpoint with documentation links."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "analyze_endpoint": f"{settings.API_V1_STR}/analyze-face",
    }


@app.post(
    f"{settings.API_V1_STR}/analyze-face",
    tags=["Face Analysis"],
    summary="Analyze Face Landmarks and Recommend Haircut Styles",
    response_model=FaceAnalysisResponse,
    response_model_exclude_none=True,
    responses={
        200: {"model": FaceAnalysisResponse, "description": "Successful face analysis"},
        400: {"model": ErrorResponse, "description": "Invalid image payload"},
        422: {"model": ErrorResponse, "description": "No face detected or severe head tilt"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def analyze_face(
    front_image: UploadFile = File(
        ...,
        description="High-resolution front-facing portrait photo (Required).",
    ),
    side_image: Optional[UploadFile] = File(
        None,
        description="Optional side-profile photo for jawline and mandibular angle analysis.",
    ),
    back_image: Optional[UploadFile] = File(
        None,
        description="Optional back-of-head photo for crown hair density and neckline taper analysis.",
    ),
):
    """Detect canonical MediaPipe landmarks from a front-facing photo, classify male face shape,

    and generate haircut recommendations.
    """
    # 1. Validate front_image presence
    if not front_image or not front_image.filename:
        raise HTTPException(
            status_code=422,
            detail="No face detected in the front photo. Please align your face inside the frame.",
        )

    # 2. Read front image bytes
    front_bytes = await front_image.read()
    if len(front_bytes) == 0:
        raise HTTPException(
            status_code=422,
            detail="No face detected in the front photo. Please align your face inside the frame.",
        )

    if len(front_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image file exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # 3. Process front image through MediaPipe & Geometry pipeline
    metrics = await face_mesh_service.process_front_image_async(front_bytes)

    # 4. Classify face shape and retrieve haircut guidance
    analysis_data = FaceShapeClassifier.classify(metrics)

    # 5. Process optional side profile photo
    if side_image and side_image.filename:
        side_bytes = await side_image.read()
        if len(side_bytes) > 0:
            analysis_data.profile_analysis = await face_mesh_service.process_side_image_async(side_bytes)

    # 6. Process optional back photo
    if back_image and back_image.filename:
        back_bytes = await back_image.read()
        if len(back_bytes) > 0:
            analysis_data.back_analysis = await face_mesh_service.process_back_image_async(back_bytes)

    return FaceAnalysisResponse(
        status="success",
        data=analysis_data,
    )
