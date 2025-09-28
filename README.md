# IBCS Compliance AI Project (Semester 4 - Group 4)

A student project that analyzes dashboard images for compliance with International Business Communication Standards (IBCS), starting with Rule B (proper use of colors). The system detects charts and highlights non-compliant areas, then provides textual guidance.

## Quick links (open files)
- Backend service: [`back-end/app.py`](back-end/app.py)
- Trained models: [`back-end/GraphAndTable.pt`](back-end/GraphAndTable.pt), [`back-end/tuned.pt`](back-end/tuned.pt), [`back-end/resnet50_ibcs_color_compliance.keras`](back-end/resnet50_ibcs_color_compliance.keras)
- Frontend entry: [`front-end/index.html`](front-end/index.html) - React + Vite setup (see [`front-end/README.md`](front-end/README.md))
- Data and preprocessing notebooks: [`dashboard-splitter/Training.ipynb`](dashboard-splitter/Training.ipynb), [`dashboard-splitter/TrainingGraphAndTable.ipynb`](dashboard-splitter/TrainingGraphAndTable.ipynb)

## Features
- Detects charts and tables in dashboard screenshots.
- Evaluates color usage against IBCS Rule B.
- Produces visual annotations and textual suggestions for corrections.
- Ships with preprocessing notebooks and trained model artifacts for reproducibility.

## Architecture overview
- Frontend (`front-end`): React + Vite single-page app for uploading dashboards and presenting results.
- Backend (`back-end/app.py`): Flask API orchestrating YOLO detection plus a ResNet-based color compliance classifier, exposing `/predict` and `/dashboard_predict` endpoints.
- Model artifacts (`back-end/*.pt`, `.keras`): pre-trained weights consumed by the API, replaceable with retrained versions.
- Notebooks (`dashboard-splitter`): data preparation and training experiments used to create the shipped models.

## Environment
- Tested with Python 3.9 and Node.js 18. Re-run setup when upgrading major versions to confirm dependencies still resolve and models load correctly.
- Create a Python virtual environment before installing backend dependencies to keep tooling isolated.
- Set `KMP_DUPLICATE_LIB_OK=TRUE` on some Windows machines if MKL duplicate library errors occur while loading the models.
- GPU acceleration is optional; the current models run on CPU but large images take longer to process.

## Install and run

### Backend setup
```bash
cd back-end
python -m venv .venv
.\.venv\Scripts\activate     # Windows
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```
The Flask app listens on `http://127.0.0.1:5000` by default. Adjust the host or port arguments in `app.py` when deploying.

### Frontend setup
```bash
cd front-end
npm install
npm run dev
```
Vite serves the UI at `http://localhost:5173`. Update the API base URL under `front-end/src` if you change the backend address.

## Usage
- Start the backend and frontend servers.
- Open the frontend in your browser and upload a dashboard image.
- Review the annotated preview (PNG overlay) and the textual explanation describing the IBCS Rule B assessment.

## API reference
- `POST /predict`
  - Body: multipart form with `file` (single dashboard image).
  - Response: `{ compliant: bool, explanation: string[], heatmap: base64 PNG }`.
- `POST /dashboard_predict`
  - Body: multipart form with `file` (full dashboard image).
  - Response: `{ results: [{ index: int, compliant: bool, explanation: string[], heatmap: base64 PNG }] }`, where each entry corresponds to a detected chart or table region.

Example request (Python):
```python
import requests

files = {"file": open("sample-dashboard.png", "rb")}
response = requests.post("http://127.0.0.1:5000/predict", files=files, timeout=60)
print(response.json())
```

## Model training workflow
- Prepare data with the notebooks in `dashboard-splitter`. They document how images were split and labeled for YOLO detection and color compliance classification.
- Update dataset paths inside the notebooks before rerunning them.
- Export the trained models to the `back-end` directory with the same filenames, or adjust the loaders in `app.py` if you rename files.
- Version large artifacts with Git LFS or publish them separately if they exceed repository size limits.

## Testing and quality checks
- Frontend lint: `npm run lint`.
- Manual smoke test: upload representative dashboards (compliant and non-compliant) to confirm annotations and explanations render as expected.
- Add automated tests gradually (unit tests for preprocessing utilities, or integration tests for the API) as new features are introduced.

## Troubleshooting
- **Model file missing**: ensure the `.pt` and `.keras` weights are present in `back-end/`; otherwise the server exits during startup.
- **Slow predictions**: reduce input resolution before uploading or run the backend with GPU-enabled PyTorch for faster YOLO inference.
- **CORS errors**: update the frontend base URL or tweak the Flask-CORS configuration in `app.py` when serving from a different domain.
- **Installation failures on Windows**: upgrade `pip` and install Microsoft C++ Build Tools if wheel compilation fails for scientific packages.

## Development notes
- Preprocessing experiments live in [`dashboard-splitter/Training.ipynb`](dashboard-splitter/Training.ipynb) and [`dashboard-splitter/TrainingGraphAndTable.ipynb`](dashboard-splitter/TrainingGraphAndTable.ipynb).
- Frontend source files sit in `front-end/src`; the main entry flow is `index.html -> src/main.jsx`.
- Keep sensitive credentials out of commits; use environment files ignored by Git for deployment secrets.

## Contributing
- Create feature branches and open pull requests summarising scope plus test evidence.
- Run `npm run lint` and a manual inference test before submitting changes.
- Document model retraining steps in the notebooks or pull request description so others can reproduce results.

## License and contact
Project licensed under MIT. See [LICENSE](LICENSE). For contributor questions, reach the Semester 4 project team via the faculty communication channel or the shared project email list.-
