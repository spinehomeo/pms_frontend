# Prescriptions API Guide

**Module:** Prescription Management  
**Version:** 2.0.0 (Updated)  
**Last Updated:** February 17, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

The Prescriptions API lets doctors create, read, update, delete, and print prescriptions. Includes **quick-add medicine capability** - add new medicines on-the-fly while creating prescriptions without leaving the form. Supports two modes:

1. **Use existing medicine** from global catalog (most common)
2. **Quick-add new medicine** instantly if not in catalog (saves time for new medicines)

---

## Authentication & Authorization

- **Type:** OAuth2 Password Bearer (DoctorOAuth2)
- **Scope:** Doctor (doctor role required)
- **Login Endpoint:** `POST /login/access-token`

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
  "detail": "Only doctors can create prescriptions"
}
```

---

## Enums

### PrescriptionType

```
"Constitutional" | "Classical" | "Inter Current" | "Pure Bio Chemic" | "Mother Tincture" | "Patent"
```

**Value Descriptions:**

- CONSTITUTIONAL = "Constitutional"
- CLASSICAL = "Classical"
- INTER_CURRENT = "Inter Current"
- PURE_BIOCHEMIC = "Pure Bio Chemic"
- MOTHER_TINCTURE = "Mother Tincture"
- PATENT = "Patent"

### RepetitionEnum (for dosage frequency)

```
"OD" | "BD" | "TDS" | "Once Weekly" | "Once in 10 Days" | "Fortnightly" | "Monthly"
```

**Value Descriptions:**

- OD = "OD" (Once Daily)
- BD = "BD" (Twice Daily)
- TDS = "TDS" (Three Times Daily)
- ONCE_WEEKLY = "Once Weekly"
- ONCE_10_DAYS = "Once in 10 Days"
- FORTNIGHTLY = "Fortnightly"
- MONTHLY = "Monthly"

---

## Data Models

### QuickAddMedicineData (for quick-add)

Use this to quickly add a new medicine to the global catalog while creating a prescription:

```json
{
  "name": "Arnica Montana",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe",
  "description": "Used for trauma and bruising"
}
```

**Fields:**

- `name` (string, required): Medicine name (max 255 chars)
- `potency` (string, required): Potency (e.g., "30", "200", "1M")
- `potency_scale` (string, default="C"): One of "C", "X", "Q"
- `form` (string, default="Globules"): Medicine form
- `manufacturer` (string, optional): Manufacturer name
- `description` (string, optional): Medicine description

### PrescriptionMedicineCreate

Add medicines to prescription. **Supports two modes:**

**Mode 1: Use existing medicine**

```json
{
  "medicine_id": 1,
  "quantity_prescribed": "2 tablets"
}
```

**Mode 2: Quick-add new medicine**

```json
{
  "new_medicine": {
    "name": "Belladonna",
    "potency": "30",
    "potency_scale": "C",
    "form": "Globules",
    "manufacturer": "Reckweg"
  },
  "quantity_prescribed": "1 tablet"
}
```

**Fields:**

- `medicine_id` (int, optional): Use existing medicine from catalog
- `new_medicine` (object, optional): Quick-add new medicine (if not in catalog)
- `quantity_prescribed` (string, optional): Dosage info (e.g., "2 tablets", "10 drops")

**Important:**

- Provide **either** `medicine_id` **OR** `new_medicine`, not both
- If medicine already exists in catalog, it will be reused instead of creating duplicate
- New medicines are added to global catalog with `is_verified: false`

### PrescriptionCreate

Create a new prescription with medicines:

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets twice daily",
  "prescription_duration": "14 days",
  "instructions": "Take after breakfast and dinner",
  "follow_up_advice": "Review in 2 weeks",
  "dietary_restrictions": "Avoid caffeine and chocolate",
  "avoidance": "No late nights, stress management important",
  "notes": "Patient also advised to increase water intake",
  "medicines": [
    {
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets"
    },
    {
      "new_medicine": {
        "name": "Sulphur",
        "potency": "30",
        "potency_scale": "C",
        "form": "Globules",
        "manufacturer": "Schwabe"
      },
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

**Required Fields:**

- `case_id` (UUID): Patient case ID
- `medicines` (array): At least one medicine

**Optional Fields:**

- `prescription_type` (PrescriptionType, default="Constitutional"): Type of prescription
- `dosage` (string): How to take (e.g., "2 tablets twice daily")
- `prescription_duration` (string): How long (e.g., "14 days")
- `instructions` (string): Additional instructions
- `follow_up_advice` (string): Next steps
- `dietary_restrictions` (string): What to avoid eating
- `avoidance` (string): Lifestyle restrictions
- `notes` (string): Additional notes

### PrescriptionUpdate

Update prescription fields. All fields optional:

```json
{
  "dosage": "1 tablet three times daily",
  "prescription_duration": "7 days",
  "instructions": "After meals",
  "follow_up_advice": "Review in 1 week",
  "dietary_restrictions": "Avoid spicy food",
  "avoidance": "No stressful activities",
  "notes": "Monitor blood pressure",
  "medicines": [
    {
      "medicine_id": 2,
      "quantity_prescribed": "2 tablets"
    }
  ]
}
```

**Notes:**

- All fields are optional
- Only include fields you want to update
- If updating medicines, provide full list (replaces all existing medicines)

### PrescriptionMedicinePublic

Single medicine in prescription (response):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440300",
  "medicine_id": 1,
  "quantity_prescribed": "2 tablets",
  "medicine_name": "Arnica Montana",
  "potency": "30",
  "form": "Globules"
}
```

### PrescriptionPublic

Single prescription (response):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "prescription_date": "2026-02-17",
  "prescription_number": "RX-2026-02-001",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets twice daily",
  "prescription_duration": "14 days",
  "instructions": "Take after breakfast and dinner",
  "follow_up_advice": "Review in 2 weeks",
  "dietary_restrictions": "Avoid caffeine and chocolate",
  "avoidance": "No late nights, stress management important",
  "notes": "Patient also advised to increase water intake",
  "medicines": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets",
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "form": "Globules"
    }
  ],
  "patient_name": "Ahmed Ali",
  "case_number": "C-FEB26-001"
}
```

### PrescriptionsPublic

List of prescriptions (response):

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "prescription_number": "RX-2026-02-001",
      "prescription_date": "2026-02-17",
      "patient_name": "Ahmed Ali",
      "medicines": [...]
    }
  ],
  "count": 15
}
```

---

## API Endpoints

### 1. List Prescriptions

**Endpoint:** `GET /prescriptions/`

**Authentication:** DoctorOAuth2

**Query Parameters:**

- `skip` (int, default=0): Number of records to skip (pagination)
- `limit` (int, default=100, max=1000): Max records to return
- `case_id` (UUID, optional): Filter by patient case
- `from_date` (date, optional): Filter prescriptions from this date (YYYY-MM-DD format)
- `to_date` (date, optional): Filter prescriptions until this date (YYYY-MM-DD format)

**Response (200 OK):** PrescriptionsPublic

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "case_id": "550e8400-e29b-41d4-a716-446655440001",
      "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
      "prescription_date": "2026-02-17",
      "prescription_number": "RX-2026-02-001",
      "prescription_type": "Constitutional",
      "dosage": "2 tablets twice daily",
      "prescription_duration": "14 days",
      "instructions": "Take after meals",
      "follow_up_advice": "Review in 2 weeks",
      "dietary_restrictions": "Avoid caffeine",
      "avoidance": "No late nights",
      "notes": "Hydration advised",
      "medicines": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440300",
          "medicine_id": 1,
          "quantity_prescribed": "2 tablets",
          "medicine_name": "Arnica Montana",
          "potency": "30",
          "form": "Globules"
        }
      ],
      "patient_name": "Ahmed Ali",
      "case_number": "C-FEB26-001"
    }
  ],
  "count": 15
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access prescriptions
- 404: Case not found (if case_id provided)

**Example Requests:**

```bash
# Get all prescriptions (basic)
GET /prescriptions/

# Get last 10 prescriptions
GET /prescriptions/?skip=0&limit=10

# Get prescriptions for specific case
GET /prescriptions/?case_id=550e8400-e29b-41d4-a716-446655440001

# Get prescriptions from date range
GET /prescriptions/?from_date=2026-02-01&to_date=2026-02-28

# Combine filters
GET /prescriptions/?case_id=...&from_date=2026-02-01&limit=50
```

---

### 2. Get Prescription by ID

**Endpoint:** `GET /prescriptions/{prescription_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `prescription_id` (UUID, required): Prescription ID

**Response (200 OK):** PrescriptionPublic

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440002",
  "prescription_date": "2026-02-17",
  "prescription_number": "RX-2026-02-001",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets twice daily",
  "prescription_duration": "14 days",
  "instructions": "Take after meals",
  "follow_up_advice": "Review in 2 weeks",
  "dietary_restrictions": "Avoid caffeine",
  "avoidance": "No late nights",
  "notes": "Hydration advised",
  "medicines": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets",
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "form": "Globules"
    }
  ],
  "patient_name": "Ahmed Ali",
  "case_number": "C-FEB26-001"
}
```

**Errors:**

- 401: Not authenticated
- 403: Not authorized to access this prescription
- 404: Prescription not found

---

### 3. Create Prescription

**Endpoint:** `POST /prescriptions/`

**Authentication:** DoctorOAuth2

**Request Body:** PrescriptionCreate

**Example 1: Using Existing Medicines**

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets twice daily",
  "prescription_duration": "14 days",
  "instructions": "Take after breakfast and dinner",
  "follow_up_advice": "Review in 2 weeks",
  "medicines": [
    {
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets"
    },
    {
      "medicine_id": 5,
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

**Example 2: Quick-Add New Medicines**

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets daily",
  "prescription_duration": "7 days",
  "medicines": [
    {
      "new_medicine": {
        "name": "Sulphur",
        "potency": "30",
        "potency_scale": "C",
        "form": "Globules",
        "manufacturer": "Schwabe"
      },
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

**Example 3: Mix of Existing & New Medicines**

```json
{
  "case_id": "550e8400-e29b-41d4-a716-446655440001",
  "prescription_type": "Constitutional",
  "dosage": "As prescribed",
  "prescription_duration": "14 days",
  "medicines": [
    {
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets"
    },
    {
      "new_medicine": {
        "name": "Phosphorus",
        "potency": "200",
        "potency_scale": "C",
        "form": "Globules"
      },
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

**Response (201 Created):** PrescriptionPublic

**Validations:**

- Case must belong to current doctor
- At least one medicine required
- Either `medicine_id` OR `new_medicine` for each medicine (not both)
- If medicine already exists in catalog (by name+potency+potency_scale+form), it's reused

**Error Examples:**

Existing medicine not found:

```json
{
  "detail": "Medicine with ID 999 not found"
}
```

Case not found:

```json
{
  "detail": "Case not found"
}
```

Missing or invalid medicine data:

```json
{
  "detail": "Either medicine_id or new_medicine must be provided"
}
```

**Notes:**

- Prescription number auto-generated in format: `RX-YYYY-MM-###` (sequence per doctor per month)
- New medicines added to global catalog with `is_verified: false`
- If quick-adding duplicate medicine, system finds existing and reuses it
- Perfect for quick prescription creation without leaving the form

---

### 4. Update Prescription

**Endpoint:** `PUT /prescriptions/{prescription_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `prescription_id` (UUID, required): Prescription ID

**Request Body:** PrescriptionUpdate (all fields optional)

**Example 1: Update Only Dosage & Duration**

```json
{
  "dosage": "1 tablet three times daily",
  "prescription_duration": "21 days"
}
```

**Example 2: Update Medicines**

```json
{
  "medicines": [
    {
      "medicine_id": 2,
      "quantity_prescribed": "2 tablets"
    },
    {
      "new_medicine": {
        "name": "Natrum Sulphuricum",
        "potency": "30",
        "potency_scale": "C",
        "form": "Globules"
      },
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

**Example 3: Full Update**

```json
{
  "dosage": "2 tablets daily",
  "prescription_duration": "7 days",
  "instructions": "After meals with water",
  "follow_up_advice": "Review in 1 week",
  "dietary_restrictions": "Avoid spicy food and alcohol",
  "avoidance": "No stressful situations",
  "notes": "Monitor sleep patterns",
  "medicines": [
    {
      "medicine_id": 1,
      "quantity_prescribed": "2 tablets"
    }
  ]
}
```

**Response (200 OK):** PrescriptionPublic

**Errors:**

- 401: Not authenticated
- 403: Not authorized to update this prescription
- 404: Prescription not found
- 400: Invalid medicine data

**Notes:**

- All fields optional - only include what you want to change
- When updating medicines, provide complete new list (replaces all existing)
- Same validation rules as create apply to new medicines
- Supports quick-add for new medicines just like create

---

### 5. Delete Prescription

**Endpoint:** `DELETE /prescriptions/{prescription_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `prescription_id` (UUID, required): Prescription ID

**Response (200 OK):**

```json
{
  "message": "Prescription deleted successfully"
}
```

**Errors:**

- 401: Not authenticated
- 403: Not authorized to delete this prescription
- 404: Prescription not found

---

### 6. Print Prescription

**Endpoint:** `GET /prescriptions/{prescription_id}/print`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `prescription_id` (UUID, required): Prescription ID

**Response (200 OK):**

```json
{
  "prescription": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "prescription_number": "RX-2026-02-001",
    "prescription_date": "2026-02-17",
    "prescription_type": "Constitutional",
    "dosage": "2 tablets twice daily",
    "prescription_duration": "14 days",
    "instructions": "Take after breakfast and dinner",
    "follow_up_advice": "Review in 2 weeks",
    "dietary_restrictions": "Avoid caffeine",
    "avoidance": "No late nights",
    "notes": "Hydration advised"
  },
  "patient": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "full_name": "Ahmed Ali",
    "age": 45,
    "gender": "M",
    "phone": "9876543210"
  },
  "medicines": [
    {
      "name": "Arnica Montana",
      "potency": "30",
      "form": "Globules",
      "quantity_prescribed": "2 tablets",
      "dosage": "2 tablets twice daily",
      "prescription_duration": "14 days",
      "instructions": "Take after breakfast and dinner"
    },
    {
      "name": "Sulphur",
      "potency": "30",
      "form": "Globules",
      "quantity_prescribed": "1 tablet",
      "dosage": "2 tablets twice daily",
      "prescription_duration": "14 days",
      "instructions": "Take after breakfast and dinner"
    }
  ],
  "doctor": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "full_name": "Dr. Noor Shaikh",
    "qualifications": "BHMS, MD"
  },
  "print_date": "2026-02-17"
}
```

**Errors:**

- 401: Not authenticated
- 403: Not authorized to print this prescription
- 404: Prescription not found

**Use Cases:**

- Generate PDF for patient
- Print directly to receipt printer
- Send via email as attachment
- Display in print preview modal

---

## ⚠️ Important Notes & Best Practices

### Key Changes from v1.0

1. **Stock management removed** - No more stock_id or stock validation
2. **Quick-add medicine capability** - Create medicines on-the-fly during prescription creation
3. **Updated field names** - `duration` → `prescription_duration`
4. **Medicine ID type** - Changed from UUID to integer
5. **New enums** - Updated PrescriptionType and added RepetitionEnum
6. **Update model added** - New `PrescriptionUpdate` for partial updates
7. **Flexible medicine input** - Supports both existing and new medicines

### Quick-Add Best Practices

**When to use quick-add:**

- Medicine exists in clinic but not in global catalog
- Creating prescription with newly released medicine
- Time-sensitive cases where adding medicine to catalog first would delay care

**Example workflow:**

```javascript
// Doctor fills form, selects medicine from dropdown
// Medicine not found?
// 1. Doctor searches - still not found
// 2. Doctor clicks "Quick Add Medicine"
// 3. Enter: name, potency, potency_scale, form
// 4. Submit - medicine added to catalog AND prescription created
// 5. Next doctor can find it in dropdown
```

### Prescription Number Format

Auto-generated format: `RX-{YYYY-MM}-{###}`

**Example:**

- `RX-2026-02-001` - First prescription in Feb 2026
- `RX-2026-02-015` - 15th prescription in Feb 2026
- `RX-2026-03-001` - First prescription in Mar 2026 (resets monthly)

### Conflict Handling

**Creating quick-add medicine that already exists:**

```json
{
  "new_medicine": {
    "name": "Arnica Montana",
    "potency": "30",
    "potency_scale": "C",
    "form": "Globules"
  }
}
```

System automatically:

1. Checks if this medicine exists (by name+potency+potency_scale+form)
2. If found: Reuses existing medicine (avoids duplicates)
3. If not found: Creates new medicine in catalog

**Result:** No duplicate medicines in catalog, smoother workflow.

### Field Specifications

| Field                 | Max Length | Notes                         |
| --------------------- | ---------- | ----------------------------- |
| Medicine name         | 255 chars  | Required for quick-add        |
| Potency               | 50 chars   | e.g., "30", "200", "1M"       |
| Form                  | (enum)     | One of 7 predefined forms     |
| Dosage                | 200 chars  | e.g., "2 tablets twice daily" |
| Prescription Duration | 100 chars  | e.g., "14 days", "2 weeks"    |
| Instructions          | unlimited  | Patient instructions          |
| Notes                 | unlimited  | Additional notes              |

---

## Common Use Cases

### Use Case 1: Quick Prescription for Existing Patient

```bash
# Get the patient case
GET /api/v1/cases/{case_id}

# Create prescription with medicines from catalog
POST /prescriptions/
{
  "case_id": "...",
  "prescription_type": "Constitutional",
  "dosage": "2 tablets daily",
  "prescription_duration": "7 days",
  "medicines": [
    { "medicine_id": 1, "quantity_prescribed": "2 tablets" },
    { "medicine_id": 5, "quantity_prescribed": "1 tablet" }
  ]
}

# Get for printing
GET /prescriptions/{prescription_id}/print
```

### Use Case 2: Create Prescription with New Medicine

```bash
POST /prescriptions/
{
  "case_id": "...",
  "prescription_type": "Constitutional",
  "dosage": "1 tablet daily",
  "prescription_duration": "21 days",
  "medicines": [
    {
      "new_medicine": {
        "name": "Calc Fluoricum",
        "potency": "30",
        "potency_scale": "C",
        "form": "Globules",
        "manufacturer": "Schwabe"
      },
      "quantity_prescribed": "1 tablet"
    }
  ]
}
```

### Use Case 3: Update Prescription Dosage

```bash
PUT /prescriptions/{prescription_id}
{
  "dosage": "2 tablets three times daily",
  "prescription_duration": "14 days"
}
```

### Use Case 4: Get All Prescriptions for Patient

```bash
GET /prescriptions/?case_id={case_id}&limit=50
```

### Use Case 5: Get Prescriptions Within Date Range

```bash
GET /prescriptions/?from_date=2026-02-01&to_date=2026-02-28
```

---

## JavaScript/TypeScript Examples

### Create Prescription with Existing Medicines

```typescript
async function createPrescription(
  caseId: string,
  medicines: Array<{ medicineId: number; quantityPrescribed: string }>,
) {
  const response = await fetch("/prescriptions/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      case_id: caseId,
      prescription_type: "Constitutional",
      dosage: "2 tablets daily",
      prescription_duration: "7 days",
      medicines: medicines.map((m) => ({
        medicine_id: m.medicineId,
        quantity_prescribed: m.quantityPrescribed,
      })),
    }),
  });
  return response.json();
}
```

### Quick-Add New Medicine to Prescription

```typescript
async function createPrescriptionWithQuickAdd(
  caseId: string,
  medicineName: string,
) {
  const response = await fetch("/prescriptions/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      case_id: caseId,
      prescription_type: "Constitutional",
      dosage: "1 tablet daily",
      prescription_duration: "14 days",
      medicines: [
        {
          new_medicine: {
            name: medicineName,
            potency: "30",
            potency_scale: "C",
            form: "Globules",
          },
          quantity_prescribed: "1 tablet",
        },
      ],
    }),
  });
  return response.json();
}
```

### Print Prescription

```typescript
async function printPrescription(prescriptionId: string) {
  const response = await fetch(`/prescriptions/${prescriptionId}/print`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const prescriptionData = await response.json();

  // Generate PDF or print directly
  window.print();
}
```

---

## Version History

| Version | Date         | Changes                                                                                        |
| ------- | ------------ | ---------------------------------------------------------------------------------------------- |
| 2.0.0   | Feb 17, 2026 | **MAJOR UPDATE** - Removed stock management; added quick-add medicine; updated enums; new docs |
| 1.0.0   | Feb 12, 2026 | Initial prescriptions API documentation with stock management                                  |
