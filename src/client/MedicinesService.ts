// Temporary MedicinesService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export type MedicineForm = "pills" | "globules" | "drops" | "powder" | "ointment" | "suppository" | "injection";
export type PotencyScale = "X" | "C" | "LM" | "Q" | "M" | "CM" | "MM";

export interface MedicinesReadMasterData {
  skip?: number;
  limit?: number;
  search?: string;
  kingdom?: string;
}

export interface MedicinesReadStockData {
  skip?: number;
  limit?: number;
  search?: string;
  low_stock?: boolean;
  expired?: boolean;
  medicine_id?: string;
}

export interface MedicineMasterPublic {
  id: string;
  name: string;
  abbreviation?: string;
  kingdom?: string;
  source?: string;
  common_indicators?: string;
  key_symptoms?: string;
  modalities?: string;
  temperament?: string;
  miasmatic_background?: string;
  repertory_rubrics?: string;
  notes?: string;
}

export interface DoctorMedicineStockPublic {
  id: string;
  medicine_id: string;
  doctor_id: string;
  potency: string;
  potency_scale: PotencyScale;
  form: MedicineForm;
  quantity: number;
  unit: string;
  batch_number?: string;
  expiry_date?: string;
  manufacturer?: string;
  purchase_date: string;
  last_used_date?: string;
  storage_location: string;
  is_active: boolean;
  low_stock_threshold: number;
  medicine_name?: string;
}

export interface MedicinesPublic {
  data: MedicineMasterPublic[];
  count: number;
}

export interface MedicinesStockPublic {
  data: DoctorMedicineStockPublic[];
  count: number;
}

export interface DoctorMedicineStockCreate {
  medicine_id: string;
  potency: string;
  potency_scale?: PotencyScale;
  form?: MedicineForm;
  quantity: number;
  unit?: string;
  batch_number?: string;
  expiry_date?: string;
  manufacturer?: string;
  purchase_date?: string;
  storage_location?: string;
  is_active?: boolean;
  low_stock_threshold?: number;
}

export interface DoctorMedicineStockUpdate {
  quantity?: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturer?: string;
  storage_location?: string;
  is_active?: boolean;
  low_stock_threshold?: number;
}

export class MedicinesService {
  public static readMedicinesMaster(data: MedicinesReadMasterData = {}): CancelablePromise<MedicinesPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/medicines/master',
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
        kingdom: data.kingdom,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readMedicineMaster(medicineId: string): CancelablePromise<MedicineMasterPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/medicines/master/${medicineId}`,
      errors: {
        404: 'Medicine not found',
        403: 'Forbidden',
      }
    });
  }

  public static readMedicineStock(data: MedicinesReadStockData = {}): CancelablePromise<MedicinesStockPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/medicines/stock',
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
        low_stock: data.low_stock,
        expired: data.expired,
        medicine_id: data.medicine_id,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readStockItem(stockId: string): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/medicines/stock/${stockId}`,
      errors: {
        404: 'Stock item not found',
        403: 'Forbidden',
      }
    });
  }

  public static createStockItem(data: { requestBody: DoctorMedicineStockCreate }): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/medicines/stock',
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

  public static updateStockItem(data: { stockId: string; requestBody: DoctorMedicineStockUpdate }): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/medicines/stock/${data.stockId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Stock item not found',
        403: 'Forbidden',
      }
    });
  }

  public static deleteStockItem(stockId: string): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/medicines/stock/${stockId}`,
      errors: {
        404: 'Stock item not found',
        403: 'Forbidden',
        400: 'Bad Request',
      }
    });
  }

  public static getLowStockAlerts(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/medicines/alerts/low-stock',
      errors: {
        403: 'Forbidden',
      }
    });
  }

  public static getExpiringMedicines(days: number = 30): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/medicines/alerts/expiring',
      query: {
        days,
      },
      errors: {
        403: 'Forbidden',
      }
    });
  }
}

