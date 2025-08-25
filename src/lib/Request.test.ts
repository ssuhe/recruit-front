// src/lib/Request.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request } from "./Request";

const BASE = "http://localhost:3000";

function makeResponse(status: number, data?: unknown) {
  return {
    status,
    json: vi.fn(async () => data),
  } as unknown as Response;
}

describe("request()", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("GET 200 → returns parsed JSON and calls fetch with correct args", async () => {
    const data = [{ id: 1, title: "A", body: "" }];
    fetchMock.mockResolvedValueOnce(makeResponse(200, data));

    const res = await request({
      method: "GET",
      url: "content",
      status: 200,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, cfg] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/content`);
    expect(cfg).toMatchObject({
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
    });

    expect(res.status).toBe(true);
    expect(res.result).toEqual(data);
  });

  it("POST 201 → sends body and returns parsed JSON", async () => {
    const payload = { title: "T", body: "B" };
    const jsonBody = JSON.stringify(payload);
    const data = { id: 10, ...payload };
    fetchMock.mockResolvedValueOnce(makeResponse(201, data));

    const res = await request({
      method: "POST",
      url: "content",
      body: jsonBody,
      status: 201,
    });

    const [, cfg] = fetchMock.mock.calls[0]!;
    expect(cfg.method).toBe("POST");
    expect(cfg.body).toBe(jsonBody); // body attached only for POST/PUT
    expect(res.status).toBe(true);
    expect(res.result).toEqual(data);
  });

  it("PUT 200 → sends body and returns parsed JSON", async () => {
    const payload = { title: "New" };
    const jsonBody = JSON.stringify(payload);
    const data = { id: 5, title: "New", body: "" };
    fetchMock.mockResolvedValueOnce(makeResponse(200, data));

    const res = await request({
      method: "PUT",
      url: "content/5",
      body: jsonBody,
      status: 200,
    });

    const [url, cfg] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/content/5`);
    expect(cfg.method).toBe("PUT");
    expect(cfg.body).toBe(jsonBody);
    expect(res.status).toBe(true);
    expect(res.result).toEqual(data);
  });

  it("DELETE 204 → returns { status: true } and does not parse JSON", async () => {
    const resp = makeResponse(204);
    const jsonSpy = vi.spyOn(resp, "json");
    fetchMock.mockResolvedValueOnce(resp);

    const res = await request({
      method: "DELETE",
      url: "content/7",
      status: 204,
    });

    const [, cfg] = fetchMock.mock.calls[0]!;
    expect(cfg.method).toBe("DELETE");
    expect(cfg).not.toHaveProperty("body");

    expect(res).toEqual({ status: true }); // no result on 204
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("unexpected status → returns { status: false }", async () => {
    // request expects 200 but server returns 500
    fetchMock.mockResolvedValueOnce(makeResponse(500, { msg: "oops" }));

    const res = await request({
      method: "GET",
      url: "content",
      status: 200,
    });

    expect(res.status).toBe(false);
    // error type is not asserted strictly since function just returns { status:false, error }
  });

  it("fetch throws → returns { status: false }", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const res = await request({
      method: "GET",
      url: "content",
      status: 200,
    });

    expect(res.status).toBe(false);
  });
});
