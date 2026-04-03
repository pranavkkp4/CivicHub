from fastapi import APIRouter, Depends, UploadFile, File
from typing import List, Optional, Tuple
import numpy as np
from PIL import Image, ImageOps
import io
from ..routes.auth import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


digit_model = None
digit_model_accuracy: Optional[float] = None


def get_digit_model():
    """Lazy load the digit recognition model."""
    global digit_model, digit_model_accuracy
    if digit_model is None:
        try:
            from sklearn.datasets import load_digits
            from sklearn.metrics import accuracy_score
            from sklearn.model_selection import train_test_split
            from sklearn.neighbors import KNeighborsClassifier
            from sklearn.pipeline import Pipeline
            from sklearn.preprocessing import StandardScaler
            
            digits = load_digits()
            X, y = digits.data, digits.target
            X_train, X_test, y_train, y_test = train_test_split(
                X,
                y,
                test_size=0.2,
                random_state=42,
                stratify=y,
            )

            model = Pipeline(
                steps=[
                    ("scaler", StandardScaler()),
                    (
                        "classifier",
                        KNeighborsClassifier(n_neighbors=3, weights="distance"),
                    ),
                ]
            )
            model.fit(X_train, y_train)
            digit_model_accuracy = accuracy_score(y_test, model.predict(X_test))
            digit_model = model
        except Exception as e:
            print(f"Error loading model: {e}")
            digit_model = None
    return digit_model


def _locate_digit_bounds(ink_array: np.ndarray, threshold: int = 24) -> Optional[Tuple[int, int, int, int]]:
    """Return the bounding box of the ink pixels, if any exist."""
    ys, xs = np.where(ink_array > threshold)
    if xs.size == 0 or ys.size == 0:
        return None

    left = int(xs.min())
    right = int(xs.max())
    top = int(ys.min())
    bottom = int(ys.max())
    return left, top, right, bottom


def _prepare_digit_image(image: Image.Image) -> np.ndarray:
    """Convert a hand-drawn image into the 8x8 digits format."""
    grayscale = image.convert("L")
    pixel_array = np.array(grayscale, dtype=np.uint8)

    # Invert so the digit becomes bright on a dark background, which matches
    # the classic sklearn digits dataset.
    ink_array = 255 - pixel_array
    bounds = _locate_digit_bounds(ink_array)

    if bounds is None:
        centered = Image.new("L", (8, 8), color=0)
        return np.asarray(centered, dtype=np.float32).reshape(1, -1)

    left, top, right, bottom = bounds
    width = right - left + 1
    height = bottom - top + 1
    pad = max(2, int(round(max(width, height) * 0.2)))

    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(ink_array.shape[1], right + pad + 1)
    bottom = min(ink_array.shape[0], bottom + pad + 1)

    cropped = Image.fromarray(ink_array).crop((left, top, right, bottom))

    # Fit the digit into a slightly smaller box so the classifier sees
    # centered, proportionate strokes instead of edge-to-edge noise.
    target_size = 6
    scale = min(target_size / max(1, cropped.width), target_size / max(1, cropped.height))
    resized_width = max(1, int(round(cropped.width * scale)))
    resized_height = max(1, int(round(cropped.height * scale)))
    resized = cropped.resize((resized_width, resized_height), Image.Resampling.LANCZOS)

    canvas = Image.new("L", (8, 8), color=0)
    offset_x = (8 - resized.width) // 2
    offset_y = (8 - resized.height) // 2
    canvas.paste(resized, (offset_x, offset_y))

    # Scale to the same 0-16 range used by sklearn's digits dataset.
    prepared = np.asarray(ImageOps.autocontrast(canvas), dtype=np.float32)
    prepared = (prepared / 255.0) * 16.0
    return prepared.reshape(1, -1)


@router.post("/digit-recognize")
async def recognize_digit(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Recognize a handwritten digit from an image"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        img_flat = _prepare_digit_image(image)
        model = get_digit_model()

        if model is None:
            return {
                "prediction": 5,
                "confidence": 0.85,
                "all_probabilities": {str(i): 0.1 for i in range(10)},
                "note": "Using fallback mode - model not loaded"
            }
        
        prediction = model.predict(img_flat)[0]
        probabilities = model.predict_proba(img_flat)[0]

        return {
            "prediction": int(prediction),
            "confidence": float(max(probabilities)),
            "all_probabilities": {str(i): float(prob) for i, prob in enumerate(probabilities)}
        }
    
    except Exception as e:
        return {
            "error": str(e),
            "prediction": None,
            "confidence": 0
        }


@router.get("/digit-recognizer/info")
async def get_digit_recognizer_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get information about the digit recognizer"""
    get_digit_model()
    return {
        "name": "Handwritten Digit Recognizer",
        "description": "A machine learning model that recognizes handwritten digits (0-9) using the classic MNIST-style dataset.",
        "model_type": "K-Nearest Neighbors with standardized digit preprocessing",
        "dataset": "sklearn digits (8x8 images)",
        "accuracy": f"~{digit_model_accuracy * 100:.1f}% on a held-out test set" if digit_model_accuracy is not None else "Model accuracy is computed at startup",
        "how_it_works": "The model centers the digit, rescales the strokes into the 8x8 digits format, and predicts which digit (0-9) it most closely matches.",
        "tips": [
            "Write one digit at a time and keep it centered",
            "Use a thick, dark stroke on a light background",
            "Leave a small margin around the digit so cropping works well",
            "Avoid extra marks or decorative lines"
        ]
    }
