/**
 * Éditeur de contenu DSFR type Notion, prêt à l'emploi.
 *
 * Consommation :
 *   import { DsfrEditor, useDsfrEditor } from "dsfr-editor";
 *   import "dsfr-editor/style.css";
 *
 *   const editor = useDsfrEditor({ initialContent: doc });
 *   <DsfrEditor editor={editor} onChange={setDoc} />
 *
 * Le CSS DSFR (`dsfr.min.css` + `utility.min.css`) et `startReactDsfr()` sont
 * de la responsabilité de l'application hôte.
 */
import { useMemo } from "react";
import { BlockNoteView } from "@blocknote/ariakit";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import { fr as frDictionary } from "@blocknote/core/locales";
import "@blocknote/core/style.css";
import "@blocknote/ariakit/style.css";

import { dsfrSchema, type DsfrEditorInstance, type DsfrPartialBlock } from "./schema";
import { getDsfrSlashMenuGetItems } from "./slashMenu";
import { useDsfrColorScheme } from "./useDsfrColorScheme";
import { BlockConfigModalHost } from "./blocks";

export type UseDsfrEditorOptions = {
  /** Document initial (arbre de blocs BlockNote). Lu une seule fois. */
  initialContent?: DsfrPartialBlock[];
};

/** Crée une instance BlockNote configurée pour le DSFR (schéma + locale FR). */
export function useDsfrEditor(
  options: UseDsfrEditorOptions = {},
): DsfrEditorInstance {
  return useCreateBlockNote({
    schema: dsfrSchema,
    dictionary: frDictionary,
    // On désactive le reset global de BlockNote (`.bn-default-styles`, qui pose
    // `font-size:inherit; margin:0` sur TOUS les p/h*/li de l'éditeur — donc
    // aussi les titres des composants DSFR). On le réimplémente dans
    // `styles/dsfr-blocknote-theme.css`, ciblé sur le seul contenu éditable.
    defaultStyles: false,
    initialContent: options.initialContent?.length
      ? options.initialContent
      : undefined,
  });
}

export type DsfrEditorProps = {
  /** Instance créée par `useDsfrEditor`. Si absente, une est créée en interne. */
  editor?: DsfrEditorInstance;
  /** Utilisé seulement si `editor` n'est pas fourni. */
  initialContent?: DsfrPartialBlock[];
  /** Appelé à chaque modification, avec le document courant. */
  onChange?: (document: DsfrPartialBlock[]) => void;
  /** `false` -> lecture seule. */
  editable?: boolean;
  className?: string;
};

export function DsfrEditor({
  editor: editorProp,
  initialContent,
  onChange,
  editable = true,
  className,
}: DsfrEditorProps) {
  const colorScheme = useDsfrColorScheme();
  const fallbackEditor = useDsfrEditor({ initialContent });
  const editor = editorProp ?? fallbackEditor;

  const getItems = useMemo(() => getDsfrSlashMenuGetItems(editor), [editor]);

  return (
    <>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={colorScheme}
        slashMenu={false}
        className={["dsfr-editor", className].filter(Boolean).join(" ")}
        onChange={() => onChange?.(editor.document)}
      >
        <SuggestionMenuController triggerCharacter="/" getItems={getItems} />
      </BlockNoteView>
      {/* Modale de config des blocs : montée HORS de `.bn-editor`. */}
      {editable && <BlockConfigModalHost editor={editor} />}
    </>
  );
}
