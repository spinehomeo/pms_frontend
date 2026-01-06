// Temporary FollowupsService until SDK is regenerated
import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

export interface FollowupsReadFollowupsData {
  skip?: number;
  limit?: number;
  case_id?: string;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
  upcoming?: boolean;
}

export interface FollowupsReadFollowupData {
  followupId: string;
}

export interface FollowUpCreate {
  case_id: string;
  prescription_id: string;
  subjective_improvement?: string;
  objective_findings?: string;
  aggravation?: string;
  amelioration?: string;
  new_symptoms?: string;
  general_state?: string;
  plan?: string;
  next_follow_up_date?: string;
}

export interface FollowUpUpdate {
  subjective_improvement?: string;
  objective_findings?: string;
  aggravation?: string;
  amelioration?: string;
  new_symptoms?: string;
  general_state?: string;
  plan?: string;
  next_follow_up_date?: string;
}

export interface FollowupsCreateFollowupData {
  requestBody: FollowUpCreate;
}

export interface FollowupsUpdateFollowupData {
  followupId: string;
  requestBody: FollowUpUpdate;
}

export interface FollowupsDeleteFollowupData {
  followupId: string;
}

export interface FollowUpPublic {
  id: string;
  case_id: string;
  prescription_id: string;
  doctor_id: string;
  follow_up_date: string;
  interval_days: number;
  next_follow_up_date?: string;
  subjective_improvement?: string;
  objective_findings?: string;
  aggravation?: string;
  amelioration?: string;
  new_symptoms?: string;
  general_state?: string;
  plan?: string;
  patient_name?: string;
  case_number?: string;
}

export interface FollowUpsPublic {
  data: FollowUpPublic[];
  count: number;
}

export class FollowupsService {
  public static readFollowups(data: FollowupsReadFollowupsData = {}): CancelablePromise<FollowUpsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/followups/',
      query: {
        skip: data.skip,
        limit: data.limit,
        case_id: data.case_id,
        patient_id: data.patient_id,
        from_date: data.from_date,
        to_date: data.to_date,
        upcoming: data.upcoming,
      },
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
      }
    });
  }

  public static readFollowup(data: FollowupsReadFollowupData): CancelablePromise<FollowUpPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/followups/${data.followupId}`,
      errors: {
        404: 'Follow-up not found',
        403: 'Forbidden',
      }
    });
  }

  public static createFollowup(data: FollowupsCreateFollowupData): CancelablePromise<FollowUpPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/followups/',
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        403: 'Forbidden',
        400: 'Bad Request',
        404: 'Not Found',
      }
    });
  }

  public static updateFollowup(data: FollowupsUpdateFollowupData): CancelablePromise<FollowUpPublic> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: `/followups/${data.followupId}`,
      body: data.requestBody,
      mediaType: 'application/json',
      errors: {
        422: 'Validation Error',
        404: 'Follow-up not found',
        403: 'Forbidden',
        400: 'Bad Request',
      }
    });
  }

  public static deleteFollowup(data: FollowupsDeleteFollowupData): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: `/followups/${data.followupId}`,
      errors: {
        404: 'Follow-up not found',
        403: 'Forbidden',
      }
    });
  }

  public static getDueFollowups(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/followups/upcoming/due',
      errors: {
        403: 'Forbidden',
      }
    });
  }
}

