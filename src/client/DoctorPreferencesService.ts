import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

export type FormType = "cases" | "followups";

export interface DoctorField {
  field_name: string;
  display_name: string;
  field_type: string;
  is_required: boolean;
  position: number;
  config: Record<string, any>;
  is_enabled?: boolean;
  is_custom?: boolean;
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
  form_type?: FormType;
}

export interface EditCustomFieldRequest {
  field_name: string;
  display_name?: string;
  field_type?: string;
  is_required?: boolean;
  form_type?: FormType;
}

export interface AddCustomFieldResponse {
  message: string;
  field: DoctorField;
}

export interface EditCustomFieldResponse {
  message: string;
  field: DoctorField;
}

export interface DeleteFieldResponse {
  message: string;
}

export class DoctorPreferencesService {
  /**
   * Initialize standard fields for the doctor (first-time setup)
   * POST /doctor-preferences/initialize-standard-fields?form_type=cases|followups
   */
  public static initializeStandardFields(
    formType: FormType = "cases",
  ): CancelablePromise<InitializeResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor-preferences/initialize-standard-fields",
      query: { form_type: formType },
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Get enabled fields only for the current doctor
   * GET /doctor-preferences/fields?form_type=cases|followups
   */
  public static getFields(
    formType: FormType = "cases",
  ): CancelablePromise<DoctorField[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor-preferences/fields",
      query: { form_type: formType },
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Get all fields (including disabled) with toggle status
   * GET /doctor-preferences/fields/all?form_type=cases|followups
   */
  public static getFieldsAll(
    formType: FormType = "cases",
  ): CancelablePromise<DoctorField[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/doctor-preferences/fields/all",
      query: { form_type: formType },
      errors: {
        401: "Unauthorized",
        403: "Forbidden",
        500: "Server Error",
      },
    });
  }

  /**
   * Enable or disable a standard field
   * POST /doctor-preferences/fields/{field_name}/toggle?form_type=...&enabled=...
   */
  public static toggleField(requestBody: {
    field_name: string;
    enabled?: boolean;
    form_type?: FormType;
  }): CancelablePromise<ToggleFieldResponse> {
    const { field_name, enabled = true, form_type = "cases" } = requestBody;
    return __request(OpenAPI, {
      method: "POST",
      url: `/doctor-preferences/fields/${field_name}/toggle`,
      query: {
        enabled,
        form_type,
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
   * POST /doctor-preferences/fields/custom?form_type=...&field_name=...&display_name=...&field_type=...&is_required=...
   */
  public static addCustomField(
    requestBody: AddCustomFieldRequest,
  ): CancelablePromise<AddCustomFieldResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/doctor-preferences/fields/custom",
      query: {
        form_type: requestBody.form_type || "cases",
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
   * Edit properties of an existing custom field
   * PUT /doctor-preferences/fields/custom/{field_name}?form_type=...&display_name=...&field_type=...&is_required=...
   */
  public static editCustomField(
    requestBody: EditCustomFieldRequest,
  ): CancelablePromise<EditCustomFieldResponse> {
    const { field_name, form_type = "cases", ...rest } = requestBody;
    const query: Record<string, any> = { form_type };
    if (rest.display_name !== undefined) query.display_name = rest.display_name;
    if (rest.field_type !== undefined) query.field_type = rest.field_type;
    if (rest.is_required !== undefined) query.is_required = rest.is_required;

    return __request(OpenAPI, {
      method: "PUT",
      url: `/doctor-preferences/fields/custom/${field_name}`,
      query,
      errors: {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Server Error",
      },
    });
  }

  /**
   * Delete a custom field
   * DELETE /doctor-preferences/fields/{field_name}?form_type=cases|followups
   */
  public static deleteCustomField(requestBody: {
    field_name: string;
    form_type?: FormType;
  }): CancelablePromise<DeleteFieldResponse> {
    const { field_name, form_type = "cases" } = requestBody;
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/doctor-preferences/fields/${field_name}`,
      query: { form_type },
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
