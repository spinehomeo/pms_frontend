// Temporary MedicinesService until SDK is regenerated
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export type MedicineForm =
  | "DISKETTE"
  | "SOM"
  | "BLANKETS"
  | "BIO_CHEMIC"
  | "PLACEBO"
  | "GLOBULES"
  | "DROPS";
export type PotencyScale = "C" | "X" | "Q";
export type FormEnum =
  | "DISKETTE"
  | "SOM"
  | "BLANKETS"
  | "BIO_CHEMIC"
  | "PLACEBO"
  | "GLOBULES"
  | "DROPS";
export type ScaleEnum = "C" | "X" | "Q";
export type PackingEnum = "10" | "30" | "100" | "200" | "450" | "500" | "1000";

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
}

export interface MedicineMasterPublic {
  id: number;
  name: string;
  description?: string;
}

export interface DoctorMedicineStockPublic {
  id: string;
  medicine_id: number;
  doctor_id: string;
  medicine_name: string;
  potency: string;
  potency_scale: PotencyScale;
  form: MedicineForm;
  quantity: number;
  unit: string;
  batch_number: string;
  expiry_date: string;
  manufacturer: string;
  purchase_date: string;
  last_used_date?: string;
  storage_location: string;
  is_active: boolean;
  low_stock_threshold: number;
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
  medicine_id: number;
  potency: string;
  potency_scale: PotencyScale;
  form: MedicineForm;
  quantity: number;
  unit: string;
  batch_number?: string;
  expiry_date?: string;
  manufacturer?: string;
  purchase_date?: string;
  last_used_date?: string;
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

export interface BulkStockCreateRequest {
  items: DoctorMedicineStockCreate[];
}

export interface BulkStockCreateResponse {
  message: string;
  created: number;
  updated: number;
  total: number;
}

export interface StockUsageLog {
  id: string;
  stock_item_id: string;
  prescription_id: string;
  patient_id: string;
  quantity_used: number;
  used_date: string;
}

export interface StockUsageResponse {
  stock_item: DoctorMedicineStockPublic;
  usage_logs: StockUsageLog[];
  total_used: number;
  remaining: number;
}

export interface LowStockAlert {
  count: number;
  items: DoctorMedicineStockPublic[];
  timestamp: string;
}

export interface ExpiringMedicinesAlert {
  count: number;
  items: DoctorMedicineStockPublic[];
  expiry_threshold: string;
  timestamp: string;
}

export class MedicinesService {
  public static readMedicinesMaster(
    data: MedicinesReadMasterData = {},
  ): CancelablePromise<MedicinesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/master",
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
        kingdom: data.kingdom,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static readMedicineMaster(
    medicineId: number,
  ): CancelablePromise<MedicineMasterPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/medicines/${medicineId}`,
      errors: {
        404: "Remidies not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static readMedicineStock(
    data: MedicinesReadStockData = {},
  ): CancelablePromise<MedicinesStockPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/stock",
      query: {
        skip: data.skip,
        limit: data.limit,
        search: data.search,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static readStockItem(
    stockId: string,
  ): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/medicines/stock/${stockId}`,
      errors: {
        404: "Stock item not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static createStockItem(data: {
    requestBody: DoctorMedicineStockCreate;
  }): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/medicines/stock",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        400: "Bad Request",
        404: "Not Found",
        401: "Unauthorized",
      },
    });
  }

  public static bulkCreateStockItems(data: {
    requestBody: DoctorMedicineStockCreate[];
  }): CancelablePromise<BulkStockCreateResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/medicines/stock/bulk",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        400: "Bad Request",
        404: "Not Found",
        401: "Unauthorized",
      },
    });
  }

  public static updateStockItem(data: {
    stockId: string;
    requestBody: DoctorMedicineStockUpdate;
  }): CancelablePromise<DoctorMedicineStockPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/medicines/stock/${data.stockId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        404: "Stock item not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteStockItem(
    stockId: string,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/medicines/stock/${stockId}`,
      errors: {
        404: "Stock item not found",
        403: "Forbidden",
        400: "Bad Request",
        401: "Unauthorized",
      },
    });
  }

  public static getStockUsageHistory(data: {
    stockId: string;
    from_date?: string;
    to_date?: string;
  }): CancelablePromise<StockUsageResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/medicines/stock/${data.stockId}/usage`,
      query: {
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        404: "Stock item not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getLowStockAlerts(): CancelablePromise<LowStockAlert> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/alerts/low-stock",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getExpiringMedicines(
    days: number = 30,
  ): CancelablePromise<ExpiringMedicinesAlert> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/medicines/alerts/expiring",
      query: {
        days,
      },
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }
}
