import type { FetchOptions, FetchRequest } from "./types";

export interface RequestInterceptorContext {
  baseURL?: string;
  commonHeaders?: Record<string, string>;
  input: FetchRequest;
  options: FetchOptions;
}

export interface ResponseInterceptorContext extends RequestInterceptorContext {
  request: Request;
}

export type RequestInterceptor = (
  request: Request,
  context: RequestInterceptorContext
) => Request | undefined | Promise<Request | undefined>;

export type ResponseInterceptor = (
  response: Response,
  context: ResponseInterceptorContext
) => Response | undefined | Promise<Response | undefined>;

export async function applyRequestInterceptors(
  request: Request,
  context: RequestInterceptorContext,
  interceptors: RequestInterceptor[] = []
): Promise<Request> {
  let currentRequest = request;

  for (const interceptor of interceptors) {
    currentRequest =
      (await interceptor(currentRequest, context)) ?? currentRequest;
  }

  return currentRequest;
}

export async function applyResponseInterceptors(
  response: Response,
  context: ResponseInterceptorContext,
  interceptors: ResponseInterceptor[] = []
): Promise<Response> {
  let currentResponse = response;

  for (const interceptor of interceptors) {
    currentResponse =
      (await interceptor(currentResponse, context)) ?? currentResponse;
  }

  return currentResponse;
}
