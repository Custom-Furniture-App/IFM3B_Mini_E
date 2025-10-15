import type { Product } from "../../model";
import { apiService } from "../apiService";

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiService.get<Product[]>("/Products");
  return response.data;
};
