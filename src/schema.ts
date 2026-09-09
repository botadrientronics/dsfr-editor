/**
 * Schéma BlockNote de l'éditeur DSFR : sous-ensemble curé des blocs natifs
 * + les blocs DSFR custom.
 */
import {
  BlockNoteSchema,
  createHeadingBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import {
  accordionSectionBlock,
  alertBlock,
  calloutBlock,
  highlightBlock,
} from "./blocks";

export const dsfrSchema = BlockNoteSchema.create({
  blockSpecs: {
    // --- blocs natifs conservés ---------------------------------------------
    paragraph: defaultBlockSpecs.paragraph,
    // Titres restreints h2–h4 (h1 = fourni par le gabarit de page).
    // `defaultLevel` vaut 1 par défaut -> impératif de le fixer dans la plage.
    heading: createHeadingBlockSpec({
      levels: [2, 3, 4],
      defaultLevel: 2,
      allowToggleHeadings: false,
    }),
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    quote: defaultBlockSpecs.quote,
    codeBlock: defaultBlockSpecs.codeBlock,
    divider: defaultBlockSpecs.divider,
    image: defaultBlockSpecs.image,

    // --- blocs DSFR custom -------------------------------------------------
    dsfrCallout: calloutBlock(),
    dsfrAlert: alertBlock(),
    dsfrHighlight: highlightBlock(),
    dsfrAccordionSection: accordionSectionBlock(),
  },
});

export type DsfrSchema = typeof dsfrSchema;
export type DsfrEditorInstance = DsfrSchema["BlockNoteEditor"];
export type DsfrBlock = DsfrSchema["Block"];
export type DsfrPartialBlock = DsfrSchema["PartialBlock"];

/** Types de blocs custom (utilisé par le slash menu et la publication). */
export const DSFR_BLOCK_TYPES = {
  callout: "dsfrCallout",
  alert: "dsfrAlert",
  highlight: "dsfrHighlight",
  accordionSection: "dsfrAccordionSection",
} as const;
