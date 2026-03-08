import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

// ============================================================================
// Request Types
// ============================================================================

export interface ConsultationPatientData {
  full_name: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  cnic?: string;
  email?: string;
  phone_secondary?: string;
  residential_address?: string;
  city?: string;
  occupation?: string;
  referred_by?: string;
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  current_medications?: string;
  notes?: string;
}

export interface ConsultationAppointmentData {
  consultation_type: string;
  appointment_date?: string;
  appointment_time?: string;
  duration_minutes?: number;
  reason?: string;
  notes?: string;
}

export interface ConsultationCaseData {
  chief_complaint_patient: string;
  chief_complaint_duration: string;
  physicals?: string;
  noted_complaint_doctor?: string;
  peculiar_symptoms?: string;
  causation?: string;
  lab_reports?: string;
  custom_fields?: Record<string, unknown>;
}

export interface ConsultationNewMedicine {
  name: string;
  potency: string;
  potency_scale?: string;
  form?: string;
  manufacturer?: string;
  description?: string;
}

export interface ConsultationMedicineEntry {
  medicine_id?: string;
  new_medicine?: ConsultationNewMedicine;
  quantity_prescribed?: string;
  frequency?: string;
}

export interface ConsultationPrescriptionData {
  prescription_type: string;
  dosage: string;
  prescription_duration: string;
  duration_days?: number;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  status?: string;
  medicines: ConsultationMedicineEntry[];
}

export interface ConsultationFollowUpData {
  next_follow_up_date: string;
  interval_days?: number;
}

export interface OnsiteConsultationRequest {
  patient: ConsultationPatientData;
  appointment: ConsultationAppointmentData;
  case: ConsultationCaseData;
  prescription?: ConsultationPrescriptionData;
  follow_up?: ConsultationFollowUpData;
}

// ============================================================================
// Response Type
// ============================================================================

export interface OnsiteConsultationResponse {
  patient_id: string;
  patient_full_name: string;
  is_new_patient: boolean;
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  appointment_status: string;
  case_id: string;
  case_number: string;
  case_date: string;
  prescription_id: string | null;
  prescription_number: string | null;
  prescription_date: string | null;
  follow_up_id: string | null;
  next_follow_up_date: string | null;
  follow_up_status: string | null;
  created_at: string;
}

// ============================================================================
// Service
// ============================================================================

export class OnsiteConsultationService {
  public static createConsultation(
    data: OnsiteConsultationRequest,
    idempotencyKey?: string,
  ): CancelablePromise<OnsiteConsultationResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["X-Idempotency-Key"] = idempotencyKey;
    }

    return __request(OpenAPI, {
      method: "POST",
      url: "/consultations/onsite",
      body: data,
      mediaType: "application/json",
      headers,
      errors: {
        400: "Validation Error",
        403: "Forbidden",
        404: "Medicine not found",
        422: "Validation Error",
      },
    });
  }
}
