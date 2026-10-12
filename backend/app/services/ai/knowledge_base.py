"""
Botanical knowledge dictionary for the 38 PlantVillage classification classes.
Provides evidence-based symptom descriptions, observable visual markers,
and low-risk cultural care actions without chemical recommendations.
"""

from typing import Dict, Any, List

BOTANICAL_DISEASE_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    # 0: Apple Scab
    "Apple Scab": {
        "category": "foliage_disease",
        "common_name": "Apple Scab (Venturia inaequalis)",
        "summary": "Fungal infection characterized by dull, olive-green to dark velvety lesions on leaves.",
        "visible_features": [
            ("Leaf Lesions", "Olive-green, velvety circular spots on upper leaf surfaces that darken with age.", "Primary fungal sporulation site"),
            ("Foliar Distortion", "Crinkling or puckering around expanding lesion margins.", "Distortion from compromised epidermal cells"),
        ],
        "low_risk_actions": [
            ("Rake & Remove Fallen Leaves", "Collect and dispose of fallen infected leaves to interrupt fungal ascospore overwintering.", "isolation", "pruning"),
            ("Improve Canopy Airflow", "Prune dense inner branches to accelerate foliage drying after precipitation.", "pruning", "pruning"),
            ("Avoid Overhead Hydration", "Direct irrigation exclusively to the soil zone to prevent extended leaf wetness.", "hydration", "watering"),
        ],
        "suggested_task": "pruning",
    },
    # 1: Apple with Black Rot
    "Apple with Black Rot": {
        "category": "foliage_disease",
        "common_name": "Frog-Eye Leaf Spot / Black Rot (Botryosphaeria obtusa)",
        "summary": "Fungal pathogen producing concentric purple-bordered 'frog-eye' necrotic leaf spots.",
        "visible_features": [
            ("Concentric Leaf Spots", "Small purple specks expanding into tan centers with distinct purple margins.", "Classic 'frog-eye' diagnostic presentation"),
            ("Leaf Yellowing", "Chlorosis developing around multiple expanding spots, leading to premature leaf drop.", "Stress response"),
        ],
        "low_risk_actions": [
            ("Prune Diseased Foliage", "Remove leaves exhibiting concentric spots using 70% isopropyl alcohol sanitized shears.", "pruning", "pruning"),
            ("Inspect Twigs for Cankers", "Check surrounding branches for sunken dark bark cankers that harbor fungal pycnidia.", "monitoring", "general"),
        ],
        "suggested_task": "pruning",
    },
    # 2: Cedar Apple Rust
    "Cedar Apple Rust": {
        "category": "foliage_disease",
        "common_name": "Cedar Apple Rust (Gymnosporangium juniperi-virginianae)",
        "summary": "Heteroecious fungal rust causing vibrant yellow-orange spots with fungal aecia on leaves.",
        "visible_features": [
            ("Vibrant Rust Spots", "Bright yellow-orange or red circular spots with tiny dark fungal pycnia in centers.", "Characteristic rust telial spore manifestation"),
            ("Under-leaf Protrusions", "Minute raised cylindrical tube-like aecia forming on the leaf underside.", "Mature rust spore release structures"),
        ],
        "low_risk_actions": [
            ("Isolate & Monitor", "Monitor alternate juniper / cedar hosts nearby within a 100-meter radius.", "isolation", "monitoring"),
            ("Sanitize Pruned Tissue", "Promptly collect fallen rust-spotted leaves and bag them for municipal green waste disposal.", "pruning", "pruning"),
        ],
        "suggested_task": "monitoring",
    },
    # 3: Healthy Apple
    "Healthy Apple": {
        "category": "healthy_specimen",
        "common_name": "Healthy Apple Foliage",
        "summary": "Foliage exhibits vigorous turgor, uniform green pigmentation, and unblemished lamina.",
        "visible_features": [
            ("Uniform Pigmentation", "Vibrant, even green coloration across upper and lower leaf surfaces.", "Optimal chlorophyll density"),
            ("Intact Lamina", "Clean, smooth margins without necrotic patches, spotting, or insect grazing.", "Strong epidermal barrier"),
        ],
        "low_risk_actions": [
            ("Maintain Consistent Hydration", "Continue current watering schedule, checking soil moisture 2 inches below surface.", "hydration", "watering"),
            ("Inspect Periodically", "Conduct weekly underside leaf checks for early mite or aphid presence.", "monitoring", "pest_inspection"),
        ],
        "suggested_task": "general",
    },
    # 4: Healthy Blueberry Plant
    "Healthy Blueberry Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Blueberry Foliage",
        "summary": "Lush, glossy foliage with intact venation and proper acid-soil vigor.",
        "visible_features": [
            ("Glossy Dark Green Lamina", "Vibrant waxy sheen on upper leaf surface indicating healthy cuticle.", "Proper nutrient assimilation"),
            ("Uniform Structure", "No interveinal chlorosis, marginal scorch, or fungal powdery deposits.", "Balanced soil pH and root health"),
        ],
        "low_risk_actions": [
            ("Maintain Acidic Moisture", "Use rainwater or filtered water when possible to maintain ideal substrate pH.", "hydration", "watering"),
        ],
        "suggested_task": "watering",
    },
    # 5: Cherry with Powdery Mildew
    "Cherry with Powdery Mildew": {
        "category": "foliage_disease",
        "common_name": "Cherry Powdery Mildew (Podosphaera clandestina)",
        "summary": "Superficial fungal infection presenting white, powdery fungal mycelia on foliage.",
        "visible_features": [
            ("White Powdery Coating", "Superficial talcum-like white fungal patches on leaf surfaces and young shoots.", "Erysiphales mycelial proliferation"),
            ("Leaf Curling", "Young expanding leaves puckering and curling upward.", "Uneven cell growth caused by fungal haustoria"),
        ],
        "low_risk_actions": [
            ("Improve Sunlight & Airflow", "Reposition plant or thin dense outer foliage to maximize air circulation and lower relative humidity around leaves.", "sunlight", "sunlight"),
            ("Avoid Shaded Damp Spots", "Relocate specimen away from dark, stagnant corners.", "sunlight", "sunlight"),
        ],
        "suggested_task": "sunlight",
    },
    # 6: Healthy Cherry Plant
    "Healthy Cherry Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Cherry Foliage",
        "summary": "Firm, serrated leaves with rich green color and clean petioles.",
        "visible_features": [
            ("Rich Foliar Green", "Deep uniform green pigmentation without mottling.", "Healthy photosynthesis"),
            ("Turgid Tissue", "Erect leaf posture without wilting or curling.", "Optimal vascular hydration"),
        ],
        "low_risk_actions": [
            ("Routine Hydration", "Maintain deep periodic watering when top inch of soil feels dry.", "hydration", "watering"),
        ],
        "suggested_task": "general",
    },
    # 7: Corn (Maize) with Cercospora and Gray Leaf Spot
    "Corn (Maize) with Cercospora and Gray Leaf Spot": {
        "category": "foliage_disease",
        "common_name": "Gray Leaf Spot (Cercospora zeae-maydis)",
        "summary": "Fungal leaf blight resulting in rectangular, vein-delimited necrotic gray-tan lesions.",
        "visible_features": [
            ("Rectangular Vein-Bound Lesions", "Narrow tan lesions restricted by leaf veins, creating distinct rectangular borders.", "Characteristic Cercospora morphology"),
            ("Foliar Blighting", "Lesions coalescing into large necrotic streaks across the lamina.", "Extensive tissue necrosis"),
        ],
        "low_risk_actions": [
            ("Avoid Wet Foliage", "Irrigate exclusively at ground level; avoid overhead misting.", "hydration", "watering"),
            ("Remove Severely Damaged Leaves", "Snip lower blighted leaves that contact the soil surface.", "pruning", "pruning"),
        ],
        "suggested_task": "watering",
    },
    # 8: Corn (Maize) with Common Rust
    "Corn (Maize) with Common Rust": {
        "category": "foliage_disease",
        "common_name": "Common Corn Rust (Puccinia sorghi)",
        "summary": "Airborne rust fungus producing prominent cinnamon-brown pustules on both leaf surfaces.",
        "visible_features": [
            ("Elevated Rust Pustules", "Oval to elongate reddish-brown powdery pustules that rupture leaf epidermis.", "Puccinia uredinia sporulation"),
            ("Spore Residue", "Cinnamon-colored dusty spore powder visible when leaves are rubbed.", "Active fungal urediniospores"),
        ],
        "low_risk_actions": [
            ("Isolate From Other Grasses", "Separate plant to prevent spore dispersal by gentle breezes.", "isolation", "monitoring"),
            ("Keep Foliage Dry", "Maintain dry leaves during night hours to suppress spore germination.", "hydration", "watering"),
        ],
        "suggested_task": "monitoring",
    },
    # 9: Corn (Maize) with Northern Leaf Blight
    "Corn (Maize) with Northern Leaf Blight": {
        "category": "foliage_disease",
        "common_name": "Northern Corn Leaf Blight (Exserohilum turcicum)",
        "summary": "Fungal infection creating long, elliptical, grayish-green to tan 'cigar-shaped' lesions.",
        "visible_features": [
            ("Cigar-Shaped Lesions", "Large elongated elliptical lesions spanning 1 to 6 inches across the leaf.", "Exserohilum diagnostic lesion shape"),
            ("Dark Fungal Olive Fuzz", "Dark sporulation visible on lesions during humid periods.", "Active conidial production"),
        ],
        "low_risk_actions": [
            ("Prune Heavily Blighted Lower Foliage", "Remove lowest severely blighted leaves.", "pruning", "pruning"),
        ],
        "suggested_task": "pruning",
    },
    # 10: Healthy Corn (Maize) Plant
    "Healthy Corn (Maize) Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Corn Foliage",
        "summary": "Broad, arching vibrant green leaves with strong central midribs and clean margins.",
        "visible_features": [
            ("Robust Green Blades", "Even green blade without striping, pustules, or lesions.", "Optimal nitrogen assimilation"),
            ("Firm Midrib", "Strong central leaf structure with vigorous upright arching.", "High cellular turgor"),
        ],
        "low_risk_actions": [
            ("Consistent Moisture Maintenance", "Ensure adequate hydration during rapid vertical growth.", "hydration", "watering"),
        ],
        "suggested_task": "general",
    },
    # 11: Grape with Black Rot
    "Grape with Black Rot": {
        "category": "foliage_disease",
        "common_name": "Grape Black Rot (Guignardia bidwellii)",
        "summary": "Destructive fungal disease producing circular reddish-brown leaf spots with black fruiting bodies.",
        "visible_features": [
            ("Reddish-Brown Circular Spots", "Circular tan spots ringed by dark brown borders.", "Fungal colonization"),
            ("Black Pycnidia Dots", "Tiny black pinhead-sized dots arranged inside lesions.", "Fungal fruiting structures"),
        ],
        "low_risk_actions": [
            ("Prune Out Infected Foliage", "Carefully snip affected leaves and discard off-site.", "pruning", "pruning"),
            ("Maximize Trellis Sun Exposure", "Thin leafy shoots to expose foliage to rapid morning drying.", "sunlight", "sunlight"),
        ],
        "suggested_task": "pruning",
    },
    # 12: Grape with Esca (Black Measles)
    "Grape with Esca (Black Measles)": {
        "category": "foliage_disease",
        "common_name": "Grape Esca Complex (Black Measles)",
        "summary": "Vascular wood decay complex manifesting as 'tiger-stripe' interveinal necrotic leaf patterns.",
        "visible_features": [
            ("Tiger-Stripe Necrosis", "Dramatic yellow chlorosis and dark necrotic stripes between green veins.", "Toxin accumulation from vascular fungi"),
        ],
        "low_risk_actions": [
            ("Avoid Water Stress", "Provide consistent, deep irrigation to minimize hydraulic stress on compromised xylem.", "hydration", "watering"),
            ("Sanitize Pruning Tools", "Thoroughly sterilize shears between every single cut.", "pruning", "pruning"),
        ],
        "suggested_task": "watering",
    },
    # 13: Grape with Isariopsis Leaf Spot
    "Grape with Isariopsis Leaf Spot": {
        "category": "foliage_disease",
        "common_name": "Grape Leaf Spot (Phaeoisariopsis vitis)",
        "summary": "Fungal leaf spot causing irregular, sharply delimited angular dark brown patches.",
        "visible_features": [
            ("Angular Brown Spots", "Sharply defined angular dark necrotic lesions delimited by minor veins.", "Localized fungal necrosis"),
        ],
        "low_risk_actions": [
            ("Canopy Ventilation", "Selectively prune non-fruiting shoots to promote laminar airflow.", "pruning", "pruning"),
        ],
        "suggested_task": "pruning",
    },
    # 14: Healthy Grape Plant
    "Healthy Grape Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Grapevine Foliage",
        "summary": "Lush, palmate lobed leaves with deep green surface and clear veins.",
        "visible_features": [
            ("Vibrant Palmate Leaves", "Smooth, well-hydrated leaf surface without necrosis or stippling.", "Vigorous vine health"),
        ],
        "low_risk_actions": [
            ("Maintain Trellis Guidance", "Gently tie new cane growth to supportive trellis wires.", "monitoring", "general"),
        ],
        "suggested_task": "general",
    },
    # 15: Orange with Citrus Greening
    "Orange with Citrus Greening": {
        "category": "foliage_disease",
        "common_name": "Citrus Greening / Huanglongbing (Candidatus Liberibacter)",
        "summary": "Systemic bacterial disease causing asymmetrical foliar blotchy mottle.",
        "visible_features": [
            ("Asymmetrical Blotchy Mottle", "Irregular patches of yellow and green that do not match across the central midrib.", "Key diagnostic distinction from zinc deficiency"),
            ("Yellow Veins", "Hardening and corking of leaf midribs with chlorotic pale coloration.", "Phloem necrosis"),
        ],
        "low_risk_actions": [
            ("Inspect for Psyllid Vectors", "Check tender new shoot flushes for tiny jumping psyllid insects.", "monitoring", "pest_inspection"),
            ("Consult Local Agricultural Extension", "Citrus greening is a regulated pathogen; request official verification if verified.", "monitoring", "monitoring"),
        ],
        "suggested_task": "pest_inspection",
    },
    # 16: Peach with Bacterial Spot
    "Peach with Bacterial Spot": {
        "category": "foliage_disease",
        "common_name": "Peach Bacterial Spot (Xanthomonas arboricola pv. pruni)",
        "summary": "Bacterial leaf spot causing angular purplish lesions that drop out, creating a 'shot-hole' appearance.",
        "visible_features": [
            ("Shot-Hole Perforations", "Small angular necrotic spots whose centers dry out and drop out, leaving clean holes.", "Classic Xanthomonas shot-hole pattern"),
            ("Tip Chlorosis", "Leaf tips yellowing and defoliating prematurely.", "Bacterial phytotoxin diffusion"),
        ],
        "low_risk_actions": [
            ("Deter Splashing Water", "Avoid high-pressure overhead watering that splashes bacterial ooze across foliage.", "hydration", "watering"),
        ],
        "suggested_task": "watering",
    },
    # 17: Healthy Peach Plant
    "Healthy Peach Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Peach Foliage",
        "summary": "Lanceolate leaves with clean serrated margins and rich green coloration.",
        "visible_features": [
            ("Glossy Lanceolate Lamina", "Vibrant, unblemished surface without curling or perforations.", "Vigorous prunus health"),
        ],
        "low_risk_actions": [
            ("Monitor Soil Moisture", "Provide uniform moisture during fruit swelling stages.", "hydration", "watering"),
        ],
        "suggested_task": "general",
    },
    # 18: Bell Pepper with Bacterial Spot
    "Bell Pepper with Bacterial Spot": {
        "category": "foliage_disease",
        "common_name": "Pepper Bacterial Spot (Xanthomonas campestris pv. vesicatoria)",
        "summary": "Bacterial disease producing water-soaked circular to irregular lesions with translucent halos.",
        "visible_features": [
            ("Water-Soaked Spots", "Dark green water-soaked spots on leaf undersides turning necrotic and brown with age.", "Bacterial parenchymal breakdown"),
            ("Marginal Scorch & Defoliation", "Leaves turning yellow around coalescing lesions, leading to leaf drop.", "Bacterial load stress"),
        ],
        "low_risk_actions": [
            ("Sanitize Pruning Shears", "Disinfect tools with alcohol between plants to halt bacterial transfer.", "pruning", "pruning"),
            ("Water at Ground Level Only", "Ensure irrigation applies water strictly at soil base.", "hydration", "watering"),
        ],
        "suggested_task": "watering",
    },
    # 19: Healthy Bell Pepper Plant
    "Healthy Bell Pepper Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Bell Pepper Foliage",
        "summary": "Smooth, ovate leaves with rich green pigment, sturdy stems, and no signs of bacterial or viral stress.",
        "visible_features": [
            ("Crisp Ovate Leaves", "Even emerald green surface without mottling, curling, or spots.", "Healthy cellular vigor"),
        ],
        "low_risk_actions": [
            ("Maintain Warm Soil & Sun", "Provide 6+ hours of direct sunlight and allow soil surface to dry slightly between hydration sessions.", "sunlight", "sunlight"),
        ],
        "suggested_task": "general",
    },
    # 20: Potato with Early Blight
    "Potato with Early Blight": {
        "category": "foliage_disease",
        "common_name": "Potato Early Blight (Alternaria solani)",
        "summary": "Fungal disease causing dark brown to black circular lesions with distinct 'target-board' concentric rings.",
        "visible_features": [
            ("Target-Board Concentric Rings", "Circular necrotic spots displaying prominent concentric ridge rings resembling a bullseye.", "Alternaria sporulation pattern"),
            ("Yellow Chlorotic Halo", "Band of yellow chlorotic tissue surrounding each expanding dark lesion.", "Alternariol toxin diffusion"),
        ],
        "low_risk_actions": [
            ("Remove Lower Affected Leaves", "Gently snip off oldest lower leaves showing target spots.", "pruning", "pruning"),
            ("Keep Foliage Dry", "Allow soil surface to dry between soakings and avoid evening misting.", "hydration", "watering"),
        ],
        "suggested_task": "pruning",
    },
    # 21: Potato with Late Blight
    "Potato with Late Blight": {
        "category": "foliage_disease",
        "common_name": "Potato Late Blight (Phytophthora infestans)",
        "summary": "Aggressive oomycete water mold causing large, rapidly spreading water-soaked dark lesions.",
        "visible_features": [
            ("Large Water-Soaked Lesions", "Dark brown to purplish-black water-soaked lesions expanding rapidly across the leaf.", "Aggressive oomycete tissue invasion"),
            ("White Under-leaf Mold", "Delicate white cottony mildew growth on leaf undersides in humid conditions.", "Phytophthora sporangiophores"),
        ],
        "low_risk_actions": [
            ("Isolate Plant Immediately", "Quarantine specimen immediately from other solanaceous plants (tomatoes, peppers).", "isolation", "isolation"),
            ("Remove Infected Tissue", "Prune collapsed foliage, seal in a bag, and do not compost.", "pruning", "pruning"),
        ],
        "suggested_task": "isolation",
    },
    # 22: Healthy Potato Plant
    "Healthy Potato Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Potato Foliage",
        "summary": "Compound pinnate leaves with vibrant green color, strong petioles, and robust vegetative posture.",
        "visible_features": [
            ("Vigorous Compound Leaves", "Smooth, turgid leaflets without necrosis, curling, or water soaking.", "Balanced tuberous vegetative stage"),
        ],
        "low_risk_actions": [
            ("Hill Soil Around Stems", "Mound fresh soil around stems to encourage tuber growth and protect roots.", "soil", "repotting"),
        ],
        "suggested_task": "general",
    },
    # 23: Healthy Raspberry Plant
    "Healthy Raspberry Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Raspberry Foliage",
        "summary": "Soft serrated compound foliage with silver-green undersides and healthy primocane growth.",
        "visible_features": [
            ("Healthy Serrated Leaflets", "Intact leaf margins and even chlorophyll distribution.", "Strong cane vigor"),
        ],
        "low_risk_actions": [
            ("Support Canes", "Ensure canes are securely supported and well-ventilated.", "monitoring", "general"),
        ],
        "suggested_task": "general",
    },
    # 24: Healthy Soybean Plant
    "Healthy Soybean Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Soybean Foliage",
        "summary": "Trifoliate leaves with vibrant, uniform green surface and healthy nitrogen-fixing vigor.",
        "visible_features": [
            ("Pristine Trifoliate Leaves", "Intact leaflets with uniform emerald coloration and no defoliation.", "Healthy symbiotic nitrogen fixation"),
        ],
        "low_risk_actions": [
            ("Ensure Full Sun Exposure", "Maintain direct sunlight exposure and deep soil hydration.", "sunlight", "sunlight"),
        ],
        "suggested_task": "general",
    },
    # 25: Squash with Powdery Mildew
    "Squash with Powdery Mildew": {
        "category": "foliage_disease",
        "common_name": "Squash Powdery Mildew (Podosphaera xanthii)",
        "summary": "Common fungal disease causing powdery white talc-like spots across broad curcurbit leaves.",
        "visible_features": [
            ("Diffuse White Powdery Coating", "Fluffy white fungal patches expanding across broad leaf surfaces.", "Superficial powdery mildew mycelia"),
            ("Underlying Chlorosis", "Yellowing of leaf blade underneath heavy powdery fungal mats.", "Impaired photosynthesis"),
        ],
        "low_risk_actions": [
            ("Increase Direct Sun Exposure", "Powdery mildew thrives in low-light, stagnant conditions; maximize direct sun.", "sunlight", "sunlight"),
            ("Prune Heavily Coated Leaves", "Snip off oldest, most heavily infected lower leaves to restore airflow.", "pruning", "pruning"),
        ],
        "suggested_task": "sunlight",
    },
    # 26: Strawberry with Leaf Scorch
    "Strawberry with Leaf Scorch": {
        "category": "foliage_disease",
        "common_name": "Strawberry Leaf Scorch (Diplocarpon earlianum)",
        "summary": "Fungal foliar disease causing numerous small, dark purple-brown blotches with burnt margins.",
        "visible_features": [
            ("Purplish Angular Blotches", "Numerous irregular purplish spots covering the upper leaf lamina.", "Diplocarpon acervuli development"),
            ("Marginal Scorching", "Leaf edges drying, curling upward, and turning brown like scorched paper.", "Extensive tissue desiccation"),
        ],
        "low_risk_actions": [
            ("Clean Dead Plant Debris", "Rake out dry dead leaves around plant crowns.", "pruning", "pruning"),
            ("Avoid Wetting Crowns", "Water into the root perimeter rather than soaking the center crown.", "hydration", "watering"),
        ],
        "suggested_task": "pruning",
    },
    # 27: Healthy Strawberry Plant
    "Healthy Strawberry Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Strawberry Foliage",
        "summary": "Trifoliate glossy leaves with bright green color, serrated margins, and active runner health.",
        "visible_features": [
            ("Glossy Trifoliate Leaves", "Vibrant green lamina with crisp serrated teeth and healthy petiole hairs.", "Optimal nutrient and crown health"),
        ],
        "low_risk_actions": [
            ("Maintain Consistent Soil Moisture", "Strawberries have shallow roots; provide even, regular moisture.", "hydration", "watering"),
        ],
        "suggested_task": "watering",
    },
    # 28: Tomato with Bacterial Spot
    "Tomato with Bacterial Spot": {
        "category": "foliage_disease",
        "common_name": "Tomato Bacterial Spot (Xanthomonas perforans)",
        "summary": "Bacterial leaf spot causing small, dark, water-soaked spots that become angular and necrotic.",
        "visible_features": [
            ("Small Dark Angular Spots", "Pinpoint water-soaked dark brown circular to angular spots.", "Bacterial parenchymal invasion"),
            ("Yellow Halos", "Narrow chlorotic margins surrounding tiny necrotic specks.", "Bacterial toxin boundary"),
        ],
        "low_risk_actions": [
            ("Prune Lower Foliage", "Remove lowest 12 inches of foliage touching or near the soil to halt rain splash.", "pruning", "pruning"),
            ("Avoid Working on Wet Leaves", "Never handle or prune plants when foliage is damp with dew or water.", "monitoring", "general"),
        ],
        "suggested_task": "pruning",
    },
    # 29: Tomato with Early Blight
    "Tomato with Early Blight": {
        "category": "foliage_disease",
        "common_name": "Tomato Early Blight (Alternaria linariae / solani)",
        "summary": "Fungal blight displaying dark concentric rings ('target-board' lesions) starting on lower foliage.",
        "visible_features": [
            ("Concentric Target Rings", "Brown to black leathery spots with distinct concentric circular ridges.", "Alternaria bullseye morphology"),
            ("Surrounding Chlorosis", "Broad yellowing of leaf tissue surrounding mature target spots.", "Foliar senescence triggered by fungal metabolites"),
        ],
        "low_risk_actions": [
            ("Remove Infected Lower Leaves", "Pinch off diseased lower leaflets with clean shears.", "pruning", "pruning"),
            ("Mulch Base Soil", "Apply an organic mulch layer over the soil to block soil-dwelling fungal spores from splashing up.", "soil", "monitoring"),
        ],
        "suggested_task": "pruning",
    },
    # 30: Tomato with Late Blight
    "Tomato with Late Blight": {
        "category": "foliage_disease",
        "common_name": "Tomato Late Blight (Phytophthora infestans)",
        "summary": "Destructive water mold causing large, irregular greasy water-soaked dark lesions.",
        "visible_features": [
            ("Greasy Dark Lesions", "Large olive-green to brown water-soaked blotches rapidly enlarging across leaflets.", "Severe oomycete necrosis"),
            ("White Under-Leaf Down", "Faint white fuzzy sporulation visible on the underside of lesions in high humidity.", "Active Phytophthora sporangia"),
        ],
        "low_risk_actions": [
            ("Immediate Quarantine", "Isolate plant away from other tomatoes and potatoes immediately.", "isolation", "isolation"),
            ("Remove Infected Shoots", "Carefully cut off affected shoots, seal in a disposal bag, and wash hands thoroughly.", "pruning", "pruning"),
        ],
        "suggested_task": "isolation",
    },
    # 31: Tomato with Leaf Mold
    "Tomato with Leaf Mold": {
        "category": "foliage_disease",
        "common_name": "Tomato Leaf Mold (Passalora fulva)",
        "summary": "Fungal infection thriving in high humidity, causing pale yellow upper spots with olive-brown underside mold.",
        "visible_features": [
            ("Pale Yellow Upper Spots", "Diffuse, pale greenish-yellow chlorotic spots on the upper leaf surface.", "Early mycelial colonization"),
            ("Olive-Velvet Underside Mold", "Dense olive-green to brownish velvety fungal mold coating the matching underside.", "Characteristic Passalora sporulation"),
        ],
        "low_risk_actions": [
            ("Drastically Lower Humidity", "Increase ventilation with a gentle fan or open greenhouse vents to drop relative humidity below 80%.", "monitoring", "sunlight"),
            ("Prune Crowded Stems", "Thin interior suckers to promote air movement through the plant canopy.", "pruning", "pruning"),
        ],
        "suggested_task": "pruning",
    },
    # 32: Tomato with Septoria Leaf Spot
    "Tomato with Septoria Leaf Spot": {
        "category": "foliage_disease",
        "common_name": "Septoria Leaf Spot (Septoria lycopersici)",
        "summary": "Fungal leaf spot characterized by numerous small circular spots with gray centers and dark borders.",
        "visible_features": [
            ("Circular Gray-Centered Spots", "Abundant small circular spots (1-3mm) with ash-gray centers and dark brown margins.", "Septoria diagnostic lesion"),
            ("Black Pycnidial Specks", "Microscopic black dots in the center of gray lesions.", "Fungal pycnidia containing conidiospores"),
        ],
        "low_risk_actions": [
            ("Prune Lower Diseased Leaves", "Snip off lower yellowing, spotted leaves to halt upward progression.", "pruning", "pruning"),
            ("Drip or Base Irrigation Only", "Never wet foliage during watering; apply moisture gently at soil line.", "hydration", "watering"),
        ],
        "suggested_task": "pruning",
    },
    # 33: Tomato with Spider Mites or Two-spotted Spider Mite
    "Tomato with Spider Mites or Two-spotted Spider Mite": {
        "category": "pest_infestation",
        "common_name": "Two-Spotted Spider Mite (Tetranychus urticae)",
        "summary": "Microscopic arachnid pests causing fine yellow stippling and delicate webbing on foliage.",
        "visible_features": [
            ("Fine Chlorotic Stippling", "Thousands of minute yellow or white specks across the upper leaf surface.", "Cell-content feeding by piercing mite mouthparts"),
            ("Fine Silken Webbing", "Delicate silken webbing visible along leaf undersides, axils, and shoot tips.", "Mite colony structural webbing"),
        ],
        "low_risk_actions": [
            ("Gentle Water Spray", "Spray the underside of leaves with a firm stream of room-temperature water to dislodge mites and webs.", "hydration", "misting"),
            ("Wipe Undersides", "Wipe affected leaf surfaces with a damp soft microfiber cloth to remove eggs and webbing.", "pest_inspection", "pest_inspection"),
            ("Increase Ambient Humidity", "Spider mites thrive in hot, dry air; elevate ambient humidity around the plant.", "hydration", "misting"),
        ],
        "suggested_task": "pest_inspection",
    },
    # 34: Tomato with Target Spot
    "Tomato with Target Spot": {
        "category": "foliage_disease",
        "common_name": "Tomato Target Spot (Corynespora cassiicola)",
        "summary": "Fungal disease causing pinpoint necrotic spots expanding into circular lesions with concentric rings.",
        "visible_features": [
            ("Concentric Dark Brown Rings", "Circular necrotic spots with alternating light and dark brown rings.", "Corynespora target pattern"),
        ],
        "low_risk_actions": [
            ("Improve Plant Spacing", "Ensure at least 24 inches of space between adjacent plants to improve air circulation.", "isolation", "monitoring"),
        ],
        "suggested_task": "pruning",
    },
    # 35: Tomato Yellow Leaf Curl Virus
    "Tomato Yellow Leaf Curl Virus": {
        "category": "foliage_disease",
        "common_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "summary": "Geminivirus transmitted by whiteflies, causing severe upward leaf cupping and stunted yellow growth.",
        "visible_features": [
            ("Upward Leaf Cupping", "Leaflets curling sharply upward, forming cup-like or curled structures.", "Viral interruption of cell division"),
            ("Interveinal Yellowing", "Severe chlorosis especially pronounced on youngest apical leaves.", "Disrupted chlorophyll synthesis"),
        ],
        "low_risk_actions": [
            ("Inspect for Whitefly Vectors", "Gently tap top shoots and inspect for tiny white moth-like flies taking flight.", "pest_inspection", "pest_inspection"),
            ("Isolate Infected Specimen", "Quarantine to prevent whiteflies from vectoring the virus to healthy plants.", "isolation", "isolation"),
        ],
        "suggested_task": "pest_inspection",
    },
    # 36: Tomato Mosaic Virus
    "Tomato Mosaic Virus": {
        "category": "foliage_disease",
        "common_name": "Tomato Mosaic Virus (ToMV)",
        "summary": "Highly stable tobamovirus causing mottled light and dark green patterns and foliar distortion.",
        "visible_features": [
            ("Mosaic Color Mottling", "Irregular patchwork pattern of alternating light green, dark green, and yellow on leaves.", "Classic tobamovirus mosaic symptom"),
            ("Fern-Like 'Shoestring' Distortion", "Narrowing and puckering of leaf blades giving leaves a fern-like or distorted shape.", "Hormonal foliar disruption"),
        ],
        "low_risk_actions": [
            ("Strict Sanitary Handling", "Wash hands thoroughly with soap before handling other plants; ToMV is easily mechanical-vectored.", "isolation", "monitoring"),
            ("Quarantine Plant", "Keep separate from other solanaceous crops.", "isolation", "isolation"),
        ],
        "suggested_task": "isolation",
    },
    # 37: Healthy Tomato Plant
    "Healthy Tomato Plant": {
        "category": "healthy_specimen",
        "common_name": "Healthy Tomato Foliage",
        "summary": "Robust, pinnate compound foliage with deep green glandular-haired leaves and strong stems.",
        "visible_features": [
            ("Deep Green Serrated Leaflets", "Uniform, deep green pigmentation with healthy glandular trichome hairs.", "Optimal vegetative vigor"),
            ("Firm Upright Posture", "Erect leaves and sturdy petioles with strong hydraulic turgor.", "Balanced root hydration and nutrient uptake"),
        ],
        "low_risk_actions": [
            ("Deep Regular Watering", "Water deeply at the base 2-3 times per week, maintaining even soil moisture.", "hydration", "watering"),
            ("Prune Non-Fruiting Suckers", "Pinch small suckers in leaf axils to direct energy toward main stem growth.", "pruning", "pruning"),
        ],
        "suggested_task": "general",
    },
}

def get_botanical_interpretation(label: str) -> Dict[str, Any]:
    """Retrieve detailed botanical context for a given predicted label with robust fallbacks."""
    if label in BOTANICAL_DISEASE_KNOWLEDGE:
        return BOTANICAL_DISEASE_KNOWLEDGE[label]

    # Fallback for unexpected labels
    is_healthy = "healthy" in label.lower()
    return {
        "category": "healthy_specimen" if is_healthy else "foliage_disease",
        "common_name": label,
        "summary": f"Specimen presents characteristics consistent with {label}.",
        "visible_features": [
            ("Foliar Morphology", f"Visual features observed match pattern for {label}.", "Morphological alignment")
        ],
        "low_risk_actions": [
            ("Monitor Plant Progress", "Observe foliage over the next 48 to 72 hours for any changes in leaf spots or color.", "monitoring", "general")
        ],
        "suggested_task": "general",
    }
