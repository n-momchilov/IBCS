from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
from keras.applications.resnet50 import preprocess_input
from PIL import Image
import numpy as np
import io
import base64
from lime import lime_image
from skimage.segmentation import mark_boundaries
import matplotlib.pyplot as plt
from skimage.color import rgb2hsv
from collections import Counter
import cv2
from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)
model = load_model(os.path.join(BASE_DIR, 'resnet50_ibcs_color_compliance.keras'))
dashboard_model = YOLO(os.path.join(BASE_DIR, 'GraphAndTable.pt'))



IMG_SIZE = 256

IBCS_COLORS = {
    'green': {'hue': (90, 150), 'sat': (0.3, 1.0), 'val': (0.3, 1.0)},
    'red': {'hue': (0, 15), 'sat': (0.5, 1.0), 'val': (0.3, 1.0)},
    'blue': {'hue': (180, 280), 'sat': (0.3, 1.0), 'val': (0.3, 1.0)}
}

def identify_color_hsv(rgb):
    rgb_normalized = np.array(rgb) / 255.0
    hsv = rgb2hsv(np.array([[rgb_normalized]]))[0][0]
    hue = hsv[0] * 360
    sat = hsv[1]
    val = hsv[2]

    if sat < 0.1 and val > 0.9:
        return "blue"

    if hue >= 345 or hue <= 15:
        for color_name, ranges in IBCS_COLORS.items():
            if color_name == 'red':
                h_min, h_max = ranges['hue']
                s_min, s_max = ranges['sat']
                v_min, v_max = ranges['val']
                if (h_min <= hue <= h_max or h_min <= (hue - 360) <= h_max) and s_min <= sat <= s_max and v_min <= val <= v_max:
                    return color_name
        return "non-compliant (red-like)"

    for color_name, ranges in IBCS_COLORS.items():
        h_min, h_max = ranges['hue']
        s_min, s_max = ranges['sat']
        v_min, v_max = ranges['val']
        if h_min <= hue <= h_max and s_min <= sat <= s_max and v_min <= val <= v_max:
            return color_name

    if 15 < hue < 90:
        return "non-compliant (yellow/orange)"
    elif 150 < hue < 180:
        return "non-compliant (cyan)"
    elif 280 < hue < 345:
        return "non-compliant (purple/magenta)"
    else:
        return "non-compliant (other)"

def preprocess_image(image_bytes, for_lime=False):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img).astype(np.float32) / 255.0
    if for_lime:
        return img_array
    img_array = preprocess_input(img_array * 255.0)
    return np.expand_dims(img_array, axis=0)

def model_predict_for_lime(img):
    img = preprocess_input(img * 255.0)
    preds = model.predict(img)
    return np.hstack([1 - preds, preds])

def generate_lime_explanation(img_array):
    explainer = lime_image.LimeImageExplainer()
    explanation = explainer.explain_instance(
        img_array,
        model_predict_for_lime,
        top_labels=1,
        hide_color=0,
        num_samples=200
    )
    temp, mask = explanation.get_image_and_mask(
        explanation.top_labels[0],
        positive_only=True,
        num_features=5,
        hide_rest=True
    )
    fig, ax = plt.subplots()
    ax.imshow(mark_boundaries(img_array, mask))
    ax.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=200)  # Better resolution
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return img_base64, explanation, mask

def get_dominant_colors_in_mask(img_array, mask):
    img_array_uint8 = (img_array * 255).astype(np.uint8)
    highlighted_pixels = img_array_uint8[mask == 1]
    if len(highlighted_pixels) == 0:
        return ["unknown"]
    colors = [tuple(pixel) for pixel in highlighted_pixels]
    color_counts = Counter(colors)
    total = sum(color_counts.values())
    dominant_colors = [
    color for color, count in color_counts.items()
    if count / total > 0.2  # Only include colors with >20% presence in mask
]

    identified_colors = []
    seen = set()
    for color in dominant_colors:
        label = identify_color_hsv(color)
        if label not in seen:
            identified_colors.append(label)
            seen.add(label)
    return identified_colors

def interpret_lime_explanation(explanation, prediction, img_array, mask):
    label = explanation.top_labels[0]
    reasons = []
    detected_colors = get_dominant_colors_in_mask(img_array, mask)

    if label == 0:
        reasons.append("The colors in this dashboard follow IBCS Rule B: green for positive, red for negative, blue for neutral.")
        non_compliant_colors = [c for c in detected_colors if "non-compliant" in c]
        if non_compliant_colors:
            reasons.append(
                f"Note: Although classified as compliant, some highlighted areas contain non-compliant colors ({', '.join(non_compliant_colors)}). This may indicate a minor deviation or model uncertainty."
            )
    else:
        non_compliant_colors_raw = [c for c in detected_colors if "non-compliant" in c]
        compliant_colors = [c for c in detected_colors if c in IBCS_COLORS]

        # Group and simplify non-compliant colors
        non_compliant_categories = {
            "yellow/orange": False,
            "cyan": False,
            "purple/magenta": False,
            "red-like": False,
            "other": False
        }
        for color in non_compliant_colors_raw:
            for key in non_compliant_categories:
                if key in color:
                    non_compliant_categories[key] = True
        non_compliant_color_labels = [f"non-compliant ({k})" for k, v in non_compliant_categories.items() if v]

        if non_compliant_color_labels:
            reasons.append(
                f"The dashboard violates IBCS Rule B. The highlighted areas contain non-compliant colors: {', '.join(non_compliant_color_labels)}. IBCS recommends using green for positive values, red for negative values, and blue for neutral elements."
            )
        if compliant_colors:
            reasons.append(
                f"The highlighted areas also include IBCS-compliant colors ({', '.join(compliant_colors)}). However, they may be used in the wrong semantic context (e.g., green for negative values, red for positive values, or blue for non-neutral elements). Please verify the chart's data representation."
            )
        if not non_compliant_color_labels and not compliant_colors:
            reasons.append(
                "The dashboard violates IBCS Rule B. The highlighted areas could not be analyzed for specific colors, possibly due to complex patterns or background elements."
            )

    return reasons

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    image_file = request.files['file']
    image_bytes = image_file.read()

    img = preprocess_image(image_bytes)
    prediction = model.predict(img)[0]
    compliant = prediction[0] < 0.5

    img_for_lime = preprocess_image(image_bytes, for_lime=True)
    lime_heatmap, explanation, mask = generate_lime_explanation(img_for_lime)
    reasons = interpret_lime_explanation(explanation, prediction, img_for_lime, mask)

    return jsonify({
        'compliant': bool(compliant),
        'explanation': reasons,
        'heatmap': f'data:image/png;base64,{lime_heatmap}'
    })

@app.route('/dashboard_predict', methods=['POST'])
def dashboard_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    image_file = request.files['file']
    image_bytes = image_file.read()

    # Load image
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(img)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Run dashboard detection model
    results = dashboard_model(img_bgr)
    responses = []

    for idx, box in enumerate(results[0].boxes.xyxy):
        x1, y1, x2, y2 = map(int, box.cpu().numpy())
        crop = img_bgr[y1:y2, x1:x2]

        # Convert crop to bytes
        _, buffer = cv2.imencode('.png', crop)
        crop_bytes = buffer.tobytes()

        # Run IBCS compliance
        img = preprocess_image(crop_bytes)
        prediction = model.predict(img)[0]
        compliant = prediction[0] < 0.5

        img_for_lime = preprocess_image(crop_bytes, for_lime=True)
        lime_heatmap, explanation, mask = generate_lime_explanation(img_for_lime)
        reasons = interpret_lime_explanation(explanation, prediction, img_for_lime, mask)

        responses.append({
            'compliant': bool(compliant),
            'explanation': reasons,
            'heatmap': f'data:image/png;base64,{lime_heatmap}',
            'index': idx + 1
        })

    return jsonify({'results': responses})

if __name__ == '__main__':
    app.run(debug=True)
