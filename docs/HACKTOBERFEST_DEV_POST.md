---
title: GardenMind AI — Grow Smarter, Care Naturally with Local Vision AI
published: false
description: An open-source botanical companion featuring local on-device computer vision to diagnose plant health, track growth milestones, and touch grass.
tags: devchallenge, hf26challenge, opensource, ai
cover_image: https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/cover-image.jpg
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

---

## What I Built

As a computer science student, I spend most of my days glued to monitors, terminal windows, and code editors. A few months ago, I started keeping houseplants in my room to bring some life to my workspace. But I quickly realized that keeping plants alive is surprisingly stressful when you are just starting out:

1. **Inconsistent care schedules:** Every plant has its own rhythm. My *Monstera* wants deep watering every week, while my Snake Plant (*Sansevieria*) barely needs water once every three weeks. Remembering what needs water, misting, or fertilizer becomes mental clutter.
2. **Ambiguous plant health issues:** The moment a leaf turns yellow or develops brown spots, you find yourself frantically searching online forums. Most commercial diagnostic apps either lock advice behind aggressive paywalls or immediately suggest chemical pesticides and synthetic sprays without explaining the real cause.
3. **Scattered observations:** Photos of new leaf unfurls, repotting dates, and pest treatments end up lost in the camera roll.

I built **GardenMind AI** to solve these problems. It is an intelligent, botanical-first web application designed to help people care for living greenery, understand early foliar stress signals, and cultivate a daily habit of stepping away from screens to connect with nature.

<!-- IMAGE 1: Overview Dashboard -->
![GardenMind AI Garden Overview Dashboard](https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/01-overview-dashboard.png)
*Figure 1: The Garden Overview dashboard showing botanical metrics, urgent attention alerts, and today's care checklist.*

### Connecting to "Touch Grass"

The goal of GardenMind AI is not to keep you staring at another app. It is designed to get you away from your desk. The application acts as a quiet companion that prompts you to check on your living plants, feel the soil with your fingers to test moisture, inspect the undersides of leaves, and record physical growth milestones. 

Whether you have a single pothos on your desk or an urban balcony terrace, GardenMind AI encourages mindful, hands-on gardening:

- **My Garden (Collection Management):** Catalog indoor and outdoor specimens with custom nicknames, botanical species, room locations, and care statuses (`Looking healthy`, `Needs attention`, `Care info needed`).
- **Plant Doctor AI (Vision Diagnostics):** Upload leaf photos to receive on-device computer vision assessments that identify possible pathologies while strictly prioritizing non-chemical cultural remedies (airflow, bottom-watering, sanitized pruning).
- **Smart Care Planner:** An interactive routine engine with recurring tasks (watering, fertilizing, misting, rotating) that automatically schedules forward when you check off an action.
- **Growth Journal:** A timeline archive where you document physical milestones, upload photo progress strips, and track quantitative growth metrics (like leaf height and new fenestrations).

<!-- IMAGE 2: My Garden Plant Collection -->
![GardenMind AI Plant Collection Grid](https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/02-my-garden.png)
*Figure 2: The My Garden collection view displaying individual botanical profiles, environmental tags, and watering rhythms.*

---

## Demo

- **Live Frontend Demo:** [https://akshay118r.github.io/Garden-Mind-AI/](https://akshay118r.github.io/Garden-Mind-AI/)

The frontend is deployed live on GitHub Pages as a fully interactive Single Page Application. You can explore the pre-seeded botanical collection, test the Care Planner, browse the Growth Journal, and inspect the Plant Doctor workflow directly in your browser.

> **Note on Backend & Full Local Experience:**  
> The static GitHub Pages deployment operates client-side with a pre-seeded in-memory catalog. To run the full stack with the local ONNX vision inference engine and persistent SQLite disk storage, you can easily spin it up locally in about two minutes using the commands below.

---

## Code

The complete source code is public and open-source under the MIT License:

- **GitHub Repository:** [https://github.com/akshay118R/Garden-Mind-AI](https://github.com/akshay118R/Garden-Mind-AI)

<!-- IMAGE 3: Public GitHub Repository -->
![GardenMind AI Public GitHub Repository](https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/05-github-repository.png)
*Figure 3: The public GardenMind AI repository on GitHub showing the full-stack codebase, MIT license, and documentation.*

### Running the Project Locally

#### 1. Clone the repository
```bash
git clone https://github.com/akshay118R/Garden-Mind-AI.git
cd Garden-Mind-AI
```

#### 2. Start the FastAPI Python Backend
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*The backend API will be live at `http://127.0.0.1:8000`, with interactive OpenAPI Swagger docs at `http://127.0.0.1:8000/docs`.*

#### 3. Start the React Vite Frontend
In a second terminal window at the project root:
```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Open `http://127.0.0.1:5173` to interact with the full application.*

---

## How I Built It

I designed GardenMind AI as a clean, decoupled full-stack architecture focused on speed, privacy, and botanical accuracy:

<!-- IMAGE 4: Plant Doctor AI Interface -->
![GardenMind AI Plant Doctor AI Workspace](https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/03-plant-doctor.png)
*Figure 4: The Plant Doctor AI interface where gardeners upload foliage photos and provide optional context to receive structured evaluations.*

### 1. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons. Built with an organic botanical design system featuring sage greens, warm ivories, and forest tones.
- **Backend API:** Python 3.11/3.14, FastAPI, Uvicorn, Pydantic v2 schemas. Provides RESTful endpoints under `/api/v1` for plants, tasks, journals, uploads, and AI diagnostics.
- **Database & Persistence:** SQLite via SQLAlchemy 2.0 ORM. Uses foreign-key relational integrity, safe archiving deletion policies, and multipart file upload management with image decompression bomb validation.
- **Computer Vision AI Engine:** `onnxruntime` executing a quantized `MobileNetV2` classifier locally on the CPU.

### 2. How the AI Works: Local ONNX Vision Inference

Rather than sending personal photos to an expensive third-party closed API for basic image classification, GardenMind AI uses an embedded open-source neural network:

- **Model Architecture:** `MobileNetV2 (1.0_224)` image classification model (`MobileNetV2ForImageClassification`).
- **Checkpoint Source:** Open-source ONNX checkpoint fine-tuned on the **PlantVillage dataset** (38 crop condition classes across 14 agricultural species, CC BY 4.0 Open Access), hosted on Hugging Face ([`onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX`](https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX)).
- **Runtime & Latency:** Executed locally via Microsoft's `onnxruntime` C++ engine in Python. Inference takes approximately **25–45 milliseconds** on a standard modern CPU without needing a GPU or CUDA drivers.
- **Preprocessing Pipeline:** Input images are normalized using ImageNet channel statistics (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`), resized to `(1, 3, 224, 224)` float32 tensors, and evaluated with a numerically stable softmax function.

<!-- IMAGE 5: Growth Journal Timeline -->
![GardenMind AI Growth Journal](https://raw.githubusercontent.com/akshay118R/Garden-Mind-AI/main/docs/devpost-assets/04-growth-journal.png)
*Figure 5: The Growth Journal archive tracking multi-photo observations, repotting dates, and dimensional growth metrics.*

### 3. Diagnostic Safeguards & Scientific Boundaries

One of the biggest pitfalls in consumer AI health tools is overconfidence. A raw softmax score from a neural network is a mathematical normalization across closed classes, not an empirically calibrated diagnostic truth. I built strict engineering guardrails into GardenMind AI:

1. **Heuristic Confidence Tiers:**
   - Softmax $\ge 0.70 \to$ High alignment (`candidate_identified`)
   - $0.45 \le \text{Softmax} < 0.70 \to$ Moderate alignment (`candidate_identified`)
   - $0.30 \le \text{Softmax} < 0.45 \to$ Low alignment (`inconclusive`)
   - Softmax $< 0.30 \to$ Uncertain (`inconclusive`)
2. **Honest Inconclusive Reporting:** If a photo is blurry, unidentifiable, or outside the training distribution, the model transparently states that the symptoms are inconclusive rather than inventing a hallucinated diagnosis.
3. **Conservative Cultural Care Only:** Suggested remedies are strictly non-chemical (isolating the pot, enhancing airflow, bottom-watering, pruning damaged leaves with sanitized shears). The system explicitly forbids chemical pesticide dosages.
4. **Physical Limitation Disclosure:** Every report clarifies that a 2D photograph cannot detect subterranean root rot, soil pH imbalances, or microscopic soil pests.

### 4. Automated Testing & Verification

Reliability matters when managing data and model inference:
- **Backend:** 31 Pytest unit and integration tests covering CRUD operations, safe deletion policies, and error handling.
- **End-to-End Persistence:** 16 live HTTP verification checks confirming disk write integrity and server reboot data retention.
- **AI Inference Checks:** 5 live verification tests confirming ONNX execution speed and schema conformity.
- **Frontend:** 101 automated TypeScript assertions across 3 test suites verifying care scheduling recurrence, journal filters, and doctor workflow logic.

---

## Why Does Open Innovation Matter?

Working on GardenMind AI reinforced why open source and open-weight models are vital for the future of technology:

1. **True Privacy and Local Ownership:**  
   When someone takes pictures inside their living room or garden, those photos shouldn't have to leave their device. By using a lightweight, open-weight ONNX model running locally on the CPU, GardenMind AI proves that practical AI features can run entirely on consumer hardware without sending private data to corporate cloud servers.
2. **Zero Marginal Inference Cost:**  
   Closed proprietary APIs charge per token or per image query. That pricing model makes it financially impractical for students, indie developers, and hobbyists to build free tools for their communities. Open-source models eliminate paywalls and rate limits.
3. **Reproducibility and Scientific Scrutiny:**  
   Because the PlantVillage dataset is openly documented and the ONNX model architecture is transparent, anyone can inspect the label mappings, study the training limitations, or fine-tune the model for specific local flora. Closed AI black-boxes offer no such accountability.
4. **Community Extension:**  
   Open-sourcing this project allows other botanical enthusiasts to fork the repository, add support for regional plant species, integrate soil moisture IoT sensors, or deploy their own personal care companions.

---

## My Agent Session

<!-- NOTE FOR SUBMISSION:
If you recorded an agent session via DevRelay or Forem, embed it here using:
{% agent_session https://dev.to/... %}
If not using an agent session recording, this section can remain omitted or updated before submitting.
-->

*Development workflow was designed and verified using pair-programming in Antigravity IDE, with automated testing suites for both Python FastAPI and React TypeScript layers.*

---

## Prize Categories

### Best Use of Render ($200 Featured Partner Category)

GardenMind AI includes a complete production deployment configuration specifically engineered for **Render**:

- **Render Blueprint:** The repository provides a tested [`render.yaml`](https://github.com/akshay118R/Garden-Mind-AI/blob/main/render.yaml) specification defining an automated Render Web Service with health checks (`/api/v1/health`) and build/start commands.
- **Persistent Disk Storage:** Because SQLite and user-uploaded plant photos require persistence across container rebuilds, the `render.yaml` configuration configures a **1 GB Render Persistent Disk** mounted at `/var/data`.
- **Environment & Containerization:** Pre-configured environment variables for CORS, upload directories, and database paths ensure the backend runs out-of-the-box on Render's managed infrastructure alongside the containerized [`backend/Dockerfile`](https://github.com/akshay118R/Garden-Mind-AI/blob/main/backend/Dockerfile).

---

*Thank you to DEV, GitHub, and the open-source community for organizing Hacktoberfest 2026. Happy gardening, and remember to step outside and touch grass! 🌱*
