import { getAuth } from "../auth/actions/get-auth";
import { UploadFileResponse } from "../types";
import { useApiUrl } from "./util/api-url";

export const uploadFile = async (file: File) => {
  const api = useApiUrl("uploadFile");
  const auth = await getAuth();

  var re = /(?:\.([^.]+))?$/;

  const ext = re.exec(file.name)?.[1] || "";

  // Convert the file to an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Convert the ArrayBuffer to a Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert the Uint8Array to a regular array of numbers
  const contentArray = Array.from(uint8Array);

  const payload = {
    file_name: file.name,
    file_extension: ext,
    content: contentArray,
  };

  const response = await fetch(api.url, {
    method: api.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth || "",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as UploadFileResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message);
  }

  return data.data.SingleLog;
};
