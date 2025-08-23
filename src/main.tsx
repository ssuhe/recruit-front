import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import Router from "./lib/route";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
