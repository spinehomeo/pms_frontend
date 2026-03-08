import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export type DoctorEnumName =
  | "PrescriptionType"
  | "PrescriptionStatus"
  | "RepetitionEnum"
  | "AppointmentStatus"
  | "ConsultationType"
  | "FollowupStatus"
  | "CaseStatus"
  | "ExceptionType"
  | "ScaleEnum"
  | "FormEnum"
  | "ManufacturerEnum"
  | "PrescriptionDuration"
  | "PatientGender"
  | "DayOfWeek";

export interface EnumOption {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  enum_type: string;
}

export interface EnumPreferenceItem {
  id: string;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  is_enabled: boolean;
  enum_type: string;
}

export interface AddEnumOptionRequest {
  value: string;
  label: string;
  sort_order?: number;
}

export class EnumsService {
  /**
   * Get doctor's enabled options for a specific enum
   * GET /enums/doctor/{enumName}
   */
  public static readDoctorEnum(
    enumName: DoctorEnumName | string,
  ): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/enums/doctor/${enumName}`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Enum not found",
      },
    });
  }

  /**
   * Get all enums at once (all groups with their options)
   * GET /enums/doctor/all
   */
  public static readAllDoctorEnums(): CancelablePromise<
    Record<string, EnumOption[]>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/enums/doctor/all",
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
      },
    });
  }

  /**
   * Get toggle preferences for a specific enum type (includes enabled/disabled status)
   * GET /enums/doctor/preferences/list/{enum_type_key}
   */
  public static getEnumPreferences(
    enumTypeKey: string,
  ): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/enums/doctor/preferences/list/${enumTypeKey}`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Enum type not found",
      },
    });
  }

  /**
   * Toggle an enum option on/off for the doctor
   * POST /enums/doctor/preferences/{option_id}
   */
  public static toggleEnumOption(
    optionId: string,
    isEnabled: boolean,
  ): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/enums/doctor/preferences/${optionId}`,
      body: { is_enabled: isEnabled },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Option not found",
      },
    });
  }

  /**
   * Add a custom option to an enum type
   * POST /enums/doctor/{enum_type_key}
   */
  public static addCustomEnumOption(
    enumTypeKey: string,
    requestBody: AddEnumOptionRequest,
  ): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "POST",
      url: `/enums/doctor/${enumTypeKey}`,
      body: requestBody,
      errors: {
        400: "Bad Request",
        401: "Not authenticated",
        403: "Forbidden",
        422: "Validation Error",
      },
    });
  }
}
