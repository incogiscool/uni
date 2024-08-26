import { API_URL } from "@/lib/const";
import { ApiIntent } from "@/lib/types";

export const getApiUrl = (intent: ApiIntent, extend?: string) => {
  let route = "";
  let method = "GET";

  switch (intent) {
    case "getLogs":
      route = "/logs";
      method = "GET";
      break;
    case "authenticate":
      route = "/";
      method = "GET";
      break;

    case "deleteFile":
      if (!extend) {
        throw new Error("Extend (file ID) is required.");
      }

      route = `/files/${extend}`;
      method = "DELETE";
      break;

    case "uploadFile":
      route = "/upload";
      method = "POST";
      break;

    case "getFile":
      if (!extend) {
        throw new Error("Extend (file ID) is required.");
      }

      route = `/files/${extend}`;
      method = "GET";
      break;

    default:
      route = "/";
      method = "GET";
      break;
  }

  return {
    url: `${API_URL}${route}`,
    method,
  };
};
