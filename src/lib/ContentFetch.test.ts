// src/lib/ContentFetch.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist a spy so it exists before the mock factory runs
const { requestSpy } = vi.hoisted(() => ({ requestSpy: vi.fn() }));

// Mock the Request module that ContentFetch depends on
vi.mock("./Request", () => ({
  request: requestSpy,
}));

// Now import the SUT
import { create, update, deleteOne, findAll, findOne } from "./ContentFetch";

describe("ContentFetch API wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create() POSTs to 'content' with status 201 and body", async () => {
    const payload = { title: "T", body: "B" };
    const fakeResponse = { status: true, result: { id: 1, ...payload } };
    requestSpy.mockResolvedValueOnce(fakeResponse);

    const res = await create(payload);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledWith({
      method: "POST",
      url: "content",
      status: 201,
      body: JSON.stringify(payload),
    });
    expect(res).toBe(fakeResponse);
  });

  it("update() PUTs to 'content/:id' with status 200 and body", async () => {
    const id = 5;
    const payload = { title: "New", body: "Updated" };
    const fakeResponse = { status: true, result: { id, ...payload } };
    requestSpy.mockResolvedValueOnce(fakeResponse);

    const res = await update(id, payload);

    expect(requestSpy).toHaveBeenCalledWith({
      method: "PUT",
      url: `content/${id}`,
      status: 200,
      body: JSON.stringify(payload),
    });
    expect(res).toBe(fakeResponse);
  });

  it("deleteOne() DELETEs 'content/:id' with status 204", async () => {
    const id = 7;
    const fakeResponse = { status: true };
    requestSpy.mockResolvedValueOnce(fakeResponse);

    const res = await deleteOne(id);

    expect(requestSpy).toHaveBeenCalledWith({
      method: "DELETE",
      url: `content/${id}`,
      status: 204,
    });
    expect(res).toBe(fakeResponse);
  });

  it("findAll() GETs 'content' with status 200", async () => {
    const fakeResponse = { status: true, result: [] };
    requestSpy.mockResolvedValueOnce(fakeResponse);

    const res = await findAll();

    expect(requestSpy).toHaveBeenCalledWith({
      method: "GET",
      url: "content",
      status: 200,
    });
    expect(res).toBe(fakeResponse);
  });

  it("findOne() GETs 'content/:id' with status 200", async () => {
    const id = 9;
    const fakeResponse = { status: true, result: { id } };
    requestSpy.mockResolvedValueOnce(fakeResponse);

    const res = await findOne(id);

    expect(requestSpy).toHaveBeenCalledWith({
      method: "GET",
      url: `content/${id}`,
      status: 200,
    });
    expect(res).toBe(fakeResponse);
  });
});
