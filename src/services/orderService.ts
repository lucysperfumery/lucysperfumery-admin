import api, { handleApiError } from "./api";
import type { Order } from "../types/order";

class OrderService {
  async getAll(): Promise<Order[]> {
    try {
      const response = await api.get("/api/orders?limit=1000");
      console.log("Fetched orders:", response.data);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getById(id: string): Promise<Order> {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateStatus(
    id: string,
    status: "pending" | "completed" | "failed"
  ): Promise<Order> {
    try {
      const response = await api.patch(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new OrderService();
