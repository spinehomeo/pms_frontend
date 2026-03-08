// Temporary PatientsService until SDK is regenerated
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

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
  phone_secondary?: string; // Added - WhatsApp number
  email?: string;
  cnic?: string; // National ID (Pakistan)
  residential_address?: string; // Updated per backend guide
  city?: string; // Added per backend guide
  occupation?: string;
  payment_status?: boolean; // Added per backend guide (business critical)
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  referred_by?: string; // Added - person who referred the patient
}

export interface PatientUpdate {
  full_name?: string;
  phone?: string;
  phone_secondary?: string; // Added - WhatsApp number
  email?: string;
  cnic?: string; // National ID (Pakistan)
  residential_address?: string; // Updated per backend guide
  city?: string; // Added per backend guide
  occupation?: string;
  payment_status?: boolean; // Added per backend guide
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  referred_by?: string; // Added - person who referred the patient
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
  phone_secondary?: string; // Added - WhatsApp number
  email?: string;
  cnic?: string; // National ID (Pakistan)
  residential_address?: string; // Updated per backend guide
  city?: string; // Added per backend guide
  occupation?: string;
  payment_status?: boolean; // Added per backend guide
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  referred_by?: string; // Added - person who referred the patient
  doctor_id: string;
  created_date: string;
  is_active?: boolean; // Added per backend guide
  age?: number;
}

export interface PatientsPublic {
  data: PatientPublic[];
  count: number;
}

// Onsite patient types
export interface OnsiteSearchData {
  phone?: string;
  full_name?: string;
}

export interface OnsiteSearchResult {
  id: string;
  full_name: string;
  phone: string;
  gender: string;
  cnic: string;
  is_match_by_phone: boolean;
  is_match_by_name: boolean;
  match_score: number;
}

export interface OnsiteQuickRegisterData {
  full_name: string;
  phone: string;
  gender?: string;
  city?: string;
  email?: string;
}

export interface OnsitePatientDetails {
  id: string;
  full_name: string;
  phone: string;
  gender: string;
  cnic: string;
  is_temp_cnic: boolean;
  date_of_birth?: string | null;
  email?: string | null;
  city?: string | null;
  medical_history?: string | null;
  drug_allergies?: string | null;
  family_history?: string | null;
  current_medications?: string | null;
  created_date: string;
  is_active: boolean;
}

export class PatientsService {
  public static readPatients(
    data: PatientsReadPatientsData = {},
  ): CancelablePromise<PatientsPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/patients/",
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
      },
    });
  }

  public static readPatient(
    data: PatientsReadPatientData,
  ): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/patients/${data.patientId}`,
      errors: {
        404: "Patient not found",
        403: "Forbidden",
      },
    });
  }

  public static createPatient(
    data: PatientsCreatePatientData,
  ): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/patients/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        400: "Bad Request",
      },
    });
  }

  public static updatePatient(
    data: PatientsUpdatePatientData,
  ): CancelablePromise<PatientPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/patients/${data.patientId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        404: "Patient not found",
        403: "Forbidden",
        400: "Bad Request",
      },
    });
  }

  public static deletePatient(
    data: PatientsDeletePatientData,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/patients/${data.patientId}`,
      errors: {
        404: "Patient not found",
        403: "Forbidden",
      },
    });
  }

  // Onsite patient methods
  public static onsiteSearch(
    data: OnsiteSearchData,
  ): CancelablePromise<OnsiteSearchResult[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/patients/onsite/search",
      query: {
        phone: data.phone,
        full_name: data.full_name,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
      },
    });
  }

  public static onsiteQuickRegister(
    data: OnsiteQuickRegisterData,
  ): CancelablePromise<OnsitePatientDetails> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/patients/onsite/quick-register",
      body: data,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        409: "Patient already exists",
        403: "Forbidden",
      },
    });
  }

  public static onsiteGetDetails(data: {
    patientId: string;
  }): CancelablePromise<OnsitePatientDetails> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/patients/onsite/${data.patientId}`,
      errors: {
        404: "Patient not found",
        403: "Forbidden",
      },
    });
  }
}
