import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      return (
        error.response.data.message ||
        error.response.data.error ||
        "An error occurred"
      );
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred";
};

export default api;
