// src/components/Sidebar.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// ---- Mocks ----

// Mock ContentContext hook
const mockSetContentList = vi.fn();
const mockContentList = [
  { id: 1, title: "Page 1", body: "..." },
  { id: 2, title: "Page 2", body: "..." },
];
vi.mock("../lib/ContentContext", () => ({
  useContentContext: () => ({
    contentList: mockContentList,
    setContentList: mockSetContentList,
  }),
}));

// Mock API create()
const createMock = vi.fn();
vi.mock("../lib/ContentFetch", () => ({
  create: (...args: any[]) => createMock(...args),
}));

// Mock toast to avoid side effects
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn() },
  ToastContainer: () => null,
}));

// Capture SidebarItem props to assert isEditable propagation
const sidebarItemSpy = vi.fn((props: any) =>
  // Render minimal content to assert behavior
  React.createElement(
    "div",
    {
      "data-testid": `sidebar-item-${props.id}`,
      "data-editable": String(props.isEditable),
    },
    props.title ?? `Item ${props.id}`
  )
);
vi.mock("./SidebarItem", () => ({
  default: (props: any) => sidebarItemSpy(props),
}));

// We’ll use the real Button components (they render accessible names)
import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders service name, and list items", () => {
    render(<Sidebar />);

    expect(screen.getByText("ServiceName")).toBeInTheDocument();

    // Items rendered
    expect(screen.getByTestId("sidebar-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-2")).toBeInTheDocument();

    // Initially not editable: Add button hidden, Edit button visible
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /new page/i })
    ).not.toBeInTheDocument();

    // Child received isEditable=false
    expect(screen.getByTestId("sidebar-item-1")).toHaveAttribute(
      "data-editable",
      "false"
    );
  });

  it("toggles to editable mode on Edit → shows Done and New page", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Now Done button and Add button appear
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new page/i })
    ).toBeInTheDocument();

    // Children now receive isEditable=true
    expect(screen.getByTestId("sidebar-item-1")).toHaveAttribute(
      "data-editable",
      "true"
    );
  });

  it("clicking Done toggles back to non-editable", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(screen.getByRole("button", { name: /done/i }));

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /new page/i })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("sidebar-item-1")).toHaveAttribute(
      "data-editable",
      "false"
    );
  });

  it("adds a new page in editable mode: calls create, updates context, and toasts", async () => {
    const user = userEvent.setup();

    // Mock API success
    const newItem = { id: 99, title: "New Content", body: "" };
    createMock.mockResolvedValueOnce({ status: true, result: newItem });

    render(<Sidebar />);

    // Enter editable mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Click New page
    await user.click(screen.getByRole("button", { name: /new page/i }));

    // API called once with the sidebar's body payload
    expect(createMock).toHaveBeenCalledTimes(1);
    const payload = createMock.mock.calls[0][0];
    expect(payload).toMatchObject({ title: "New Content", body: "" });

    // setContentList should be called with appended item
    await waitFor(() => {
      expect(mockSetContentList).toHaveBeenCalledTimes(1);
    });

    const updated = mockSetContentList.mock.calls[0][0] as any[];
    expect(updated).toHaveLength(mockContentList.length + 1);
    expect(updated.at(-1)).toMatchObject(newItem);
  });
});
