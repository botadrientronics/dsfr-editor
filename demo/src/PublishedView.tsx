import { useEffect, useState } from "react";
import { renderPublishedHtml, type DsfrEditorInstance } from "dsfr-editor";

/**
 * Rend le document comme une page DSFR statique.
 * Ici — et seulement ici — la JS vanilla DSFR est autorisée à animer les
 * accordéons : le `MutationObserver` de `dsfr.module` câble le markup injecté.
 *
 * `renderPublishedHtml` déclenche un rendu React interne (sérialisation des
 * blocs custom) : on l'exécute donc dans un effet, jamais pendant le rendu.
 */
export function PublishedView({ editor }: { editor: DsfrEditorInstance }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    // Hors de la pile de rendu/commit React : `renderPublishedHtml` déclenche
    // un `flushSync` interne (sérialisation des blocs custom).
    const id = setTimeout(() => {
      // `wrapInContainer: false` : la colonne de la démo (`.demo-column`) fournit
      // déjà la largeur — on l'aligne ainsi sur la vue édition.
      setHtml(
        renderPublishedHtml(editor, editor.document, {
          wrapInContainer: false,
        }),
      );
    }, 0);
    return () => clearTimeout(id);
  }, [editor]);

  useEffect(() => {
    if (!html) return;
    const w = window as unknown as { dsfr?: { start?: () => void } };
    w.dsfr?.start?.();
  }, [html]);

  return (
    <div
      className="published-root"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
