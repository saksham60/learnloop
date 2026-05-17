export type ContentUploadPayload = {
  filename: string;
  content_type: string;
  storage_path: string;
};

export type ContentUpload = {
  id: string;
  filename: string;
  status: string;
};

export type ContentProcessPayload = {
  raw_text?: string | null;
};

export type ContentProcessResult = {
  id: string;
  chunk_count: number;
  status: string;
};

export type ContentChunk = {
  id: string;
  chunk_index: number;
  chunk_text: string;
};
