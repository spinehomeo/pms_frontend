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
  | "PrescriptionDuration";

export class EnumsService {
  public static readDoctorEnum(
    enumName: DoctorEnumName,
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
}
