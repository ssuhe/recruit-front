// src/lib/ContentContext.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  useContentContext,
  ContentContextProvider,
  type ContentContextType,
} from "./ContentContext";

function Probe() {
  const { contentList } = useContentContext();
  return <div data-testid="len">{contentList.length}</div>;
}

describe("ContentContext", () => {
  it("throws if used outside provider", () => {
    // suppress error logs in test output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrowError(
      /must be used inside ContentContextProvider/
    );
    spy.mockRestore();
  });

  it("provides values inside provider", () => {
    const value: ContentContextType = {
      contentList: [{ id: 1, title: "A", body: "" }],
      setContentList: () => {},
      fetchContentList: async () => {
        return {
          id: 1,
          title: "A",
          body: "",
        };
      },
    };

    render(
      <ContentContextProvider value={value}>
        <Probe />
      </ContentContextProvider>
    );

    expect(screen.getByTestId("len")).toHaveTextContent("1");
  });
});
