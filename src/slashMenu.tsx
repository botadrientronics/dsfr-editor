/**
 * Entrées du slash menu (`/`) : blocs natifs curés + groupe « DSFR ».
 */
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
} from "@blocknote/core/extensions";
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import type { DsfrEditorInstance } from "./schema";

const DsfrIcon = ({ id }: { id: string }) => (
  <span className={id} aria-hidden style={{ fontSize: "1rem" }} />
);

/** Blocs natifs non exposés au MVP (le schéma peut les contenir, pas le menu). */
const HIDDEN_NATIVE_ALIASES = ["audio", "video", "file", "emoji"];

export function getDsfrSlashMenuItems(
  editor: DsfrEditorInstance,
): DefaultReactSuggestionItem[] {
  const natives = getDefaultReactSlashMenuItems(editor).filter(
    (item) =>
      !HIDDEN_NATIVE_ALIASES.some(
        (a) =>
          item.title.toLowerCase().includes(a) ||
          (item.aliases ?? []).includes(a),
      ),
  );

  const dsfr: DefaultReactSuggestionItem[] = [
    {
      title: "Encadré",
      subtext: "Bloc de contenu mis en avant (CallOut DSFR)",
      group: "DSFR",
      aliases: ["callout", "encadre", "encadré", "mise en avant"],
      icon: <DsfrIcon id="fr-icon-quote-line" />,
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "dsfrCallout" }),
    },
    {
      title: "Alerte",
      subtext: "Message d'information, succès, avertissement ou erreur",
      group: "DSFR",
      aliases: ["alert", "alerte", "message", "notice"],
      icon: <DsfrIcon id="fr-icon-error-warning-line" />,
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "dsfrAlert" }),
    },
    {
      title: "Accordéon — section",
      subtext: "Section repliable (titre + contenu)",
      group: "DSFR",
      aliases: ["accordion", "accordeon", "accordéon", "dépliant", "repliable"],
      icon: <DsfrIcon id="fr-icon-arrow-down-s-line" />,
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, {
          type: "dsfrAccordionSection",
        }),
    },
    {
      title: "Mise en relief",
      subtext: "Paragraphe accentué par une barre latérale (Highlight DSFR)",
      group: "DSFR",
      aliases: ["highlight", "relief", "exergue", "surlignage"],
      icon: <DsfrIcon id="fr-icon-edit-line" />,
      onItemClick: () =>
        insertOrUpdateBlockForSlashMenu(editor, { type: "dsfrHighlight" }),
    },
  ];

  return [...natives, ...dsfr];
}

/** Passé à `<SuggestionMenuController getItems>`. */
export function getDsfrSlashMenuGetItems(editor: DsfrEditorInstance) {
  return async (query: string) =>
    filterSuggestionItems(getDsfrSlashMenuItems(editor), query);
}
