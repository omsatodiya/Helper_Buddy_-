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
  details?: string;
  description: string;
  category?: string;
  price: number;
  imageUrl?: string;
  pricing?: {
    basePrice: number;
    discountedPrice?: number;
    unit: "per_hour" | "fixed" | "per_day";
    minimumCharge?: number;
    additionalCharges?: {
      name: string;
      amount: number;
      description?: string;
    }[];
  };
  images?: ServiceImage[];
  serviceTime?: {
    duration: number;
    unit: "minutes" | "hours" | "days";
    availableDays: string[];
    availableHours: {
      start: string;
      end: string;
    };
  };
  provider?: ServiceProvider;
  reviews?: ServiceReview[];
  rating?: number;
  totalReviews?: number;
  features?: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  metadata?: {
    isActive: boolean;
    isPopular: boolean;
    isPromoted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
  maxQuantity?: number;
  availableQuantity?: number;
  servicePincodes?: { pincode: string }[];
  thresholdTime: string;
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