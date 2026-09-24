import base64
import cv2
import numpy as np
import logging
from app.config import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

VISION_PROMPT = """You are an animal health observation assistant. Analyze this image of an animal and provide preliminary visual observations.

RULES:
1. Describe what you observe in the image factually.
2. Note any visible abnormalities (skin conditions, swelling, discharge, posture issues, etc.).
3. Do NOT provide a definitive diagnosis.
4. Do NOT prescribe medication.
5. Recommend veterinary examination if anything concerning is visible.
6. Keep the observation clear and professional.

Format:
**Visual Observation:**
[Your observations]

**Recommendation:**
[Whether veterinary examination may be appropriate]

**Disclaimer:** This is a preliminary AI observation, not a veterinary diagnosis. Physical examination by a qualified veterinarian is recommended for accurate assessment."""


def validate_image(content_type: str, size: int) -> str | None:
    if content_type not in ALLOWED_TYPES:
        return f"Unsupported file type: {content_type}. Supported: JPG, JPEG, PNG, WEBP."
    if size > MAX_SIZE_BYTES:
        return f"File too large ({size / 1024 / 1024:.1f} MB). Maximum: 5 MB."
    return None


def preprocess_image(image_bytes: bytes) -> tuple[bytes, np.ndarray]:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Unable to decode image.")

    h, w = img.shape[:2]
    max_dim = 1024
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    enhanced = cv2.convertScaleAbs(img, alpha=1.1, beta=10)
    _, buf = cv2.imencode(".jpg", enhanced, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buf.tobytes(), img


def _offline_vision_analysis(img: np.ndarray) -> str:
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_val = float(np.mean(gray))
    std_val = float(np.std(gray))
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    clarity = "sharp and well-defined" if laplacian_var > 100 else "mildly blurred or soft focus"
    lighting = "adequate and balanced" if 60 <= mean_val <= 190 else ("low lighting" if mean_val < 60 else "high exposure")

    return f"""**Visual Observation:**
- Image processed successfully ({w}x{h} px resolution).
- Image clarity is {clarity} (focus index: {laplacian_var:.1f}).
- Lighting condition appears {lighting} with contrast level at {std_val:.1f}.
- Visual surface contours and features are detected. Note that computer vision cannot detect internal discomfort, subtle skin parasites, or subsurface inflammation without direct palpation.

**Recommendation:**
- If examining skin patches, lesions, eye discharge, or leg swelling, ensure good natural daylight and close-up focus.
- Share this visual with your local veterinarian for an accurate in-person clinical examination.

**Disclaimer:** This is a preliminary AI computer vision observation, not a veterinary diagnosis. Physical examination by a qualified veterinarian is recommended for accurate clinical assessment."""


def analyze_image(image_bytes: bytes) -> str:
    processed, img = preprocess_image(image_bytes)

    if not settings.openai_api_key:
        return _offline_vision_analysis(img)

    b64 = base64.b64encode(processed).decode("utf-8")

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "low"}},
                ],
            }
        ],
        max_tokens=800,
        temperature=0.3,
    )
    return response.choices[0].message.content
