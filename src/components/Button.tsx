import { type ReactElement, type MouseEvent as ReactMouseEvent } from "react";
import {
  CancelIcon,
  DoneIcon,
  EditIcon,
  PlusIcon,
  SaveIcon,
} from "../lib/Icons";

type ButtonProps = {
  size?: "small" | "normal";
  variant?: "filled" | "outlined";
  color?: "primary" | "dark";
  icon?: ReactElement;
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent) => void;
  text?: string;
};

const Button = ({
  text,
  onClick,
  disabled,
  color = "primary",
  variant = "filled",
  size = "normal",
  icon,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-${color} btn-${variant} btn-${size}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

export const EditButton = ({ onClick }: ButtonProps) => (
  <Button
    disabled={false}
    icon={<EditIcon />}
    text="Edit"
    size="normal"
    variant="filled"
    color="primary"
    onClick={onClick}
  />
);

export const SaveButton = ({ onClick }: ButtonProps) => (
  <Button
    disabled={false}
    icon={<SaveIcon />}
    text="Save"
    size="small"
    variant="filled"
    color="primary"
    onClick={onClick}
  />
);
export const CancelButton = ({ onClick }: ButtonProps) => (
  <Button
    disabled={false}
    icon={<CancelIcon />}
    text="Cancel"
    size="small"
    variant="filled"
    color="dark"
    onClick={onClick}
  />
);

export const DoneButton = ({ onClick }: ButtonProps) => (
  <Button
    disabled={false}
    icon={<DoneIcon />}
    text={"Done"}
    size="normal"
    variant="filled"
    color="primary"
    onClick={onClick}
  />
);

export const AddButton = ({ onClick }: ButtonProps) => (
  <Button
    disabled={false}
    icon={<PlusIcon className="plusIcon" />}
    text="New page"
    size="normal"
    variant="outlined"
    color="primary"
    onClick={onClick}
  />
);

export default Button;
