import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { HeroUIProviderWrapper } from "@/shared/lib/HeroUIProvider";
import "./index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root not found");
}

createRoot(root).render(
  <StrictMode>
    <HeroUIProviderWrapper>
      <App />
    </HeroUIProviderWrapper>
  </StrictMode>,
);
