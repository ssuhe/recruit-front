// src/router/Router.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted state to control initial path of the (mocked) BrowserRouter
const { routerState } = vi.hoisted(() => ({
  routerState: { initialPath: "/" },
}));

// Mock react-router: keep everything, but replace BrowserRouter with MemoryRouter
vi.mock("react-router", async () => {
  const rr = await vi.importActual<any>("react-router");
  const MockBrowserRouter = ({ children }: { children: React.ReactNode }) => (
    <rr.MemoryRouter initialEntries={[routerState.initialPath]}>
      {children}
    </rr.MemoryRouter>
  );
  return { ...rr, BrowserRouter: MockBrowserRouter };
});

// Mock Layout to render an Outlet and a marker so we can assert the wrapper
vi.mock("../components/Layout", async () => {
  const { Outlet } = await import("react-router");
  const LayoutMock = () => (
    <div data-testid="layout">
      <Outlet />
    </div>
  );
  return { default: LayoutMock };
});

// Mock page components
vi.mock("../pages/Memo", () => ({
  default: () => <div data-testid="memo">Memo</div>,
}));
vi.mock("../pages/NotFound", () => ({
  default: () => <div data-testid="notfound">NotFound</div>,
}));

// Import SUT after mocks
import Route from "./Route";

describe("Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Memo on index route '/'", () => {
    routerState.initialPath = "/";
    render(<Route />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("memo")).toBeInTheDocument();
    expect(screen.queryByTestId("notfound")).not.toBeInTheDocument();
  });

  it("renders Memo on param route '/:id' (e.g., '/123')", () => {
    routerState.initialPath = "/123";
    render(<Route />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("memo")).toBeInTheDocument();
    expect(screen.queryByTestId("notfound")).not.toBeInTheDocument();
  });

  it("renders NotFound on unknown paths", () => {
    routerState.initialPath = "/nope/not-here";
    render(<Route />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByTestId("notfound")).toBeInTheDocument();
    expect(screen.queryByTestId("memo")).not.toBeInTheDocument();
  });
});
