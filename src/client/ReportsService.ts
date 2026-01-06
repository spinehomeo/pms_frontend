// Temporary ReportsService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export class ReportsService {
  public static getPatientHistory(patientId: string, fromDate?: string, toDate?: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/reports/patient-history/${patientId}`,
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        404: 'Patient not found',
        403: 'Forbidden',
      }
    });
  }

  public static getMedicineUsageReport(fromDate?: string, toDate?: string, medicineId?: string, groupBy: string = "month"): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/reports/medicine-usage',
      query: {
        from_date: fromDate,
        to_date: toDate,
        medicine_id: medicineId,
        group_by: groupBy,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static getAppointmentStatistics(fromDate?: string, toDate?: string, groupBy: string = "month"): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/reports/appointment-statistics',
      query: {
        from_date: fromDate,
        to_date: toDate,
        group_by: groupBy,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static getPrescriptionAnalysis(fromDate?: string, toDate?: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/reports/prescription-analysis',
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        403: 'Forbidden',
      }
    });
  }

  public static getFinancialSummary(fromDate?: string, toDate?: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/reports/financial-summary',
      query: {
        from_date: fromDate,
        to_date: toDate,
      },
      errors: {
        403: 'Forbidden',
      }
    });
  }

  public static getExpiryAlerts(daysThreshold: number = 30): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/reports/expiry-alerts',
      query: {
        days_threshold: daysThreshold,
      },
      errors: {
        403: 'Forbidden',
      }
    });
  }
}

