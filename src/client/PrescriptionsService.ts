// Temporary PrescriptionsService until SDK is regenerated
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export type PrescriptionType =
  | "Constitutional"
  | "Classical"
  | "Inter Current"
  | "Pure Bio Chemic"
  | "Mother Tincture"
  | "Patent";

export type RepetitionEnum =
  | "OD"
  | "BD"
  | "TDS"
  | "Once Weekly"
  | "Once in 10 Days"
  | "Fortnightly"
  | "Monthly";

export type PrescriptionStatus = "open" | "completed" | "cancelled";

export interface QuickAddMedicineData {
  name: string;
  potency: string;
  potency_scale?: "C" | "X" | "Q";
  form?: string;
  manufacturer?: string;
  description?: string;
}

export interface PrescriptionMedicineCreate {
  medicine_id?: string;
  new_medicine?: QuickAddMedicineData;
  quantity_prescribed?: string;
  frequency?: RepetitionEnum;
}

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

export interface PrescriptionCreate {
  case_id: string;
  prescription_type?: PrescriptionType;
  dosage?: string;
  prescription_duration?: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  status?: PrescriptionStatus;
  medicines: PrescriptionMedicineCreate[];
}

export interface PrescriptionUpdate {
  dosage?: string;
  prescription_duration?: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  status?: PrescriptionStatus;
  medicines?: PrescriptionMedicineCreate[];
}

export interface PrescriptionsCreatePrescriptionData {
  requestBody: PrescriptionCreate;
}

export interface PrescriptionsUpdatePrescriptionData {
  prescriptionId: string;
  requestBody: PrescriptionUpdate;
}

export interface PrescriptionsDeletePrescriptionData {
  prescriptionId: string;
}

export interface PrescriptionMedicinePublic {
  id: string;
  medicine_id: string;
  quantity_prescribed: string;
  frequency?: RepetitionEnum;
  medicine_name?: string;
  potency?: string;
  form?: string;
  medicine?: {
    id: string;
    name: string;
    potency?: string;
    form?: string;
  };
}

export interface PrescriptionPublic {
  id: string;
  case_id: string;
  doctor_id: string;
  prescription_date: string;
  prescription_number: string;
  prescription_type?: PrescriptionType;
  dosage?: string;
  prescription_duration?: string;
  instructions?: string;
  follow_up_advice?: string;
  dietary_restrictions?: string;
  avoidance?: string;
  notes?: string;
  status?: PrescriptionStatus;
  medicines: PrescriptionMedicinePublic[];
  patient_name?: string;
  case_number?: string;
}

export interface PrescriptionsPublic {
  data: PrescriptionPublic[];
  count: number;
}

export interface PrintPrescriptionMedicine {
  name: string;
  potency: string;
  form: string;
  quantity_prescribed: string;
  dosage?: string;
  prescription_duration?: string;
  instructions?: string;
}

export interface PrintPrescriptionResponse {
  prescription: PrescriptionPublic;
  patient: {
    id: string;
    full_name: string;
    age?: number;
    gender?: string;
    phone?: string;
  };
  medicines: PrintPrescriptionMedicine[];
  doctor: {
    id: string;
    full_name: string;
    qualifications?: string;
  };
  print_date: string;
}

export class PrescriptionsService {
  public static readPrescriptions(
    data: PrescriptionsReadPrescriptionsData = {},
  ): CancelablePromise<PrescriptionsPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/prescriptions/",
      query: {
        skip: data.skip,
        limit: data.limit,
        case_id: data.case_id,
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Not authenticated",
      },
    });
  }

  public static readPrescription(
    data: PrescriptionsReadPrescriptionData,
  ): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/prescriptions/${data.prescriptionId}`,
      errors: {
        404: "Prescription not found",
        403: "Forbidden",
        401: "Not authenticated",
      },
    });
  }

  public static createPrescription(
    data: PrescriptionsCreatePrescriptionData,
  ): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/prescriptions/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        400: "Bad Request",
        404: "Not Found",
        401: "Not authenticated",
      },
    });
  }

  public static updatePrescription(
    data: PrescriptionsUpdatePrescriptionData,
  ): CancelablePromise<PrescriptionPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/prescriptions/${data.prescriptionId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        404: "Prescription not found",
        403: "Forbidden",
        400: "Bad Request",
        401: "Not authenticated",
      },
    });
  }

  public static deletePrescription(
    data: PrescriptionsDeletePrescriptionData,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/prescriptions/${data.prescriptionId}`,
      errors: {
        404: "Prescription not found",
        403: "Forbidden",
        401: "Not authenticated",
      },
    });
  }

  public static printPrescription(
    prescriptionId: string,
  ): CancelablePromise<PrintPrescriptionResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/prescriptions/${prescriptionId}/print`,
      errors: {
        404: "Prescription not found",
        403: "Forbidden",
        401: "Not authenticated",
      },
    });
  }
}
