# GardenMind AI — Plant Doctor AI Model Specification

## 1. Selected Model Overview

GardenMind AI uses a **local, embedded ONNX vision classifier** fine-tuned on the **PlantVillage dataset**, paired with an extensible multi-provider architecture that can optionally utilize Google Gemini Vision for multimodal botanical analysis.

- **Primary Local Model:** `MobileNetV2 (1.0_224) Plant Disease Classifier`
- **Hugging Face Model Repository:** [`onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX`](https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX)
- **Model Architecture:** `MobileNetV2ForImageClassification` (Sandler et al., Google Research)
- **Format:** ONNX (Open Neural Network Exchange), executed via `onnxruntime`
- **File Size:** 9.22 MB (`backend/models/plant_disease_mobilenet_v2.onnx`) + `config.json` (38-class mapping)
- **License:** **Apache 2.0** (Permissive; commercial and open-source use verified)
- **Dataset Attribution:** PlantVillage Dataset (Hughes & Salathé, 2015 / Penn State University), CC BY 4.0 Open Access (54,306 images across 38 classes)
- **Execution Target:** Local CPU (no GPU, CUDA, or cloud connection required)
- **Inference Latency:** 20–50 ms on a standard modern CPU

---

## 2. Supported Botanical Classes (38 Labels Across 14 Species)

The model is trained to classify images within a closed set of 38 distinct crop, leaf condition, and disease categories across 14 botanical species:

| Plant Specimen | Supported Conditions & Pathologies |
|---|---|
| **Apple** (*Malus domestica*) | Apple Scab (*Venturia inaequalis*), Black Rot (*Botryosphaeria obtusa*), Cedar Apple Rust (*Gymnosporangium juniperi-virginianae*), Healthy Apple |
| **Blueberry** (*Vaccinium*) | Healthy Blueberry Plant |
| **Cherry** (*Prunus avium*) | Powdery Mildew (*Podosphaera clandestina*), Healthy Cherry Plant |
| **Corn / Maize** (*Zea mays*) | Cercospora & Gray Leaf Spot, Common Rust (*Puccinia sorghi*), Northern Leaf Blight (*Exserohilum turcicum*), Healthy Corn Plant |
| **Grape** (*Vitis vinifera*) | Black Rot (*Guignardia bidwellii*), Esca / Black Measles (*Phaeoacremonium*), Isariopsis Leaf Spot, Healthy Grape Plant |
| **Orange / Citrus** (*Citrus sinensis*) | Citrus Greening / Huanglongbing (*Candidatus Liberibacter*) |
| **Peach** (*Prunus persica*) | Bacterial Spot (*Xanthomonas campestris*), Healthy Peach Plant |
| **Bell Pepper** (*Capsicum annuum*) | Bacterial Spot (*Xanthomonas euvesicatoria*), Healthy Bell Pepper Plant |
| **Potato** (*Solanum tuberosum*) | Early Blight (*Alternaria solani*), Late Blight (*Phytophthora infestans*), Healthy Potato Plant |
| **Raspberry** (*Rubus*) | Healthy Raspberry Plant |
| **Soybean** (*Glycine max*) | Healthy Soybean Plant |
| **Squash** (*Cucurbita*) | Powdery Mildew (*Erysiphe cichoracearum*) |
| **Strawberry** (*Fragaria*) | Leaf Scorch (*Diplocarpon earlianum*), Healthy Strawberry Plant |
| **Tomato** (*Solanum lycopersicum*) | Bacterial Spot, Early Blight, Late Blight, Leaf Mold (*Passalora fulva*), Septoria Leaf Spot, Two-Spotted Spider Mites (*Tetranychus urticae*), Target Spot (*Corynespora cassiicola*), Tomato Yellow Leaf Curl Virus (TYLCV), Tomato Mosaic Virus (ToMV), Healthy Tomato Plant |

---

## 3. Input Preprocessing & Output Format

### Input Specification
- **Input Name:** `pixel_values`
- **Tensor Shape:** `(1, 3, 224, 224)` (Batch size 1, 3 RGB channels, 224 height, 224 width)
- **Data Type:** `float32`
- **Normalization:** Standard ImageNet statistics:
  - Mean: `[0.485, 0.456, 0.406]`
  - Standard Deviation: `[0.229, 0.224, 0.225]`
  - Pixel scale: Rescaled from `[0, 255]` to `[0.0, 1.0]` prior to normalization

### Output Specification
- **Output Name:** `logits`
- **Tensor Shape:** `(1, 38)`
- **Data Type:** `float32`
- **Post-Processing:** Numerical stable Softmax applied across the 38 class logits:
  $$\text{Softmax}(z_i) = \frac{e^{z_i - \max(z)}}{\sum_j e^{z_j - \max(z)}}$$

---

## 4. Heuristic Confidence Mapping, Uncertainty & Diagnostic Safeguards

### Heuristic Confidence vs. Calibrated Probability
The raw output of the softmax layer represents a mathematical normalization of classifier logits within the closed 38-class distribution. **This score is not an empirically calibrated Bayesian probability** (such as one derived from Platt scaling or isotonic regression on real-world field datasets). To protect users from overconfidence:
- **Heuristic Confidence Thresholds:**
  - $\text{Softmax Score} \ge 0.70$: Categorized as `candidate_identified` with `high` relative score alignment.
  - $0.45 \le \text{Softmax Score} < 0.70$: Categorized as `candidate_identified` with `moderate` relative alignment.
  - $0.30 \le \text{Softmax Score} < 0.45$: Categorized as `inconclusive` with `low` alignment.
  - $\text{Softmax Score} < 0.30$: Categorized as `inconclusive` with `uncertain` alignment.
- **Honest Inconclusive Reporting:** When the model cannot isolate a clear top prediction, it does not force an arbitrary label; it transparently informs the gardener that visual symptoms are ambiguous.

### Scientific & Dataset Limitations
1. **Lab Setting vs. Real-World Domain Gap:**
   - The PlantVillage dataset was primarily captured in controlled agricultural laboratory settings (single detached leaves placed flat on uniform grey or black paper under consistent lighting).
   - In contrast, real-world smartphone photos taken by gardeners often feature complex backgrounds, varied lighting, multiple overlapping leaves, motion blur, and varied camera angles. These factors introduce a significant domain shift that can reduce real-world accuracy compared to laboratory benchmarks.
2. **Inference Latency vs. Diagnostic Accuracy:**
   - The 20–50 ms CPU runtime measures **computational execution latency**, not clinical or botanical accuracy. Rapid inference guarantees responsive software, but does not guarantee correctness on novel specimens.
3. **Synthetic Image Verification:**
   - Automated tests using synthetic images (e.g. uniform green squares) verify software pipeline execution, tensor reshaping, error handling, and memory safety. They do **not** validate diagnostic accuracy on real plant pathogens.
4. **Out-of-Distribution Species:**
   - Common ornamental houseplants (e.g., *Monstera deliciosa*, *Epipremnum aureum*, *Sansevieria*, *Calathea*) are **outside the 38 PlantVillage training classes**. When analyzing non-crop houseplants, the model may return an inconclusive result or map symptoms to an analogous agricultural condition.
5. **Conservative Cultural Care Boundaries:**
   - Recommendations are strictly restricted to low-risk, non-chemical horticultural cultural practices:
     - Isolating the specimen from neighboring foliage to prevent spore transmission.
     - Improving ambient airflow and humidity circulation.
     - Modifying watering rhythms (bottom-watering, avoiding overhead leaf wetting).
     - Pruning visibly necrotic tissue using sterilized bypass shears.
   - Hazardous chemical pesticide, fungicide, or herbicide dosages are strictly prohibited.
6. **Physical Photographic Limitations:**
   - A single 2D leaf photograph cannot detect subterranean root rot (*Phytophthora cactorum*), soil nutrient deficiencies, soil pH imbalances, electrical conductivity, or microscopic nematodes. Every report explicitly discloses these physical boundaries.

---

## 5. Extensible Cloud Provider: Google Gemini Vision

If a user or deployment specifies a `GEMINI_API_KEY` in `backend/.env`, the architecture supports optional dynamic routing to **Google Gemini 1.5 Flash / 2.0 Flash Vision**:
- Provides rich multimodal analysis for exotic houseplants and ornamental species beyond the 38 PlantVillage crop labels.
- Preserves identical Pydantic `AnalysisResult` response schemas.
- If `GEMINI_API_KEY` is omitted, the system defaults to the zero-dependency local ONNX model with zero external network traffic.
