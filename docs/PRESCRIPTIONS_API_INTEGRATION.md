# Prescriptions API Integration Guide (Frontend)

This document is based on the **current backend implementation** in:

- `routes/prescriptions.py`
- `models/prescriptions_model.py`
- `models/medicines_model.py`

Use this guide to align frontend request/response handling exactly with backend behavior.

---

## 1) Auth, Base Path, and Access Rules

- **Auth required:** `DoctorOAuth2` bearer token (doctor/staff/admin token type).
- **Role requirement in route logic:** `current_user.is_doctor == True`
  - If not doctor: `403` with `"Only doctors can ... prescriptions"`
- **Router prefix:** `/prescriptions`
- **Global API prefix:** `settings.API_V1_STR` (environment dependent)
  - Final path is usually: `{API_V1_STR}/prescriptions/...`

---

## 2) Core Data Contracts

### Prescription object (`PrescriptionPublic`)

```json
{
  "id": "uuid",
  "case_id": "uuid",
  "doctor_id": "uuid",
  "prescription_date": "YYYY-MM-DD",
  "prescription_number": "RX-2026-02-001",
  "prescription_type": "Constitutional",
  "dosage": "4 pills twice daily",
  "prescription_duration": "15 days",
  "instructions": "Take before meals",
  "follow_up_advice": "Review after 2 weeks",
  "dietary_restrictions": "Avoid spicy food",
  "avoidance": "Avoid coffee",
  "notes": "Optional note",
  "status": "open",
  "patient_name": "Ali Raza",
  "case_number": "CASE-00012",
  "medicines": [
    {
      "id": "uuid",
      "medicine_id": "uuid",
      "quantity_prescribed": "30 tablets",
      "frequency": "BD",
      "medicine": {
        "id": "uuid",
        "name": "Arnica",
        "potency": "30",
        "form": "Globules"
      }
    }
  ]
}
```

### List response (`PrescriptionsPublic`)

```json
{
  "data": ["...PrescriptionPublic"],
  "count": 42
}
```

### Delete response (`Message`)

```json
{
  "message": "Prescription deleted successfully"
}
```

---

## 3) Medicines Input Modes (Create/Update)

Each medicine item in request supports **one of two modes**:

### Mode A: Existing medicine

```json
{
  "medicine_id": "uuid",
  "quantity_prescribed": "30 tablets",
  "frequency": "BD"
}
```

### Mode B: Quick-add medicine

```json
{
  "new_medicine": {
    "name": "New Remedy",
    "potency": "200",
    "potency_scale": "C",
    "form": "Globules",
    "manufacturer": "SCHWABE",
    "description": "Optional"
  },
  "quantity_prescribed": "20 globules",
  "frequency": "OD"
}
```

Validation in model:

- Must provide **exactly one** of:
  - `medicine_id`
  - `new_medicine`
- If both missing or both provided -> validation error (422).

Quick-add behavior:

- Backend checks duplicate by: `name + potency + potency_scale + form`
- If duplicate exists, existing medicine is reused
- If not found, medicine is created with:
  - `created_by_doctor_id = current_user.id`
  - `is_verified = false`

---

## 4) Enum-Validated Fields

Backend validates these through dynamic enum service:

- `prescription_type` must be valid in `PrescriptionType`
- `status` must be valid in `PrescriptionStatus`
- Each medicine `frequency` must be valid in `RepetitionEnum` (**on create only**)

Frontend should fetch valid values from:

- `GET /enums/doctor/PrescriptionType`
- `GET /enums/doctor/PrescriptionStatus`
- `GET /enums/doctor/RepetitionEnum`

---

## 5) Endpoints

## 5.1 GET `/prescriptions/`

### Query params

- `skip` (int, default `0`, min `0`)
- `limit` (int, default `100`, min `1`, max `1000`)
- `case_id` (uuid, optional)
- `from_date` (date `YYYY-MM-DD`, optional)
- `to_date` (date `YYYY-MM-DD`, optional)

### Behavior

- Returns prescriptions for current doctor only
- Ordered by `prescription_date DESC`
- If `case_id` is provided and not owned by doctor -> `404 Case not found`

### Success response

- `200` with `PrescriptionsPublic`

### Common errors

- `403` non-doctor user
- `404` case not found (when filtering by case)

---

## 5.2 GET `/prescriptions/{prescription_id}`

### Behavior

- Fetch single prescription with medicines + patient/case details
- Must belong to current doctor

### Success response

- `200` with `PrescriptionPublic`

### Common errors

- `403` non-doctor user
- `403` prescription belongs to another doctor
- `404` prescription not found

---

## 5.3 POST `/prescriptions/`

### Request body (`PrescriptionCreate`)

```json
{
  "case_id": "uuid",
  "prescription_type": "Constitutional",
  "dosage": "4 pills twice daily",
  "prescription_duration": "15 days",
  "instructions": "Take before meals",
  "follow_up_advice": "Review after 2 weeks",
  "dietary_restrictions": "Avoid spicy food",
  "avoidance": "Avoid coffee",
  "notes": "Optional note",
  "status": "open",
  "medicines": [
    {
      "medicine_id": "uuid",
      "quantity_prescribed": "30 tablets",
      "frequency": "BD"
    },
    {
      "new_medicine": {
        "name": "Belladonna",
        "potency": "30",
        "potency_scale": "C",
        "form": "Globules",
        "manufacturer": "SCHWABE",
        "description": "Optional"
      },
      "quantity_prescribed": "20 globules",
      "frequency": "OD"
    }
  ]
}
```

### Backend behavior

- Verifies case belongs to current doctor
- Validates enums:
  - `PrescriptionType`
  - optional `PrescriptionStatus`
  - each medicine `frequency` against `RepetitionEnum`
- Generates `prescription_number` format:
  - `RX-YYYY-MM-###` (monthly sequence per doctor)

### Success response

- `200` with `PrescriptionPublic`

### Common errors

- `403` non-doctor user
- `404` case not found / not owned
- `404` referenced `medicine_id` not found
- `400` invalid enum value
- `422` schema validation issue

---

## 5.4 PUT `/prescriptions/{prescription_id}`

### Request body (`PrescriptionUpdate`)

All fields optional:

```json
{
  "dosage": "Updated dosage",
  "prescription_duration": "20 days",
  "instructions": "Updated instructions",
  "follow_up_advice": "Updated follow-up",
  "dietary_restrictions": "Updated restrictions",
  "avoidance": "Updated avoidance",
  "notes": "Updated notes",
  "status": "completed",
  "medicines": [
    {
      "medicine_id": "uuid",
      "quantity_prescribed": "60 tablets",
      "frequency": "BD"
    }
  ]
}
```

### Backend behavior

- Confirms prescription exists and belongs to doctor
- Validates only `status` enum (`PrescriptionStatus`)
- If `medicines` is provided:
  - Deletes all old prescription-medicine rows
  - Recreates rows from provided list (replace-all semantics)

### Important implementation notes (as currently coded)

1. `prescription_type` is **not updatable** in this endpoint.
2. `frequency` is accepted in request schema but **not persisted on update** (new rows are inserted without `frequency`).
3. Frequency enum (`RepetitionEnum`) is validated on create, but **not validated on update**.

### Success response

- `200` with updated `PrescriptionPublic`

### Common errors

- `403` non-doctor user / unauthorized ownership
- `404` prescription not found
- `404` referenced `medicine_id` not found
- `400` invalid status enum
- `422` schema validation issue

---

## 5.5 DELETE `/prescriptions/{prescription_id}`

### Behavior

- Deletes prescription if owned by current doctor

### Success response

- `200`

```json
{
  "message": "Prescription deleted successfully"
}
```

### Common errors

- `403` non-doctor user / unauthorized ownership
- `404` prescription not found

---

## 5.6 GET `/prescriptions/{prescription_id}/print`

### Behavior

Returns print-friendly payload with:

- raw `prescription`
- `patient`
- transformed `medicines` list
- `doctor`
- `print_date`

### Success response shape (representative)

```json
{
  "prescription": { "...prescription model...": "..." },
  "patient": { "...patient model...": "..." },
  "medicines": [
    {
      "name": "Arnica",
      "potency": "30",
      "form": "Globules",
      "quantity_prescribed": "30 tablets",
      "dosage": "4 pills twice daily",
      "prescription_duration": "15 days",
      "instructions": "Take before meals"
    }
  ],
  "doctor": { "...current user model...": "..." },
  "print_date": "2026-02-21"
}
```

### Common errors

- `403` non-doctor user
- `404` prescription not found / not owned

---

## 6) Frontend Integration Checklist

1. Always send doctor OAuth token for all `/prescriptions/*` calls.
2. Fetch enum options from `/enums/doctor/*` for dropdowns instead of hardcoding.
3. For create/update medicines, send exactly one of `medicine_id` or `new_medicine`.
4. On PUT with `medicines`, send the full final list (backend replaces all old items).
5. If your UI edits frequency on update, note backend currently does not persist it in PUT.
6. Handle response status codes `400`, `403`, `404`, `422` with user-friendly messages.

---

## 7) Suggested Frontend DTO Notes

- Treat `patient_name` and `case_number` as optional in responses.
- Treat `instructions`, `follow_up_advice`, `dietary_restrictions`, `avoidance`, `notes` as nullable.
- Keep `prescription_date` as ISO date string (`YYYY-MM-DD`).
- For safety, make print endpoint response loosely typed (`unknown`/`any` mapped carefully), because it returns model objects directly, not strict `PrescriptionPublic`.
