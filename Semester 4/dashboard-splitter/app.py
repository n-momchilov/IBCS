import os
from flask import Flask, render_template, request
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/results'
app.config['CROPS_FOLDER'] = 'static/crops'

# Creates output folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CROPS_FOLDER'], exist_ok=True)

# Load model
model = YOLO('model/tuned.pt')

@app.route('/', methods=['GET', 'POST'])
def index():
    result_img_path = None
    crop_paths = []
    if request.method == 'POST':
        file = request.files.get('file')
        if file and file.filename:
            # Read image and save original
            img = Image.open(file.stream).convert("RGB")
            img_array = np.array(img)
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            orig_path = os.path.join(app.config['UPLOAD_FOLDER'], 'uploaded.jpg')
            cv2.imwrite(orig_path, img_bgr)

            # Run YOLOv8 inference
            results = model(img_bgr)
            result_img = results[0].plot()
            result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
            result_pil = Image.fromarray(result_img_rgb)
            result_img_path = os.path.join(app.config['UPLOAD_FOLDER'], 'result.jpg')
            result_pil.save(result_img_path)
            result_img_path = '/' + result_img_path 

            # Extract and save each detected graph as a separate image
            for idx, box in enumerate(results[0].boxes.xyxy):
                x1, y1, x2, y2 = map(int, box.cpu().numpy())
                crop = img_bgr[y1:y2, x1:x2]
                crop_path = os.path.join(app.config['CROPS_FOLDER'], f'graph_{idx+1}.png')
                cv2.imwrite(crop_path, crop)
                crop_paths.append('/' + crop_path)
    return render_template('index.html', result_img=result_img_path, crop_paths=crop_paths)

# Start server
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
