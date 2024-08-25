import { API_URL } from "../const";
import { StoreResponse } from "../types";
import { useApiUrl } from "./util/api-url";

export const authenticate = async (username: string, password: string) => {
  const authString = `${username}:${password}`;

  const api = useApiUrl("authenticate");

  const res = await fetch(api.url, {
    method: api.method,
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
