# IBCS Compliance AI Project

## About The Project
The IBCS Compliance AI Project is a student group project that develops an AI-powered tool to evaluate dashboards for compliance with the International Business Communication Standards (IBCS).  
The first milestone focuses on Rule B: Proper use of colors. The tool scans dashboard images, detects compliance issues, and generates both visual highlights and textual feedback to help users improve their dashboards.

### Built With
- Python (Flask or FastAPI)
- PyTorch, Keras, TensorFlow
- OpenCV, PIL
- React with Vite

---

## Getting Started
To get a local copy up and running, follow these steps.

### Prerequisites
- Python 3.9 or higher
- Node.js and npm

### Installation

#### Backend

cd back-end
pip install -r requirements.txt
python app.py

#### Frondend
cd front-end
npm install
npm run dev

#### Usage
1. Start the backend server:
cd back-end
python app.py
2. Start the frontend:
cd front-end
npm run dev

3. Open your browser at http://localhost:5173.

4. Upload a dashboard image.

5. Review the compliance results:

- Visual annotations of non-compliant areas.
- Textual explanations and suggestions.

### Project Structure
back-end/            Backend logic and trained models
front-end/           React-based frontend
dashboard-splitter/  Image preprocessing and splitting
Documentation/       Research documents and reports
IBCS_Group4_Iteration1.ipynb   Experiment notebook
README.md            Project documentation


