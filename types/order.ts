interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerPincode?: string;
  customerCity?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
  status: "pending" | "accepted" | "completed" | "paid" | "cancelled" | "rejected";
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  deliveryDate?: string;
  deliveryTime?: string;
  thresholdTime: string;
  providerName?: string;
  providerResponses?: {
    [providerId: string]: {
      status: "pending" | "accepted" | "rejected";
      updatedAt: Date | { toDate: () => Date };
    };
  };
  availableProviders?: string[];
  remarks?: string;
  isReviewed?: boolean;
} 