# Onsite Consultation — Complete API Reference

## Overview

The Onsite Consultation feature handles **walk-in / onsite patient visits** in a single atomic transaction. It covers **two route files** under the API prefix `/api/v1`:

| Module              | Prefix                    | Purpose                                   |
| ------------------- | ------------------------- | ----------------------------------------- |
| Onsite Consultation | `/api/v1/consultations`   | Create a full consultation in one shot    |
| Onsite Patient Mgmt | `/api/v1/patients/onsite` | Search, quick-register, and view patients |

**Auth:** All endpoints require a Bearer token (DoctorOAuth2). Only doctors can use the consultation endpoint.

---

## API 1: `POST /api/v1/consultations/onsite`

**Tag:** `Onsite Consultation`  
**Auth:** Doctor only (Bearer token)  
**Status:** `201 Created`  
**Optional Header:** `X-Idempotency-Key` (string) — prevents duplicate submissions within 24h.

### What it does (atomic 5-step transaction)

| Step | Record Created                                                                              | Required?                        |
| ---- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| 1    | **Patient** — creates new (by phone+name) or reuses existing (matched by phone + doctor_id) | Yes                              |
| 2    | **Appointment** — status auto-set to `onsite`, date/time default to now                     | Yes                              |
| 3    | **Case** — full case-taking linked to the appointment                                       | Yes                              |
| 4    | **Prescription** — with medicine lines (existing or quick-add)                              | Optional                         |
| 5    | **Follow-up** — scheduling for patient return                                               | Optional (requires prescription) |

If any step fails, the entire transaction rolls back. An audit trail record (`OnsiteConsultationAudit`) is also created.

### Request Body

```json
{
  "patient": { ... },        // REQUIRED
  "appointment": { ... },    // REQUIRED
  "case": { ... },           // REQUIRED
  "prescription": { ... },   // OPTIONAL
  "follow_up": { ... }       // OPTIONAL (needs prescription)
}
```

### Validation Rules

- `follow_up` requires `prescription` to be present.
- If `prescription` is present, `prescription.medicines` must have at least one entry.
- Each medicine entry must have **either** `medicine_id` **or** `new_medicine`, not both.

---

### `patient` block (required)

| Field                 | Type                | Required | Notes                                       |
| --------------------- | ------------------- | -------- | ------------------------------------------- |
| `full_name`           | string (max 255)    | **Yes**  |                                             |
| `phone`               | string (max 20)     | **Yes**  | Used to match existing patients             |
| `gender`              | string (max 20)     | No       | Defaults to `"unknown"`                     |
| `date_of_birth`       | date (`YYYY-MM-DD`) | No       |                                             |
| `cnic`                | string (max 15)     | No       | Auto-generates `TEMP-XXXXXXXXXX` if omitted |
| `email`               | string (max 255)    | No       |                                             |
| `phone_secondary`     | string (max 20)     | No       |                                             |
| `residential_address` | string              | No       |                                             |
| `city`                | string (max 100)    | No       |                                             |
| `occupation`          | string (max 255)    | No       |                                             |
| `referred_by`         | string (max 255)    | No       |                                             |
| `medical_history`     | string              | No       |                                             |
| `drug_allergies`      | string              | No       |                                             |
| `family_history`      | string              | No       |                                             |
| `current_medications` | string              | No       |                                             |
| `notes`               | string              | No       |                                             |

**Behavior:** If a patient with the same `phone` already exists under this doctor, the existing patient is reused and `last_visit_date` is updated. Otherwise, a new patient is created.

---

### `appointment` block (required)

| Field               | Type              | Required | Notes                                                  |
| ------------------- | ----------------- | -------- | ------------------------------------------------------ |
| `consultation_type` | string (max 50)   | **Yes**  | `"first"`, `"emergency"`, `"follow_up"`, or `"onsite"` |
| `appointment_date`  | date              | No       | Defaults to today                                      |
| `appointment_time`  | time (`HH:MM:SS`) | No       | Defaults to current time                               |
| `duration_minutes`  | int (min 15)      | No       | Defaults to `30`                                       |
| `reason`            | string            | No       |                                                        |
| `notes`             | string            | No       |                                                        |

**Behavior:** Status is automatically set to `"onsite"`. Date and time default to _now_ for desk speed.

---

### `case` block (required)

| Field                      | Type             | Required | Notes                         |
| -------------------------- | ---------------- | -------- | ----------------------------- |
| `chief_complaint_patient`  | string (max 500) | **Yes**  | Patient's own words           |
| `chief_complaint_duration` | string (max 100) | **Yes**  | e.g. `"3 days"`, `"2 weeks"`  |
| `physicals`                | string           | No       | Physical examination findings |
| `noted_complaint_doctor`   | string (max 500) | No       | Doctor's assessment           |
| `peculiar_symptoms`        | string           | No       |                               |
| `causation`                | string           | No       |                               |
| `lab_reports`              | string           | No       |                               |
| `custom_fields`            | object (JSON)    | No       | Dynamic JSONB fields          |

**Behavior:** Case number is auto-generated in format `C-MAR26-017` (month-year-sequence). Status is set to `"open"`.

---

### `prescription` block (optional)

| Field                   | Type             | Required                          | Notes                                                     |
| ----------------------- | ---------------- | --------------------------------- | --------------------------------------------------------- |
| `prescription_type`     | string (max 100) | **Yes**                           | e.g. `"constitutional"`, `"acute"`                        |
| `dosage`                | string (max 200) | **Yes**                           | e.g. `"3 times daily"`                                    |
| `prescription_duration` | string (max 100) | **Yes**                           | e.g. `"14 days"`                                          |
| `duration_days`         | int (min 1)      | No                                | Integer version for auto follow-up calc                   |
| `instructions`          | string           | No                                |                                                           |
| `follow_up_advice`      | string           | No                                |                                                           |
| `dietary_restrictions`  | string           | No                                |                                                           |
| `avoidance`             | string           | No                                | Lifestyle avoidance                                       |
| `notes`                 | string           | No                                |                                                           |
| `status`                | string (max 50)  | No                                | Defaults to `"open"` (`open` / `completed` / `cancelled`) |
| `medicines`             | array            | **Yes** (if prescription present) | At least 1 entry required                                 |

**Behavior:** Prescription number is auto-generated in format `RX-MAR26-001`.

#### `medicines[*]` — each entry

| Field                 | Type             | Required             | Notes                                    |
| --------------------- | ---------------- | -------------------- | ---------------------------------------- |
| `medicine_id`         | UUID             | **One of these two** | Reference existing medicine in catalogue |
| `new_medicine`        | object           | **One of these two** | Quick-add a new medicine (see below)     |
| `quantity_prescribed` | string (max 100) | No                   | e.g. `"10 drops"`                        |
| `frequency`           | string (max 50)  | No                   | e.g. `"TDS"`, `"BD"`                     |

**Rule:** Exactly one of `medicine_id` or `new_medicine` must be provided per entry.

#### `new_medicine` object (for quick-add)

| Field           | Type             | Required | Notes                       |
| --------------- | ---------------- | -------- | --------------------------- |
| `name`          | string (max 255) | **Yes**  |                             |
| `potency`       | string (max 50)  | **Yes**  | e.g. `"30"`                 |
| `potency_scale` | string           | No       | Defaults to `"C"` (C, X, Q) |
| `form`          | string           | No       | Defaults to `"Globules"`    |
| `manufacturer`  | string           | No       |                             |
| `description`   | string           | No       |                             |

**Behavior:** Creates an unverified medicine entry in the global catalogue (`is_verified=false`).

---

### `follow_up` block (optional — requires prescription)

| Field                 | Type                | Required | Notes                      |
| --------------------- | ------------------- | -------- | -------------------------- |
| `next_follow_up_date` | date (`YYYY-MM-DD`) | **Yes**  | Date patient should return |
| `interval_days`       | int (min 7)         | No       | Defaults to `30`           |

**Behavior:** Status auto-set to `"scheduled"`. `payment_confirmed` = `false`.

---

### Response (`201 Created`)

```json
{
  "patient_id": "uuid",
  "patient_full_name": "Ali Hassan",
  "is_new_patient": true,
  "appointment_id": "uuid",
  "appointment_date": "2026-03-08",
  "appointment_time": "14:32:00",
  "consultation_type": "first",
  "appointment_status": "onsite",
  "case_id": "uuid",
  "case_number": "C-MAR26-017",
  "case_date": "2026-03-08",
  "prescription_id": "uuid | null",
  "prescription_number": "RX-MAR26-001 | null",
  "prescription_date": "2026-03-08 | null",
  "follow_up_id": "uuid | null",
  "next_follow_up_date": "2026-03-22 | null",
  "follow_up_status": "scheduled | null",
  "created_at": "2026-03-08T14:32:00+00:00"
}
```

### Error Responses

| Status | When                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| `400`  | `follow_up` sent without `prescription`; `medicines` empty; medicine creation failed |
| `403`  | Non-doctor user; accessing another doctor's patient                                  |
| `404`  | `medicine_id` not found in catalogue                                                 |
| `500`  | Unexpected DB error (full rollback)                                                  |

---

## API 2: `GET /api/v1/patients/onsite/search`

**Tag:** `Onsite Patient Management`  
**Auth:** Bearer token (any authenticated user)

Search for existing patients before creating a consultation (prevents duplicates).

### Query Parameters

| Param       | Type             | Required              | Notes                             |
| ----------- | ---------------- | --------------------- | --------------------------------- |
| `phone`     | string (max 20)  | At least one required | Exact match                       |
| `full_name` | string (max 255) | At least one required | Partial, case-insensitive (ILIKE) |

### Response (`200 OK`) — `List[PatientMatchResponse]`

Returns up to **10 results** sorted by match score (highest first).

```json
[
  {
    "id": "uuid",
    "full_name": "Ali Hassan",
    "phone": "03001234567",
    "gender": "male",
    "date_of_birth": "1990-01-15",
    "email": "ali@example.com",
    "cnic": "42101-1234567-1",
    "phone_secondary": null,
    "residential_address": "...",
    "city": "Karachi",
    "occupation": "Engineer",
    "referred_by": null,
    "medical_history": "...",
    "drug_allergies": null,
    "family_history": null,
    "current_medications": null,
    "notes": null,
    "payment_status": false,
    "created_date": "2026-01-10",
    "last_visit_date": "2026-03-01",
    "is_active": true,
    "age": 36,
    "doctor": {
      "id": "uuid",
      "full_name": "Dr. Ahmed",
      "specialization": "Homeopathy",
      "phone": "...",
      "clinic_name": "...",
      "clinic_address": "..."
    },
    "is_match_by_phone": true,
    "is_match_by_name": true,
    "match_score": 1.0
  }
]
```

**Match Scoring:**

| Criteria                             | Score        |
| ------------------------------------ | ------------ |
| Exact phone match                    | +0.9         |
| Exact name match                     | +0.7         |
| Partial name match (first name only) | +0.4         |
| Maximum score                        | 1.0 (capped) |

### Error Responses

| Status | When                                     |
| ------ | ---------------------------------------- |
| `400`  | Neither `phone` nor `full_name` provided |

---

## API 3: `POST /api/v1/patients/onsite/quick-register`

**Tag:** `Onsite Patient Management`  
**Auth:** Bearer token  
**Status:** `201 Created`

Fast registration for a new walk-in patient (separate from the full consultation flow).

### Request Body

```json
{
  "full_name": "Ali Hassan",
  "phone": "03001234567",
  "gender": "male",
  "cnic": "42101-1234567-1",
  "date_of_birth": "1990-01-15",
  "email": "ali@example.com",
  "phone_secondary": null,
  "residential_address": "...",
  "city": "Karachi",
  "occupation": "Engineer",
  "referred_by": null,
  "medical_history": null,
  "drug_allergies": null,
  "family_history": null,
  "current_medications": null,
  "notes": null,
  "payment_status": false
}
```

| Field                 | Type             | Required | Notes                                       |
| --------------------- | ---------------- | -------- | ------------------------------------------- |
| `full_name`           | string (max 255) | **Yes**  |                                             |
| `phone`               | string (max 20)  | **Yes**  |                                             |
| `gender`              | string (max 20)  | No       | Defaults to `"unknown"`                     |
| `cnic`                | string (max 15)  | No       | Auto-generates `TEMP-XXXXXXXXXX` if omitted |
| `date_of_birth`       | date             | No       |                                             |
| `email`               | string (max 255) | No       |                                             |
| `phone_secondary`     | string (max 20)  | No       |                                             |
| `residential_address` | string           | No       |                                             |
| `city`                | string (max 100) | No       |                                             |
| `occupation`          | string (max 255) | No       |                                             |
| `referred_by`         | string (max 255) | No       |                                             |
| `medical_history`     | string           | No       |                                             |
| `drug_allergies`      | string           | No       |                                             |
| `family_history`      | string           | No       |                                             |
| `current_medications` | string           | No       |                                             |
| `notes`               | string           | No       |                                             |
| `payment_status`      | bool             | No       | Defaults to `false`                         |

### Response (`201 Created`) — `PatientQuickRegisterResponse`

```json
{
  "id": "uuid",
  "full_name": "Ali Hassan",
  "phone": "03001234567",
  "gender": "male",
  "cnic": "TEMP-A1B2C3D4E5",
  "is_temp_cnic": true,
  "date_of_birth": null,
  "email": null,
  "phone_secondary": null,
  "residential_address": null,
  "city": null,
  "occupation": null,
  "referred_by": null,
  "medical_history": null,
  "drug_allergies": null,
  "family_history": null,
  "current_medications": null,
  "notes": null,
  "payment_status": false,
  "created_date": "2026-03-08",
  "last_visit_date": null,
  "is_active": true,
  "age": null,
  "doctor": {
    "id": "uuid",
    "full_name": "Dr. Ahmed",
    "specialization": "Homeopathy",
    "phone": "...",
    "clinic_name": "...",
    "clinic_address": "..."
  }
}
```

### Error Responses

| Status         | When                                                   |
| -------------- | ------------------------------------------------------ |
| `409 Conflict` | Patient with same phone already exists for this doctor |
| `400`          | DB validation failure                                  |

---

## API 4: `GET /api/v1/patients/onsite/{patient_id}`

**Tag:** `Onsite Patient Management`  
**Auth:** Bearer token

Retrieve a single patient's full record for review/edit during onsite consultation.

### Path Parameters

| Param        | Type |
| ------------ | ---- |
| `patient_id` | UUID |

### Response (`200 OK`) — `PatientQuickRegisterResponse`

Same shape as the quick-register response above.

### Error Responses

| Status | When                                  |
| ------ | ------------------------------------- |
| `404`  | Patient not found                     |
| `403`  | Patient belongs to a different doctor |

---

## DB Models

### `sequence_counter` table

Thread-safe counter for generating sequential case/prescription numbers. Uses `SELECT FOR UPDATE` to prevent race conditions.

| Column             | Type       | Notes                          |
| ------------------ | ---------- | ------------------------------ |
| `id`               | UUID       | PK                             |
| `counter_type`     | string(50) | `"case"` or `"prescription"`   |
| `prefix`           | string(50) | e.g. `"C-MAR26"`, `"RX-MAR26"` |
| `current_sequence` | int        | Current counter value          |
| `created_at`       | datetime   |                                |
| `updated_at`       | datetime   |                                |

Composite unique index on `(counter_type, prefix)`.

### `onsite_consultation_audit` table

Audit trail linking all resources created in a single consultation.

| Column            | Type                   | Notes                      |
| ----------------- | ---------------------- | -------------------------- |
| `id`              | UUID                   | PK                         |
| `patient_id`      | UUID FK → patient      |                            |
| `appointment_id`  | UUID FK → appointment  |                            |
| `case_id`         | UUID FK → patient_case |                            |
| `prescription_id` | UUID FK → prescription | Nullable                   |
| `follow_up_id`    | UUID FK → follow_up    | Nullable                   |
| `doctor_id`       | UUID FK → user         |                            |
| `created_at`      | datetime               |                            |
| `idempotency_key` | string(255)            | Nullable, indexed          |
| `is_new_patient`  | bool                   |                            |
| `patient_phone`   | string(20)             | For quick duplicate lookup |

---

## Typical Reception Desk Workflow

```
1. Patient walks in
2. Staff searches:       GET  /patients/onsite/search?phone=03001234567
3. If not found:         POST /patients/onsite/quick-register
4. Doctor consultation:  POST /consultations/onsite  (patient phone auto-matches)
5. All records (appointment, case, prescription, follow-up) created atomically
```

---

## Example: Minimal Request

```json
POST /api/v1/consultations/onsite

{
  "patient": {
    "full_name": "Ali Hassan",
    "phone": "03001234567"
  },
  "appointment": {
    "consultation_type": "first"
  },
  "case": {
    "chief_complaint_patient": "Severe headache since 3 days",
    "chief_complaint_duration": "3 days"
  }
}
```

## Example: Full Request (all 5 steps)

```json
POST /api/v1/consultations/onsite
Header: X-Idempotency-Key: some-uuid

{
  "patient": {
    "full_name": "Ali Hassan",
    "phone": "03001234567",
    "gender": "male",
    "city": "Karachi",
    "cnic": "42101-1234567-1"
  },
  "appointment": {
    "consultation_type": "first",
    "duration_minutes": 45,
    "reason": "Headache and fatigue"
  },
  "case": {
    "chief_complaint_patient": "Severe headache since 3 days",
    "chief_complaint_duration": "3 days",
    "physicals": "BP 130/85, Pulse 78",
    "noted_complaint_doctor": "Tension-type headache",
    "peculiar_symptoms": "Worse in mornings",
    "causation": "Stress and poor sleep"
  },
  "prescription": {
    "prescription_type": "constitutional",
    "dosage": "3 times daily",
    "prescription_duration": "14 days",
    "duration_days": 14,
    "dietary_restrictions": "Avoid coffee",
    "avoidance": "Avoid loud environments",
    "medicines": [
      {
        "medicine_id": "a1b2c3d4-e5f6-...",
        "quantity_prescribed": "10 drops",
        "frequency": "TDS"
      },
      {
        "new_medicine": {
          "name": "Belladonna",
          "potency": "30",
          "potency_scale": "C",
          "form": "Globules"
        },
        "quantity_prescribed": "5 drops",
        "frequency": "BD"
      }
    ]
  },
  "follow_up": {
    "next_follow_up_date": "2026-03-22",
    "interval_days": 14
  }
}
```

## Example: Full Response

```json
{
  "patient_id": "d4e5f6a7-b8c9-...",
  "patient_full_name": "Ali Hassan",
  "is_new_patient": true,
  "appointment_id": "a1b2c3d4-...",
  "appointment_date": "2026-03-08",
  "appointment_time": "14:32:00",
  "consultation_type": "first",
  "appointment_status": "onsite",
  "case_id": "e5f6a7b8-...",
  "case_number": "C-MAR26-017",
  "case_date": "2026-03-08",
  "prescription_id": "f6a7b8c9-...",
  "prescription_number": "RX-MAR26-001",
  "prescription_date": "2026-03-08",
  "follow_up_id": "a7b8c9d0-...",
  "next_follow_up_date": "2026-03-22",
  "follow_up_status": "scheduled",
  "created_at": "2026-03-08T14:32:00+00:00"
}
```
