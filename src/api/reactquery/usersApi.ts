import type { User, UserRq } from "../../model";
import { apiService } from "../apiService";

export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiService.get<User[]>("/Users");
  return response.data;
};

export const getUser = async (userId: number) => {
  const response = await apiService.get<UserRq>(`/Users/${userId}`);
  return response.data;
};
