// Web Content Management Service
import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

// ====== Hero Section Models ======
export interface Credential {
  id?: number;
  label: string;
  value: string;
  order: number;
}

export interface HeroSectionCreate {
  title: string;
  subtitle: string;
  description: string;
  credentials: Credential[];
}

export interface HeroSectionUpdate {
  title?: string;
  subtitle?: string;
  description?: string;
  credentials?: Credential[];
}

export interface HeroSectionResponse {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  credentials: Credential[];
  created_at: string;
  updated_at: string;
}

// ====== About Doctor Models ======
export interface Qualification {
  id?: number;
  qualification_text: string;
  order: number;
}

export interface Specialization {
  id?: number;
  specialization_text: string;
  order: number;
}

export interface AboutDoctorCreate {
  title: string;
  experience_title: string;
  experience_description: string;
  qualifications: Qualification[];
  specializations: Specialization[];
}

export interface AboutDoctorUpdate {
  title?: string;
  experience_title?: string;
  experience_description?: string;
  qualifications?: Qualification[];
  specializations?: Specialization[];
}

export interface AboutDoctorResponse {
  id: number;
  title: string;
  experience_title: string;
  experience_description: string;
  qualifications: Qualification[];
  specializations: Specialization[];
  created_at: string;
  updated_at: string;
}

// ====== Services & Treatments Models ======
export interface Service {
  id?: number;
  icon: string;
  image_url: string;
  title: string;
  description: string;
  order: number;
}

export interface ServicesAndTreatmentsCreate {
  title: string;
  services: Service[];
}

export interface ServicesAndTreatmentsUpdate {
  title?: string;
  services?: Service[];
}

export interface ServicesAndTreatmentsResponse {
  id: number;
  title: string;
  services: Service[];
  created_at: string;
  updated_at: string;
}

// ====== Patient Success Stories Models ======
export interface Testimonial {
  id?: number;
  name: string;
  city: string;
  rating: number;
  message: string;
  order: number;
  is_approved: boolean;
}

export interface PatientSuccessStoriesCreate {
  title: string;
  testimonials: Testimonial[];
}

export interface PatientSuccessStoriesUpdate {
  title?: string;
  testimonials?: Testimonial[];
}

export interface PatientSuccessStoriesResponse {
  id: number;
  title: string;
  testimonials: Testimonial[];
  created_at: string;
  updated_at: string;
}

// ====== Contact Information Models ======
export interface ContactInformationCreate {
  title: string;
  address: string;
  city: string;
  phone_primary: string;
  phone_secondary?: string;
  weekdays_hours: string;
  saturday_hours: string;
  sunday_hours: string;
  whatsapp_number: string;
  whatsapp_message: string;
}

export interface ContactInformationUpdate {
  title?: string;
  address?: string;
  city?: string;
  phone_primary?: string;
  phone_secondary?: string;
  weekdays_hours?: string;
  saturday_hours?: string;
  sunday_hours?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
}

export interface ContactInformationResponse {
  id: number;
  title: string;
  address: string;
  city: string;
  phone_primary: string;
  phone_secondary?: string;
  weekdays_hours: string;
  saturday_hours: string;
  sunday_hours: string;
  whatsapp_number: string;
  whatsapp_message: string;
  created_at: string;
  updated_at: string;
}

// ====== Service Methods ======
export class WebContentService {
  // ====== Hero Section Endpoints ======
  public static createHeroSection(data: {
    requestBody: HeroSectionCreate;
  }): CancelablePromise<HeroSectionResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/web-content/hero-section",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getHeroSection(
    heroId: number,
  ): CancelablePromise<HeroSectionResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/web-content/hero-section/${heroId}`,
      errors: {
        404: "Hero Section not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static listHeroSections(): CancelablePromise<HeroSectionResponse[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/web-content/hero-section",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static updateHeroSection(data: {
    heroId: number;
    requestBody: HeroSectionUpdate;
  }): CancelablePromise<HeroSectionResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/web-content/hero-section/${data.heroId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        404: "Hero Section not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteHeroSection(heroId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/web-content/hero-section/${heroId}`,
      errors: {
        404: "Hero Section not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  // ====== About Doctor Endpoints ======
  public static createAboutDoctor(data: {
    requestBody: AboutDoctorCreate;
  }): CancelablePromise<AboutDoctorResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/web-content/about-doctor",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getAboutDoctor(
    aboutDoctorId: number,
  ): CancelablePromise<AboutDoctorResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/web-content/about-doctor/${aboutDoctorId}`,
      errors: {
        404: "About Doctor not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static listAboutDoctor(): CancelablePromise<AboutDoctorResponse[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/web-content/about-doctor",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static updateAboutDoctor(data: {
    aboutDoctorId: number;
    requestBody: AboutDoctorUpdate;
  }): CancelablePromise<AboutDoctorResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/web-content/about-doctor/${data.aboutDoctorId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        404: "About Doctor not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteAboutDoctor(
    aboutDoctorId: number,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/web-content/about-doctor/${aboutDoctorId}`,
      errors: {
        404: "About Doctor not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  // ====== Services & Treatments Endpoints ======
  public static createServices(data: {
    requestBody: ServicesAndTreatmentsCreate;
  }): CancelablePromise<ServicesAndTreatmentsResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/web-content/services",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getServices(
    servicesId: number,
  ): CancelablePromise<ServicesAndTreatmentsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/web-content/services/${servicesId}`,
      errors: {
        404: "Services not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static listServices(): CancelablePromise<
    ServicesAndTreatmentsResponse[]
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/web-content/services",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static updateServices(data: {
    servicesId: number;
    requestBody: ServicesAndTreatmentsUpdate;
  }): CancelablePromise<ServicesAndTreatmentsResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/web-content/services/${data.servicesId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        404: "Services not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteServices(servicesId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/web-content/services/${servicesId}`,
      errors: {
        404: "Services not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  // ====== Patient Success Stories Endpoints ======
  public static createTestimonials(data: {
    requestBody: PatientSuccessStoriesCreate;
  }): CancelablePromise<PatientSuccessStoriesResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/web-content/testimonials",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getTestimonials(
    testimonialsId: number,
  ): CancelablePromise<PatientSuccessStoriesResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/web-content/testimonials/${testimonialsId}`,
      errors: {
        404: "Testimonials not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static listTestimonials(): CancelablePromise<
    PatientSuccessStoriesResponse[]
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/web-content/testimonials",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static updateTestimonials(data: {
    testimonialsId: number;
    requestBody: PatientSuccessStoriesUpdate;
  }): CancelablePromise<PatientSuccessStoriesResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/web-content/testimonials/${data.testimonialsId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        404: "Testimonials not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteTestimonials(
    testimonialsId: number,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/web-content/testimonials/${testimonialsId}`,
      errors: {
        404: "Testimonials not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  // ====== Contact Information Endpoints ======
  public static createContactInfo(data: {
    requestBody: ContactInformationCreate;
  }): CancelablePromise<ContactInformationResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/web-content/contact-info",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static getContactInfo(
    contactId: number,
  ): CancelablePromise<ContactInformationResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: `/web-content/contact-info/${contactId}`,
      errors: {
        404: "Contact Information not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static listContactInfo(): CancelablePromise<
    ContactInformationResponse[]
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/web-content/contact-info",
      errors: {
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static updateContactInfo(data: {
    contactId: number;
    requestBody: ContactInformationUpdate;
  }): CancelablePromise<ContactInformationResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/web-content/contact-info/${data.contactId}`,
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        404: "Contact Information not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }

  public static deleteContactInfo(contactId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/web-content/contact-info/${contactId}`,
      errors: {
        404: "Contact Information not found",
        403: "Forbidden",
        401: "Unauthorized",
      },
    });
  }
}
