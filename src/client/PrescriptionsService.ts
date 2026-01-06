// Temporary PrescriptionsService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export type PrescriptionType = "acute" | "chronic" | "constitutional" | "intercurrent" | "nosode" | "sarcode" | "tautode";

export interface PrescriptionsReadPrescriptionsData {
  skip?: number;
  limit?: number;
  case_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface PrescriptionsReadPrescriptionData {
  prescriptionId: string;
}

export interface PrescriptionMedicineCreate {
  medicine_id: string;
  stock_id: string;
  quantity: number;
}

export interface PrescriptionCreate {
  case_id: string;
  prescription_type?: PrescriptionType;
  dosage: string;
  duration: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  medicines: PrescriptionMedicineCreate[];
}

export interface PrescriptionUpdate {
  dosage?: string;
  duration?: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
}

export interface PrescriptionsCreatePrescriptionData {
  requestBody: PrescriptionCreate;
}

export interface PrescriptionsUpdatePrescriptionData {
  prescriptionId: string;
  requestBody: PrescriptionCreate;
}

export interface PrescriptionsDeletePrescriptionData {
  prescriptionId: string;
}

export interface PrescriptionMedicinePublic {
  id: string;
  medicine_id: string;
  stock_used_id: string;
  quantity_used: number;
  medicine_name?: string;
  potency?: string;
  form?: string;
}

export interface PrescriptionPublic {
  id: string;
  case_id: string;
  doctor_id: string;
  prescription_date: string;
  prescription_number: string;
  prescription_type: PrescriptionType;
  dosage: string;
  duration: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  medicines: PrescriptionMedicinePublic[];
  patient_name?: string;
  case_number?: string;
}

export interface PrescriptionsPublic {
  data: PrescriptionPublic[];
  count: number;
}

export class PrescriptionsService {
  public static readPrescriptions(data: PrescriptionsReadPrescriptionsData = {}): CancelablePromise<PrescriptionsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/prescriptions/',
      query: {
        skip: data.skip,
        limit: data.limit,
        case_id: data.case_id,
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readPrescription(data: PrescriptionsReadPrescriptionData): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/prescriptions/${data.prescriptionId}`,
      errors: {
        404: 'Prescription not found',
        403: 'Forbidden',
      }
    });
  }

  public static createPrescription(data: PrescriptionsCreatePrescriptionData): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/prescriptions/',
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

  public static updatePrescription(data: PrescriptionsUpdatePrescriptionData): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/prescriptions/${data.prescriptionId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Prescription not found',
        403: 'Forbidden',
        400: 'Bad Request',
      }
    });
  }

  public static deletePrescription(data: PrescriptionsDeletePrescriptionData): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/prescriptions/${data.prescriptionId}`,
      errors: {
        404: 'Prescription not found',
        403: 'Forbidden',
      }
    });
  }

  public static printPrescription(prescriptionId: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/prescriptions/${prescriptionId}/print`,
      errors: {
        404: 'Prescription not found',
        403: 'Forbidden',
      }
    });
  }
}

