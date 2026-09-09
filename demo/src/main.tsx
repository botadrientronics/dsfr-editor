import React from "react";
import ReactDOM from "react-dom/client";

// Ordre d'import important : DSFR d'abord, puis BlockNote (tiré par `App` ->
// `DsfrEditor`), puis le thème de la lib EN DERNIER pour qu'il ait le dernier
// mot sur les variables et resets de BlockNote (`--bn-font-family`, etc.).
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import "@codegouvfr/react-dsfr/dsfr/utility/utility.min.css";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

import App from "./App";

import "dsfr-editor/style.css";
import "./app.css";

startReactDsfr({ defaultColorScheme: "system" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
