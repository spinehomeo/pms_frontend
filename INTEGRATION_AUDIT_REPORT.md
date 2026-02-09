# 🔍 Frontend API Integration Audit Report

**Date:** February 9, 2026  
**Status:** Partial Integration - Several Updates Required

---

## Executive Summary

Your frontend has **75% of the backend integrations implemented**, but there are **critical gaps** between the generated OpenAPI client and the backend guide specifications. The main issues are:

1. ❌ **Incomplete User Type Definitions** - Missing doctor profile fields
2. ❌ **Missing /login Endpoint** - Using only OAuth2 token endpoint, not the enhanced login
3. ❌ **User Stats API Not Integrated** - No GET /users/me/stats implementation
4. ❌ **Patient Type Mismatch** - Missing important fields (cnic, city, payment_status)
5. ✅ **Password Change** - Implemented correctly
6. ✅ **Basic User CRUD** - Admin user management works
7. ✅ **Patient Management** - Core endpoints available

---

## Detailed Findings

### 1. ❌ User Type Definitions - CRITICAL

#### Current State (INCOMPLETE)

**File:** [src/client/types.gen.ts](src/client/types.gen.ts)

```typescript
export type UserPublic = {
  email: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string | null;
  id: string;
};

export type UserUpdateMe = {
  full_name?: string | null;
  email?: string | null;
};
```

#### What Backend Actually Returns (PER GUIDE)

According to BACKEND_INTEGRATION_GUIDE.md, `GET /users/me` should return:

```json
{
  "id": "...",
  "email": "...",
  "full_name": "...",
  "role": "doctor | staff | admin", // ❌ MISSING
  "phone": "...", // ❌ MISSING
  "specialization": "...", // ❌ MISSING (doctors)
  "registration_number": "...", // ❌ MISSING (doctors)
  "clinic_name": "...", // ❌ MISSING (doctors)
  "clinic_address": "...", // ❌ MISSING (doctors)
  "consultation_fee": 1500.0, // ❌ MISSING (doctors)
  "is_active": true,
  "is_verified": true,
  "is_approved": true,
  "is_superuser": false,
  "join_date": "2025-01-15", // ❌ MISSING
  "last_login": "2026-02-09" // ❌ MISSING
}
```

#### Impact

- ❌ User profile page cannot display doctor's specialization
- ❌ Cannot show clinic information
- ❌ Cannot display user role in dashboard
- ❌ Cannot show consultation fee

#### Required Changes

1. Regenerate client from backend OpenAPI schema
2. OR manually update `UserPublic` type to include all fields
3. Update `UserUpdateMe` to include updateable doctor fields

---

### 2. ❌ Missing /login Endpoint - HIGH PRIORITY

#### Current Implementation

**File:** [src/routes/login.tsx](src/routes/login.tsx)

Using: `POST /login/access-token` (OAuth2 form-based)

```typescript
loginMutation.mutate(data); // Uses LoginService.loginAccessToken()
// Makes: POST /login/access-token with form data
// Returns: { access_token, token_type, expires_in }
```

#### What Backend Recommends

According to the guide, `POST /login` (enhanced) is **recommended**:

```
POST /login
Content-Type: application/json

{
  "email": "doctor@email.com",
  "password": "SecurePass123",
  "remember_me": false
}
```

Returns: More details including user info

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "...",
    "email": "...",
    "full_name": "...",
    "role": "doctor"
  }
}
```

#### Impact

- ⚠️ Current approach works but doesn't return user info
- ⚠️ Need separate call to GET /users/me to populate user after login
- ⚠️ Missing "remember_me" functionality (30-day token option)

#### Status

- ✅ Works but not optimal
- ❌ Missing user info in login response
- ❌ No remember_me support

---

### 3. ❌ User Stats Endpoint - MISSING

#### What Should Exist

**Per Guide:** `GET /users/me/stats`

```json
Response:
{
  "total_patients": 45,
  "total_cases": 120,
  "total_appointments": 85,
  "total_prescriptions": 95,
  "upcoming_appointments": 5,
  "pending_followups": 3
}
```

#### Current Status

- ❌ Not implemented in generated client
- ❌ Not used anywhere in frontend
- ✅ Dashboard might benefit from showing these stats

#### Where It Should Be Used

- Dashboard home page to show doctor's statistics
- Admin panel to show overall metrics
- User profile to show activity summary

---

### 4. ❌ Patient Type Mismatch - HIGH PRIORITY

#### Current Patient Fields

**File:** [src/client/PatientsService.ts](src/client/PatientsService.ts)

```typescript
export interface PatientCreate {
  full_name: string;
  date_of_birth?: string;
  gender: "male" | "female" | "other" | "child";
  phone?: string;
  email?: string;
  address?: string; // Generic "address"
  occupation?: string;
  referred_by?: string;
  medical_history?: string;
  drug_allergies?: string;
  family_history?: string;
  notes?: string;
}

export interface PatientPublic {
  // ... same fields as above
  age?: number;
  doctor_id: string;
  created_date: string;
  last_visit_date?: string;
}
```

#### What Backend Actually Expects

```json
{
  "full_name": "...",
  "gender": "...",
  "phone": "...",
  "cnic": "12345-6789012-3", // ❌ MISSING - Important!
  "date_of_birth": "1990-05-15",
  "email": "...",
  "residential_address": "...", // ❌ Has "address" not this
  "city": "Lahore", // ❌ MISSING
  "occupation": "...",
  "payment_status": true, // ❌ MISSING - Critical for business
  "medical_history": "...",
  "drug_allergies": "...",
  "family_history": "..."
  // Note: NO "referred_by" or "notes" fields!
}
```

#### Impact

- ❌ CNIC field not captured (important for patient identification in Pakistan)
- ❌ City information lost (affects search/filtering)
- ❌ Payment status not tracked (business critical)
- ❌ Using wrong field names for address

#### Required Changes

1. Update `PatientCreate` interface
2. Update `PatientPublic` interface
3. Update patient forms in UI components
4. Update patient search to use correct fields

---

### 5. ✅ Password Change - CORRECTLY IMPLEMENTED

**Status:** Working correctly

**File:** [src/components/UserSettings/ChangePassword.tsx](src/components/UserSettings/ChangePassword.tsx)

```typescript
const mutation = useMutation({
  mutationFn: (data: UpdatePassword) =>
    UsersService.updatePasswordMe({ requestBody: data }),
  // Calls: PATCH /users/me/password
  // with: { current_password, new_password }
});
```

- ✅ Endpoint: `PATCH /users/me/password`
- ✅ Uses correct service method
- ✅ Form validation works
- ✅ Error handling present

---

### 6. ✅ Admin User Management - MOSTLY WORKING

**Status:** Core functionality implemented

**File:** [src/components/Admin/](src/components/Admin/)

- ✅ Create user: `POST /users/`
- ✅ List users: `GET /users/?skip=0&limit=50`
- ✅ Update user: `PATCH /users/{user_id}`
- ✅ Delete user: `DELETE /users/{user_id}`
- ✅ Get user by ID: `GET /users/{user_id}`

**Issue:** User form doesn't capture all fields that backend supports

- ❌ Missing: specialization, registration_number, phone (in update)
- ❌ Missing: clinic_name, clinic_address, consultation_fee

---

### 7. ✅ Patient Management - IMPLEMENTED

**Status:** Core endpoints available but with field mismatches

**Files:**

- Service: [src/client/PatientsService.ts](src/client/PatientsService.ts)
- Routes: [src/routes/\_layout/patients.tsx](src/routes/_layout/patients.tsx)
- Components: [src/components/Patients/](src/components/Patients/)

**Implemented Endpoints:**

- ✅ `GET /patients/` - List all patients
- ✅ `GET /patients/{patient_id}` - Get single patient
- ✅ `POST /patients/` - Create patient
- ✅ `PUT /patients/{patient_id}` - Update patient
- ✅ `DELETE /patients/{patient_id}` - Delete patient

**Issue:** Field mismatches (see section 4 above)

---

## Summary Table

| API Feature             | Status     | Notes                                               |
| ----------------------- | ---------- | --------------------------------------------------- |
| **Login (OAuth2)**      | ✅ Working | Uses `/login/access-token`                          |
| **Login (Enhanced)**    | ❌ Missing | Should use `/login` with JSON body                  |
| **Get Current User**    | ✅ Working | Missing fields in response                          |
| **Update User Profile** | ⚠️ Partial | Fields incomplete                                   |
| **Change Password**     | ✅ Working | Fully implemented                                   |
| **Delete Account**      | ✅ Working | Implemented                                         |
| **User Stats**          | ❌ Missing | Endpoint not in client                              |
| **Create User (Admin)** | ✅ Working | Form incomplete                                     |
| **List Users (Admin)**  | ✅ Working | Correct pagination                                  |
| **Update User (Admin)** | ✅ Working | Form incomplete                                     |
| **Delete User (Admin)** | ✅ Working | Implemented                                         |
| **List Patients**       | ✅ Working | Field mismatch                                      |
| **Get Patient**         | ✅ Working | Field mismatch                                      |
| **Create Patient**      | ✅ Working | Field mismatch (missing cnic, city, payment_status) |
| **Update Patient**      | ✅ Working | Field mismatch                                      |
| **Delete Patient**      | ✅ Working | Implemented                                         |

---

## Recommended Fixes (Priority Order)

### Priority 1: CRITICAL (Do First)

1. **Regenerate API client** from backend OpenAPI schema
   - This will auto-sync UserPublic, UserUpdateMe, and all types
   - Run: `npm run generate-client`

2. **Fix Patient fields** if not fixed by regeneration
   - Add cnic, city, payment_status
   - Remove incorrect fields (referred_by, notes if not in backend)

### Priority 2: HIGH

3. **Add /login endpoint** implementation
   - Create new login service method
   - Update login form to use `/login` with remember_me option
   - Extract user info from login response

4. **Add user stats endpoint**
   - Add to client generation
   - Use in dashboard

### Priority 3: MEDIUM

5. **Update forms** to collect/display all fields
   - User profile form: add phone, specialization, clinic info
   - Patient form: add cnic, city, payment_status
   - Admin user form: add doctor-specific fields

6. **Update types** if regeneration doesn't fix everything
   - UserPublic
   - UserUpdateMe
   - Patient types

---

## Testing Checklist

After fixes:

- [ ] Login works with `/login/access-token`
- [ ] Optional: Test `/login` endpoint if implemented
- [ ] User profile displays all fields correctly
- [ ] Password change works
- [ ] Creating user populates all required fields
- [ ] Creating patient captures cnic, city, payment_status
- [ ] Patient listing and filtering works
- [ ] Role-based fields show for doctors only

---

## Files to Review/Update

### Type/Schema Files (Generated)

- [src/client/types.gen.ts](src/client/types.gen.ts) - Auto-generated
- [src/client/sdk.gen.ts](src/client/sdk.gen.ts) - Auto-generated
- [src/client/index.ts](src/client/index.ts) - Auto-generated

### Service Files

- [src/client/PatientsService.ts](src/client/PatientsService.ts) - Manually maintained
- [src/client/core/OpenAPI.ts](src/client/core/OpenAPI.ts) - Config

### Component Files to Update

- [src/components/UserSettings/UserInformation.tsx](src/components/UserSettings/UserInformation.tsx) - Add doctor fields
- [src/components/UserSettings/ChangePassword.tsx](src/components/UserSettings/ChangePassword.tsx) - ✅ Good
- [src/components/Admin/AddUser.tsx](src/components/Admin/AddUser.tsx) - Add doctor fields
- [src/components/Patients/AddPatient.tsx](src/components/Patients/AddPatient.tsx) - Add cnic, city, payment_status
- [src/routes/login.tsx](src/routes/login.tsx) - Update if /login endpoint added

---

## Next Steps

1. ✅ Review this report
2. Run: `npm run generate-client` to regenerate from latest backend OpenAPI
3. Compare generated types with this report
4. Update remaining manual implementations
5. Test all critical flows
6. Update unit/E2E tests if needed
