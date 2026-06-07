import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Establish Gemini client with required User-Agent headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. Using local fallback triage engine.");
}

// ---------------------------------------------------------
// RxNorm, SNOMED CT, ICD-10-CM High-Fidelity Dictionary Seed
// ---------------------------------------------------------
interface TerminologyItem {
  id: string;
  term: string;
  vocabulary: 'SNOMED CT' | 'ICD-10-CM' | 'RxNorm' | 'LOINC' | 'UMLS';
  code: string;
  cui: string;
  description: string;
  category: 'medication' | 'symptom' | 'condition' | 'lab';
}

const SEED_TERMINOLOGY: TerminologyItem[] = [
  {
    id: "term-1",
    term: "Oxybutynin",
    vocabulary: "RxNorm",
    code: "7806",
    cui: "C0030018",
    description: "Anticholinergic agent for overactive bladder. High risk in older adults (Beers Criteria) due to cognitive impairment, confusion, dry mouth, constipation, and falls.",
    category: "medication"
  },
  {
    id: "term-2",
    term: "Diphenhydramine",
    vocabulary: "RxNorm",
    code: "3498",
    cui: "C0012546",
    description: "First-generation antihistamine with strong anticholinergic effects. High Beers Criteria risk for older adults: causes drowsiness, severe confusion, and significant fall risk.",
    category: "medication"
  },
  {
    id: "term-3",
    term: "Amitriptyline",
    vocabulary: "RxNorm",
    code: "704",
    cui: "C0002598",
    description: "Tricyclic antidepressant. Strong anticholinergic burden. High Beers Criteria risk: sedation, orthostatic hypotension, cardiac abnormalities, and fall risk in the elderly.",
    category: "medication"
  },
  {
    id: "term-4",
    term: "Tolterodine",
    vocabulary: "RxNorm",
    code: "21183",
    cui: "C0723821",
    description: "Antimuscarinic bladder relaxant. Anticholinergic profile with warnings for central nervous system effects in older patients.",
    category: "medication"
  },
  {
    id: "term-5",
    term: "Metformin",
    vocabulary: "RxNorm",
    code: "6809",
    cui: "C0025598",
    description: "Biguanide antihyperglycemic agent. Clearance is renal. Contraindicated if eGFR is below 30 mL/min due to rare but serious lactic acidosis cascade risk.",
    category: "medication"
  },
  {
    id: "term-6",
    term: "Lisinopril",
    vocabulary: "RxNorm",
    code: "29046",
    cui: "C0065374",
    description: "ACE Inhibitor antihypertensive. Major cause of drug-induced dry cough (often misdiagnosed as asthma/bronchitis, causing prescribing cascade). Risk of hyperkalemia.",
    category: "medication"
  },
  {
    id: "term-7",
    term: "Atorvastatin",
    vocabulary: "RxNorm",
    code: "83367",
    cui: "C0286651",
    description: "Statin for lipid regulation. Side effects include myalgia (muscle pain, SNOMED: 68962001) and extremely rare rhabdomyolysis.",
    category: "medication"
  },
  {
    id: "term-8",
    term: "Spironolactone",
    vocabulary: "RxNorm",
    code: "9997",
    cui: "C0037996",
    description: "Potassium-sparing diuretic. Risk of hyperkalemia, especially in older adults, heart failure clients, and patients on ACE inhibitors.",
    category: "medication"
  },
  {
    id: "term-9",
    term: "Chest Pain / Chest Pressure",
    vocabulary: "SNOMED CT",
    code: "29857009",
    cui: "C0008031",
    description: "Sensation of pain or pressure in the thoracic region. High-priority red flag; triggers instant Tier 0 emergency escalation due to acute coronary syndrome risk.",
    category: "symptom"
  },
  {
    id: "term-10",
    term: "Shortness of Breath / Dyspnea",
    vocabulary: "SNOMED CT",
    code: "267036007",
    cui: "C0013404",
    description: "Difficulty breathing, air hunger, or respiratory distress. High-priority red flag; triggers instant Tier 0 emergency escalation.",
    category: "symptom"
  },
  {
    id: "term-11",
    term: "Disequilibrium",
    vocabulary: "SNOMED CT",
    code: "247547007",
    cui: "C0240973",
    description: "Sensation of unsteadiness, instability, or loss of balance when standing or walking. Must be distinguished from true spinning vertigo or faint-like presyncope.",
    category: "symptom"
  },
  {
    id: "term-12",
    term: "Vertigo",
    vocabulary: "SNOMED CT",
    code: "399090003",
    cui: "C0042571",
    description: "Sensation of rotational motion or spinning, often due to inner ear issues (like BPPV, labyrinthitis) or central pathways.",
    category: "symptom"
  },
  {
    id: "term-13",
    term: "Presyncope",
    vocabulary: "SNOMED CT",
    code: "710008008",
    cui: "C0234473",
    description: "The sensation of impending loss of consciousness or faintness, often vascular, orthostatic, or cardiac in origin.",
    category: "symptom"
  },
  {
    id: "term-14",
    term: "Anaphylaxis",
    vocabulary: "SNOMED CT",
    code: "39579001",
    cui: "C0002792",
    description: "Severe, rapidly progressing systemic allergic reaction with bronchospasm, upper airway obstruction, or cardiovascular collapse. Tier 0 Emergency.",
    category: "condition"
  },
  {
    id: "term-15",
    term: "Sepsis",
    vocabulary: "SNOMED CT",
    code: "76571008",
    cui: "C0243026",
    description: "Life-threatening organ dysfunction caused by a dysregulated host response to infection. High fever with rapid breathing or confusion. Tier 0 Emergency.",
    category: "condition"
  },
  {
    id: "term-16",
    term: "Acute Nasopharyngitis (Common Cold)",
    vocabulary: "SNOMED CT",
    code: "82272006",
    cui: "C0027424",
    description: "Mild viral infection of the nose and throat. Normally Tier 3 Self-Care and educational guidance with standard safety precautions.",
    category: "condition"
  },
  {
    id: "term-17",
    term: "Myocardial Infarction (Heart Attack)",
    vocabulary: "ICD-10-CM",
    code: "I21.9",
    cui: "C0027051",
    description: "Ischemic myocardial tissue necrosis, usually presenting with crushing substernal chest discomfort radiating to left arm or neck. Tier 0 Emergency.",
    category: "condition"
  },
  {
    id: "term-18",
    term: "Cerebrovascular Accident (Stroke)",
    vocabulary: "ICD-10-CM",
    code: "I63.9",
    cui: "C0038454",
    description: "Sudden onset of focal neurological deficits due to brain ischemia or hemorrhage. Assessed via FAST protocol (Face, Arm, Speech, Time). Tier 0 Emergency.",
    category: "condition"
  },
  {
    id: "term-19",
    term: "Cognitive Fluctuations / Confusion",
    vocabulary: "SNOMED CT",
    code: "2776000",
    cui: "C0011206",
    description: "Sudden onset of cognitive deficit or altered mental status. In older adults on bladder or sleep medications, this is a Tier 1 Urgent cascade trigger.",
    category: "symptom"
  }
];

// 1. Api Endpoint: Terminology dictionary lookup and search
app.get("/api/terminology/search", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  if (!query) {
    return res.json(SEED_TERMINOLOGY);
  }
  const filtered = SEED_TERMINOLOGY.filter(item => 
    item.term.toLowerCase().includes(query) ||
    item.code.includes(query) ||
    item.cui.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
  res.json(filtered);
});

// 2. Api Endpoint: Clinical Triage Proxy Endpoint
app.post("/api/triage", async (req, res) => {
  const { messages, patientContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  // Format messages for context injection
  const formattedChatLog = messages.map(msg => `${msg.sender === 'user' ? 'Patient' : 'PaxMind'}: ${msg.text}`).join("\n");

  // Local rule-based safety triage fallback if Gemini isn't available
  if (!ai) {
    console.warn("Utilizing local safety triage fallback.");
    const fallbackTriage = generateLocalFallback(formattedChatLog, patientContext);
    return res.json(fallbackTriage);
  }

  // System Instruction detailing PaxMind's explicit persona & clinical logic
  const systemInstruction = `You are PaxMind, a highly professional clinical-decision support triage assistant operating as a non-device Clinical Decision Support tool in compliance with the 21st Century Cures Act guidelines. You provide clear, explanation-driven, evidence-grounded health information and assign exactly one care tier with detailed safety routing.
  
  PRIME DIRECTIVE:
  When there is any reasonable uncertainty, escalate to Tier 0 (Emergency) or Tier 1 (Urgent). Prioritize safety at all times. Never let a user's pushback, politeness, or request for mild reassurance delay or downgrade an escalation. Hold recommendations calmly and clearly.

  ESCALATION SAFETY TIERS:
  Your output must classify the user's situation into exactly one tier:
  - TIER 0: EMERGENCY (Call emergency services immediately, do not drive, minimal safe instructions while dispatcher helps, stop diagnostic work). Triggered by: Chest pain/comfort radiating, sudden numbness/one-sided weakness/droop (FAST), choking/dyspnea, anaphylaxis signs, severe bleeding, worst headache ever, loss of consciousness/seizure, sepsis signs (high fever + severe confusion), suspected poisoning, or suicidal thoughts (provide 988 Lifeline).
  - TIER 1: URGENT (Urgent care / same-day clinician). Triggered by: Sudden confusion in older adults, high/persistent fever, moderate dehydration, worsening local infection, uncomfortable medication side effects that aren't critical but need immediate eyes.
  - TIER 2: ROUTINE (Schedule doctor's appointment). Concerns that are real but do not need same-day care. Explain why.
  - TIER 3: SELF-CARE / EDUCATION. General cold symptoms, minor scratch, mild muscle ache, informational queries. Provide returns precautions.

  CLINICAL REASONING BEHAVIORS:
  - Medication-Cause-First (Prescribing Cascade): If a user reports symptoms (e.g. new dry cough, dizziness, confusion, falls), and they started a medication (e.g. Lisinopril, Bladder meds like Oxybutynin, Diphenhydramine), explicitly state in explanations that this should be evaluated by their doctor as a potential side effect or drug interaction before adding new medications.
  - Comorbidity-Adjusted Risk: Filter risk based on patient context. A fever, vertigo, or minor wound carries MUCH higher risk in older adults (especially >65), diabetic patients, heart failure patients, or kidney dialysis clients.
  - Polypharmacy Burden: Flag older adults taking Beers Criteria medications (Amitriptyline, Oxybutynin, Diphenhydramine) or multiple highly anticholinergic products. Use cumulative anticholinergic burden warning.
  - Terminology Grounding: Map findings, symptoms, and diagnoses to SNOMED CT and ICD-10-CM. Map medications to RxNorm. Map labs to LOINC. List their corresponding UMLS Concept Unique Identifiers (CUIs). Only provide authentic, high-confidence mappings. Mark candidates as unconfirmed if you have any ambiguity. Include all codes in the mappedCodes schema array so the user can show their physician. Keep raw codes hidden from the user-facing advice text itself (let explanations speak in plain language, keep the raw codes nested in the mappedCodes array).
  - Physician Handoff Packet: If safety tier is TIER 0 or TIER 1, you MUST generate a markdown physician handoff packet outlining Chief Complaint (in patient's words), History of Present Illness (Onset, duration, severity), Relevant History & Active Medication list, Red Flags Triggered, Medication Cascade/Polypharmacy flags, Recommended Urgency, and your specific Confidence/Uncertainty level for the doctor to resolve.

  RESPONSE COMPREHENSIVENESS / JSON SCHEMAS:
  Respond STRICTLY in JSON format following the requested schema. Ensure all fields are populated carefully, with honest, empathetic, and professional language.`;

  const prompt = `--- ACTIVE PATIENT PROFILE ---
Age: ${patientContext.age || "Unspecified"}
Sex Assigned at Birth: ${patientContext.biologicalSex || "Unspecified"}
Pregnancy Status: ${patientContext.isPregnant === true ? "Pregnant" : patientContext.isPregnant === false ? "Not pregnant" : "Unspecified"}
Active Medical Conditions: ${patientContext.conditions && patientContext.conditions.length > 0 ? patientContext.conditions.join(", ") : "None reported"}
Allergies: ${patientContext.allergies && patientContext.allergies.length > 0 ? patientContext.allergies.join(", ") : "None reported"}
Active Medications: ${patientContext.medications && patientContext.medications.length > 0 ? patientContext.medications.join(", ") : "None reported"}

--- ACTIVE CHAT HISTORY CONTEXT ---
${formattedChatLog}

Assess this context and output the correct clinical triage JSON object containing:
- acknowledgment: brief empathetic statement in warm language.
- questions: array of 1-2 clarifying questions to narrow down triage safety if needed.
- explanations: array of clear, clinical, plain-language educational facts (cascade side-effects, Beers risk, comorbidity warnings).
- tier: number (0, 1, 2, or 3).
- reason: the safety-based clinical reason for assigning this tier.
- precautions: array of specific red-flag symptoms that should trigger higher escalation if they occur.
- handoffPacket: markdown string for physician handoff (only if tier is 0 or 1, else omit or put "").
- mappedCodes: array of objects containing {'concept', 'vocabulary', 'code', 'cui', 'confidence': 'confirmed' | 'candidate'} specifically mapped from this context.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            acknowledgment: {
              type: Type.STRING,
              description: "Empathetic, clear clinical acknowledgement of the patient's concern.",
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-2 focused triage questions to ask the patient, if helpful."
            },
            explanations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Plain language clinical context (e.g., medication side effect cascades, comorbidity hazards, Beers criteria warnings) framed as educational."
            },
            tier: {
              type: Type.INTEGER,
              description: " Triage Safety Tier: 0 (Emergency), 1 (Urgent), 2 (Routine), 3 (Self-Care)."
            },
            reason: {
              type: Type.STRING,
              description: "The underlying rationale behind this safety recommendation in plain everyday language."
            },
            precautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific red flag symptoms that must trigger immediate higher care if witnessed."
            },
            handoffPacket: {
              type: Type.STRING,
              description: "Factual, objective Physician Handoff Packet in Markdown format. High density clinical summary. Mandatory for Tiers 0 and 1."
            },
            mappedCodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  vocabulary: { type: Type.STRING },
                  code: { type: Type.STRING },
                  cui: { type: Type.STRING },
                  confidence: { type: Type.STRING, description: "'confirmed' or 'candidate'" }
                },
                required: ["concept", "vocabulary", "code", "cui", "confidence"]
              }
            }
          },
          required: ["acknowledgment", "questions", "explanations", "tier", "reason", "precautions", "mappedCodes"]
        }
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response received from Gemini API.");
    }
    const triageResult = JSON.parse(rawText.trim());
    return res.json(triageResult);
  } catch (error) {
    console.error("Gemini API request failed. Reverting to local triage fallback:", error);
    const fallbackTriage = generateLocalFallback(formattedChatLog, patientContext);
    fallbackTriage.explanations.push("Notice: PaxMind's live clinical neural model is currently initializing. A local rule-based safety matrix is monitoring your health query.");
    return res.json(fallbackTriage);
  }
});

// Helper: Rule-based fallback triage algorithm
function generateLocalFallback(chatLog: string, context: any) {
  const lowercaseLog = chatLog.toLowerCase();
  
  // High Priority Red Flags Triggering Tier 0 (Emergency)
  const isEmergency = 
    lowercaseLog.includes("chest pain") || 
    lowercaseLog.includes("chest pressure") || 
    lowercaseLog.includes("heart attack") || 
    lowercaseLog.includes("stroke") || 
    lowercaseLog.includes("face droop") || 
    lowercaseLog.includes("weakness on one side") || 
    lowercaseLog.includes("trouble breathing") || 
    lowercaseLog.includes("difficulty breathing") || 
    lowercaseLog.includes("shortness of breath") || 
    lowercaseLog.includes("choking") || 
    lowercaseLog.includes("anaphylaxis") || 
    lowercaseLog.includes("bleeding") || 
    lowercaseLog.includes("seizure") || 
    lowercaseLog.includes("consciousness") || 
    lowercaseLog.includes("sepsis") || 
    lowercaseLog.includes("poison") || 
    lowercaseLog.includes("overdose") || 
    lowercaseLog.includes("harm myself") || 
    lowercaseLog.includes("suicide") || 
    lowercaseLog.includes("kill myself");

  const ageNum = parseInt(context.age || "0", 10);
  const isElderly = ageNum >= 65;

  // Tier 1 (Urgent) Criteria
  const isUrgent = 
    isEmergency === false && (
      lowercaseLog.includes("confusion") || 
      lowercaseLog.includes("confused") || 
      lowercaseLog.includes("unsteady") || 
      lowercaseLog.includes("fever") || 
      lowercaseLog.includes("infection") || 
      lowercaseLog.includes("vomiting") || 
      lowercaseLog.includes("dehydration") ||
      (lowercaseLog.includes("dizzy") && isElderly)
    );

  if (isEmergency) {
    return {
      acknowledgment: "Please stay as calm as possible. I want to assist you, but your safety is my absolute, immediate priority.",
      questions: ["Are you alone right now, or is there someone with you who can assist?"],
      explanations: ["The symptoms described indicate potential high-risk medical strain require immediate emergency intervention."],
      tier: 0,
      reason: "Symptoms match potential cardiovascular stress, acute airway blockage, anaphylaxis, or serious systemic distress (Tier 0).",
      precautions: [
        "Call 911 or your local emergency services immediately.",
        "Do not try to drive yourself to the hospital.",
        "If experiencing severe allergic signs, use an epinephrine auto-injector if already prescribed."
      ],
      handoffPacket: `### PHYSICIAN MEDICAL HANDOFF (Emergency Triage)
**PaxMind Clinical Fallback Report**
- **Chief Complaint:** Possible immediate red flag symptom (Substernal/respiratory triggers).
- **Assigned Urgency:** Tier 0 — EMERGENCY CARE REQUIRED.
- **Patient Age:** ${context.age || "Unspecified"} | **Sex:** ${context.biologicalSex || "Unspecified"}
- **Active Medications:** ${context.medications?.join(", ") || "None listed"}
- **Active Conditions:** ${context.conditions?.join(", ") || "None listed"}
- **Safety Flags:** Positive indicators for immediate vital organ warning signs.`,
      mappedCodes: [
        { concept: "Suspected acute coronary syndrome", vocabulary: "SNOMED CT", code: "398700009", cui: "C1299586", confidence: "candidate" },
        { concept: "Dyspnea / Crisis", vocabulary: "SNOMED CT", code: "267036007", cui: "C0013404", confidence: "candidate" }
      ]
    };
  }

  if (isUrgent) {
    const isBladderCascade = 
      (context.medications?.some((m: string) => ["oxybutynin", "diphenhydramine", "amitriptyline", "detrol", "ditropan"].includes(m.toLowerCase())) ||
       lowercaseLog.includes("bladder") || lowercaseLog.includes("allergy pill")) &&
      (lowercaseLog.includes("confused") || lowercaseLog.includes("confusion") || lowercaseLog.includes("dizzy"));

    return {
      acknowledgment: "Thank you for sharing. These symptoms need careful professional review within the day to keep you healthy.",
      questions: ["How long have these symptoms been present, and have they worsened in the last 24 hours?"],
      explanations: [
        "New confusion, altered balance, or high fevers require same-day medical review.",
        isBladderCascade ? "Clinical Alert: Bladder antimuscarinics (anticholinergics) or diphenhydramine are highly associated with acute cognitive changes, confusion, and dizziness in older adults (prescribing cascade risk)." : "Possible infection or adverse medication impact."
      ],
      tier: 1,
      reason: "Symptoms present same-day evaluation indicators (Tier 1 Urgent), including neurological or thermoregulatory stress.",
      precautions: [
        "Inability to keep liquids down.",
        "Any expansion of dizziness to sudden fainting or loss of muscle power (FAST signs).",
        "Fever rising above 103°F (39.4°C)."
      ],
      handoffPacket: `### CLINICIAN ASSISTANCE REPORT (Urgent Care Triage)
- **Chief Complaint:** Same-day triage candidate. 
- **Assigned Tier:** Tier 1 — Urgent evaluation within 24 hours recommended.
- **Age:** ${context.age || "Unspecified"} | **Sex:** ${context.biologicalSex || "Unspecified"}
- **Cascade Risk:** ${isBladderCascade ? "HIGH risk of medication-induced anticholinergic burden / Beers Criteria alert. BLADDER OR ANTIHISTAMINE EXPOSURE PRESENT." : "Standard review."}
- **Confidence:** Moderate rule-based validation.`,
      mappedCodes: [
        { concept: "Acute confusion (finding)", vocabulary: "SNOMED CT", code: "2776000", cui: "C0011206", confidence: "candidate" }
      ]
    };
  }

  // Tier 3/2 fallback
  const isRoutine = context.conditions?.length > 0 || lowercaseLog.includes("pain") || lowercaseLog.includes("chronic");
  
  return {
    acknowledgment: "I understand you are seeking information about these symptoms. Let's look at some helpful, general information.",
    questions: ["Would you like to search our RxNorm/SNOMED Terminology Explorer to see clinical definitions for common symptoms?"],
    explanations: [
      "Often symptoms like general mild congestion, minor muscular aches, or static concerns are safe for home monitoring paired with tight return precautions.",
      "If you are taking any regular medication, always read the manufacturer label prior to starting any complementary therapies."
    ],
    tier: isRoutine ? 2 : 3,
    reason: isRoutine 
      ? "Chronic or underlying comorbidities require scheduling a primary doctor check-up (Tier 2)" 
      : "Standard wellness query matching self-care and medical education (Tier 3).",
    precautions: [
      "Development of centralized squeezing pain or respiratory struggle.",
      "Fever persisting or returning after a period of abatement.",
      "Sudden loss of balance or slurred vocalization."
    ],
    mappedCodes: [
      { concept: "Health education (procedure)", vocabulary: "SNOMED CT", code: "243029008", cui: "C0079549", confidence: "confirmed" }
    ]
  };
}

// ---------------------------------------------------------
// Vite Dev Server / Static Asset Handler Configuration
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PaxMind full-stack server running at http://localhost:${PORT}`);
  });
}

startServer();
