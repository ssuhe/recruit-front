import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
