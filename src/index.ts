import { createFeqi } from "./feqi";

export type { CreateFeqiOptions, Feqi } from "./feqi";
// biome-ignore lint/performance/noBarrelFile: This file is the public package entry point.
export { createFeqi } from "./feqi";
export type {
  RequestInterceptor,
  RequestInterceptorContext,
  ResponseInterceptor,
  ResponseInterceptorContext,
} from "./intercept";
export type {
  FeqiResponseType,
  FetchOptions,
  FetchRequest,
  ResponseMap,
} from "./types";

export const feqi = createFeqi();
