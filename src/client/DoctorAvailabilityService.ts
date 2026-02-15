// Doctor Availability Service for managing doctor schedules
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Request/Response Data Interfaces
export interface DoctorAvailabilityCreateData {
  requestBody: {
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    is_available?: boolean;
    max_patients_per_slot?: number | null;
    notes?: string;
  };
}

export interface DoctorAvailabilityUpdateData {
  slotId: string;
  requestBody: {
    day_of_week?: DayOfWeek;
    start_time?: string;
    end_time?: string;
    is_available?: boolean;
    max_patients_per_slot?: number | null;
    notes?: string;
  };
}

export interface DoctorAvailabilityDeleteData {
  slotId: string;
}

export interface DoctorAvailabilityToggleData {
  slotId: string;
}

export interface DoctorAvailabilityBulkCreateData {
  requestBody: {
    availability_slots: Array<{
      day_of_week: DayOfWeek;
      start_time: string;
      end_time: string;
      is_available?: boolean;
      max_patients_per_slot?: number | null;
      notes?: string;
    }>;
  };
}

export interface DoctorAvailabilityReadByDayData {
  day?: DayOfWeek;
  skip?: number;
  limit?: number;
}

export interface DoctorAvailabilityCheckData {
  dayName: string;
  doctor_id?: string;
}

export interface DoctorAvailabilityDeleteByDayData {
  day?: DayOfWeek;
}

// Response Interfaces
export interface DoctorAvailabilityPublic {
  id: string;
  doctor_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients_per_slot?: number | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorAvailabilitiesPublic {
  data: DoctorAvailabilityPublic[];
  count: number;
}

export interface AvailableSlot {
  start: string;
  end: string;
}

export interface AvailableSlotCheck {
  day_of_week: DayOfWeek;
  total_slots: number;
  available_slots: AvailableSlot[];
  booked_count: number;
}

export interface DoctorScheduleDay {
  day: DayOfWeek;
  slots: DoctorAvailabilityPublic[];
}

export interface DoctorScheduleResponse {
  doctor_id: string;
  schedule: Record<DayOfWeek, DoctorAvailabilityPublic[]>;
}

export interface DoctorScheduleWithPatientInfo {
  doctor_id: string;
  schedule: Record<
    DayOfWeek,
    Array<
      DoctorAvailabilityPublic & {
        booked_patients?: Array<{
          patient_name: string;
          appointment_time: string;
        }>;
      }
    >
  >;
}

export class DoctorAvailabilityService {
  /**
   * Create a single availability slot
   * POST /doctor_availability/
   */
  public static createAvailability(
    data: DoctorAvailabilityCreateData,
  ): CancelablePromise<DoctorAvailabilityPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor_availability/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        409: "Conflict",
        422: "Validation Error",
      },
    });
  }

  /**
   * Create multiple availability slots (bulk)
   * POST /doctor_availability/bulk
   */
  public static bulkCreateAvailability(
    data: DoctorAvailabilityBulkCreateData,
  ): CancelablePromise<DoctorAvailabilitiesPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor_availability/bulk",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        409: "Conflict",
        422: "Validation Error",
      },
    });
  }

  /**
   * Get doctor's weekly schedule
   * GET /doctor_availability/schedule
   */
  public static getSchedule(): CancelablePromise<DoctorScheduleResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor_availability/schedule",
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
      },
    });
  }

  /**
   * Get weekly schedule with patient info
   * GET /doctor_availability/schedule/patient-info
   */
  public static getScheduleWithPatientInfo(): CancelablePromise<DoctorScheduleWithPatientInfo> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor_availability/schedule/patient-info",
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
      },
    });
  }

  /**
   * Get all availability slots with optional filtering
   * GET /doctor_availability/
   */
  public static getAvailabilities(
    data: DoctorAvailabilityReadByDayData = {},
  ): CancelablePromise<DoctorAvailabilitiesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor_availability/",
      query: {
        day: data.day,
        skip: data.skip,
        limit: data.limit,
      },
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        422: "Validation Error",
      },
    });
  }

  /**
   * Get a single availability slot
   * GET /doctor_availability/{slot_id}
   */
  public static getAvailability(
    slotId: string,
  ): CancelablePromise<DoctorAvailabilityPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/doctor_availability/${slotId}`,
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
      },
    });
  }

  /**
   * Update an availability slot
   * PUT /doctor_availability/{slot_id}
   */
  public static updateAvailability(
    data: DoctorAvailabilityUpdateData,
  ): CancelablePromise<DoctorAvailabilityPublic> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/doctor_availability/${data.slotId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Validation Error",
      },
    });
  }

  /**
   * Toggle availability status of a slot
   * PATCH /doctor_availability/{slot_id}/toggle
   */
  public static toggleAvailability(
    data: DoctorAvailabilityToggleData,
  ): CancelablePromise<DoctorAvailabilityPublic> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/doctor_availability/${data.slotId}/toggle`,
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
      },
    });
  }

  /**
   * Delete a single availability slot
   * DELETE /doctor_availability/{slot_id}
   */
  public static deleteAvailability(
    data: DoctorAvailabilityDeleteData,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/doctor_availability/${data.slotId}`,
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
      },
    });
  }

  /**
   * Delete availability slots (all or by day)
   * DELETE /doctor_availability/
   */
  public static deleteAvailabilities(
    data: DoctorAvailabilityDeleteByDayData = {},
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/doctor_availability/",
      query: {
        day: data.day,
      },
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        422: "Validation Error",
      },
    });
  }

  /**
   * Check available slots for a specific day (for patient booking)
   * GET /doctor_availability/check/{day_name}
   */
  public static checkAvailableSlots(
    data: DoctorAvailabilityCheckData,
  ): CancelablePromise<AvailableSlotCheck> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/doctor_availability/check/${data.dayName}`,
      query: {
        doctor_id: data.doctor_id,
      },
      errors: {
        400: "Bad Request",
        404: "Not Found",
      },
    });
  }
}
