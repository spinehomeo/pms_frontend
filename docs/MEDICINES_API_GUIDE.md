# Medicines API Guide

**Module:** Medicine Master and Doctor Stock  
**Version:** 2.0.0 (Updated)  
**Last Updated:** February 15, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

This module provides:

- Medicine master catalog (read-only for doctors)
- Doctor-specific medicine stock management
- Bulk stock import
- Stock usage history
- Low-stock and expiring alerts

---

## Authentication & Authorization

- **Doctor endpoints:** DoctorOAuth2 (doctor role required)
- **Master list access:** Doctors and superusers

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
  "detail": "Only doctors can access stock"
}
```

---

## Enums

### FormEnum

```
"DISKETTE" | "SOM" | "BLANKETS" | "BIO_CHEMIC" | "PLACEBO" | "GLOBULES" | "DROPS"
```

### ScaleEnum

```
"C" | "X" | "Q"
```

### PackingEnum

```
"10" | "30" | "100" | "200" | "450" | "500" | "1000"
```

---

## Data Models

### MedicineMasterPublic (Response)

```json
{
  "id": 1,
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising"
}
```

### DoctorMedicineStockCreate (Request)

```json
{
  "medicine_id": 1,
  "potency": "30",
  "potency_scale": "C",
  "form": "GLOBULES",
  "quantity": 20,
  "unit": "packet",
  "batch_number": "B-2026-02",
  "expiry_date": "2027-02-01",
  "manufacturer": "Herbal Labs",
  "purchase_date": "2026-02-12",
  "last_used_date": null,
  "storage_location": "Clinic Cabinet A",
  "is_active": true,
  "low_stock_threshold": 5
}
```

### DoctorMedicineStockUpdate (Request)

All fields optional.

```json
{
  "quantity": 15,
  "batch_number": "B-2026-02-A",
  "expiry_date": "2027-03-01",
  "manufacturer": "Herbal Labs",
  "storage_location": "Clinic Cabinet B",
  "is_active": true,
  "low_stock_threshold": 4
}
```

### DoctorMedicineStockPublic (Response)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "medicine_id": 1,
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "medicine_name": "Arnica Montana",
  "potency": "30",
  "potency_scale": "C",
  "form": "GLOBULES",
  "quantity": 20,
  "unit": "packet",
  "batch_number": "B-2026-02",
  "expiry_date": "2027-02-01",
  "manufacturer": "Herbal Labs",
  "purchase_date": "2026-02-12",
  "last_used_date": null,
  "storage_location": "Clinic Cabinet A",
  "is_active": true,
  "low_stock_threshold": 5
}
```

---

## API Endpoints

### 1. List Medicine Master

**Endpoint:** `GET /api/v1/medicines/master`

**Authentication:** DoctorOAuth2

**Query Parameters:**

- `skip` (int, default=0): Number of records to skip
- `limit` (int, default=100): Max records to return
- `search` (string, optional): Search by medicine name
- `kingdom` (string, optional): Filter by kingdom

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Arnica Montana",
      "description": "Used for trauma and bruising"
    }
  ],
  "count": 1
}
```

**Errors:**

- 401: Not authenticated
- 403: Not authorized (not a doctor or superuser)

---

### 2. Get Medicine Master by ID

**Endpoint:** `GET /api/v1/medicines/{medicine_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `medicine_id` (int, required): Medicine ID

**Response (200 OK):**

```json
{
  "id": 1,
  "name": "Arnica Montana",
  "description": "Used for trauma and bruising"
}
```

**Errors:**

- 401: Not authenticated
- 403: Not authorized
- 404: Medicine not found

---

### 3. List Doctor Stock

**Endpoint:** `GET /api/v1/medicines/stock`

**Authentication:** DoctorOAuth2

**Query Parameters:**

- `skip` (int, default=0): Number of records to skip
- `limit` (int, default=100): Max records to return
- `search` (string, optional): Search by medicine name

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "medicine_id": 1,
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "potency_scale": "C",
      "form": "GLOBULES",
      "quantity": 20,
      "unit": "packet",
      "batch_number": "B-2026-02",
      "expiry_date": "2027-02-01",
      "manufacturer": "Herbal Labs",
      "purchase_date": "2026-02-12",
      "last_used_date": null,
      "storage_location": "Clinic Cabinet A",
      "is_active": true,
      "low_stock_threshold": 5
    }
  ],
  "count": 1
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access stock

---

### 4. Get Stock Item by ID

**Endpoint:** `GET /api/v1/medicines/stock/{stock_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `stock_id` (UUID, required): Stock item ID

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "medicine_id": 1,
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "medicine_name": "Arnica Montana",
  "potency": "30",
  "potency_scale": "C",
  "form": "GLOBULES",
  "quantity": 20,
  "unit": "packet",
  "batch_number": "B-2026-02",
  "expiry_date": "2027-02-01",
  "manufacturer": "Herbal Labs",
  "purchase_date": "2026-02-12",
  "last_used_date": null,
  "storage_location": "Clinic Cabinet A",
  "is_active": true,
  "low_stock_threshold": 5
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access stock / Not authorized to access this stock item
- 404: Stock item not found

---

### 5. Create Stock Item

**Endpoint:** `POST /api/v1/medicines/stock`

**Authentication:** DoctorOAuth2

**Request Body:** DoctorMedicineStockCreate

```json
{
  "medicine_id": 1,
  "potency": "30",
  "potency_scale": "C",
  "form": "GLOBULES",
  "quantity": 20,
  "unit": "packet",
  "batch_number": "B-2026-02",
  "expiry_date": "2027-02-01",
  "manufacturer": "Herbal Labs",
  "purchase_date": "2026-02-12",
  "last_used_date": null,
  "storage_location": "Clinic Cabinet A",
  "is_active": true,
  "low_stock_threshold": 5
}
```

**Response (201 Created):** DoctorMedicineStockPublic

**Notes:**

- If the same medicine + potency + form exists for the doctor, quantity is increased and the item is returned
- Medicine must exist in master list
- doctor_id is automatically set from authenticated user

**Errors:**

- 401: Not authenticated
- 403: Only doctors can add to stock
- 404: Medicine not found in master list

---

### 6. Bulk Create/Update Stock Items

**Endpoint:** `POST /api/v1/medicines/stock/bulk`

**Authentication:** DoctorOAuth2

**Request Body:** Array of DoctorMedicineStockCreate

```json
[
  {
    "medicine_id": 1,
    "potency": "30",
    "potency_scale": "C",
    "form": "GLOBULES",
    "quantity": 20,
    "unit": "packet",
    "batch_number": "B-2026-02",
    "expiry_date": "2027-02-01",
    "manufacturer": "Herbal Labs",
    "purchase_date": "2026-02-12",
    "storage_location": "Clinic Cabinet A",
    "is_active": true,
    "low_stock_threshold": 5
  },
  {
    "medicine_id": 2,
    "potency": "200",
    "potency_scale": "C",
    "form": "DROPS",
    "quantity": 50,
    "unit": "bottle",
    "batch_number": "B-2026-03",
    "expiry_date": "2027-03-01",
    "manufacturer": "Herbal Labs",
    "purchase_date": "2026-02-13",
    "storage_location": "Clinic Cabinet B",
    "is_active": true,
    "low_stock_threshold": 10
  }
]
```

**Response (201 Created):**

```json
{
  "message": "Successfully processed 2 items",
  "created": 1,
  "updated": 1,
  "total": 2
}
```

**Notes:**

- Maximum 100 items per request
- Items with same medicine, potency, and form will have quantity updated
- doctor_id is automatically set from authenticated user

**Errors:**

- 400: Empty payload / Maximum 100 items per bulk request / Medicine not found
- 401: Not authenticated
- 403: Only doctors can add to stock
- 404: Medicine ID X not found in master list

---

### 7. Update Stock Item

**Endpoint:** `PUT /api/v1/medicines/stock/{stock_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `stock_id` (UUID, required): Stock item ID

**Request Body:** DoctorMedicineStockUpdate

```json
{
  "quantity": 15,
  "batch_number": "B-2026-02-A",
  "expiry_date": "2027-03-01",
  "manufacturer": "Herbal Labs",
  "storage_location": "Clinic Cabinet B",
  "is_active": true,
  "low_stock_threshold": 4
}
```

**Response (200 OK):** DoctorMedicineStockPublic

**Notes:**

- All fields are optional
- Only provided fields are updated

**Errors:**

- 401: Not authenticated
- 403: Only doctors can update stock / Not authorized to update this stock item
- 404: Stock item not found

---

### 8. Delete Stock Item

**Endpoint:** `DELETE /api/v1/medicines/stock/{stock_id}`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `stock_id` (UUID, required): Stock item ID

**Response (200 OK):**

```json
{
  "message": "Stock item deleted successfully"
}
```

**Errors:**

- 400: Cannot delete stock item that is being used in prescriptions. Set is_active to False instead.
- 401: Not authenticated
- 403: Only doctors can delete stock / Not authorized to delete this stock item
- 404: Stock item not found

---

### 9. Get Stock Usage History

**Endpoint:** `GET /api/v1/medicines/stock/{stock_id}/usage`

**Authentication:** DoctorOAuth2

**Path Parameters:**

- `stock_id` (UUID, required): Stock item ID

**Query Parameters:**

- `from_date` (date, optional): Start date (YYYY-MM-DD)
- `to_date` (date, optional): End date (YYYY-MM-DD)

**Response (200 OK):**

```json
{
  "stock_item": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "medicine_id": 1,
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "medicine_name": "Arnica Montana",
    "potency": "30",
    "potency_scale": "C",
    "form": "GLOBULES",
    "quantity": 20,
    "unit": "packet",
    "batch_number": "B-2026-02",
    "expiry_date": "2027-02-01",
    "manufacturer": "Herbal Labs",
    "purchase_date": "2026-02-12",
    "last_used_date": null,
    "storage_location": "Clinic Cabinet A",
    "is_active": true,
    "low_stock_threshold": 5
  },
  "usage_logs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "stock_item_id": "550e8400-e29b-41d4-a716-446655440100",
      "prescription_id": "550e8400-e29b-41d4-a716-446655440300",
      "patient_id": "550e8400-e29b-41d4-a716-446655440400",
      "quantity_used": 1,
      "used_date": "2026-02-12"
    }
  ],
  "total_used": 1,
  "remaining": 20
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access usage history
- 404: Stock item not found

---

### 10. Get Low Stock Alerts

**Endpoint:** `GET /api/v1/medicines/alerts/low-stock`

**Authentication:** DoctorOAuth2

**Response (200 OK):**

```json
{
  "count": 2,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "medicine_id": 1,
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "potency_scale": "C",
      "form": "GLOBULES",
      "quantity": 2,
      "unit": "packet",
      "batch_number": "B-2026-02",
      "expiry_date": "2027-02-01",
      "manufacturer": "Herbal Labs",
      "purchase_date": "2026-02-12",
      "last_used_date": null,
      "storage_location": "Clinic Cabinet A",
      "is_active": true,
      "low_stock_threshold": 5
    }
  ],
  "timestamp": "2026-02-15T10:30:00Z"
}
```

**Notes:**

- Returns only active stock items where quantity ≤ low_stock_threshold

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access alerts

---

### 11. Get Expiring Medicines Alerts

**Endpoint:** `GET /api/v1/medicines/alerts/expiring`

**Authentication:** DoctorOAuth2

**Query Parameters:**

- `days` (int, default=30): Number of days to look ahead

**Response (200 OK):**

```json
{
  "count": 1,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "medicine_id": 1,
      "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
      "medicine_name": "Arnica Montana",
      "potency": "30",
      "potency_scale": "C",
      "form": "GLOBULES",
      "quantity": 20,
      "unit": "packet",
      "batch_number": "B-2026-02",
      "expiry_date": "2027-02-20",
      "manufacturer": "Herbal Labs",
      "purchase_date": "2026-02-12",
      "last_used_date": null,
      "storage_location": "Clinic Cabinet A",
      "is_active": true,
      "low_stock_threshold": 5
    }
  ],
  "expiry_threshold": "2026-03-17",
  "timestamp": "2026-02-15T10:30:00Z"
}
```

**Notes:**

- Returns only active stock items expiring between today and (today + days)
- Sorted by expiry_date in ascending order

**Errors:**

- 401: Not authenticated
- 403: Only doctors can access alerts

---

## ⚠️ Important Notes

### Key Differences from Previous Version

1. **Medicine ID**: Changed from UUID to integer (int)
2. **FormEnum values**: Updated to: `DISKETTE`, `SOM`, `BLANKETS`, `BIO_CHEMIC`, `PLACEBO`, `GLOBULES`, `DROPS`
3. **ScaleEnum values**: Reduced to: `C`, `X`, `Q` (removed LM, M, CM, MM)
4. **Medicine Model**: Now includes `description` field (optional)
5. **Bulk Endpoint**: New `/medicines/stock/bulk` endpoint for importing multiple items at once
6. **Response Format**: Bulk endpoint returns object with `created`, `updated`, `total` counts instead of array
7. **Medicine Name**: Stock items now include `medicine_name` in responses for convenience

### Common Use Cases

#### Add single medicine to stock

```
POST /api/v1/medicines/stock
Body: DoctorMedicineStockCreate
```

#### Import bulk medicines (recommended for initial setup)

```
POST /api/v1/medicines/stock/bulk
Body: Array of DoctorMedicineStockCreate
```

#### Track medicine usage

```
GET /api/v1/medicines/stock/{stock_id}/usage?from_date=2026-02-01&to_date=2026-02-15
```

#### Get alerts for low and expiring stock

```
GET /api/v1/medicines/alerts/low-stock
GET /api/v1/medicines/alerts/expiring?days=30
```

---

## Version History

| Version | Date         | Changes                                                                         |
| ------- | ------------ | ------------------------------------------------------------------------------- |
| 2.0.0   | Feb 15, 2026 | Updated with current implementation: new enums, bulk endpoint, int medicine IDs |
| 1.0.0   | Feb 12, 2026 | Initial medicines API documentation                                             |
