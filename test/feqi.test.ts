import { afterEach, expect, test, vi } from "vitest";
import { createFeqi } from "../src/feqi";
import { FeqiResponseError } from "../src/response";

afterEach(() => {
  vi.restoreAllMocks();
});

test("decodes json responses automatically", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        ok: true,
      })
    )
  );

  const feqi = createFeqi({
    baseURL: "https://example.com",
  });

  await expect(feqi("/api")).resolves.toEqual({
    ok: true,
  });
});

test("applies base url, query, common headers, and json body", async () => {
  const fetchMock = vi.fn(async (_request: Request) =>
    Response.json({ ok: true })
  );
  vi.stubGlobal("fetch", fetchMock);

  const feqi = createFeqi({
    baseURL: "https://example.com/api/",
    commonHeaders: {
      "x-client": "feqi",
    },
  });

  await feqi("users", {
    body: {
      name: "Ada",
    },
    method: "POST",
    query: {
      active: true,
    },
  });

  const request = fetchMock.mock.calls[0]?.[0];

  expect(request.url).toBe("https://example.com/api/users?active=true");
  expect(request.headers.get("content-type")).toBe("application/json");
  expect(request.headers.get("x-client")).toBe("feqi");
  await expect(request.text()).resolves.toBe('{"name":"Ada"}');
});

test("runs request and response interceptors", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request: Request) =>
      Response.json({
        token: request.headers.get("authorization"),
      })
    )
  );

  const feqi = createFeqi({
    interceptors: {
      request: [
        (request, context) => {
          expect(context.input).toBe("https://example.com");
          expect(context.baseURL).toBeUndefined();
          request.headers.set("authorization", "Bearer token");

          return request;
        },
      ],
      response: [
        async (response, context) => {
          expect(context.request.headers.get("authorization")).toBe(
            "Bearer token"
          );
          const data = await response.json();

          return Response.json({
            ...data,
            intercepted: true,
          });
        },
      ],
    },
  });

  await expect(feqi("https://example.com")).resolves.toEqual({
    intercepted: true,
    token: "Bearer token",
  });
});

test("throws when response is not ok", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        {
          message: "nope",
        },
        {
          status: 500,
          statusText: "Internal Server Error",
        }
      )
    )
  );

  const feqi = createFeqi();

  await expect(feqi("https://example.com")).rejects.toMatchObject({
    name: "FeqiResponseError",
    status: 500,
    statusText: "Internal Server Error",
  });
  await expect(feqi("https://example.com")).rejects.toBeInstanceOf(
    FeqiResponseError
  );
});
