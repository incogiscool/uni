import { getAuth } from "../auth/actions/get-auth";
import { DeleteFileResponse } from "../types";
import { getApiUrl } from "./util/api-url";

export const deleteFile = async (fileId: string) => {
  const api = getApiUrl("deleteFile", fileId);

  const auth = await getAuth();

  const response = await fetch(api.url, {
    method: api.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth || "",
    },
  });

  const data = (await response.json()) as DeleteFileResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message);
  }

  return data.data;
};
