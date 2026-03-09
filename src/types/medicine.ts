export interface Medicine {
  id: string;
  name: string;
  effect: string;
  dosage: string;
  schedule: string;
  warning: string;
  side_effect: string;
  patient_explanation: string;
  created_at: string;
}

export interface MedicineGuideRequest {
  medicine_name: string;
}

export interface MedicineGuideResponse {
  id: string;
  medicine: Medicine;
}

export interface MedicineHistory {
  items: Medicine[];
  total: number;
}

export interface MedicineRecognizeResponse {
  medicine_name: string;
}

export interface PrescriptionOcrItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  schedule: string;
}

export interface PrescriptionOcrResponse {
  items: PrescriptionOcrItem[];
}

export interface MedicineTTSResponse {
  audio_url: string;
}
