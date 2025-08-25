import Button from "./Button";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

describe("Button", () => {
  it("should render component withoutp props", () => {
    render(<Button />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /click me/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button text="Nope" onClick={onClick} disabled />);
    await user.click(screen.getByRole("button", { name: /nope/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
  it("applies composed class names from props", () => {
    render(
      <Button
        text="Styled"
        onClick={() => {}}
        color="dark"
        variant="outlined"
        size="small"
      />
    );
    const btn = screen.getByRole("button", { name: /styled/i });
    expect(btn).toHaveClass("btn-dark");
    expect(btn).toHaveClass("btn-outlined");
    expect(btn).toHaveClass("btn-small");
  });
});
