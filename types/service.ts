export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalServices: number;
  totalReviews?: number;
  profileImage?: string;
  specializations?: string[];
  location?: {
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ServiceReview {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  userName: string;
  userEmail: string;
  date: string;
  helpful: number;
  editedAt?: string;
  isEdited?: boolean;
  reply?: {
    comment: string;
    date: string;
  };
  orderId: string;
  userId: string;
  createdAt: Date;
}

export interface ServiceImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ServicePricing {
  basePrice: number;
  discountedPrice?: number;
  unit: "per_hour" | "fixed" | "per_day";
  minimumCharge?: number;
  additionalCharges?: {
    name: string;
    amount: number;
    description?: string;
  }[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  details?: string;
  category?: string;
  rating?: number;
  totalReviews?: number;
  reviews?: ServiceReview[];
  images?: { url: string; alt: string; isPrimary: boolean }[];
  provider?: any;
  features?: string[];
  faqs?: { question: string; answer: string }[];
  createdAt: any;
  updatedAt: any;
  serviceTime?: {
    duration: number;
    unit: string;
  };
  imageUrl?: string;
  thresholdTime?: string | number;
  pricing?: {
    unit?: 'per_hour' | 'per_day' | 'fixed';
    basePrice?: number;
    discountedPrice?: number;
  };
  servicePincodes?: { pincode: string }[];
}

export interface SimpleService {
  [x: string]: any;
  id: string;
  name: string;
  description: string;
  price: number;
  details: string;
  rating: number;
  totalReviews: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  reviews?: ServiceReview[];
  servicePincodes?: { pincode: string }[];
}

type ServiceStatus = "pending" | "accepted" | "completed" | "paid" | "rejected" | "cancelled";

export interface ServiceRequest {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerAddress: string;
  customerPincode: string;
  customerCity: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  isPaid?: boolean;
  status: ServiceStatus;
  createdAt: Date;
  completedAt?: Date;
  deliveryDate?: string | Date;
  deliveryTime?: string;
  customerPhone?: string;
  updatedAt?: Date;
}

export interface Order {
  status: ServiceStatus;
} 