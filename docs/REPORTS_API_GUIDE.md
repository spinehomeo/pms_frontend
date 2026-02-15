# Reports API Guide

**Module:** Reports and Analytics  
**Version:** 1.0.0  
**Last Updated:** February 12, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

The Reports API provides analytical insights for doctors including patient history, medicine usage, appointment statistics, prescription analysis, financial summary, and expiry alerts.

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
  "detail": "Only doctors can access reports"
}
```

---

## API Endpoints

### 1. Patient History Report

**Endpoint:** `GET /api/v1/reports/patient-history/{patient_id}`

**Query Parameters:**

- `from_date` (date, optional) → default: last 365 days
- `to_date` (date, optional) → default: today

**Response (200 OK):**

```json
{
  "patient": { "id": "...", "full_name": "Ahmed Ali" },
  "date_range": { "from": "2025-02-12", "to": "2026-02-12" },
  "summary": {
    "total_cases": 4,
    "total_visits": 6,
    "total_prescriptions": 5,
    "total_medicines": 9,
    "first_visit": "2025-04-10",
    "last_visit": "2026-02-12",
    "top_medicines": [["Arnica Montana", 3]]
  },
  "timeline": {
    "cases": [{ "id": "..." }],
    "prescriptions": [{ "prescription": { "id": "..." }, "medicines": [] }],
    "appointments": [{ "id": "..." }],
    "followups": [{ "id": "..." }]
  },
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

### 2. Medicine Usage Report

**Endpoint:** `GET /api/v1/reports/medicine-usage`

**Query Parameters:**

- `from_date` (date, optional) → default: last 90 days
- `to_date` (date, optional) → default: today
- `medicine_id` (UUID, optional)
- `group_by` (string, optional) → `day | week | month | year` (default: month)

**Response (200 OK):**

```json
{
  "date_range": { "from": "2025-11-14", "to": "2026-02-12" },
  "group_by": "month",
  "summary": {
    "total_usage": 120,
    "total_patients": 35,
    "total_medicines": 6,
    "average_daily_usage": 1.5,
    "top_medicines": { "Arnica Montana": 40 }
  },
  "detailed_data": [
    {
      "period": "2026-01-01",
      "medicine_name": "Arnica Montana",
      "quantity": 12,
      "unique_patients": 6
    }
  ],
  "trend_data": [{ "period": "2026-01-01", "quantity": 20 }],
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

### 3. Appointment Statistics

**Endpoint:** `GET /api/v1/reports/appointment-statistics`

**Query Parameters:**

- `from_date` (date, optional) → default: last 90 days
- `to_date` (date, optional) → default: today
- `group_by` (string, optional) → `day | week | month | year` (default: month)

**Response (200 OK):**

```json
{
  "date_range": { "from": "2025-11-14", "to": "2026-02-12" },
  "group_by": "month",
  "summary": {
    "total_appointments": 50,
    "total_hours": 42.5,
    "average_duration_minutes": 30,
    "unique_patients": 25,
    "cancellation_rate": 4.0,
    "no_show_rate": 2.0
  },
  "distributions": {
    "status": { "scheduled": 10, "completed": 35 },
    "consultation_type": { "first": 20, "follow_up": 30 },
    "weekday": { "Monday": 8, "Tuesday": 10 }
  },
  "trend_data": [
    {
      "period": "2026-01-01",
      "appointments": 15,
      "unique_patients": 10,
      "total_minutes": 450
    }
  ],
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

### 4. Prescription Analysis

**Endpoint:** `GET /api/v1/reports/prescription-analysis`

**Query Parameters:**

- `from_date` (date, optional) → default: last 180 days
- `to_date` (date, optional) → default: today

**Response (200 OK):**

```json
{
  "date_range": { "from": "2025-08-16", "to": "2026-02-12" },
  "summary": {
    "total_prescriptions": 18,
    "total_medicines_prescribed": 40,
    "average_medicines_per_prescription": 2.22,
    "most_common_prescription_type": null
  },
  "distributions": {
    "prescription_type": {},
    "top_medicines": { "Arnica Montana": 7 },
    "potency": { "30": 10 },
    "form": { "globules": 12 }
  },
  "trends": {
    "monthly": [{ "month": "2026-01", "count": 5 }]
  },
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

### 5. Financial Summary

**Endpoint:** `GET /api/v1/reports/financial-summary`

**Query Parameters:**

- `from_date` (date, optional) → default: first day of current month
- `to_date` (date, optional) → default: today

**Response (200 OK):**

```json
{
  "date_range": { "from": "2026-02-01", "to": "2026-02-12" },
  "revenue": {
    "consultation_fees": 5000,
    "total_revenue": 5000
  },
  "costs": {
    "medicine_costs": 0,
    "total_costs": 0
  },
  "profitability": {
    "gross_profit": 5000,
    "profit_margin": 100
  },
  "key_metrics": {
    "completed_appointments": 10,
    "average_daily_revenue": 416.67
  },
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

### 6. Expiry Alerts Report

**Endpoint:** `GET /api/v1/reports/expiry-alerts`

**Query Parameters:**

- `days_threshold` (int, default 30)

**Response (200 OK):**

```json
{
  "check_date": "2026-02-12",
  "threshold_days": 30,
  "summary": {
    "expiring_soon_count": 1,
    "expiring_later_count": 2,
    "expired_count": 0,
    "total_items_at_risk": 3
  },
  "alerts": {
    "expiring_soon": [
      {
        "stock_item": { "id": "..." },
        "days_until_expiry": 5,
        "urgency": "high"
      }
    ],
    "expiring_later": [
      {
        "stock_item": { "id": "..." },
        "days_until_expiry": 15,
        "urgency": "medium"
      }
    ],
    "expired": []
  },
  "recommendations": [
    "Consider using expiring medicines first in prescriptions",
    "Review and update stock ordering schedule"
  ],
  "generated_at": "2026-02-12T12:00:00Z"
}
```

---

## Notes

- Report endpoints are read-only and doctor-only.
- Date ranges default to common windows if not provided.
- Some financial calculations are placeholders (no cost fields in models).

---

## Version History

| Version | Date         | Changes                           |
| ------- | ------------ | --------------------------------- |
| 1.0.0   | Feb 12, 2026 | Initial reports API documentation |
