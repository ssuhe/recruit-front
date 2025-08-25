// src/pages/Memo.test.tsx
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** ======================= Router Mocks ======================= */
const hoisted = vi.hoisted(() => ({
  paramsId: undefined as string | undefined,
  navigatedTo: undefined as string | undefined,
}));
vi.mock("react-router", async () => {
  const rr = await vi.importActual<any>("react-router");
  return {
    ...rr,
    useParams: () => ({ id: hoisted.paramsId }),
    useNavigate: () => (to: string) => {
      hoisted.navigatedTo = to;
    },
  };
});

/** ======================= Context Mock ======================= */
const mockSetContentList = vi.fn();
const mockContentList = [
  { id: 1, title: "First", body: "First body content" },
  { id: 5, title: "Five", body: "Five body content" },
];
vi.mock("../lib/ContentContext", () => ({
  useContentContext: () => ({
    contentList: mockContentList,
    setContentList: mockSetContentList,
  }),
}));

/** ======================= API Mocks ======================= */
const findOneMock = vi.fn();
const updateMock = vi.fn();
vi.mock("../lib/ContentFetch", () => ({
  findOne: (...a: any[]) => findOneMock(...a),
  update: (...a: any[]) => updateMock(...a),
}));

/** ======================= Toast Mock ======================= */
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from "react-toastify";

/** ======================= Child Component Mocks ======================= */
vi.mock("../components/Button", () => ({
  EditButton: (p: any) => (
    <button type="button" onClick={p.onClick}>
      Edit
    </button>
  ),
  SaveButton: (p: any) => (
    <button type="button" onClick={p.onClick} disabled={p.disabled}>
      Save
    </button>
  ),
  CancelButton: (p: any) => (
    <button type="button" onClick={p.onClick}>
      Cancel
    </button>
  ),
}));

vi.mock("./NotFound", () => ({
  default: () => <div data-testid="notfound">NotFound</div>,
}));

/** ======================= SUT ======================= */
import Memo from "./Memo";

/** ======================= Tests ======================= */
describe("Memo page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.paramsId = undefined;
    hoisted.navigatedTo = undefined;
  });

  it("navigates to first item when id is undefined and contentList exists", async () => {
    // When no id, your effect redirects to first item if list exists.
    // We still stub findOne once to satisfy any immediate effect usages.
    findOneMock.mockResolvedValueOnce({
      status: true,
      result: mockContentList[0],
    });

    render(<Memo />);

    await waitFor(() => {
      expect(hoisted.navigatedTo).toBe("/1");
    });
  });
});
