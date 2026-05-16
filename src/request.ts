import type { FetchOptions, FetchRequest } from "./types";
import { isJSONSerializable } from "./utils";

const ABSOLUTE_URL_RE = /^[a-z][a-z\d+\-.]*:/i;

interface RequestDefaults {
  baseURL?: string;
  commonHeaders?: Record<string, string>;
}

export function createRequest(
  input: FetchRequest,
  fetchOptions: FetchOptions,
  defaults: RequestDefaults
): Request {
  const { query, responseType: _responseType, ...init } = fetchOptions;
  const headers = new Headers(defaults.commonHeaders);

  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  new Headers(init.headers).forEach((value, key) => {
    headers.set(key, value);
  });

  const body = normalizeBody(init.body, headers);
  const url =
    input instanceof Request
      ? appendQuery(input.url, query)
      : appendQuery(resolveURL(input, defaults.baseURL), query);
  const requestInput = input instanceof Request ? new Request(url, input) : url;

  return new Request(requestInput, {
    ...init,
    body,
    headers,
  });
}

function resolveURL(input: FetchRequest, baseURL?: string): string {
  if (typeof input === "string") {
    return baseURL ? new URL(input, baseURL).toString() : input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function appendQuery(url: string, query?: Record<string, unknown>): string {
  if (!query) {
    return url;
  }

  const normalizedURL = new URL(url, "http://feqi.local");

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        normalizedURL.searchParams.append(key, String(item));
      }
      continue;
    }

    normalizedURL.searchParams.set(key, String(value));
  }

  if (ABSOLUTE_URL_RE.test(url)) {
    return normalizedURL.toString();
  }

  return `${normalizedURL.pathname}${normalizedURL.search}${normalizedURL.hash}`;
}

function normalizeBody(
  body: FetchOptions["body"],
  headers: Headers
): BodyInit | null | undefined {
  if (isJSONSerializable(body)) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return JSON.stringify(body);
  }

  return body as BodyInit | null | undefined;
}
