// src/components/SidebarItem.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// ---------- React Router mock (NavLink + useLocation) ----------
const hoisted = vi.hoisted(() => ({
  pathname: "/",
  setPath(p: string) {
    hoisted.pathname = p;
  },
}));
vi.mock("react-router", () => {
  return {
    // NavLink that computes className({ isActive }) itself and renders an <a>
    NavLink: ({
      to,
      className,
      children,
      ref,
    }: {
      to: string;
      className?: (args: { isActive: boolean }) => string;
      children: React.ReactNode;
      ref?: React.Ref<HTMLAnchorElement>;
    }) => {
      const isActive = hoisted.pathname === to;
      const cls = className ? className({ isActive }) : "";
      return (
        <a data-testid="navlink" data-to={to} className={cls} ref={ref as any}>
          {children}
        </a>
      );
    },
    useLocation: () => ({ pathname: hoisted.pathname }),
  };
});

// ---------- Content context hook mock ----------
const mockSetContentList = vi.fn();
const baseContentList = [
  { id: 1, title: "Page 1", body: "" },
  { id: 5, title: "Page 5", body: "" },
];
vi.mock("../lib/ContentContext", () => ({
  useContentContext: () => ({
    contentList: baseContentList,
    setContentList: mockSetContentList,
  }),
}));

// ---------- API mock ----------
const deleteOneMock = vi.fn();
vi.mock("../lib/ContentFetch", () => ({
  deleteOne: (...a: any[]) => deleteOneMock(...a),
}));

// ---------- Icons mock (DeleteIcon renders a clickable button) ----------
vi.mock("../lib/Icons", () => ({
  DeleteIcon: (props: { onClick?: () => void }) => (
    <button type="button" data-testid="delete-btn" onClick={props.onClick}>
      delete
    </button>
  ),
}));

// ---------- Toast mock ----------
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from "react-toastify";

// ---------- SUT ----------
import SidebarItem from "./SidebarItem";

describe("SidebarItem", () => {
  const scrollSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom doesn't implement scrollIntoView; stub it
    Element.prototype.scrollIntoView = scrollSpy;
    // default path
    hoisted.setPath("/");
  });

  afterEach(() => {
    scrollSpy.mockClear();
  });

  it("renders title and target url", () => {
    render(<SidebarItem id={5} title="Five" body="" isEditable={false} />);
    const link = screen.getByTestId("navlink");
    expect(screen.getByText("Five")).toBeInTheDocument();
    expect(link).toHaveAttribute("data-to", "/5");
    // not editable -> no delete button
    expect(screen.queryByTestId("delete-btn")).not.toBeInTheDocument();
  });

  it("applies active class and scrolls into view when current path matches", async () => {
    hoisted.setPath("/5");
    render(<SidebarItem id={5} title="Five" body="" isEditable={false} />);

    const link = screen.getByTestId("navlink");
    expect(link.className).toMatch(/\bactive\b/);

    // effect should run and call scrollIntoView once
    await waitFor(() => expect(scrollSpy).toHaveBeenCalledTimes(1));
  });

  it("shows delete button only in editable mode", () => {
    render(<SidebarItem id={5} title="Five" body="" isEditable={true} />);
    expect(screen.getByTestId("delete-btn")).toBeInTheDocument();
  });

  it("deletes on click: updates context and shows success toast", async () => {
    const user = userEvent.setup();
    deleteOneMock.mockResolvedValueOnce({ status: true });

    render(<SidebarItem id={5} title="Five" body="" isEditable={true} />);

    await user.click(screen.getByTestId("delete-btn"));

    // API called with correct id
    expect(deleteOneMock).toHaveBeenCalledWith(5);

    // setContentList called with filtered list (id 5 removed)
    await waitFor(() => expect(mockSetContentList).toHaveBeenCalledTimes(1));
    const updatedArg = mockSetContentList.mock.calls[0][0];
    expect(updatedArg).toEqual([{ id: 1, title: "Page 1", body: "" }]);

    // toast success
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Deleted: 5")
    );
  });

  it("handles API failure: warns and shows error toast", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    deleteOneMock.mockResolvedValueOnce({ status: false, error: "boom" });

    const user = userEvent.setup();
    render(<SidebarItem id={5} title="Five" body="" isEditable={true} />);

    await user.click(screen.getByTestId("delete-btn"));

    // no context update
    expect(mockSetContentList).not.toHaveBeenCalled();

    // console.warn + toast.error
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith("boom");
      expect(toast.error).toHaveBeenCalledWith("Deleted Error: 5");
    });

    warnSpy.mockRestore();
  });
});
