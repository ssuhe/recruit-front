// src/components/Layout.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContext } from "react";

// 1) Mock children
vi.mock("./Sidebar", () => ({
  default: () => <aside data-testid="sidebar" />,
}));
vi.mock("./Footer", () => ({ default: () => <footer data-testid="footer" /> }));

// 2) Mock ContentFetch
const findAllMock = vi.fn();
vi.mock("../lib/ContentFetch", () => ({
  findAll: (...a: any[]) => findAllMock(...a),
}));

// 3) Context probe
import { ContentContext } from "../lib/ContentContext";
function ContextProbe() {
  const ctx = useContext(ContentContext) as any;
  return (
    <div>
      <div data-testid="len">{ctx?.contentList?.length ?? 0}</div>
      <button data-testid="refetch" onClick={ctx?.fetchContentList}>
        refetch
      </button>
    </div>
  );
}

// 4) Mock Outlet ONCE to include the probe
vi.mock("react-router", () => ({
  Outlet: () => (
    <div data-testid="outlet">
      <ContextProbe />
    </div>
  ),
}));

// 5) Import SUT after mocks
import Layout from "./Layout";

describe("Layout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches on mount", async () => {
    findAllMock.mockResolvedValueOnce({
      status: true,
      result: [{ id: 1 }, { id: 2 }],
      error: null,
    });
    render(<Layout />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId("len")).toHaveTextContent("2")
    );
    expect(findAllMock).toHaveBeenCalledTimes(1);
  });

  it("exposes fetchContentList so consumers can refetch", async () => {
    findAllMock
      .mockResolvedValueOnce({ status: true, result: [{ id: 1 }], error: null })
      .mockResolvedValueOnce({
        status: true,
        result: [{ id: 1 }, { id: 2 }, { id: 3 }],
        error: null,
      });

    const user = userEvent.setup();
    render(<Layout />);

    await waitFor(() =>
      expect(screen.getByTestId("len")).toHaveTextContent("1")
    );
    await user.click(screen.getByTestId("refetch"));
    await waitFor(() =>
      expect(screen.getByTestId("len")).toHaveTextContent("3")
    );

    expect(findAllMock).toHaveBeenCalledTimes(2);
  });
});
