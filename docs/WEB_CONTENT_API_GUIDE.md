# Web Content Management API Guide

**Module:** Web Content Management  
**Version:** 1.0.0  
**Last Updated:** February 15, 2026  
**Audience:** Frontend Engineers, Mobile Developers

---

## Overview

This module provides comprehensive APIs for managing website content sections including:

- **Hero Section** 🎯 - Main landing page banner with credentials
- **About Doctor Section** 👨‍⚕️ - Doctor biography, qualifications, and specializations
- **Services & Treatments** 🏥 - Service offerings with descriptions and images
- **Patient Success Stories** ⭐ - Testimonials and patient reviews
- **Contact Information** 📞 - Phone, address, hours, and WhatsApp details

---

## Authentication & Authorization

- **All endpoints:** DoctorOAuth2 (Doctor or Admin role required)
- **Create/Update/Delete:** Doctors and Admins only
- **Read:** Doctors and Admins only

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
  "detail": "Only doctors and admins can manage website content"
}
```

---

## 🎯 Hero Section API

The Hero Section is the main banner on your website displaying title, subtitle, description, and key credentials.

### Data Models

#### CredentialCreate (Request)

```json
{
  "label": "Experience",
  "value": "15+ Years",
  "order": 1
}
```

**Fields:**

- `label` (string, required): Credential label (e.g., "Experience", "Patients Treated")
- `value` (string, required): Credential value (e.g., "15+ Years", "5000+")
- `order` (integer): Display order (default: 0)

#### CredentialResponse (Response)

```json
{
  "id": 1,
  "label": "Experience",
  "value": "15+ Years",
  "order": 1
}
```

**Fields:**

- `id` (integer): Unique credential ID
- `label` (string): Credential label
- `value` (string): Credential value
- `order` (integer): Display order

#### HeroSectionCreate (Request)

```json
{
  "title": "Welcome to Herbal Healing Clinic",
  "subtitle": "Experience Natural Wellness",
  "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
  "credentials": [
    {
      "label": "Experience",
      "value": "15+ Years"
    },
    {
      "label": "Patients Treated",
      "value": "5000+"
    },
    {
      "label": "Success Rate",
      "value": "95%"
    }
  ]
}
```

**Fields:**

- `title` (string, required, max 200): Hero section title
- `subtitle` (string, required, max 200): Hero section subtitle
- `description` (string, required, max 1000): Detailed description
- `credentials` (array, required): List of credential objects

#### HeroSectionUpdate (Request)

All fields optional.

```json
{
  "title": "Updated Title",
  "subtitle": "Updated Subtitle",
  "description": "Updated description",
  "credentials": [
    {
      "label": "New Credential",
      "value": "New Value"
    }
  ]
}
```

#### HeroSectionResponse (Response)

```json
{
  "id": 1,
  "title": "Welcome to Herbal Healing Clinic",
  "subtitle": "Experience Natural Wellness",
  "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
  "credentials": [
    {
      "id": 1,
      "label": "Experience",
      "value": "15+ Years",
      "order": 1
    },
    {
      "id": 2,
      "label": "Patients Treated",
      "value": "5000+",
      "order": 2
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

---

### Hero Section Endpoints

#### 1. Create Hero Section

**Endpoint:** `POST /api/v1/web-content/hero-section`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** HeroSectionCreate

```json
{
  "title": "Welcome to Herbal Healing Clinic",
  "subtitle": "Experience Natural Wellness",
  "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
  "credentials": [
    {
      "label": "Experience",
      "value": "15+ Years",
      "order": 1
    },
    {
      "label": "Patients Treated",
      "value": "5000+",
      "order": 2
    },
    {
      "label": "Success Rate",
      "value": "95%",
      "order": 3
    }
  ]
}
```

**Response (201 Created):** HeroSectionResponse

```json
{
  "id": 1,
  "title": "Welcome to Herbal Healing Clinic",
  "subtitle": "Experience Natural Wellness",
  "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
  "credentials": [
    {
      "id": 1,
      "label": "Experience",
      "value": "15+ Years",
      "order": 1
    },
    {
      "id": 2,
      "label": "Patients Treated",
      "value": "5000+",
      "order": 2
    },
    {
      "id": 3,
      "label": "Success Rate",
      "value": "95%",
      "order": 3
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content

---

#### 2. Get Hero Section by ID

**Endpoint:** `GET /api/v1/web-content/hero-section/{hero_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Path Parameters:**

- `hero_id` (integer, required): Hero section ID

**Response (200 OK):** HeroSectionResponse

```json
{
  "id": 1,
  "title": "Welcome to Herbal Healing Clinic",
  "subtitle": "Experience Natural Wellness",
  "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
  "credentials": [
    {
      "id": 1,
      "label": "Experience",
      "value": "15+ Years",
      "order": 1
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content
- 404: Hero Section not found

---

#### 3. List All Hero Sections

**Endpoint:** `GET /api/v1/web-content/hero-section`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** Array of HeroSectionResponse

```json
[
  {
    "id": 1,
    "title": "Welcome to Herbal Healing Clinic",
    "subtitle": "Experience Natural Wellness",
    "description": "We provide holistic healing through time-tested herbal remedies and personalized care",
    "credentials": [
      {
        "id": 1,
        "label": "Experience",
        "value": "15+ Years",
        "order": 1
      }
    ],
    "created_at": "2026-02-15T10:30:00",
    "updated_at": "2026-02-15T10:30:00"
  }
]
```

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content

---

#### 4. Update Hero Section

**Endpoint:** `PUT /api/v1/web-content/hero-section/{hero_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Path Parameters:**

- `hero_id` (integer, required): Hero section ID

**Request Body:** HeroSectionUpdate (all fields optional)

```json
{
  "title": "Updated Title",
  "subtitle": "Updated Subtitle",
  "description": "Updated description text",
  "credentials": [
    {
      "label": "New Credential",
      "value": "New Value",
      "order": 1
    }
  ]
}
```

**Response (200 OK):** HeroSectionResponse

**Notes:**

- When updating credentials, existing credentials are deleted and replaced with new ones
- Only provided fields are updated

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Hero Section not found

---

#### 5. Delete Hero Section

**Endpoint:** `DELETE /api/v1/web-content/hero-section/{hero_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Path Parameters:**

- `hero_id` (integer, required): Hero section ID

**Response (204 No Content):** Empty

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Hero Section not found

---

## 👨‍⚕️ About Doctor Section API

### Data Models

#### QualificationCreate (Request)

```json
{
  "qualification_text": "BAMS (Bachelor of Ayurvedic Medicine and Surgery)",
  "order": 1
}
```

#### SpecializationCreate (Request)

```json
{
  "specialization_text": "Herbal Medicine Specialist",
  "order": 1
}
```

#### AboutDoctorCreate (Request)

```json
{
  "title": "Dr. Raj Kumar",
  "experience_title": "15+ Years in Holistic Medicine",
  "experience_description": "Specializing in herbal remedies and natural wellness treatments",
  "qualifications": [
    {
      "qualification_text": "BAMS (Bachelor of Ayurvedic Medicine and Surgery)",
      "order": 1
    },
    {
      "qualification_text": "MD in Herbal Medicine",
      "order": 2
    }
  ],
  "specializations": [
    {
      "specialization_text": "Herbal Medicine Specialist",
      "order": 1
    },
    {
      "specialization_text": "Oncology Support",
      "order": 2
    }
  ]
}
```

#### AboutDoctorResponse (Response)

```json
{
  "id": 1,
  "title": "Dr. Raj Kumar",
  "experience_title": "15+ Years in Holistic Medicine",
  "experience_description": "Specializing in herbal remedies and natural wellness treatments",
  "qualifications": [
    {
      "id": 1,
      "qualification_text": "BAMS (Bachelor of Ayurvedic Medicine and Surgery)",
      "order": 1
    }
  ],
  "specializations": [
    {
      "id": 1,
      "specialization_text": "Herbal Medicine Specialist",
      "order": 1
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

### About Doctor Endpoints

#### 1. Create About Doctor

**Endpoint:** `POST /api/v1/web-content/about-doctor`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** AboutDoctorCreate

**Response (201 Created):** AboutDoctorResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content

---

#### 2. Get About Doctor by ID

**Endpoint:** `GET /api/v1/web-content/about-doctor/{about_doctor_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** AboutDoctorResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content
- 404: About Doctor section not found

---

#### 3. List All About Doctor Sections

**Endpoint:** `GET /api/v1/web-content/about-doctor`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** Array of AboutDoctorResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content

---

#### 4. Update About Doctor

**Endpoint:** `PUT /api/v1/web-content/about-doctor/{about_doctor_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** AboutDoctorUpdate (all fields optional)

**Response (200 OK):** AboutDoctorResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: About Doctor section not found

---

#### 5. Delete About Doctor

**Endpoint:** `DELETE /api/v1/web-content/about-doctor/{about_doctor_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (204 No Content):** Empty

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: About Doctor section not found

---

## 🏥 Services & Treatments API

### Data Models

#### ServiceCreate (Request)

```json
{
  "icon": "heart-icon",
  "image_url": "https://example.com/images/herbal-treatment.jpg",
  "title": "Herbal Treatment",
  "description": "Comprehensive herbal treatment using natural remedies",
  "order": 1
}
```

#### ServicesAndTreatmentsCreate (Request)

```json
{
  "title": "Our Services",
  "services": [
    {
      "icon": "heart-icon",
      "image_url": "https://example.com/images/herbal-treatment.jpg",
      "title": "Herbal Treatment",
      "description": "Comprehensive herbal treatment using natural remedies",
      "order": 1
    },
    {
      "icon": "wellness-icon",
      "image_url": "https://example.com/images/wellness.jpg",
      "title": "Wellness Consultation",
      "description": "Personalized wellness consultation",
      "order": 2
    }
  ]
}
```

#### ServiceResponse (Response)

```json
{
  "id": 1,
  "icon": "heart-icon",
  "image_url": "https://example.com/images/herbal-treatment.jpg",
  "title": "Herbal Treatment",
  "description": "Comprehensive herbal treatment using natural remedies",
  "order": 1
}
```

#### ServicesAndTreatmentsResponse (Response)

```json
{
  "id": 1,
  "title": "Our Services",
  "services": [
    {
      "id": 1,
      "icon": "heart-icon",
      "image_url": "https://example.com/images/herbal-treatment.jpg",
      "title": "Herbal Treatment",
      "description": "Comprehensive herbal treatment using natural remedies",
      "order": 1
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

### Services Endpoints

#### 1. Create Services & Treatments

**Endpoint:** `POST /api/v1/web-content/services`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** ServicesAndTreatmentsCreate

**Response (201 Created):** ServicesAndTreatmentsResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content

---

#### 2. Get Services & Treatments by ID

**Endpoint:** `GET /api/v1/web-content/services/{services_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** ServicesAndTreatmentsResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content
- 404: Services section not found

---

#### 3. List All Services & Treatments

**Endpoint:** `GET /api/v1/web-content/services`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** Array of ServicesAndTreatmentsResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content

---

#### 4. Update Services & Treatments

**Endpoint:** `PUT /api/v1/web-content/services/{services_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** ServicesAndTreatmentsUpdate (all fields optional)

**Response (200 OK):** ServicesAndTreatmentsResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Services section not found

---

#### 5. Delete Services & Treatments

**Endpoint:** `DELETE /api/v1/web-content/services/{services_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (204 No Content):** Empty

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Services section not found

---

## ⭐ Patient Success Stories API

### Data Models

#### TestimonialCreate (Request)

```json
{
  "name": "John Doe",
  "city": "Mumbai",
  "rating": 5,
  "message": "Great treatment! Highly recommended!",
  "order": 1,
  "is_approved": true
}
```

**Fields:**

- `name` (string, required): Patient name
- `city` (string, required): Patient city
- `rating` (integer, required): Rating 1-5
- `message` (string, required): Testimonial message
- `order` (integer): Display order (default: 0)
- `is_approved` (boolean): Moderation flag (default: true)

#### PatientSuccessStoriesCreate (Request)

```json
{
  "title": "Success Stories",
  "testimonials": [
    {
      "name": "John Doe",
      "city": "Mumbai",
      "rating": 5,
      "message": "Great treatment! Highly recommended!",
      "order": 1,
      "is_approved": true
    },
    {
      "name": "Jane Smith",
      "city": "Bangalore",
      "rating": 5,
      "message": "Very professional and caring",
      "order": 2,
      "is_approved": true
    }
  ]
}
```

#### TestimonialResponse (Response)

```json
{
  "id": 1,
  "name": "John Doe",
  "city": "Mumbai",
  "rating": 5,
  "message": "Great treatment! Highly recommended!",
  "order": 1,
  "is_approved": true
}
```

#### PatientSuccessStoriesResponse (Response)

```json
{
  "id": 1,
  "title": "Success Stories",
  "testimonials": [
    {
      "id": 1,
      "name": "John Doe",
      "city": "Mumbai",
      "rating": 5,
      "message": "Great treatment! Highly recommended!",
      "order": 1,
      "is_approved": true
    }
  ],
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

### Testimonials Endpoints

#### 1. Create Patient Success Stories

**Endpoint:** `POST /api/v1/web-content/testimonials`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** PatientSuccessStoriesCreate

**Response (201 Created):** PatientSuccessStoriesResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content

---

#### 2. Get Patient Success Stories by ID

**Endpoint:** `GET /api/v1/web-content/testimonials/{testimonials_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** PatientSuccessStoriesResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content
- 404: Testimonials section not found

---

#### 3. List All Patient Success Stories

**Endpoint:** `GET /api/v1/web-content/testimonials`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** Array of PatientSuccessStoriesResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content

---

#### 4. Update Patient Success Stories

**Endpoint:** `PUT /api/v1/web-content/testimonials/{testimonials_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** PatientSuccessStoriesUpdate (all fields optional)

**Response (200 OK):** PatientSuccessStoriesResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Testimonials section not found

---

#### 5. Delete Patient Success Stories

**Endpoint:** `DELETE /api/v1/web-content/testimonials/{testimonials_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (204 No Content):** Empty

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Testimonials section not found

---

## 📞 Contact Information API

### Data Models

#### ContactInformationCreate (Request)

```json
{
  "title": "Herbal Healing Clinic",
  "address": "123 Wellness Street",
  "city": "Mumbai",
  "phone_primary": "+91-9876543210",
  "phone_secondary": "+91-9876543211",
  "weekdays_hours": "9:00 AM - 6:00 PM",
  "saturday_hours": "9:00 AM - 1:00 PM",
  "sunday_hours": "Closed",
  "whatsapp_number": "+91-9876543210",
  "whatsapp_message": "Hello! How can we help you?"
}
```

**Fields:**

- `title` (string, required): Clinic name
- `address` (string, required): Street address
- `city` (string, required): City name
- `phone_primary` (string, required): Primary contact number
- `phone_secondary` (string, optional): Secondary contact number
- `weekdays_hours` (string, required): Weekday operating hours
- `saturday_hours` (string, required): Saturday operating hours
- `sunday_hours` (string, required): Sunday operating hours
- `whatsapp_number` (string, required): WhatsApp number
- `whatsapp_message` (string, required): Default WhatsApp message

#### ContactInformationUpdate (Request)

All fields optional.

```json
{
  "phone_primary": "+91-9876543210",
  "weekdays_hours": "10:00 AM - 7:00 PM",
  "whatsapp_number": "+91-9876543210"
}
```

#### ContactInformationResponse (Response)

```json
{
  "id": 1,
  "title": "Herbal Healing Clinic",
  "address": "123 Wellness Street",
  "city": "Mumbai",
  "phone_primary": "+91-9876543210",
  "phone_secondary": "+91-9876543211",
  "weekdays_hours": "9:00 AM - 6:00 PM",
  "saturday_hours": "9:00 AM - 1:00 PM",
  "sunday_hours": "Closed",
  "whatsapp_number": "+91-9876543210",
  "whatsapp_message": "Hello! How can we help you?",
  "created_at": "2026-02-15T10:30:00",
  "updated_at": "2026-02-15T10:30:00"
}
```

### Contact Information Endpoints

#### 1. Create Contact Information

**Endpoint:** `POST /api/v1/web-content/contact-info`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** ContactInformationCreate

**Response (201 Created):** ContactInformationResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content

---

#### 2. Get Contact Information by ID

**Endpoint:** `GET /api/v1/web-content/contact-info/{contact_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** ContactInformationResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content
- 404: Contact Information not found

---

#### 3. List All Contact Information

**Endpoint:** `GET /api/v1/web-content/contact-info`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (200 OK):** Array of ContactInformationResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can access website content

---

#### 4. Update Contact Information

**Endpoint:** `PUT /api/v1/web-content/contact-info/{contact_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Request Body:** ContactInformationUpdate (all fields optional)

**Response (200 OK):** ContactInformationResponse

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Contact Information not found

---

#### 5. Delete Contact Information

**Endpoint:** `DELETE /api/v1/web-content/contact-info/{contact_id}`

**Authentication:** DoctorOAuth2 (Doctor or Admin)

**Response (204 No Content):** Empty

**Errors:**

- 401: Not authenticated
- 403: Only doctors and admins can manage website content
- 404: Contact Information not found

---

## ⚠️ Important Notes

### Key Points

1. **Authorization**: All endpoints require Doctor or Admin role
2. **Nested Data**: When updating sections (Hero, About, Services, etc.), child items (credentials, qualifications, testimonials) are replaced entirely
3. **Order Field**: Use the `order` field to control display sequence on frontend
4. **Timestamps**: All responses include `created_at` and `updated_at` timestamps
5. **Moderation**: Testimonials have an `is_approved` flag for content moderation

### Frontend Integration Notes

#### For Hero Section

- Display credentials in the order specified by the `order` field
- Credentials are ideal for showcasing key metrics (experience, patients, success rate, etc.)

#### For About Doctor

- Qualifications and specializations should be displayed in order
- These help establish credibility and trust

#### For Services

- Each service has an icon and image URL for visual presentation
- Use these to create attractive service cards

#### For Testimonials

- Filter testimonials by `is_approved` flag for moderation
- Display rating as star count (1-5)
- Sort by order field for display sequence

#### For Contact

- Use phone_primary and phone_secondary for click-to-call functionality
- Store whatsapp_number separately for WhatsApp integration
- Display operating hours in user-friendly format

### Common Use Cases

#### Update Hero Section Credentials

```
PUT /api/v1/web-content/hero-section/{hero_id}
Body: {
  "credentials": [
    {"label": "Experience", "value": "20+ Years", "order": 1},
    {"label": "Patients", "value": "10000+", "order": 2}
  ]
}
```

#### Get All Contact Information

```
GET /api/v1/web-content/contact-info
Response: Array with all contact details for multiple locations/branches
```

#### Moderate Testimonials (Create with is_approved: false, then review)

```
POST /api/v1/web-content/testimonials
Body: {
  "title": "Testimonials",
  "testimonials": [
    {
      "name": "Patient Name",
      "city": "City",
      "rating": 5,
      "message": "Message...",
      "is_approved": false
    }
  ]
}
```

---

## Version History

| Version | Date         | Changes                                                               |
| ------- | ------------ | --------------------------------------------------------------------- |
| 1.0.0   | Feb 15, 2026 | Complete Web Content Management API documentation with all 5 sections |
