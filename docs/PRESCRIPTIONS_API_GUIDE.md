# Prescriptions API Guide

**Module:** Prescription Management  
**Version:** 1.0.0  
**Last Updated:** February 12, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

The Prescriptions API lets doctors create, read, update, delete, and print prescriptions. Creation and updates adjust medicine stock quantities and validate availability in stock.

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
  "detail": "Only doctors can access prescriptions"
}
```

---

## Enums

### PrescriptionType

```
"acute" | "chronic" | "constitutional" | "intercurrent" | "nosode" | "sarcode" | "tautode"
```

---

## Data Models

### PrescriptionMedicineCreate

```json
{
  "medicine_id": "550e8400-e29b-41d4-a716-446655440010",
  "stock_id": "550e8400-e29b-41d4-a716-446655440100",
  "quantity": 2
}
```

### PrescriptionCreate

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_type": "chronic",
  "dosage": "2 tablets",
  "duration": "7 days",
  "instructions": "After meals",
  "follow_up_advice": "Review in 1 week",
  "dietary_restrictions": "Avoid caffeine",
  "avoidance": "No late nights",
  "notes": "Hydration advised",
  "medicines": [
    {
      "medicine_id": "550e8400-e29b-41d4-a716-446655440010",
      "stock_id": "550e8400-e29b-41d4-a716-446655440100",
      "quantity": 2
    }
  ]
}
```

### PrescriptionPublic

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "prescription_date": "2026-02-12",
  "prescription_number": "RX-2026-02-001",
  "prescription_type": "chronic",
  "dosage": "2 tablets",
  "duration": "7 days",
  "instructions": "After meals",
  "follow_up_advice": "Review in 1 week",
  "dietary_restrictions": "Avoid caffeine",
  "avoidance": "No late nights",
  "notes": "Hydration advised",
  "medicines": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "medicine_id": "550e8400-e29b-41d4-a716-446655440010",
      "stock_used_id": "550e8400-e29b-41d4-a716-446655440100",
      "quantity_used": 2,
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "form": "globules"
    }
  ],
  "patient_name": "Ahmed Ali",
  "case_number": "C-FEB26-001"
}
```

### PrescriptionsPublic

```json
{
  "data": [{ "id": "...", "prescription_number": "RX-2026-02-001" }],
  "count": 1
}
```

---

## API Endpoints

### 1. List Prescriptions (Doctor)

**Endpoint:** `GET /api/v1/prescriptions/`

**Query Parameters:**

- `skip` (int, default 0)
- `limit` (int, default 100, max 1000)
- `case_id` (UUID, optional)
- `from_date` (date, optional)
- `to_date` (date, optional)

**Response (200 OK):** PrescriptionsPublic

---

### 2. Get Prescription by ID (Doctor)

**Endpoint:** `GET /api/v1/prescriptions/{prescription_id}`

**Response (200 OK):** PrescriptionPublic

**Errors:**

- 404: Prescription not found
- 403: Not authorized to access this prescription

---

### 3. Create Prescription (Doctor)

**Endpoint:** `POST /api/v1/prescriptions/`

**Request Body:** PrescriptionCreate

**Response (201 Created):** PrescriptionPublic

**Validations:**

- Case must belong to the doctor
- Medicine must exist
- Stock item must belong to the doctor
- Sufficient stock quantity is required

**Common Error (400):**

```json
{
  "detail": "Insufficient stock for Arnica Montana. Available: 1, Requested: 2"
}
```

**Common Error (404):**

```json
{
  "detail": "Stock item 550e8400-e29b-41d4-a716-446655440100 not found or not accessible"
}
```

---

### 4. Update Prescription (Doctor)

**Endpoint:** `PUT /api/v1/prescriptions/{prescription_id}`

**Request Body:** PrescriptionCreate (full payload including medicines)

**Response (200 OK):** PrescriptionPublic

**Notes:**

- The backend restores old stock quantities, then applies new medicine usage.
- Update requires full medicine list (not partial).

---

### 5. Delete Prescription (Doctor)

**Endpoint:** `DELETE /api/v1/prescriptions/{prescription_id}`

**Response (200 OK):**

```json
{ "message": "Prescription deleted successfully" }
```

**Notes:**

- Stock quantities are restored before deletion.

---

### 6. Print Prescription (Doctor)

**Endpoint:** `GET /api/v1/prescriptions/{prescription_id}/print`

**Response (200 OK):**

```json
{
  "prescription": { "id": "...", "prescription_number": "RX-2026-02-001" },
  "patient": { "id": "...", "full_name": "Ahmed Ali" },
  "medicines": [
    {
      "name": "Arnica Montana",
      "potency": "30",
      "form": "globules",
      "dosage": "2 tablets",
      "duration": "7 days",
      "instructions": "After meals"
    }
  ],
  "doctor": { "id": "...", "full_name": "Dr. Noor" },
  "print_date": "2026-02-12"
}
```

---

## Notes

- Prescription number format: `RX-YYYY-MM-###` (sequence per doctor per month).
- Create and update adjust stock quantities automatically.

---

## Version History

| Version | Date         | Changes                                 |
| ------- | ------------ | --------------------------------------- |
| 1.0.0   | Feb 12, 2026 | Initial prescriptions API documentation |
