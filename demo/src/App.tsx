import { useCallback, useEffect, useRef, useState } from "react";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { DsfrEditor, useDsfrEditor, type DsfrPartialBlock } from "dsfr-editor";
import { loadDoc, saveDoc, clearDoc } from "./storage";
import { INITIAL_DOC } from "./initialDoc";
import { PublishedView } from "./PublishedView";

type Mode = "edit" | "published";
type Theme = "light" | "dark" | "system";

const REPO_URL = "https://github.com/botadrientronics/dsfr-editor";
const THEME_KEY = "dsfr-editor:theme";
const THEME_LABELS: Record<Theme, string> = {
  light: "Clair",
  dark: "Sombre",
  system: "Système",
};

const loadTheme = (): Theme => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
};

// Chargé une seule fois : `initialContent` de BlockNote est lu au montage.
const INITIAL = loadDoc();

export default function App() {
  const editor = useDsfrEditor({ initialContent: INITIAL });
  const [mode, setMode] = useState<Mode>("edit");
  const [, forceRender] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const { setIsDark } = useIsDark();
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => {
    setIsDark(theme === "system" ? "system" : theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, setIsDark]);

  const handleChange = useCallback((doc: DsfrPartialBlock[]) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDoc(doc), 500);
    // Re-rend l'aperçu quand on est dessus.
    forceRender((n) => n + 1);
  }, []);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const reset = () => {
    clearDoc();
    editor.replaceBlocks(editor.document, INITIAL_DOC);
    forceRender((n) => n + 1);
  };

  return (
    <div className="demo-shell">
      <header className="demo-bar">
        <strong className="demo-title">dsfr-editor</strong>
        <div
          className="fr-segmented fr-segmented--sm"
          role="group"
          aria-label="Mode d'affichage"
        >
          <div className="fr-segmented__elements">
            {(["edit", "published"] as const).map((m) => (
              <div className="fr-segmented__element" key={m}>
                <input
                  type="radio"
                  id={`mode-${m}`}
                  name="mode"
                  checked={mode === m}
                  onChange={() => setMode(m)}
                />
                <label className="fr-label" htmlFor={`mode-${m}`}>
                  {m === "edit" ? "Édition" : "Aperçu publié"}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div
          className="fr-segmented fr-segmented--sm"
          role="group"
          aria-label="Thème"
        >
          <div className="fr-segmented__elements">
            {(["light", "dark", "system"] as const).map((th) => (
              <div className="fr-segmented__element" key={th}>
                <input
                  type="radio"
                  id={`theme-${th}`}
                  name="theme"
                  checked={theme === th}
                  onChange={() => setTheme(th)}
                />
                <label className="fr-label" htmlFor={`theme-${th}`}>
                  {THEME_LABELS[th]}
                </label>
              </div>
            ))}
          </div>
        </div>
        <a
          className="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-github-fill fr-btn--icon-left"
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Code source
        </a>
        <button
          type="button"
          className="fr-btn fr-btn--secondary fr-btn--sm"
          onClick={reset}
        >
          Réinitialiser
        </button>
      </header>

      <main className="demo-content">
        {/* L'éditeur reste monté en permanence pour ne pas perdre son état. */}
        <div className="demo-column" hidden={mode !== "edit"}>
          <DsfrEditor editor={editor} onChange={handleChange} />
        </div>
        {mode === "published" && (
          <div className="demo-column">
            <PublishedView editor={editor} />
          </div>
        )}
      </main>
    </div>
  );
}
