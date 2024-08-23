export type Log = {
  timestamp: number;
  file_name: string;
  id: string;
  file_extension: string;
};

export type FileWithContent = Log & {
  content: Buffer;
};

export type StoreRequest = {
  content: Buffer;
  file_name: string;
  file_extension: string;
};

export type StoreResponseData = {
  SingleLog: Log;
  FileWithContent: FileWithContent;
  MultipleLogs: Log[];
};

export type StoreResponse = {
  message: string;
  success: boolean;
  data: StoreResponseData | null;
};
