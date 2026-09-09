import { useCallback, useEffect, useRef, useState } from "react";
import { DsfrEditor, useDsfrEditor, type DsfrPartialBlock } from "dsfr-editor";
import { loadDoc, saveDoc, clearDoc } from "./storage";
import { INITIAL_DOC } from "./initialDoc";
import { PublishedView } from "./PublishedView";

type Mode = "edit" | "published";

// Chargé une seule fois : `initialContent` de BlockNote est lu au montage.
const INITIAL = loadDoc();

export default function App() {
  const editor = useDsfrEditor({ initialContent: INITIAL });
  const [mode, setMode] = useState<Mode>("edit");
  const [, forceRender] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

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
