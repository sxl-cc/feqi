import type { FeqiResponseType } from "./types";

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

const textTypes = new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html",
]);
// This provides reasonable defaults for the correct parser based on Content-Type header.
export function detectResponseType(_contentType = ""): FeqiResponseType {
  if (!_contentType) {
    return "json";
  }

  // Value might look like: `application/json; charset=utf-8`
  const contentType = _contentType.split(";").shift() || "";

  if (JSON_RE.test(contentType)) {
    return "json";
  }

  if (contentType === "text/event-stream") {
    return "stream";
  }

  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }

  return "blob";
}

export function isJSONSerializable(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || value === null) {
    return true;
  }
  if (t !== "object") {
    return false; // bigint, function, symbol, undefined
  }
  if (Array.isArray(value)) {
    return true;
  }
  if ((value as Record<string, unknown>).buffer) {
    return false;
  }
  // `FormData` and `URLSearchParams` should't have a `toJSON` method,
  // but Bun adds it, which is non-standard.
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return (
    (value.constructor && value.constructor.name === "Object") ||
    typeof (value as Record<string, unknown>).toJSON === "function"
  );
}
