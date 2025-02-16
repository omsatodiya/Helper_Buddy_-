export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
  serviceProvider?: string;
} 