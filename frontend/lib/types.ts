export type Log = {
  timestamp: number;
  file_name: string;
  id: string;
  file_extension: string;
  size: number;
};

export type FileWithContent = Log & {
  content: number[];
};

export type StoreRequest = {
  content: Buffer;
  file_name: string;
  file_extension: string;
};

export type StoreResponseData = {
  SingleLog: { SingleLog: Log };
  FileWithContent: { FileWithContent: FileWithContent };
  MultipleLogs: { MultipleLogs: Log[] };
};

export type StoreResponse<T = null> = {
  message: string;
  success: boolean;
  data: T;
};

export type LogResponse = StoreResponse<StoreResponseData["MultipleLogs"]>;
export type DeleteFileResponse = StoreResponse<null>;
export type UploadFileResponse = StoreResponse<StoreResponseData["SingleLog"]>;
export type GetFileResponse = StoreResponse<
  StoreResponseData["FileWithContent"]
>;

export type ApiIntent =
  | "getLogs"
  | "authenticate"
  | "deleteFile"
  | "uploadFile"
  | "getFile";
