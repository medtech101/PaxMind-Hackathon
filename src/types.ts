export interface PatientContext {
  age: string;
  biologicalSex: 'male' | 'female' | 'other' | '';
  isPregnant: boolean | 'unknown';
  conditions: string[];
  medications: string[];
  allergies: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  triageDetails?: TriageResult;
}

export interface StandardizedCode {
  concept: string;
  vocabulary: 'SNOMED CT' | 'ICD-10-CM' | 'RxNorm' | 'LOINC' | 'UMLS';
  code: string;
  cui: string; // UMLS Concept Unique Identifier
  confidence: 'confirmed' | 'candidate';
}

export interface TriageResult {
  tier: 0 | 1 | 2 | 3; // TIER 0, 1, 2, 3
  reason: string;
  explanations: string[];
  precautions: string[];
  handoffPacket?: string; // Factual markdown handoff for physician
  mappedCodes?: StandardizedCode[];
}

export interface TerminologyItem {
  term: string;
  vocabulary: string;
  code: string;
  cui: string;
  description: string;
}
