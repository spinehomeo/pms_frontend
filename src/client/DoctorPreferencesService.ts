import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export interface DoctorField {
  field_name: string;
  display_name: string;
  field_type: string;
  is_required: boolean;
  position: number;
  config: Record<string, any>;
  is_enabled?: boolean;
}

export interface InitializeResponse {
  message: string;
}

export interface ToggleFieldResponse {
  message: string;
}

export interface AddCustomFieldRequest {
  field_name: string;
  display_name: string;
  field_type?: string;
  is_required?: boolean;
}

export interface AddCustomFieldResponse {
  message: string;
  field: DoctorField;
}

export interface DeleteFieldResponse {
  message: string;
}

export class DoctorPreferencesService {
  /**
   * Initialize standard fields for the doctor (first-time setup)
   * POST /doctor-preferences/initialize-standard-fields
   */
  public static initializeStandardFields(): CancelablePromise<InitializeResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor-preferences/initialize-standard-fields",
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Get all enabled fields (standard and custom) for the current doctor
   * GET /doctor-preferences/fields
   */
  public static getFields(): CancelablePromise<DoctorField[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor-preferences/fields",
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Enable or disable a standard field
   * POST /doctor-preferences/fields/{field_name}/toggle?enabled={true|false}
   */
  public static toggleField(requestBody: {
    field_name: string;
    enabled?: boolean;
  }): CancelablePromise<ToggleFieldResponse> {
    const { field_name, enabled = true } = requestBody;
    return __request(OpenAPI, {
      method: "POST",
      url: `/doctor-preferences/fields/${field_name}/toggle`,
      query: {
        enabled: enabled,
      },
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Add a custom field for the doctor
   * POST /doctor-preferences/fields/custom?field_name=...&display_name=...&field_type=...&is_required=...
   */
  public static addCustomField(
    requestBody: AddCustomFieldRequest,
  ): CancelablePromise<AddCustomFieldResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor-preferences/fields/custom",
      query: {
        field_name: requestBody.field_name,
        display_name: requestBody.display_name,
        field_type: requestBody.field_type || "text",
        is_required: requestBody.is_required || false,
      },
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        422: "Validation Error",
        500: "Server Error",
      },
    });
  }

  /**
   * Delete a custom field
   * DELETE /doctor-preferences/fields/{field_name}
   */
  public static deleteCustomField(requestBody: {
    field_name: string;
  }): CancelablePromise<DeleteFieldResponse> {
    const { field_name } = requestBody;
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/doctor-preferences/fields/${field_name}`,
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Server Error",
      },
    });
  }
}
