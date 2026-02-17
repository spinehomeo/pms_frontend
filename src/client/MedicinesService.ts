// MedicinesService - Global Medicine Catalog API v3.0
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

// ============================================================================
// ENUMS
// ============================================================================

export type ScaleEnum = "C" | "X" | "Q";
export type PotencyScale = "C" | "X" | "Q";

export type FormEnum =
  | "Diskette"
  | "SOM"
  | "Blankets"
  | "Bio Chemic"
  | "Homoeo Tabs"
  | "Globules"
  | "Dilutions";

export type ManufacturerEnum =
  | "Schwabe"
  | "Reckweg"
  | "Lemasar"
  | "Dolisos"
  | "Kamal"
  | "Masood"
  | "BM"
  | "Kent"
  | "Brooks"
  | "Waris Shah"
  | "Self Packing";

// ============================================================================
// DATA MODELS - Responses
// ============================================================================

export interface MedicinePublic {
  id: number;
  name: string;
  description?: string;
  potency: string;
  potency_scale: ScaleEnum;
  form: FormEnum;
  manufacturer?: ManufacturerEnum;
  created_by_doctor_id: string;
  created_at: string;
  is_verified: boolean;
  is_favorite: boolean;
}

export interface MedicinesPublic {
  data: MedicinePublic[];
  count: number;
}

// ============================================================================
// DATA MODELS - Requests
// ============================================================================

export interface MedicineCreate {
  name: string;
  description?: string;
  potency: string;
  potency_scale: ScaleEnum;
  form: FormEnum;
  manufacturer?: ManufacturerEnum;
}

export interface MedicineUpdate {
  name?: string;
  description?: string;
  potency?: string;
  potency_scale?: ScaleEnum;
  form?: FormEnum;
  manufacturer?: ManufacturerEnum;
  is_verified?: boolean;
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface MedicinesSearchParams {
  skip?: number;
  limit?: number;
  name?: string;
  description?: string;
  potency?: string;
  potency_scale?: ScaleEnum;
  form?: FormEnum;
  manufacturer?: ManufacturerEnum;
  created_by?: string;
  is_verified?: boolean;
  is_favorite?: boolean;
  from_date?: string;
  to_date?: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class MedicinesService {
  /**
   * GET /medicines/all
   * List all medicines from the global catalog (unpaginated)
   */
  public static listAllMedicines(): CancelablePromise<MedicinesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/all",
      errors: {
        401: "Not authenticated",
        403: "Only doctors can access medicines",
      },
    });
  }

  /**
   * GET /medicines/search
   * Search medicines with advanced filters (paginated)
   */
  public static searchMedicines(
    params: MedicinesSearchParams = {},
  ): CancelablePromise<MedicinesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/search",
      query: {
        skip: params.skip,
        limit: params.limit,
        name: params.name,
        description: params.description,
        potency: params.potency,
        potency_scale: params.potency_scale,
        form: params.form,
        manufacturer: params.manufacturer,
        created_by: params.created_by,
        is_verified: params.is_verified,
        is_favorite: params.is_favorite,
        from_date: params.from_date,
        to_date: params.to_date,
      },
      errors: {
        401: "Not authenticated",
        403: "Only doctors can access medicines",
      },
    });
  }

  /**
   * GET /medicines/{medicine_id}
   * Get a specific medicine by ID
   */
  public static getMedicineById(
    medicineId: number,
  ): CancelablePromise<MedicinePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/medicines/${medicineId}`,
      errors: {
        401: "Not authenticated",
        403: "Only doctors can access medicines",
        404: "Medicine not found",
      },
    });
  }

  /**
   * POST /medicines/add
   * Add a single medicine to the global catalog
   */
  public static createMedicine(data: {
    requestBody: MedicineCreate;
  }): CancelablePromise<MedicinePublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/medicines/add",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        400: "Duplicate medicine or invalid data",
        401: "Not authenticated",
        403: "Only doctors can add medicines",
      },
    });
  }

  /**
   * POST /medicines/bulk
   * Add multiple medicines at once (max 100)
   */
  public static bulkCreateMedicines(data: {
    requestBody: MedicineCreate[];
  }): CancelablePromise<MedicinesPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/medicines/bulk",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        400: "Empty payload or too many items (max 100)",
        401: "Not authenticated",
        403: "Only doctors can add medicines",
      },
    });
  }

  /**
   * PUT /medicines/{medicine_id}
   * Update a medicine
   */
  public static updateMedicine(data: {
    medicineId: number;
    requestBody: MedicineUpdate;
  }): CancelablePromise<MedicinePublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/medicines/${data.medicineId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        401: "Not authenticated",
        403: "Only doctors can update medicines / Only creator or admin can update this medicine",
        404: "Medicine not found",
      },
    });
  }

  /**
   * DELETE /medicines/{medicine_id}
   * Delete a medicine
   */
  public static deleteMedicine(
    medicineId: number,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/medicines/${medicineId}`,
      errors: {
        400: "Cannot delete medicine used in prescriptions",
        401: "Not authenticated",
        403: "Only doctors can delete medicines / Only creator or admin can delete this medicine",
        404: "Medicine not found",
      },
    });
  }

  /**
   * POST /medicines/{medicine_id}/favorite
   * Toggle medicine as favorite for current doctor
   */
  public static toggleFavoriteMedicine(
    medicineId: number,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/medicines/${medicineId}/favorite`,
      errors: {
        401: "Not authenticated",
        403: "Only doctors can mark favorites",
        404: "Medicine not found",
      },
    });
  }
}
