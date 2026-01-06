// Temporary AppointmentsService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export interface AppointmentsReadAppointmentsData {
  skip?: number;
  limit?: number;
  date_filter?: string;
  status?: AppointmentStatus;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface AppointmentsReadAppointmentData {
  appointmentId: string;
}

export interface AppointmentsCreateAppointmentData {
  requestBody: {
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    duration_minutes?: number;
    status?: AppointmentStatus;
    consultation_type?: string;
    reason?: string;
    notes?: string;
  };
}

export interface AppointmentsUpdateAppointmentData {
  appointmentId: string;
  requestBody: {
    appointment_date?: string;
    appointment_time?: string;
    duration_minutes?: number;
    status?: AppointmentStatus;
    consultation_type?: string;
    reason?: string;
    notes?: string;
  };
}

export interface AppointmentsUpdateStatusData {
  appointmentId: string;
  status: AppointmentStatus;
}

export interface AppointmentsDeleteAppointmentData {
  appointmentId: string;
}

export interface AppointmentPublic {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  consultation_type: string;
  reason?: string;
  notes?: string;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
}

export interface AppointmentsPublic {
  data: AppointmentPublic[];
  count: number;
}

export interface AppointmentCreate {
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  consultation_type?: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentUpdate {
  appointment_date?: string;
  appointment_time?: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  consultation_type?: string;
  reason?: string;
  notes?: string;
}

export class AppointmentsService {
  public static readAppointments(data: AppointmentsReadAppointmentsData = {}): CancelablePromise<AppointmentsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/appointments/',
      query: {
        skip: data.skip,
        limit: data.limit,
        date_filter: data.date_filter,
        status: data.status,
        patient_id: data.patient_id,
        from_date: data.from_date,
        to_date: data.to_date,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readTodayAppointments(): CancelablePromise<AppointmentsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/appointments/today',
      errors: {
        403: 'Forbidden',
      }
    });
  }

  public static readUpcomingAppointments(days: number = 7): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/appointments/upcoming',
      query: {
        days,
      },
      errors: {
        403: 'Forbidden',
      }
    });
  }

  public static readAppointment(data: AppointmentsReadAppointmentData): CancelablePromise<AppointmentPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/appointments/${data.appointmentId}`,
      errors: {
        404: 'Appointment not found',
        403: 'Forbidden',
      }
    });
  }

  public static createAppointment(data: AppointmentsCreateAppointmentData): CancelablePromise<AppointmentPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/appointments/',
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
        400: 'Bad Request',
        409: 'Conflict',
      }
    });
  }

  public static updateAppointment(data: AppointmentsUpdateAppointmentData): CancelablePromise<AppointmentPublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/appointments/${data.appointmentId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Appointment not found',
        403: 'Forbidden',
        400: 'Bad Request',
        409: 'Conflict',
      }
    });
  }

  public static updateAppointmentStatus(data: AppointmentsUpdateStatusData): CancelablePromise<AppointmentPublic> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: `/appointments/${data.appointmentId}/status`,
      query: {
        status: data.status,
      },
      errors: {
        404: 'Appointment not found',
        403: 'Forbidden',
      }
    });
  }

  public static deleteAppointment(data: AppointmentsDeleteAppointmentData): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/appointments/${data.appointmentId}`,
      errors: {
        404: 'Appointment not found',
        403: 'Forbidden',
      }
    });
  }

  public static checkAvailability(checkDate: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/appointments/availability/${checkDate}`,
      errors: {
        403: 'Forbidden',
      }
    });
  }
}

