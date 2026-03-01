import type { CancelablePromise } from "@/client/core/CancelablePromise";
import { OpenAPI } from "@/client/core/OpenAPI";
import { request as __request } from "@/client/core/request";

export type FinanceNatureCode = "CASH_IN" | "CASH_OUT" | string;
export type FinanceCustomFieldType = "text" | "number" | "date" | "boolean";

export interface FinanceCashBook {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  doctor_id: string;
  created_at: string;
  updated_at?: string | null;
}

export interface FinanceCashBooksResponse {
  data: FinanceCashBook[];
  count: number;
}

export interface CreateFinanceCashBookPayload {
  name: string;
  description?: string;
}

export interface UpdateFinanceCashBookPayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface FinanceCustomField {
  id: string;
  cash_book_id: string;
  field_key: string;
  field_label: string;
  field_type: FinanceCustomFieldType;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

export interface FinanceTransaction {
  id: string;
  cash_book_id: string;
  doctor_id: string;
  transaction_date: string;
  amount: number;
  remarks?: string | null;
  running_balance: number;
  nature_code: FinanceNatureCode;
  category_code: string;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface FinanceTransactionsResponse {
  data: FinanceTransaction[];
  count: number;
}

export interface CreateFinanceTransactionPayload {
  cash_book_id: string;
  nature_code: FinanceNatureCode;
  category_code: string;
  amount: number;
  transaction_date: string;
  remarks?: string;
  custom_field_values?: Record<string, string | number | boolean>;
}

export interface UpdateFinanceTransactionPayload {
  nature_code?: FinanceNatureCode;
  category_code?: string;
  amount?: number;
  transaction_date?: string;
  remarks?: string;
  custom_field_values?: Record<string, string | number | boolean>;
}

export interface FinanceBalanceResponse {
  cash_book_id: string;
  current_balance: number;
}

export interface FinanceCashBookSummary {
  cash_book_id: string;
  name: string;
  total_cash_in: number;
  total_cash_out: number;
  net_balance: number;
  current_balance: number;
  transaction_count: number;
}

export interface FinanceDoctorSummary {
  total_cash_in: number;
  total_cash_out: number;
  net_balance: number;
  total_current_balance: number;
  transaction_count: number;
  books: FinanceCashBookSummary[];
}

export interface FinanceEnumOption {
  value: string;
  label: string;
}

export interface ListFinanceCashBooksParams {
  active_only?: boolean;
  skip?: number;
  limit?: number;
}

export interface ListFinanceTransactionsParams {
  cash_book_id: string;
  start_date?: string;
  end_date?: string;
  nature_code?: string;
  category_code?: string;
  include_deleted?: boolean;
  skip?: number;
  limit?: number;
}

export class FinanceApi {
  public static listCashBooks(
    params: ListFinanceCashBooksParams = {
      active_only: true,
      skip: 0,
      limit: 100,
    },
  ): CancelablePromise<FinanceCashBooksResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/finance/cash-books",
      query: {
        active_only: params.active_only,
        skip: params.skip,
        limit: params.limit,
      },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
      },
    });
  }

  public static createCashBook(
    payload: CreateFinanceCashBookPayload,
  ): CancelablePromise<FinanceCashBook> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/finance/cash-books",
      body: payload,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Not authenticated",
        403: "Forbidden",
      },
    });
  }

  public static getCashBook(
    cashBookId: string,
  ): CancelablePromise<FinanceCashBook> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/finance/cash-books/${cashBookId}`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static updateCashBook(
    cashBookId: string,
    payload: UpdateFinanceCashBookPayload,
  ): CancelablePromise<FinanceCashBook> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/finance/cash-books/${cashBookId}`,
      body: payload,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static deleteCashBook(
    cashBookId: string,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/finance/cash-books/${cashBookId}`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static listCustomFields(
    cashBookId: string,
    activeOnly: boolean = true,
  ): CancelablePromise<FinanceCustomField[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/finance/cash-books/${cashBookId}/custom-fields`,
      query: {
        active_only: activeOnly,
      },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static listTransactions(
    params: ListFinanceTransactionsParams,
  ): CancelablePromise<FinanceTransactionsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/finance/transactions",
      query: {
        cash_book_id: params.cash_book_id,
        start_date: params.start_date,
        end_date: params.end_date,
        nature_code: params.nature_code,
        category_code: params.category_code,
        include_deleted: params.include_deleted,
        skip: params.skip,
        limit: params.limit,
      },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        422: "Validation Error",
      },
    });
  }

  public static createTransaction(
    payload: CreateFinanceTransactionPayload,
  ): CancelablePromise<FinanceTransaction> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/finance/transactions",
      body: payload,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Not authenticated",
        403: "Forbidden",
        422: "Validation Error",
      },
    });
  }

  public static updateTransaction(
    transactionId: string,
    payload: UpdateFinanceTransactionPayload,
  ): CancelablePromise<FinanceTransaction> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: `/finance/transactions/${transactionId}`,
      body: payload,
      mediaType: "application/json",
      errors: {
        400: "Bad Request",
        401: "Not authenticated",
        403: "Forbidden",
        404: "Transaction not found",
      },
    });
  }

  public static deleteTransaction(
    transactionId: string,
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/finance/transactions/${transactionId}`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Transaction not found",
      },
    });
  }

  public static getCurrentBalance(
    cashBookId: string,
  ): CancelablePromise<FinanceBalanceResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/finance/cash-books/${cashBookId}/current-balance`,
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static getCashBookSummary(
    cashBookId: string,
    startDate?: string,
    endDate?: string,
  ): CancelablePromise<FinanceCashBookSummary> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/finance/cash-books/${cashBookId}/summary`,
      query: {
        start_date: startDate,
        end_date: endDate,
      },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Cash book not found",
      },
    });
  }

  public static getDoctorSummary(
    startDate?: string,
    endDate?: string,
  ): CancelablePromise<FinanceDoctorSummary> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/finance/summary",
      query: {
        start_date: startDate,
        end_date: endDate,
      },
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
      },
    });
  }

  public static readTransactionNatureEnum(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/enums/doctor/TransactionNature",
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Enum not found",
      },
    });
  }

  public static readTransactionCategoryEnum(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/enums/doctor/TransactionCategory",
      errors: {
        401: "Not authenticated",
        403: "Forbidden",
        404: "Enum not found",
      },
    });
  }
}
