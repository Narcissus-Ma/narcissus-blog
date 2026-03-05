export interface UploadFileResponse {
  key: string;
  url: string;
}

export interface CreateUploadTicketRequest {
  filename: string;
  mimeType: string;
  size?: number;
}

export interface UploadTicketResult {
  key: string;
  url: string;
  uploadProvider: string;
  note: string;
}

export interface MediaAssetItem {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  uploaderId: string;
}
