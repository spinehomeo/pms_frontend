// Temporary ReportsService until SDK is regenerated
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

// ============ Response Interfaces ============

export interface CaseRecord {
  id: string;
  chief_complaint_patient: string;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  appointment_date: string;
  doctor_name: string;
}

export interface PrescriptionRecord {
  id: string;
  created_at: string;
  medicine_count: number;
}

export interface FollowupRecord {
  id: string;
  followup_date: string;
  last_updated: string;
}

export interface PatientHistoryResponse {
  patient_id: string;
  patient_name: string;
  total_cases: number;
  total_appointments: number;
  total_prescriptions: number;
  total_followups: number;
  cases: CaseRecord[];
  appointments: AppointmentRecord[];
  prescriptions: PrescriptionRecord[];
  followups: FollowupRecord[];
}

export interface MedicineUsageDataPoint {
  period: string;
  medicine_name: string;
  total_quantity: number;
  prescription_count: number;
}

export interface MedicineUsageReport {
  from_date: string | null;
  to_date: string | null;
  group_by: string;
  data: MedicineUsageDataPoint[];
}

export interface AppointmentStatisticsDataPoint {
  period: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
}

export interface AppointmentStatisticsReport {
  from_date: string | null;
  to_date: string | null;
  group_by: string;
  data: AppointmentStatisticsDataPoint[];
}

export interface PrescriptionAnalysisResponse {
  from_date: string | null;
  to_date: string | null;
  total_prescriptions: number;
  unique_patients: number;
  unique_medicines: number;
  avg_medicines_per_prescription: number;
  top_medicines: Array<{
    medicine_name: string;
    usage_count: number;
  }>;
}

export interface FinancialSummaryResponse {
  from_date: string | null;
  to_date: string | null;
  total_revenue: number;
  total_appointments: number;
  avg_revenue_per_appointment: number;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
    appointment_count: number;
  }>;
}

export interface ExpiringMedicineAlert {
  medicine_id: string;
  medicine_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
}

export interface ExpiryAlertsReport {
  days_threshold: number;
  total_items: number;
  items: ExpiringMedicineAlert[];
}

// ============ Service Methods ============

export class ReportsService {
  public static getPatientHistory(
    patientId: string,
    fromDate?: string,
    toDate?: string,
  ): CancelablePromise<PatientHistoryResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/reports/patient-history/${patientId}`,
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        404: "Patient not found",
        403: "Forbidden",
      },
    });
  }

  public static getMedicineUsageReport(
    fromDate?: string,
    toDate?: string,
    medicineId?: string,
    groupBy: string = "month",
  ): CancelablePromise<MedicineUsageReport> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/reports/medicine-usage",
      query: {
        from_date: fromDate,
        to_date: toDate,
        medicine_id: medicineId,
        group_by: groupBy,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
      },
    });
  }

  public static getAppointmentStatistics(
    fromDate?: string,
    toDate?: string,
    groupBy: string = "month",
  ): CancelablePromise<AppointmentStatisticsReport> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/reports/appointment-statistics",
      query: {
        from_date: fromDate,
        to_date: toDate,
        group_by: groupBy,
      },
      errors: {
        422: "Validation Error",
        403: "Forbidden",
      },
    });
  }

  public static getPrescriptionAnalysis(
    fromDate?: string,
    toDate?: string,
  ): CancelablePromise<PrescriptionAnalysisResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/reports/prescription-analysis",
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        403: "Forbidden",
      },
    });
  }

  public static getFinancialSummary(
    fromDate?: string,
    toDate?: string,
  ): CancelablePromise<FinancialSummaryResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/reports/financial-summary",
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        403: "Forbidden",
      },
    });
  }

  public static getExpiryAlerts(
    daysThreshold: number = 30,
  ): CancelablePromise<ExpiryAlertsReport> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/reports/expiry-alerts",
      query: {
        days_threshold: daysThreshold,
      },
      errors: {
        403: "Forbidden",
      },
    });
  }
}
