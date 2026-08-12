import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RaahiRadio from "./app/page";
import "./app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RaahiRadio />
  </StrictMode>,
);
