// Temporary CasesService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

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
  chief_complaint: string;
  duration: string;
  onset?: string;
  location?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
  generals?: string;
  mentals?: string;
  physicals?: string;
  miasm_assessment?: string;
  vitality_assessment?: string;
  case_notes?: string;
}

export interface CaseUpdate {
  chief_complaint?: string;
  duration?: string;
  onset?: string;
  location?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
  generals?: string;
  mentals?: string;
  physicals?: string;
  miasm_assessment?: string;
  vitality_assessment?: string;
  case_notes?: string;
}

export interface CasesCreateCaseData {
  requestBody: CaseCreate;
}

export interface CasesUpdateCaseData {
  caseId: string;
  requestBody: CaseCreate; // Backend expects CaseCreate, not CaseUpdate
}

export interface CasesDeleteCaseData {
  caseId: string;
}

export interface PatientCasePublic {
  id: string;
  patient_id: string;
  doctor_id: string;
  case_date: string;
  case_number: string;
  chief_complaint: string;
  duration: string;
  onset?: string;
  location?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
  generals?: string;
  mentals?: string;
  physicals?: string;
  miasm_assessment?: string;
  vitality_assessment?: string;
  case_notes?: string;
  patient_name?: string;
}

export interface CasesPublic {
  data: PatientCasePublic[];
  count: number;
}

export class CasesService {
  public static readCases(data: CasesReadCasesData = {}): CancelablePromise<CasesPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/cases/',
      query: {
        skip: data.skip,
        limit: data.limit,
        patient_id: data.patient_id,
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readCase(data: CasesReadCaseData): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/cases/${data.caseId}`,
      errors: {
        404: 'Case not found',
        403: 'Forbidden',
      }
    });
  }

  public static createCase(data: CasesCreateCaseData): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/cases/',
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
        400: 'Bad Request',
        404: 'Not Found',
      }
    });
  }

  public static updateCase(data: CasesUpdateCaseData): CancelablePromise<PatientCasePublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/cases/${data.caseId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Case not found',
        403: 'Forbidden',
      }
    });
  }

  public static deleteCase(data: CasesDeleteCaseData): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/cases/${data.caseId}`,
      errors: {
        404: 'Case not found',
        403: 'Forbidden',
      }
    });
  }
}

