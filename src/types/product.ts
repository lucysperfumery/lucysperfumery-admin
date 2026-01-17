export interface ProductOption {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  isActive?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  isActive: boolean;
  options?: ProductOption[];
  hasOptions?: boolean; // Virtual field from backend
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  options?: ProductOption[];
}
