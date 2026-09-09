/**
 * Bloc « Accordéon — section » (DSFR Accordion).
 *
 * BlockNote ne fournit qu'une zone `contentRef` par bloc : on modélise donc
 * *une section = un bloc*.
 *   - contenu inline du bloc  -> le titre de la section
 *   - blocs enfants           -> le corps de la section
 *
 * En édition, le repli est géré par le `ToggleWrapper` React de BlockNote
 * (état local + localStorage) — AUCUNE JS vanilla DSFR (`fr-collapse`) ici,
 * pour ne pas entrer en conflit avec ProseMirror.
 *
 * Le regroupement visuel des sections adjacentes (`fr-accordions-group`) et le
 * markup interactif final sont produits à la publication
 * (voir `publish/renderPublishedHtml.ts`) — pas via `toExternalHTML`, car
 * l'export de BlockNote aplatit les enfants d'un bloc `blockContent`.
 */
import type { FC, ReactNode } from "react";
import {
  ToggleWrapper as ToggleWrapperRaw,
  createReactBlockSpec,
} from "@blocknote/react";
import { BlockErrorBoundary, serializeForKey } from "./blockKit";

// `@blocknote/react` est typé contre React 19 (`ReactNode` inclut `bigint`) ;
// on ré-annonce le composant sous une signature compatible React 18.
const ToggleWrapper = ToggleWrapperRaw as unknown as FC<{
  block: unknown;
  editor: unknown;
  children: ReactNode;
}>;

export const accordionSectionBlock = createReactBlockSpec(
  {
    type: "dsfrAccordionSection",
    content: "inline",
    propSchema: {},
  },
  {
    render: (props) => (
      <BlockErrorBoundary
        name="Accordéon"
        resetKey={serializeForKey(props.block.props)}
      >
        <div className="dsfr-editor-accordion-section">
          <ToggleWrapper block={props.block} editor={props.editor}>
            <span
              className="dsfr-editor-accordion-title"
              ref={props.contentRef}
            />
          </ToggleWrapper>
        </div>
      </BlockErrorBoundary>
    ),
    // Rendu de repli uniquement (copier-coller, aperçu brut). La publication
    // « propre » passe par renderPublishedHtml().
    toExternalHTML: (props) => (
      <section className="fr-accordion">
        <h3 className="fr-accordion__title">
          <span className="fr-accordion__btn" ref={props.contentRef} />
        </h3>
      </section>
    ),
  },
);
