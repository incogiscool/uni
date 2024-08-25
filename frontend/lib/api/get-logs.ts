import { getAuth } from "../auth/actions/get-auth";
import { LogResponse } from "../types";
import { useApiUrl } from "./util/api-url";

export const getLogs = async () => {
  const apiUrl = useApiUrl("getLogs");

  const auth = await getAuth();

  const res = await fetch(apiUrl.url, {
    method: apiUrl.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth || "",
    },
  });

  const data = (await res.json()) as LogResponse;

  if (!res.ok || !data.success) {
    throw new Error(data.message);
  }

  return data.data.MultipleLogs;
};
