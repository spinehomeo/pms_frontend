# 🏥 Herbal Backend Integration Guide

**Last Updated:** February 9, 2026

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [Dashboard Integration (Doctor/Staff/Admin)](#dashboard-integration)
4. [Website Integration (Patient)](#website-integration)
5. [User Management APIs](#user-management-apis)
6. [User Profile APIs](#user-profile-apis)
7. [Error Handling](#error-handling)
8. [Configuration](#configuration)

---

## Architecture Overview

Your backend uses **two completely separate authentication systems** for two different user domains:

```
┌─────────────────────────────────────────────────────────────┐
│                   HERBAL BACKEND API                         │
├─────────────────────────────────────────┬───────────────────┤
│   DASHBOARD (Doctor/Staff/Admin)        │   WEBSITE (Patient)│
│   ├─ User Table (Database)              │   └─ Patient Table │
│   ├─ DoctorOAuth2 Auth                  │   └─ PatientBearer │
│   ├─ JWT with "entity": "user"          │   └─ JWT with      │
│   ├─ /login/access-token                │      "entity":     │
│   └─ /login                             │      "patient"     │
│       (Traditional Login)                │   └─ /login/       │
│                                         │      patient-simple│
└─────────────────────────────────────────┴───────────────────┘
```

### Key Points:
- **Tokens are NOT interchangeable** - Patient token ≠ Doctor token
- Each system stores its own users in different database tables
- Different authentication schemes (OAuth2 vs Bearer JWT)
- Role-based access control via JWT claims

---

## Authentication System

### 🔑 Two Authentication Methods

#### 1️⃣ **Dashboard Authentication (Doctor/Staff/Admin)**

**Type:** OAuth2 Password Bearer  
**Scheme Name:** `DoctorOAuth2`  
**Login Endpoints:**
- `POST /login/access-token` - Standard OAuth2 endpoint
- `POST /login` - Alternative endpoint with more details

**Token Claims:**
```json
{
  "sub": "user-id-uuid",
  "entity": "user",
  "role": "doctor | staff | admin",
  "exp": 1707000000
}
```

**Token Usage:**
```
Authorization: Bearer <token>
```

---


## Dashboard Integration

### User Roles & Permissions

| Role | Table | Features |
|------|-------|----------|
| **Admin** | User | Manage all users, approve doctors/staff, system settings |
| **Doctor** | User | Manage own patients, create cases, prescriptions, appointments |
| **Staff** | User | Support role, manage appointments, patient records |

### 📌 Authentication Flow (Dashboard)

```
1. User opens dashboard
2. Frontend shows login form
3. User enters: email + password
4. Frontend sends: POST /login or POST /login/access-token
5. Backend validates credentials
6. Backend checks:
   - Email verified? ✓
   - Account active? ✓
   - Approved (if doctor/staff)? ✓
7. Backend returns JWT token
8. Frontend stores token (localStorage or sessionStorage)
9. All subsequent requests include Authorization header
```

---

### 🔓 Login Endpoints (Dashboard)

#### Option 1: Standard OAuth2 Login
```
POST /login/access-token
Content-Type: application/x-www-form-urlencoded

username=doctor@email.com&password=SecurePass123
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Error Responses:**
```json
// 400 Bad Request - Wrong credentials
{
  "detail": "Incorrect email or password"
}

// 400 Bad Request - Email not verified
{
  "detail": "Email not verified. Please check your inbox for verification link."
}

// 403 Forbidden - Not approved yet
{
  "detail": "Your account is pending admin approval. You'll receive an email when approved."
}

// 400 Bad Request - Inactive account
{
  "detail": "Your account is inactive. Contact the administrator."
}
```

---

#### Option 2: Enhanced Login (Recommended)
```
POST /login
Content-Type: application/json

{
  "email": "doctor@email.com",
  "password": "SecurePass123",
  "remember_me": false
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
    "email": "doctor@email.com",
    "full_name": "Dr. Ahmed Khan",
    "role": "doctor",
    "is_verified": true,
    "is_superuser": false,
    "specialization": "Cardiology",
    "clinic_name": "Herbal Clinic"
  }
}
```

**Parameters:**
- `email` (string, required): User email address
- `password` (string, required): Plaintext password (8-128 chars)
- `remember_me` (boolean, optional): If `true`, token valid for 30 days; else 60 minutes

---

### 👤 User Management APIs

#### 1. Get Current User Profile
```
GET /users/me
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
  "email": "doctor@email.com",
  "full_name": "Dr. Ahmed Khan",
  "role": "doctor",
  "phone": "03001234567",
  "specialization": "Cardiology",
  "registration_number": "PMC12345",
  "clinic_name": "Herbal Clinic",
  "clinic_address": "123 Medical Road, Lahore",
  "consultation_fee": 1500.00,
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "is_superuser": false,
  "join_date": "2025-01-15",
  "last_login": "2026-02-09"
}
```

**Errors:**
```json
// 403 Forbidden - User not authenticated
{
  "detail": "Not authenticated"
}
```

---

#### 2. Update Own Profile
```
PATCH /users/me
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "full_name": "Dr. Ahmed Khan",
  "phone": "03001234567",
  "specialization": "Cardiology",
  "clinic_name": "Herbal Clinic",
  "clinic_address": "123 Medical Road, Lahore",
  "consultation_fee": 1500.00
}
```

**Response (200 OK):**
```json
{
  "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
  "email": "doctor@email.com",
  "full_name": "Dr. Ahmed Khan",
  "role": "doctor",
  "phone": "03001234567",
  "specialization": "Cardiology",
  "clinic_name": "Herbal Clinic",
  "clinic_address": "123 Medical Road, Lahore",
  "consultation_fee": 1500.00,
  "is_active": true,
  "is_verified": true,
  "is_approved": true
}
```

**Allowed Fields:**
- `full_name` - Doctor's full name
- `phone` - Contact number
- `specialization` - Medical specialty
- `clinic_name` - Practice name
- `clinic_address` - Practice address
- `consultation_fee` - Consultation fee

---

#### 3. Change Password
```
PATCH /users/me/password
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "current_password": "OldPassword123",
  "new_password": "NewPassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
```json
// 400 Bad Request - Wrong current password
{
  "detail": "Incorrect password"
}

// 422 Unprocessable Entity - Password too short/long
{
  "detail": "Password must be 8-128 characters"
}
```

---

#### 4. Get User Statistics
```
GET /users/me/stats
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "total_patients": 45,
  "total_cases": 120,
  "total_appointments": 85,
  "total_prescriptions": 95,
  "upcoming_appointments": 5,
  "pending_followups": 3
}
```

---

#### 5. Delete Own Account
```
DELETE /users/me
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 👥 Admin: User Management

#### Create New User (Admin Only)
```
POST /users/
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newdoctor@email.com",
  "password": "SecurePass123",
  "full_name": "Dr. Fatima Ahmed",
  "role": "doctor",
  "phone": "03009876543",
  "specialization": "General Medicine",
  "registration_number": "PMC98765",
  "is_verified": true
}
```

**Response (201 Created):**
```json
{
  "id": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
  "email": "newdoctor@email.com",
  "full_name": "Dr. Fatima Ahmed",
  "role": "doctor",
  "is_verified": true,
  "is_approved": false
}
```

---

#### List All Users (Admin Only)
```
GET /users/?skip=0&limit=50
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `limit` (int, optional): Max records to return (default: 100, max: 1000)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
      "email": "doctor@email.com",
      "full_name": "Dr. Ahmed Khan",
      "role": "doctor",
      "is_verified": true,
      "is_approved": true,
      "is_active": true
    }
  ],
  "count": 45
}
```

---

#### Get User by ID (Admin Only)
```
GET /users/{user_id}
Authorization: Bearer <admin-token>
```

**Path Parameters:**
- `user_id` (UUID): The user's unique ID

**Response (200 OK):**
```json
{
  "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
  "email": "doctor@email.com",
  "full_name": "Dr. Ahmed Khan",
  "role": "doctor",
  "phone": "03001234567",
  "specialization": "Cardiology",
  "registration_number": "PMC12345",
  "clinic_name": "Herbal Clinic",
  "clinic_address": "123 Medical Road, Lahore",
  "consultation_fee": 1500.00,
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "is_superuser": false,
  "join_date": "2025-01-15",
  "last_login": "2026-02-09"
}
```

---

#### Update User (Admin Only)
```
PATCH /users/{user_id}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "full_name": "Dr. Ahmed Khan Updated",
  "specialization": "Cardiology",
  "is_active": true,
  "is_verified": true,
  "is_approved": true
}
```

**Response (200 OK):**
```json
{
  "id": "d4e7e6f0-579c-402a-b266-98de85604a54",
  "email": "doctor@email.com",
  "full_name": "Dr. Ahmed Khan Updated",
  "role": "doctor",
  "specialization": "Cardiology",
  "is_active": true,
  "is_verified": true,
  "is_approved": true
}
```

---

#### Delete User (Admin Only)
```
DELETE /users/{user_id}
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

---
---

### Doctor Can Manage Patients

#### Get All Patients (Doctor View)
```
GET /patients/?skip=0&limit=50&search=John&gender=male&payment_status=true
Authorization: Bearer <doctor-token>
```

**Query Parameters:**
- `skip` (int, optional): Records to skip (default: 0)
- `limit` (int, optional): Max records (default: 100, max: 1000)
- `search` (string, optional): Search by name, phone, email, CNIC, or city
- `gender` (string, optional): Filter by gender
- `payment_status` (boolean, optional): Filter by payment status

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "p5q6r7s8-t9u0-41v2-w3x4-y5z6a7b8c9d0",
      "full_name": "John Doe",
      "gender": "male",
      "phone": "03001234567",
      "city": "Lahore",
      "payment_status": true,
      "created_date": "2025-12-01",
      "age": 35
    }
  ],
  "count": 15
}
```

---

#### Get Patient by ID (Doctor View)
```
GET /patients/{patient_id}
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "id": "p5q6r7s8-t9u0-41v2-w3x4-y5z6a7b8c9d0",
  "full_name": "John Doe",
  "gender": "male",
  "phone": "03001234567",
  "email": "john@example.com",
  "cnic": "12345-6789012-3",
  "date_of_birth": "1990-05-15",
  "residential_address": "123 Main Street, Lahore",
  "city": "Lahore",
  "occupation": "Engineer",
  "payment_status": true,
  "medical_history": "Hypertension, Diabetes",
  "drug_allergies": "Penicillin",
  "family_history": "Heart disease",
  "current_medications": "Metformin 500mg",
  "created_date": "2025-12-01",
  "is_active": true,
  "age": 35
}
```

---

#### Create Patient (Doctor View)
```
POST /patients/
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "gender": "female",
  "phone": "03009876543",
  "cnic": "98765-4321098-7",
  "date_of_birth": "1985-08-20",
  "email": "jane@example.com",
  "residential_address": "456 Oak Avenue, Karachi",
  "city": "Karachi",
  "occupation": "Doctor",
  "payment_status": false,
  "medical_history": "None",
  "drug_allergies": "None",
  "family_history": "None"
}
```

**Response (201 Created):**
```json
{
  "id": "p9i8h7g6-f5e4-43d2-c1b0-a9z8y7x6w5v4",
  "full_name": "Jane Smith",
  "gender": "female",
  "phone": "03009876543",
  "email": "jane@example.com",
  "city": "Karachi",
  "created_date": "2026-02-09",
  "is_active": true
}
```

---

#### Update Patient (Doctor View)
```
PUT /patients/{patient_id}
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "phone": "03009876543",
  "cnic": "98765-4321098-7",
  "payment_status": true,
  "medical_history": "Hypertension",
  "drug_allergies": "Aspirin"
}
```

**Response (200 OK):**
```json
{
  "id": "p9i8h7g6-f5e4-43d2-c1b0-a9z8y7x6w5v4",
  "full_name": "Jane Smith",
  "phone": "03009876543",
  "payment_status": true,
  "medical_history": "Hypertension",
  "drug_allergies": "Aspirin"
}
```

---

#### Delete Patient (Doctor View)
```
DELETE /patients/{patient_id}
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "message": "Patient deleted successfully"
}
```

---

#### Get Patient Statistics
```
GET /patients/{patient_id}/stats
Authorization: Bearer <doctor-token>
```

**Response (200 OK):**
```json
{
  "total_appointments": 12,
  "total_cases": 5,
  "total_prescriptions": 8,
  "upcoming_appointments": 2,
  "completed_appointments": 10
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | Request successful |
| **201** | Created | Resource created |
| **400** | Bad Request | Invalid input, wrong credentials |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Not approved, wrong role, no permission |
| **404** | Not Found | Resource doesn't exist |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Backend error |

---

### Common Error Responses

#### Authentication Errors
```json
// 401 Unauthorized - Invalid/expired token
{
  "detail": "Not authenticated"
}

// 401 Unauthorized - Token format invalid
{
  "detail": "Invalid authentication credentials"
}
```

#### Authorization Errors
```json
// 403 Forbidden - Wrong role
{
  "detail": "Not authorized for this action"
}

// 403 Forbidden - Not approved
{
  "detail": "Your account is pending admin approval. You'll receive an email when approved."
}
```

#### Validation Errors
```json
// 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

#### Rate Limiting
```json
// 429 Too Many Requests
{
  "detail": "Rate limit exceeded. Please try again later.",
  "code": "rate_limit_exceeded"
}
```

---

## Configuration

### ⚙️ Authentication Settings

**File:** [core/config.py](core/config.py)

```python
# Token expiration time (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# JWT secret key
SECRET_KEY = "your-secret-key-here"

# JWT algorithm
ALGORITHM = "HS256"

# CORS origins
CORS_ORIGINS = [
  "https://pms-frontend-ten.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
]

# Email configuration
EMAILS_ENABLED = True
SMTP_HOST = "smtp.gmail.com"
```

---

### 🔐 Token Expiration

| Type | Default Expiry | Remember Me | Use Case |
|------|-----------------|-------------|----------|
| **Doctor Login** | 60 minutes | 30 days | Dashboard access |
| **Patient Login** | 30 days | N/A | Website access |
| **Password Reset** | 24 hours | N/A | Email token |

---

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/login/access-token` | 5 requests | 1 minute |
| `/login` | 5 requests | 1 minute |
| `/login/patient-simple` | 5 requests | 1 minute |
| `/password-recovery` | Unlimited | N/A |

---

## Quick Reference

### Auth Headers

**Dashboard (Doctor/Staff/Admin):**
```
Authorization: Bearer <doctor-oauth2-token>
```

**Website (Patient):**
```
Authorization: Bearer <patient-jwt-token>
```

---

### Common Request Headers

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

---

### API Base URL

```
https://api.herbal.example.com/api/v1
```

---

## Testing Endpoints

### Test Login Token
```
POST /login/test-token
Authorization: Bearer <token>

# Returns current user info
# Use to verify token validity
```

---

### Health Check
```
GET /
GET /doc
```

---

## Swagger Documentation

**Interactive API Docs:**
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc UI
- `GET /openapi.json` - OpenAPI Schema

---

## Summary

| Feature | Dashboard (Doctor) | Website (Patient) |
|---------|-------------------|-------------------|
| **Auth Type** | DoctorOAuth2 | PatientBearer JWT |
| **Login Endpoint** | `/login` or `/login/access-token` | `/login/patient-simple` |
| **Credentials** | Email + Password | Name + Phone |
| **Token Duration** | 60 min (or 30 days) | 30 days |
| **Database Table** | User | Patient |
| **Key APIs** | Users, Patients, Cases, Appointments | Patient Profile, Appointments |

---

**Questions or issues?** Contact: `backend@herbal.example.com`

