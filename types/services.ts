export interface ServiceProvider {
  id: string;
  providerName: string;
  providerAddress: string;
  providerMobileNumber: string;
  providerState: string;
  providerGender: string;
  providerCity: string;
  providerPinCode: string;
  email: string;
  servicePincodes: Array<{ pincode: string }>;
  services: string[];
  providerReviews: number; // Average rating (1-5)
  numberOfReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  details: string;
  price: number;
  category: string;
  review: number;
  providers: Array<{
    providerId: string;
    price?: number;
    isAvailable: boolean;
    serviceAreas: string[]; // Array of pincodes
    createdAt: Date;
  }>;
  reviews: Array<{
    reviewerId: string;
    providerId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
} 