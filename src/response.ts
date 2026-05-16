import type { FeqiResponseType } from "./types";
import { detectResponseType } from "./utils";

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
