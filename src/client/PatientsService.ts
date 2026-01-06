// Temporary PatientsService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export interface PatientsReadPatientsData {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface PatientsReadPatientData {
  patientId: string;
}

export interface PatientCreate {
  full_name: string;
  date_of_birth?: string;
  gender: "male" | "female" | "other" | "child";
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  referred_by?: string;
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  notes?: string;
}

export interface PatientUpdate {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  notes?: string;
}

export interface PatientsCreatePatientData {
  requestBody: PatientCreate;
}

export interface PatientsUpdatePatientData {
  patientId: string;
  requestBody: PatientUpdate;
}

export interface PatientsDeletePatientData {
  patientId: string;
}

export interface PatientPublic {
  id: string;
  full_name: string;
  date_of_birth?: string;
  gender: "male" | "female" | "other" | "child";
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  referred_by?: string;
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  notes?: string;
  doctor_id: string;
  created_date: string;
  last_visit_date?: string;
  age?: number;
}

export interface PatientsPublic {
  data: PatientPublic[];
  count: number;
}

export class PatientsService {
  public static readPatients(data: PatientsReadPatientsData = {}): CancelablePromise<PatientsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/patients/',
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readPatient(data: PatientsReadPatientData): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/patients/${data.patientId}`,
      errors: {
        404: 'Patient not found',
        403: 'Forbidden',
      }
    });
  }

  public static createPatient(data: PatientsCreatePatientData): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/patients/',
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
        400: 'Bad Request',
      }
    });
  }

  public static updatePatient(data: PatientsUpdatePatientData): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/patients/${data.patientId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Patient not found',
        403: 'Forbidden',
        400: 'Bad Request',
      }
    });
  }

  public static deletePatient(data: PatientsDeletePatientData): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/patients/${data.patientId}`,
      errors: {
        404: 'Patient not found',
        403: 'Forbidden',
      }
    });
  }
}

