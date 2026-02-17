# Medicines API Guide

**Module:** Global Medicine Catalog with Doctor Contributions  
**Version:** 3.0.0 (Completely Revised)  
**Last Updated:** February 17, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

This module provides a **global, community-driven medicine catalog** where:

- Doctors can **view, search, and add** medicines to the global catalog
- Doctors can **mark favorite medicines** for quick access
- Admins can **verify** doctor-added medicines
- **No stock management** (stock tracking was removed in v3.0)
- Advanced search with multiple filters
- Bulk medicine import capability

---

## Authentication & Authorization

**All endpoints require DoctorOAuth2** (doctor, staff, or admin role)

- Doctors can add, view, update, and delete medicines they created
- Admins can verify or manage any medicine
- Only doctors and admins can access medicines

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
  "detail": "Only doctors can access medicines"
}
```

```json
{
  "detail": "Only the creator or admin can update this medicine"
}
```

---

## Enums

### ScaleEnum

```
"C" | "X" | "Q"
```

**Value Descriptions:**

- **C** = Centesimal potency (1:100 dilution)
- **X** = Decimal potency (1:10 dilution)
- **Q** = Quinquagintamillesimal potency (1:50,000 dilution)

### FormEnum

```
"Diskette" | "SOM" | "Blankets" | "Bio Chemic" | "Homoeo Tabs" | "Globules" | "Dilutions"
```

**Display Values:**

- DISKETTE = "Diskette"
- SOM = "SOM"
- BLANKETS = "Blankets"
- BIO_CHEMIC = "Bio Chemic"
- HOMOEO_TABS = "Homoeo Tabs"
- GLOBULES = "Globules"
- DILUTIONS = "Dilutions"

### ManufacturerEnum

```
"Schwabe" | "Reckweg" | "Lemasar" | "Dolisos" | "Kamal" | "Masood" | "BM" | "Kent" | "Brooks" | "Waris Shah" | "Self Packing"
```

**Display Values:**

- SCHWABE = "Schwabe"
- RECKWEG = "Reckweg"
- LEMASAR = "Lemasar"
- DOLISOS = "Dolisos"
- KAMAL = "Kamal"
- MASOOD = "Masood"
- BM = "BM"
- KENT = "Kent"
- BROOKS = "Brooks"
- WARIS_SHAH = "Waris Shah"
- SELF_PACKING = "Self Packing"

---

## Data Models

### MedicinePublic (Response)

Medicine object returned from the API. Includes all medicine details plus metadata.

```json
{
  "id": 1,
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe",
  "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "created_at": "2026-02-15T10:30:00Z",
  "is_verified": true,
  "is_favorite": false
}
```

**Fields:**

- `id` (int): Unique medicine ID
- `name` (string): Medicine name (max 255 chars)
- `description` (string, optional): Medicine description
- `potency` (string): Potency strength (e.g., "30", "200", "1M")
- `potency_scale` (ScaleEnum): One of "C", "X", "Q"
- `form` (FormEnum): One of the 7 form types
- `manufacturer` (ManufacturerEnum, optional): One of the 11 manufacturers
- `created_by_doctor_id` (UUID): Doctor who added this medicine to catalog
- `created_at` (datetime): When medicine was added (ISO 8601 format)
- `is_verified` (boolean): Admin has verified this medicine
- `is_favorite` (boolean): Currently marked as favorite for authenticated doctor

### MedicineCreate (Request)

Request body for creating a single medicine.

```json
{
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe"
}
```

**Required Fields:**

- `name` (string): Medicine name (max 255 chars)
- `potency` (string): Medicine potency (e.g., "30", "200", "1M")
- `potency_scale` (ScaleEnum): One of "C", "X", "Q"
- `form` (FormEnum): One of the 7 form types

**Optional Fields:**

- `description` (string): Medicine description
- `manufacturer` (ManufacturerEnum): One of the 11 manufacturers

**Notes:**

- If a medicine with the same name + potency + potency_scale + form already exists, returns 400 error
- Creator is automatically set to current authenticated doctor
- `is_verified` defaults to `false` (requires admin verification)

### MedicineUpdate (Request)

Request body for updating a medicine. All fields are optional.

```json
{
  "name": "Arnica Montana",
  "description": "Updated description",
  "potency": "200",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe",
  "is_verified": true
}
```

**Fields:**

- `name` (string, optional): Medicine name
- `description` (string, optional): Medicine description
- `potency` (string, optional): Medicine potency
- `potency_scale` (ScaleEnum, optional): One of "C", "X", "Q"
- `form` (FormEnum, optional): One of the 7 form types
- `manufacturer` (ManufacturerEnum, optional): One of the 11 manufacturers
- `is_verified` (boolean, optional): **Admin only** - verify medicine

**Notes:**

- Only include fields you want to update
- Only the creator or admin can update a medicine
- Only admin can set `is_verified` to `true`

### MedicinesPublic (Response)

List response containing multiple medicines.

```json
{
  "data": [
    {
      "id": 1,
      "name": "Arnica Montana",
      "description": "Used for trauma and bruising",
      "potency": "30",
      "potency_scale": "C",
      "form": "Globules",
      "manufacturer": "Schwabe",
      "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-02-15T10:30:00Z",
      "is_verified": true,
      "is_favorite": false
    }
  ],
  "count": 1
}
```

**Fields:**

- `data` (array): Array of MedicinePublic objects
- `count` (int): Total number of medicines in result

---

## API Endpoints

### 1. List All Medicines

**Endpoint:** `GET /api/v1/medicines/all`

**Authentication:** DoctorOAuth2

**Description:** Retrieve all medicines from the global catalog without pagination. Useful for dropdowns and initial loads.

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Arnica Montana",
      "description": "Used for trauma and bruising",
      "potency": "30",
      "potency_scale": "C",
      "form": "Globules",
      "manufacturer": "Schwabe",
      "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-02-15T10:30:00Z",
      "is_verified": true,
      "is_favorite": false
    }
  ],
  "count": 150
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access medicines

**Notes:**

- Returns medicines sorted by name and potency
- Includes `is_favorite` status for current doctor
- Use with caution for large catalogs; consider using `/search` for filtered results

---

### 2. Advanced Search Medicines

**Endpoint:** `GET /api/v1/medicines/search`

**Authentication:** DoctorOAuth2

**Query Parameters:**

- `skip` (int, default=0): Number of records to skip (pagination)
- `limit` (int, default=100, max=1000): Max records to return
- `name` (string, optional): Filter by medicine name (case-insensitive)
- `description` (string, optional): Filter by description
- `potency` (string, optional): Filter by potency (e.g., "30", "200")
- `potency_scale` (ScaleEnum, optional): Filter by scale (C, X, Q)
- `form` (FormEnum, optional): Filter by form
- `manufacturer` (ManufacturerEnum, optional): Filter by manufacturer
- `created_by` (string, optional): Filter by creator (UUID or email)
- `is_verified` (boolean, optional): Filter by verification status
- `is_favorite` (boolean, optional): Filter by favorite status (for current doctor)
- `from_date` (datetime, optional): Filter medicines created after this date
- `to_date` (datetime, optional): Filter medicines created before this date

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Arnica Montana",
      "description": "Used for trauma and bruising",
      "potency": "30",
      "potency_scale": "C",
      "form": "Globules",
      "manufacturer": "Schwabe",
      "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-02-15T10:30:00Z",
      "is_verified": true,
      "is_favorite": true
    }
  ],
  "count": 5
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access medicines

**Example Requests:**

```
GET /api/v1/medicines/search?name=Arnica&is_verified=true
GET /api/v1/medicines/search?form=Globules&manufacturer=Schwabe&limit=50
GET /api/v1/medicines/search?is_favorite=true
GET /api/v1/medicines/search?created_by=550e8400-e29b-41d4-a716-446655440001
```

---

### 3. Get Medicine by ID

**Endpoint:** `GET /api/v1/medicines/{medicine_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `medicine_id` (int, required): Medicine ID

**Response (200 OK):** MedicinePublic

```json
{
  "id": 1,
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe",
  "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "created_at": "2026-02-15T10:30:00Z",
  "is_verified": true,
  "is_favorite": false
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access medicines
- 404: Medicine not found

---

### 4. Create Medicine

**Endpoint:** `POST /api/v1/medicines/add`

**Authentication:** DoctorOAuth2

**Request Body:** MedicineCreate

```json
{
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe"
}
```

**Response (200 OK):** MedicinePublic

**Notes:**

- Any doctor can add medicines to the global catalog
- If a medicine with the same name + potency + scale + form exists, returns 400 error
- Creator is automatically set to current doctor
- `is_verified` defaults to `false` (needs admin verification)
- Doctor is automatically added to this medicine's preferences

**Errors:**

- 400: Duplicate medicine (same name + potency + scale + form)
- 401: Not authenticated
- 403: Only doctors can add medicines

**Example:**

```bash
curl -X POST "http://localhost:8000/api/v1/medicines/add" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arnica Montana",
    "potency": "30",
    "potency_scale": "C",
    "form": "Globules",
    "manufacturer": "Schwabe",
    "description": "Used for trauma and bruising"
  }'
```

---

### 5. Update Medicine

**Endpoint:** `PUT /api/v1/medicines/{medicine_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `medicine_id` (int, required): Medicine ID

**Request Body:** MedicineUpdate (all fields optional)

```json
{
  "name": "Arnica Montana",
  "description": "Updated description",
  "potency": "200",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Reckweg"
}
```

**Response (200 OK):** MedicinePublic

**Notes:**

- Only the creator or admin can update
- Admin can set `is_verified` to approve medicines

**Errors:**

- 401: Not authenticated
- 403: Only doctors can update medicines / Only creator or admin can update this medicine
- 404: Medicine not found

---

### 6. Delete Medicine

**Endpoint:** `DELETE /api/v1/medicines/{medicine_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `medicine_id` (int, required): Medicine ID

**Response (200 OK):**

```json
{
  "message": "Medicine deleted successfully"
}
```

**Notes:**

- Only the creator or admin can delete
- Cannot delete medicines used in prescriptions

**Errors:**

- 400: Cannot delete medicine used in prescriptions
- 401: Not authenticated
- 403: Only doctors can delete medicines / Only creator or admin can delete this medicine
- 404: Medicine not found

---

### 7. Bulk Create Medicines

**Endpoint:** `POST /api/v1/medicines/bulk`

**Authentication:** DoctorOAuth2

**Request Body:** Array of MedicineCreate (max 100 items)

```json
[
  {
    "name": "Arnica Montana",
    "potency": "30",
    "potency_scale": "C",
    "form": "Globules",
    "manufacturer": "Schwabe",
    "description": "Used for trauma and bruising"
  },
  {
    "name": "Belladonna",
    "potency": "30",
    "potency_scale": "C",
    "form": "Globules",
    "manufacturer": "Reckweg",
    "description": "Sudden onset of high fever"
  }
]
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Arnica Montana",
      "potency": "30",
      "potency_scale": "C",
      "form": "Globules",
      "manufacturer": "Schwabe",
      "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-02-15T10:30:00Z",
      "is_verified": false,
      "is_favorite": false
    },
    {
      "id": 2,
      "name": "Belladonna",
      "potency": "30",
      "potency_scale": "C",
      "form": "Globules",
      "manufacturer": "Reckweg",
      "created_by_doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-02-15T10:30:00Z",
      "is_verified": false,
      "is_favorite": false
    }
  ],
  "count": 2
}
```

**Notes:**

- Maximum 100 medicines per bulk request
- Duplicates (same name + potency + scale + form) are skipped
- Creator is automatically set to current doctor
- Returns only newly created medicines (skipped duplicates are not included)

**Errors:**

- 400: Empty payload / Maximum 100 medicines per bulk request
- 401: Not authenticated
- 403: Only doctors can add medicines

---

### 8. Toggle Medicine as Favorite

**Endpoint:** `POST /api/v1/medicines/{medicine_id}/favorite`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `medicine_id` (int, required): Medicine ID

**Request Body:** (empty)

**Response (200 OK):**

```json
{
  "message": "Medicine added to favorites"
}
```

or

```json
{
  "message": "Medicine removed from favorites"
}
```

**Notes:**

- Toggles favorite status for current doctor
- Creates preference record if doesn't exist
- First call adds to favorites, second call removes, etc.

**Errors:**

- 401: Not authenticated
- 403: Only doctors can mark favorites
- 404: Medicine not found

**Example:**

```bash
# First call - add to favorites
curl -X POST "http://localhost:8000/api/v1/medicines/1/favorite" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: "Medicine added to favorites"

# Second call - remove from favorites
curl -X POST "http://localhost:8000/api/v1/medicines/1/favorite" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: "Medicine removed from favorites"
```

---

## ⚠️ Important Changes (v2.0 → v3.0)

### What Changed

1. **REMOVED: All stock management endpoints** (no more `/medicines/stock`)
   - Stock tracking, expiry dates, batch numbers removed
   - Use prescriptions module for medicine usage tracking
   - Doctors should manage physical stock externally

2. **NEW: Global user-contributed medicine catalog**
   - Doctors can now add medicines to global catalog (not admin-only)
   - Admin verification system for quality control
   - Shared catalog benefits all doctors

3. **NEW: Favorite medicines system**
   - Each doctor can mark favorite medicines
   - Favorites appear in `/medicines/search?is_favorite=true`
   - Helps doctors quickly access frequently used medicines

4. **Updated endpoints:**
   - `GET /medicines/master` → `GET /medicines/all` (unpaginated)
   - `GET /medicines/` (paginated) → `GET /medicines/search` (advanced search)
   - `POST /medicines/stock` → REMOVED
   - `POST /medicines/add` → NEW (create single medicine)
   - `POST /medicines/bulk` → NEW (create multiple)
   - `PUT /medicines/{id}` → NEW (update)
   - `DELETE /medicines/{id}` → NEW (delete)
   - `POST /medicines/{id}/favorite` → NEW (toggle favorite)

5. **Updated data model:**
   - Medicine IDs remain integers
   - Added: `created_by_doctor_id`, `created_at`, `is_verified`, `is_favorite`
   - Removed: Stock fields (quantity, batch_number, storage_location, expiry_date, etc.)
   - Simplified: Only core medicine attributes (name, potency, form, manufacturer, description)

6. **Authorization changes:**
   - All doctors can add medicines (not just admins)
   - Creator and admin can update/delete
   - Admin can verify medicines

### Migration Notes

If upgrading from v2.0:

- **Medicine master list:** Still exists, now crowd-sourced and verified
- **Stock management:** Move to external system or use prescriptions tracking
- **For each medicine:** All instances now share the global ID
- **Doctor preferences:** Replaced with created_by_doctor_id (who added to catalog) + is_favorite (personal preference)

---

## Common Use Cases

### Load all medicines for dropdown

```bash
# Get all medicines for a dropdown (no pagination)
GET /api/v1/medicines/all
```

### Search medicines with filters

```bash
# Find all Schwabe globules
GET /api/v1/medicines/search?manufacturer=Schwabe&form=Globules

# Find verified medicines only
GET /api/v1/medicines/search?is_verified=true&limit=50

# Find favorite medicines
GET /api/v1/medicines/search?is_favorite=true

# Search by name
GET /api/v1/medicines/search?name=Arnica&limit=20
```

### Add single medicine to global catalog

```bash
POST /api/v1/medicines/add
Body: {
  "name": "Arnica Montana",
  "potency": "30",
  "potency_scale": "C",
  "form": "Globules",
  "manufacturer": "Schwabe",
  "description": "Used for trauma and bruising"
}
```

### Add multiple medicines at once

```bash
POST /api/v1/medicines/bulk
Body: [
  { "name": "Arnica Montana", "potency": "30", "potency_scale": "C", "form": "Globules" },
  { "name": "Belladonna", "potency": "30", "potency_scale": "C", "form": "Globules" }
]
```

### Mark medicine as favorite

```bash
# First call adds to favorites
POST /api/v1/medicines/1/favorite

# Second call removes from favorites
POST /api/v1/medicines/1/favorite
```

### Update medicine details

```bash
PUT /api/v1/medicines/1
Body: {
  "description": "Updated description",
  "manufacturer": "Reckweg"
}
```

### Delete medicine

```bash
# Only works if medicine is not used in any prescriptions
DELETE /api/v1/medicines/1
```

---

## Version History

| Version | Date         | Changes                                                                                                                                                                           |
| ------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.0.0   | Feb 17, 2026 | **MAJOR REWRITE** - Removed all stock management endpoints; added user-contributed global catalog; new favorite system; new search/update/delete endpoints; simplified data model |
| 2.0.0   | Feb 15, 2026 | Updated with current implementation: new enums, bulk endpoint, int medicine IDs                                                                                                   |
| 1.0.0   | Feb 12, 2026 | Initial medicines API documentation with stock management                                                                                                                         |
