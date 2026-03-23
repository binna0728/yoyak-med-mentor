import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

Sentry.init({
  dsn: "https://e568cc010411ecc673a11633da7d3c34@o4511094637461504.ingest.us.sentry.io/4511094643490816",
  sendDefaultPii: true,
  enabled: import.meta.env.PROD,
});

createRoot(document.getElementById("root")!).render(<App />);
