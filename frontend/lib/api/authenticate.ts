import { API_URL } from "./const";
import { StoreResponse } from "./types";

export const authenticate = async (username: string, password: string) => {
  const authString = `${username}:${password}`;

  const res = await fetch(`${API_URL}/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: authString,
    },
  });

  const data = (await res.json()) as StoreResponse;

  if (!res.ok || !data.success) {
    throw new Error(data.message);
  }

  return data;
};
