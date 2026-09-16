"""Virtual Haircut Try-On Service using Hugging Face HairFastGAN with fallback simulation."""

import base64
import os
import tempfile
import logging
from typing import Optional
import cv2
import numpy as np
import httpx

from app.core.config import settings
from app.schemas.face import TryOnData

logger = logging.getLogger("try_on_service")


class VirtualTryOnService:
    """Handles hairstyle transfer from target reference to customer photo."""

    def __init__(self) -> None:
        self._hf_client = None

    async def _download_image(self, url: str) -> Optional[bytes]:
        """Download haircut reference image with timeout."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.content
        except Exception as e:
            logger.warning("Failed to download haircut image from %s: %s", url, e)
        return None

    @staticmethod
    def _to_base64_data_url(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
        """Encode binary image into base64 data URL."""
        encoded = base64.b64encode(image_bytes).decode("utf-8")
        return f"data:{mime_type};base64,{encoded}"

    @staticmethod
    def _create_fallback_blend(customer_bytes: bytes, haircut_bytes: Optional[bytes]) -> bytes:
        """Create aesthetic visual preview by blending target hair tone & texture onto customer crown."""
        try:
            nparr = np.frombuffer(customer_bytes, np.uint8)
            customer_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if customer_img is None:
                return customer_bytes

            h, w = customer_img.shape[:2]

            if haircut_bytes:
                nparr_hair = np.frombuffer(haircut_bytes, np.uint8)
                hair_img = cv2.imdecode(nparr_hair, cv2.IMREAD_COLOR)
                if hair_img is not None:
                    # Crop top 50% of reference haircut
                    hh, hw = hair_img.shape[:2]
                    hair_crop = hair_img[0 : int(hh * 0.55), :]
                    # Resize to match customer head width
                    target_w = int(w * 0.9)
                    target_h = int(h * 0.45)
                    hair_resized = cv2.resize(hair_crop, (target_w, target_h), interpolation=cv2.INTER_AREA)

                    # Create soft feathered mask
                    mask = np.zeros((target_h, target_w), dtype=np.float32)
                    cv2.ellipse(
                        mask,
                        (target_w // 2, int(target_h * 0.55)),
                        (int(target_w * 0.48), int(target_h * 0.48)),
                        0,
                        0,
                        360,
                        1.0,
                        -1,
                    )
                    mask = cv2.GaussianBlur(mask, (31, 31), 15)

                    # Position at top center of customer image
                    start_y = max(0, int(h * 0.02))
                    end_y = min(h, start_y + target_h)
                    start_x = max(0, (w - target_w) // 2)
                    end_x = min(w, start_x + target_w)

                    crop_h = end_y - start_y
                    crop_w = end_x - start_x

                    sub_mask = mask[:crop_h, :crop_w, np.newaxis]
                    sub_hair = hair_resized[:crop_h, :crop_w]

                    roi = customer_img[start_y:end_y, start_x:end_x].astype(np.float32)
                    blended = (sub_hair.astype(np.float32) * sub_mask) + (roi * (1.0 - sub_mask))
                    customer_img[start_y:end_y, start_x:end_x] = np.clip(blended, 0, 255).astype(np.uint8)

            # Encode back to JPEG
            _, buffer = cv2.imencode(".jpg", customer_img, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            return buffer.tobytes()
        except Exception as err:
            logger.error("Error creating fallback blend: %s", err)
            return customer_bytes

    async def execute_try_on(
        self,
        customer_image_bytes: bytes,
        haircut_id: Optional[str] = None,
        haircut_name: Optional[str] = None,
        haircut_image_url: Optional[str] = None,
        barber_notes: Optional[str] = None,
    ) -> TryOnData:
        """Execute virtual try-on via Hugging Face HairFastGAN or fallback synthesis."""
        haircut_bytes: Optional[bytes] = None
        if haircut_image_url:
            haircut_bytes = await self._download_image(haircut_image_url)

        # Attempt Hugging Face Space inference
        hf_success = False
        result_bytes: Optional[bytes] = None

        try:
            from gradio_client import Client, handle_file

            # Write customer and haircut images to temp files
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_cust:
                f_cust.write(customer_image_bytes)
                cust_path = f_cust.name

            shape_path = None
            if haircut_bytes:
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_shape:
                    f_shape.write(haircut_bytes)
                    shape_path = f_shape.name

            try:
                # Initialize client with timeout
                client = Client(
                    settings.HAIRFASTGAN_SPACE,
                    hf_token=settings.HF_TOKEN if settings.HF_TOKEN else None,
                )

                # HairFastGAN takes: face (customer), shape (haircut), color (customer or haircut)
                # Parameters map to handle_file
                ref_path = shape_path if shape_path else cust_path
                predict_result = client.predict(
                    face=handle_file(cust_path),
                    shape=handle_file(ref_path),
                    color=handle_file(cust_path),
                    api_name="/predict",
                )

                # Predict result can be a tuple or string path to generated image
                generated_path = None
                if isinstance(predict_result, (list, tuple)) and len(predict_result) > 0:
                    generated_path = predict_result[0]
                elif isinstance(predict_result, str):
                    generated_path = predict_result

                if generated_path and os.path.exists(generated_path):
                    with open(generated_path, "rb") as gf:
                        result_bytes = gf.read()
                    hf_success = True
                    logger.info("Successfully generated hairstyle using Hugging Face HairFastGAN.")

            except Exception as hf_err:
                logger.warning("Hugging Face HairFastGAN Space call skipped or failed: %s", hf_err)
            finally:
                if os.path.exists(cust_path):
                    os.unlink(cust_path)
                if shape_path and os.path.exists(shape_path):
                    os.unlink(shape_path)

        except ImportError:
            logger.info("gradio_client not installed or not available, using fallback blender.")

        # If HF succeeded, use its result; otherwise use smart fallback blend
        if not hf_success or not result_bytes:
            result_bytes = self._create_fallback_blend(customer_image_bytes, haircut_bytes)
            is_simulation = True
        else:
            is_simulation = False

        base64_url = self._to_base64_data_url(result_bytes, "image/jpeg")

        return TryOnData(
            haircut_id=haircut_id,
            haircut_name=haircut_name or "Rekomendasi Potongan Rambut",
            after_image_base64=base64_url,
            barber_notes=barber_notes,
            is_simulation=is_simulation,
        )


virtual_try_on_service = VirtualTryOnService()
