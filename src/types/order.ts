export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  paystackReference: string;
  metadata?: {
    deliveryMethod?: string;
    deliveryAddress?: string;
    country?: string;
    specialInstructions?: string;
  };
  createdAt: string;
  updatedAt: string;
}
