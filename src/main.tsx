import { StrictMode } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./i18n";
import type { Bundle, Messages } from "./i18n";
import "./styles.css";

/** Renders one page of the site; every page's entry calls this once. */
export function mount(Page: ComponentType, messages: Bundle<Messages>) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <LanguageProvider messages={messages}>
        <Page />
      </LanguageProvider>
    </StrictMode>,
  );
}
