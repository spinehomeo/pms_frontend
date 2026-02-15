# Follow-ups API Guide

**Module:** Follow-up Management  
**Version:** 1.0.0  
**Last Updated:** February 12, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

The Follow-ups API lets doctors manage patient follow-ups linked to cases and prescriptions. It supports CRUD operations, case timelines, due/overdue views, and scheduling the next follow-up.

---

## Authentication & Authorization

- **Type:** OAuth2 Password Bearer (DoctorOAuth2)
- **Scope:** Doctor (doctor role required)

**Common Auth Errors**

**401 Unauthorized**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden**

```json
{
  "detail": "Only doctors can access follow-ups"
}
```

---

## Data Models

### FollowUpCreate

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_id": "550e8400-e29b-41d4-a716-446655440200",
  "subjective_improvement": "Headache reduced",
  "objective_findings": "BP normal",
  "aggravation": null,
  "amelioration": "Improved after rest",
  "new_symptoms": "Mild fatigue",
  "general_state": "Stable",
  "plan": "Continue same medicine",
  "next_follow_up_date": "2026-03-12"
}
```

### FollowUpUpdate

All fields optional.

```json
{
  "objective_findings": "BP 118/78",
  "new_symptoms": null,
  "plan": "Reduce dosage",
  "next_follow_up_date": "2026-03-20"
}
```

### FollowUpPublic

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440400",
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_id": "550e8400-e29b-41d4-a716-446655440200",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "follow_up_date": "2026-02-12",
  "interval_days": 30,
  "next_follow_up_date": "2026-03-12",
  "subjective_improvement": "Headache reduced",
  "objective_findings": "BP normal",
  "aggravation": null,
  "amelioration": "Improved after rest",
  "new_symptoms": "Mild fatigue",
  "general_state": "Stable",
  "plan": "Continue same medicine",
  "patient_name": "Ahmed Ali",
  "case_number": "C-FEB26-001"
}
```

### FollowUpsPublic

```json
{
  "data": [{ "id": "...", "follow_up_date": "2026-02-12" }],
  "count": 1
}
```

---

## API Endpoints

### 1. List Follow-ups (Doctor)

**Endpoint:** `GET /api/v1/followups/`

**Query Parameters:**

- `skip` (int, default 0)
- `limit` (int, default 100)
- `case_id` (UUID, optional)
- `patient_id` (UUID, optional)
- `from_date` (date, optional)
- `to_date` (date, optional)
- `upcoming` (bool, optional) → next 30 days

**Response (200 OK):** FollowUpsPublic

---

### 2. Get Follow-up by ID (Doctor)

**Endpoint:** `GET /api/v1/followups/{followup_id}`

**Response (200 OK):** FollowUpPublic

**Errors:**

- 404: Follow-up not found
- 403: Not authorized to access this follow-up

---

### 3. Create Follow-up (Doctor)

**Endpoint:** `POST /api/v1/followups/`

**Request Body:** FollowUpCreate

**Response (201 Created):** FollowUpPublic

**Validations:**

- Case must belong to doctor
- Prescription must belong to doctor and match the case
- `interval_days` is auto-calculated (min 7 days)
- `next_follow_up_date` defaults to today + 30 days if not provided

**Common Errors:**

```json
{ "detail": "Case not found" }
```

```json
{ "detail": "Prescription does not belong to the specified case" }
```

---

### 4. Update Follow-up (Doctor)

**Endpoint:** `PUT /api/v1/followups/{followup_id}`

**Request Body:** FollowUpUpdate

**Response (200 OK):** FollowUpPublic

---

### 5. Delete Follow-up (Doctor)

**Endpoint:** `DELETE /api/v1/followups/{followup_id}`

**Response (200 OK):**

```json
{ "message": "Follow-up deleted successfully" }
```

---

### 6. Get Case Follow-ups (Doctor)

**Endpoint:** `GET /api/v1/followups/case/{case_id}`

**Response (200 OK):**

```json
{
  "case": { "id": "...", "case_number": "C-FEB26-001" },
  "followups": [{ "id": "...", "follow_up_date": "2026-02-12" }],
  "timeline": [{ "followup": { "id": "..." }, "position": 1, "total": 3 }],
  "total_followups": 3,
  "first_followup": { "id": "..." },
  "latest_followup": { "id": "..." }
}
```

---

### 7. Due / Overdue Follow-ups (Doctor)

**Endpoint:** `GET /api/v1/followups/upcoming/due`

**Response (200 OK):**

```json
{
  "overdue": {
    "count": 1,
    "items": [{ "followup": { "id": "..." }, "days_overdue": 3 }]
  },
  "due_today": {
    "count": 1,
    "items": [{ "id": "..." }]
  },
  "upcoming_week": {
    "count": 2,
    "items": [{ "followup": { "id": "..." }, "days_until": 5 }]
  },
  "total_due": 2,
  "check_date": "2026-02-12"
}
```

---

### 8. Schedule Next Follow-up (Doctor)

**Endpoint:** `POST /api/v1/followups/{followup_id}/schedule-next`

**Query Parameters:**

- `next_date` (date, required)

**Response (200 OK):**

```json
{
  "message": "Next follow-up scheduled successfully",
  "current_followup": { "id": "..." },
  "scheduled_followup": { "id": "..." }
}
```

---

## Notes

- `interval_days` is auto-calculated with a minimum of 7 days.
- Follow-ups are linked to both `case_id` and `prescription_id`.

---

## Version History

| Version | Date         | Changes                              |
| ------- | ------------ | ------------------------------------ |
| 1.0.0   | Feb 12, 2026 | Initial follow-ups API documentation |
