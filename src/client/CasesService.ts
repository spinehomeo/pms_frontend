// Temporary CasesService until SDK is regenerated
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export interface CasesReadCasesData {
  skip?: number;
  limit?: number;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface CasesReadCaseData {
  caseId: string;
}

export interface CaseCreate {
  patient_id: string;
  appointment_id?: string;
  chief_complaint_patient: string;
  chief_complaint_duration: string;
  physicals?: string;
  noted_complaint_doctor?: string;
  peculiar_symptoms?: string;
  causation?: string;
  lab_reports?: string;
  custom_fields?: Record<string, string>;
}

export interface CaseUpdate {
  duration?: string;
  physicals?: string;
  noted_complaint_doctor?: string;
  peculiar_symptoms?: string;
  causation?: string;
  lab_reports?: string;
  custom_fields?: Record<string, string>;
}

export interface CasesCreateCaseData {
  requestBody: CaseCreate;
}

export interface CasesUpdateCaseData {
  caseId: string;
  requestBody: CaseUpdate;
}

export interface CasesDeleteCaseData {
  caseId: string;
}

export interface PrescriptionPublic {
  id: string;
  case_id: string;
  doctor_id: string;
  prescription_date: string;
  prescription_number: string;
  prescription_type: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
}

export interface CasesGetPrescriptionData {
  caseId: string;
}

export interface PatientCasePublic {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  case_date: string;
  case_number: string;
  chief_complaint_patient: string;
  duration: string;
  physicals?: string;
  noted_complaint_doctor?: string;
  peculiar_symptoms?: string;
  causation?: string;
  lab_reports?: string;
  custom_fields?: Record<string, string>;
  patient_name?: string;
  patient_phone?: string;
  patient_city?: string;
}

export interface CasesPublic {
  data: PatientCasePublic[];
  count: number;
}

export class CasesService {
  public static readCases(
    data: CasesReadCasesData = {},
  ): CancelablePromise<CasesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/cases/",
      query: {
        skip: data.skip,
        limit: data.limit,
        patient_id: data.patient_id,
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
      },
    });
  }

  public static readCase(
    data: CasesReadCaseData,
  ): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/cases/${data.caseId}`,
      errors: {
        404: "Case not found",
        403: "Forbidden",
      },
    });
  }

  public static createCase(
    data: CasesCreateCaseData,
  ): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/cases/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        400: "Bad Request",
        404: "Not Found",
      },
    });
  }

  public static updateCase(
    data: CasesUpdateCaseData,
  ): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/cases/${data.caseId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        404: "Case not found",
        403: "Forbidden",
      },
    });
  }

  public static deleteCase(
    data: CasesDeleteCaseData,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/cases/${data.caseId}`,
      errors: {
        404: "Case not found",
        403: "Forbidden",
      },
    });
  }

  public static getCasePrescription(
    data: CasesGetPrescriptionData,
  ): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/cases/${data.caseId}/prescription`,
      errors: {
        404: "No prescription found for this case",
        403: "Forbidden",
      },
    });
  }
}
