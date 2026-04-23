export type ServiceCategory = 'package' | 'addon';
export type VehicleSize = 'small' | 'medium' | 'large';

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  duration: string;
}

export interface VehicleProfile {
  id: string;
  label: string;
  make: string;
  model: string;
  year: string;
  color: string;
  size: VehicleSize;
  serviceIds: string[];
}

export interface CustomerBookingForm {
  fullName: string;
  email: string;
  phone: string;
  zipCode: string;
  sendEmailConfirmation: boolean;
  sendSmsConfirmation: boolean;
  acceptedSmsConsent: boolean;
  notes: string;
  acceptedConsent: boolean;
}

export interface BookingVehicleRequest {
  id: string;
  label: string;
  make: string;
  model: string;
  year: string;
  color: string;
  size: VehicleSize;
  serviceIds: string[];
}

export interface BookingIntakeRequest {
  customer: CustomerBookingForm;
  vehicles: BookingVehicleRequest[];
  honeypot: string;
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}
