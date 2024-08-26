import { getAuth } from "../auth/actions/get-auth";
import { GetFileResponse } from "../types";
import { getApiUrl } from "./util/api-url";

export const getFile = async (fileId: string) => {
  const api = getApiUrl("getFile", fileId);

  const auth = await getAuth();

  const response = await fetch(api.url, {
    method: api.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth || "",
    },
  });

  const data = (await response.json()) as GetFileResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message);
  }

  return data.data.FileWithContent;
};
