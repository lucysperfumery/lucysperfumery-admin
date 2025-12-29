import api, { handleApiError } from "./api";
import type { Product, ProductFormData } from "../types/product";

class ProductService {
  async getAll(): Promise<Product[]> {
    try {
      const response = await api.get("/api/products?limit=1000");
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async create(data: ProductFormData, imageFile?: File): Promise<Product> {
    try {
      const formData = new FormData();

      // Append all product fields
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("brand", data.brand);
      formData.append("stock", data.stock.toString());

      // Append image file if provided
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Created product response:", response);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async update(
    id: string,
    data: Partial<ProductFormData>,
    imageFile?: File
  ): Promise<Product> {
    try {
      const formData = new FormData();

      // Append all provided fields
      if (data.name) formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.price !== undefined)
        formData.append("price", data.price.toString());
      if (data.category) formData.append("category", data.category);
      if (data.brand) formData.append("brand", data.brand);
      if (data.stock !== undefined)
        formData.append("stock", data.stock.toString());

      // Append image file if provided
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.put(`/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ProductService();
