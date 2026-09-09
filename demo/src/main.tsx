import React from "react";
import ReactDOM from "react-dom/client";

// Ordre d'import important : DSFR -> BlockNote (via la lib) -> thème lib.
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import "@codegouvfr/react-dsfr/dsfr/utility/utility.min.css";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

import "dsfr-editor/style.css";
import "./app.css";

import App from "./App";

startReactDsfr({ defaultColorScheme: "system" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
