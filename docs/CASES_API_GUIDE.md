# Cases API Guide

**Module:** Patient Cases Management  
**Version:** 1.0.0  
**Last Updated:** February 12, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

The Cases API lets doctors create, read, update, and delete patient cases. Case fields are validated against the doctor's preferences (standard + custom fields). Case numbers are generated automatically in format `C-MMMYY-###` (example: `C-FEB26-001`).

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
  "detail": "Only doctors can access cases"
}
```

---

## Data Models

### PatientCaseCreate

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440010",
  "chief_complaint_patient": "Headache for 3 days",
  "duration": "3 days",
  "physicals": "BP 120/80",
  "noted_complaint_doctor": "Mild migraine",
  "peculiar_symptoms": "Sensitivity to light",
  "causation": "Lack of sleep",
  "lab_reports": "CBC normal",
  "custom_fields": {
    "family_history": "No known history",
    "dietary_notes": "High caffeine intake"
  }
}
```

### PatientCaseUpdate

All fields are optional.

```json
{
  "duration": "4 days",
  "noted_complaint_doctor": "Moderate migraine",
  "custom_fields": {
    "dietary_notes": "Reduced caffeine"
  }
}
```

### PatientCasePublic

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440010",
  "case_date": "2026-02-12",
  "case_number": "C-FEB26-001",
  "chief_complaint_patient": "Headache for 3 days",
  "duration": "3 days",
  "physicals": "BP 120/80",
  "noted_complaint_doctor": "Mild migraine",
  "peculiar_symptoms": "Sensitivity to light",
  "causation": "Lack of sleep",
  "lab_reports": "CBC normal",
  "custom_fields": {
    "family_history": "No known history"
  },
  "patient_name": "Ahmed Ali"
}
```

### CasesPublic

```json
{
  "data": [
    { "id": "...", "case_number": "C-FEB26-001", "case_date": "2026-02-12" }
  ],
  "count": 1
}
```

---

## API Endpoints

### 1. List Cases (Doctor)

**Endpoint:** `GET /api/v1/cases/`

**Query Parameters:**

- `skip` (int, default 0)
- `limit` (int, default 100)
- `patient_id` (UUID, optional)
- `from_date` (date, optional)
- `to_date` (date, optional)

**Response (200 OK):** CasesPublic

---

### 2. Get Case by ID (Doctor)

**Endpoint:** `GET /api/v1/cases/{case_id}`

**Response (200 OK):** PatientCasePublic

**Errors:**

- 404: Case not found
- 403: Not authorized to access this case

---

### 3. Create Case (Doctor)

**Endpoint:** `POST /api/v1/cases/`

**Request Body:** PatientCaseCreate

**Response (201 Created):** PatientCasePublic

**Important Validation:**

- Patient must belong to doctor
- If `appointment_id` is provided, it must belong to same doctor and patient
- Required fields are enforced based on doctor preferences
- Custom fields are filtered to only enabled custom fields

**Error Examples:**

```json
{
  "detail": "Patient not found"
}
```

```json
{
  "detail": "Appointment does not belong to this patient"
}
```

```json
{
  "detail": "Required field 'Chief Complaint (Patient's Words)' is missing or empty"
}
```

---

### 4. Update Case (Doctor)

**Endpoint:** `PUT /api/v1/cases/{case_id}`

**Request Body:** PatientCaseUpdate

**Response (200 OK):** PatientCasePublic

**Validation:** Required fields are re-checked against doctor preferences.

---

### 5. Delete Case (Doctor)

**Endpoint:** `DELETE /api/v1/cases/{case_id}`

**Response (200 OK):**

```json
{ "message": "Case deleted successfully" }
```

---

### 6. Get Case Prescription (Doctor)

**Endpoint:** `GET /api/v1/cases/{case_id}/prescription`

**Response (200 OK):** Prescription (database model)

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "case_id": "550e8400-e29b-41d4-a716-446655440100",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "prescription_date": "2026-02-12",
  "prescription_number": "P-FEB26-001",
  "prescription_type": "chronic",
  "dosage": "2 tablets",
  "duration": "7 days",
  "instructions": "After meals",
  "follow_up_advice": "Review in 1 week",
  "dietary_restrictions": "Avoid caffeine",
  "avoidance": "No late nights",
  "notes": "Hydration advised"
}
```

**Errors:**

- 404: No prescription found for this case
- 404: Case not found

---

## Notes

- Case numbers are auto-generated on create and are unique.
- Custom fields are validated and filtered using doctor preferences.
- For required fields, the backend checks the doctor’s enabled preference settings.

---

## Version History

| Version | Date         | Changes                         |
| ------- | ------------ | ------------------------------- |
| 1.0.0   | Feb 12, 2026 | Initial cases API documentation |
