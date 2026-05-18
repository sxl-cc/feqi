import {
  applyRequestInterceptors,
  applyResponseInterceptors,
  type RequestInterceptor,
  type ResponseInterceptor,
} from "./intercept";
import { createRequest } from "./request";
import { assertResponseOk, decodeResponse } from "./response";
import type { FetchOptions, FetchRequest } from "./types";

export interface CreateFeqiOptions {
  baseURL?: string;
  commonHeaders?: Record<string, string>;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
}

export type Feqi = <T = unknown>(
  input: FetchRequest,
  options?: FetchOptions
) => Promise<T>;

export function createFeqi(options: CreateFeqiOptions = {}): Feqi {
  return async function feqi<T = unknown>(
    input: FetchRequest,
    fetchOptions: FetchOptions = {}
  ): Promise<T> {
    const request = await applyRequestInterceptors(
      createRequest(input, fetchOptions, options),
      {
        baseURL: options.baseURL,
        commonHeaders: options.commonHeaders,
        input,
        options: fetchOptions,
      },
      options.interceptors?.request
    );

    const response = await applyResponseInterceptors(
      await fetch(request),
      {
        baseURL: options.baseURL,
        commonHeaders: options.commonHeaders,
        input,
        options: fetchOptions,
        request,
      },
      options.interceptors?.response
    );

    assertResponseOk(response);

    return (await decodeResponse(response, fetchOptions.responseType)) as T;
  };
}
