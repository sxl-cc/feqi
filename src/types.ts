export type FetchRequest = RequestInfo;

export interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: RequestInit["body"] | Record<string, unknown>;
  query?: Record<string, unknown>;
  responseType?: FeqiResponseType;
}

export interface ResponseMap {
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  stream: ReadableStream<Uint8Array>;
  text: string;
}

export type FeqiResponseType = keyof ResponseMap | "json";
