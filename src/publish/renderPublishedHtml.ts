/**
 * Sérialise un document BlockNote en HTML DSFR statique pour la page publiée.
 *
 * Pourquoi ne pas juste appeler `editor.blocksToHTMLLossy(document)` ?
 *   - `blocksToFullHTML()` émet des classes `bn-*` (structure interne).
 *   - `blocksToHTMLLossy()` appelle bien les `toExternalHTML` de nos blocs, MAIS
 *     l'exporteur *aplatit* les blocs enfants d'un bloc `blockContent` : le corps
 *     d'une section d'accordéon se retrouverait en frère du `<section>`.
 *
 * On pilote donc la sérialisation nous-mêmes : les runs de blocs « simples »
 * passent par `blocksToHTMLLossy`, et les sections d'accordéon adjacentes sont
 * assemblées à la main (titre + corps récursif) puis groupées dans
 * `fr-accordions-group`.
 */
import type { DsfrEditorInstance, DsfrPartialBlock } from "../schema";

const ACCORDION = "dsfrAccordionSection";

/** Sérialise le contenu inline d'un bloc (sans balise conteneur). */
function inlineToHtml(
  editor: DsfrEditorInstance,
  block: DsfrPartialBlock,
): string {
  const html = editor.blocksToHTMLLossy([
    { type: "paragraph", content: (block as { content?: unknown }).content } as DsfrPartialBlock,
  ]);
  const match = html.match(/^\s*<p[^>]*>([\s\S]*)<\/p>\s*$/i);
  return match ? match[1] : html;
}

function accordionSectionHtml(
  editor: DsfrEditorInstance,
  section: DsfrPartialBlock,
): string {
  const id = `acc-${(section as { id?: string }).id ?? Math.random().toString(36).slice(2)}`;
  const title =
    inlineToHtml(editor, section).replace(/￼/g, "").trim() || "Section";
  const body = serialize(editor, (section.children ?? []) as DsfrPartialBlock[]);
  return (
    `<section class="fr-accordion">` +
    `<h3 class="fr-accordion__title">` +
    `<button type="button" class="fr-accordion__btn" aria-expanded="false" aria-controls="${id}">${title}</button>` +
    `</h3>` +
    `<div class="fr-collapse" id="${id}">${body}</div>` +
    `</section>`
  );
}

function serialize(
  editor: DsfrEditorInstance,
  blocks: DsfrPartialBlock[],
): string {
  const parts: string[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === ACCORDION) {
      const run: DsfrPartialBlock[] = [];
      while (i < blocks.length && blocks[i].type === ACCORDION) {
        run.push(blocks[i]);
        i++;
      }
      parts.push(
        `<div class="fr-accordions-group">` +
          run.map((s) => accordionSectionHtml(editor, s)).join("") +
          `</div>`,
      );
    } else {
      const run: DsfrPartialBlock[] = [];
      while (i < blocks.length && blocks[i].type !== ACCORDION) {
        run.push(blocks[i]);
        i++;
      }
      parts.push(editor.blocksToHTMLLossy(run));
    }
  }
  return parts.join("");
}

/**
 * Nettoie le HTML sérialisé :
 *  - retire le placeholder `￼` (U+FFFC) que BlockNote insère dans les blocs
 *    inline vides (utile seulement pour un aller-retour HTML, jamais ici) ;
 *  - retire les classes `bn-*` et les attributs `data-*` internes, en gardant
 *    `data-fr-*` (JS DSFR) et l'accessibilité ;
 *  - supprime les éléments de bloc devenus vides.
 * Sans DOM : seul le strip de `￼` est appliqué.
 */
function cleanup(html: string): string {
  const stripped = html.split("￼").join("");
  if (typeof DOMParser === "undefined") {
    return stripped;
  }
  const doc = new DOMParser().parseFromString(
    `<div id="__root">${stripped}</div>`,
    "text/html",
  );
  const root = doc.getElementById("__root");
  if (!root) {
    return stripped;
  }
  root.querySelectorAll("*").forEach((el) => {
    const kept = el.className
      .split(/\s+/)
      .filter((c) => c && !c.startsWith("bn-"));
    if (kept.length) {
      el.className = kept.join(" ");
    } else {
      el.removeAttribute("class");
    }
    for (const attr of [...el.attributes]) {
      if (
        attr.name.startsWith("data-") &&
        !attr.name.startsWith("data-fr-")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  });
  // Éléments de bloc laissés vides (aucun enfant élément, aucun texte).
  // Parcours en ordre inverse (feuilles avant parents) pour qu'un
  // `<blockquote><p></p></blockquote>` s'effondre entièrement.
  // Le garde `children.length === 0` préserve les conteneurs de blocs enfants
  // (`.fr-collapse`, `ul`, `section.fr-accordion`…).
  [...root.querySelectorAll("p, blockquote, li, h2, h3, h4")]
    .reverse()
    .forEach((el) => {
      if (el.children.length === 0 && !(el.textContent ?? "").trim()) {
        el.remove();
      }
    });
  return root.innerHTML;
}

export type RenderPublishedHtmlOptions = {
  /** Enveloppe le contenu dans une grille `fr-container`. Défaut : true. */
  wrapInContainer?: boolean;
};

/**
 * @param editor  Instance BlockNote (celle de l'éditeur, ou headless).
 * @param blocks  Document à sérialiser. Défaut : `editor.document`.
 */
export function renderPublishedHtml(
  editor: DsfrEditorInstance,
  blocks: DsfrPartialBlock[] = editor.document,
  options: RenderPublishedHtmlOptions = {},
): string {
  const { wrapInContainer = true } = options;
  const inner = cleanup(serialize(editor, blocks));
  if (!wrapInContainer) {
    return inner;
  }
  return (
    `<div class="fr-container fr-my-6w">` +
    `<div class="fr-grid-row fr-grid-row--center">` +
    `<div class="fr-col-12 fr-col-md-8">${inner}</div>` +
    `</div></div>`
  );
}
