import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export interface DoctorStats {
  total_patients: number;
  total_cases: number;
  total_appointments: number;
  total_prescriptions: number;
  upcoming_appointments: number;
  pending_followups: number;
  low_stock_items: number;
  revenue_today: number;
  revenue_this_month: number;
}

export class DoctorStatisticsService {
  /**
   * Get Doctor Dashboard Statistics
   * GET /users/me/stats
   */
  public static getDoctorStats(): CancelablePromise<DoctorStats> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/users/me/stats",
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }
}
