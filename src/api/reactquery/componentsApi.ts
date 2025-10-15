import type { Component } from "../../model";
import { apiService } from "../apiService";

export const fetchComponents = async (): Promise<Component[]> => {
  const response = await apiService.get<Component[]>("/Components");
  return response.data;
};