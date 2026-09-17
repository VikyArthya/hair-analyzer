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
        """Create visual try-on by blending target haircut directly onto customer's face image."""
        try:
            nparr = np.frombuffer(customer_bytes, np.uint8)
            customer_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if customer_img is None:
                return customer_bytes

            h, w = customer_img.shape[:2]

            if not haircut_bytes:
                return customer_bytes

            nparr_hair = np.frombuffer(haircut_bytes, np.uint8)
            hair_img = cv2.imdecode(nparr_hair, cv2.IMREAD_COLOR)
            if hair_img is None:
                return customer_bytes

            # 1. Detect facial landmarks on customer to accurately position hair
            forehead_y = int(h * 0.28)
            temple_w = int(w * 0.75)
            center_x = w // 2

            try:
                from app.services.face_mesh import face_mesh_service
                landmarks = face_mesh_service.extract_landmarks(customer_img)
                if landmarks and 10 in landmarks:
                    forehead_y = int(landmarks[10][1])
                if landmarks and 54 in landmarks and 284 in landmarks:
                    temple_w = int(abs(landmarks[284][0] - landmarks[54][0]) * 1.35)
                    center_x = int((landmarks[284][0] + landmarks[54][0]) / 2)
            except Exception as e:
                logger.debug("Landmark detection in try-on fallback skipped: %s", e)

            # 2. Extract hair portion from reference image
            hh, hw = hair_img.shape[:2]
            hair_crop = hair_img[0 : int(hh * 0.52), :]

            # 3. Resize hair to match customer head proportions
            target_w = max(50, min(w, temple_w))
            target_h = int(target_w * (hair_crop.shape[0] / hair_crop.shape[1]))
            hair_resized = cv2.resize(hair_crop, (target_w, target_h), interpolation=cv2.INTER_AREA)

            # 4. Create soft feathered mask
            mask = np.zeros((target_h, target_w), dtype=np.float32)
            cv2.ellipse(
                mask,
                (target_w // 2, int(target_h * 0.50)),
                (int(target_w * 0.46), int(target_h * 0.46)),
                0,
                0,
                360,
                1.0,
                -1,
            )
            mask = cv2.GaussianBlur(mask, (25, 25), 11)

            # 5. Position hair naturally sitting on top of forehead
            start_y = max(0, forehead_y - int(target_h * 0.72))
            end_y = min(h, start_y + target_h)
            start_x = max(0, center_x - (target_w // 2))
            end_x = min(w, start_x + target_w)

            crop_h = end_y - start_y
            crop_w = end_x - start_x

            if crop_h > 0 and crop_w > 0:
                sub_mask = mask[:crop_h, :crop_w, np.newaxis]
                sub_hair = hair_resized[:crop_h, :crop_w]

                roi = customer_img[start_y:end_y, start_x:end_x].astype(np.float32)
                blended = (sub_hair.astype(np.float32) * sub_mask) + (roi * (1.0 - sub_mask))
                customer_img[start_y:end_y, start_x:end_x] = np.clip(blended, 0, 255).astype(np.uint8)

            # Encode back to JPEG
            _, buffer = cv2.imencode(".jpg", customer_img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            return buffer.tobytes()
        except Exception as err:
            logger.error("Error creating fallback blend: %s", err)
            return customer_bytes


    def _run_hf_inference(self, cust_path: str, shape_path: Optional[str]) -> Optional[tuple[bytes, str]]:
        """Perform Hugging Face Face-Swap space inference to swap customer face onto haircut model."""
        if not shape_path:
            return None
        try:
            from gradio_client import Client, handle_file

            client = Client(
                settings.HF_FACESWAP_SPACE,
                token=settings.HF_TOKEN if settings.HF_TOKEN else None,
            )

            predict_result = client.predict(
                src_img=handle_file(cust_path),
                dest_img=handle_file(shape_path),
                api_name="/swap_faces",
            )

            generated_path = None
            if isinstance(predict_result, (list, tuple)) and len(predict_result) > 0:
                generated_path = predict_result[0]
            elif isinstance(predict_result, str):
                generated_path = predict_result

            if generated_path and os.path.exists(generated_path):
                mime = "image/webp" if generated_path.lower().endswith(".webp") else "image/jpeg"
                with open(generated_path, "rb") as gf:
                    return gf.read(), mime
        except Exception as hf_err:
            logger.warning("Hugging Face Face-Swap Space call skipped or failed: %s", hf_err)
        return None

    async def execute_try_on(
        self,
        customer_image_bytes: bytes,
        haircut_id: Optional[str] = None,
        haircut_name: Optional[str] = None,
        haircut_image_url: Optional[str] = None,
        barber_notes: Optional[str] = None,
    ) -> TryOnData:
        """Execute virtual try-on via Hugging Face Face-Swap or reference fallback."""
        haircut_bytes: Optional[bytes] = None
        if haircut_image_url:
            haircut_bytes = await self._download_image(haircut_image_url)

        # Attempt Hugging Face Space inference
        hf_success = False
        hf_result = None

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
            hf_result = self._run_hf_inference(cust_path, shape_path)
            if hf_result:
                if isinstance(hf_result, tuple):
                    result_bytes, mime_type = hf_result
                else:
                    result_bytes = hf_result
                    mime_type = "image/jpeg"
                hf_success = True
                logger.info("Successfully generated hairstyle using Hugging Face Face-Swap.")
        finally:
            if os.path.exists(cust_path):
                os.unlink(cust_path)
            if shape_path and os.path.exists(shape_path):
                os.unlink(shape_path)

        # If HF succeeded, use its result; otherwise use clean haircut reference image
        if not hf_success or not hf_result:
            result_bytes = haircut_bytes if haircut_bytes else customer_image_bytes
            mime_type = "image/jpeg"
            is_simulation = True
        else:
            is_simulation = False

        base64_url = self._to_base64_data_url(result_bytes, mime_type)

        return TryOnData(
            haircut_id=haircut_id,
            haircut_name=haircut_name or "Rekomendasi Potongan Rambut",
            after_image_base64=base64_url,
            barber_notes=barber_notes,
            is_simulation=is_simulation,
        )


virtual_try_on_service = VirtualTryOnService()
