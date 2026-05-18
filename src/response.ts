import type { FeqiResponseType } from "./types";
import { detectResponseType } from "./utils";

export class FeqiResponseError extends Error {
  response: Response;
  status: number;
  statusText: string;

  constructor(response: Response) {
    super(
      `Request failed with status ${response.status}${
        response.statusText ? ` ${response.statusText}` : ""
      }`
    );
    this.name = "FeqiResponseError";
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
  }
}

export function assertResponseOk(response: Response): void {
  if (!response.ok) {
    throw new FeqiResponseError(response);
  }
}

export async function decodeResponse(
  response: Response,
  responseType?: FeqiResponseType
): Promise<unknown> {
  const type =
    responseType ??
    detectResponseType(response.headers.get("content-type") ?? "");

  if (type === "stream") {
    return response.body;
  }

  if (type === "json") {
    const text = await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text);
  }

  return response[type]();
}
