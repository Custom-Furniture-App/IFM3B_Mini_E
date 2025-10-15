import type {  Order } from "../../model";
import { apiService } from "../apiService";

export const fetchAllOrders = async (): Promise<Order[]> => {
  const response = await apiService.get<Order[]>("/Orders");
  return response.data;
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  const response = await apiService.get<Order>(`/Orders/${id}`);
  return response.data;
};