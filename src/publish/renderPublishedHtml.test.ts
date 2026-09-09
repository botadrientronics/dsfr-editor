import { describe, expect, it } from "vitest";
import { renderPublishedHtml } from "./renderPublishedHtml";
import type { DsfrEditorInstance, DsfrPartialBlock } from "../schema";

/**
 * Éditeur factice : `renderPublishedHtml` n'utilise que `blocksToHTMLLossy` et
 * `document`. On simule une sortie « brute » BlockNote (classes `bn-*`,
 * attributs `data-*`, placeholder `￼` des blocs inline vides) pour vérifier le
 * regroupement des accordéons ET le nettoyage.
 */
function fakeEditor(): DsfrEditorInstance {
  const blocksToHTMLLossy = (blocks: DsfrPartialBlock[]): string =>
    blocks
      .map((b) => {
        const text =
          typeof b.content === "string"
            ? b.content
            : Array.isArray(b.content)
              ? b.content.map((c) => (c as { text?: string }).text ?? "").join("")
              : "";
        // BlockNote insère `￼` dans tout contenu inline vide.
        const inline = text === "" ? "￼" : text;
        switch (b.type) {
          case "heading":
            return `<h2 data-level="2">${inline}</h2>`;
          case "bulletListItem":
            return `<ul><li><p class="bn-inline-content">${inline}</p></li></ul>`;
          case "quote":
            return `<blockquote><p class="bn-inline-content">${inline}</p></blockquote>`;
          case "dsfrCallout":
            return `<div class="fr-callout fr-callout--blue-ecume" data-color-variant="blue-ecume"><div class="bn-inline-content fr-callout__text">${inline}</div></div>`;
          default:
            return `<p>${inline}</p>`;
        }
      })
      .join("");
  return { blocksToHTMLLossy, document: [] } as unknown as DsfrEditorInstance;
}

const t = (text: string) => [{ type: "text", text, styles: {} }];

describe("renderPublishedHtml", () => {
  const doc: DsfrPartialBlock[] = [
    { type: "heading", content: t("Titre") } as DsfrPartialBlock,
    { type: "dsfrCallout", content: t("Encadré") } as DsfrPartialBlock,
    { type: "quote", content: t("") } as DsfrPartialBlock,
    {
      type: "dsfrAccordionSection",
      id: "s1",
      content: t("Section 1"),
      children: [{ type: "bulletListItem", content: t("Point A") }],
    } as DsfrPartialBlock,
    {
      type: "dsfrAccordionSection",
      id: "s2",
      content: t("Section 2"),
      children: [{ type: "paragraph", content: t("Corps 2") }],
    } as DsfrPartialBlock,
    {
      type: "dsfrAccordionSection",
      id: "s3",
      content: t(""),
      children: [{ type: "paragraph", content: t("Corps 3") }],
    } as DsfrPartialBlock,
    { type: "paragraph", content: t("Fin") } as DsfrPartialBlock,
  ];

  it("groupe les sections d'accordéon adjacentes dans un seul fr-accordions-group", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html.match(/fr-accordions-group/g)).toHaveLength(1);
    expect(html.match(/<section class="fr-accordion">/g)).toHaveLength(3);
  });

  it("imbrique le corps d'une section dans son fr-collapse", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html).toMatch(
      /<div class="fr-collapse" id="acc-s1">\s*<ul><li>.*Point A.*<\/li><\/ul>\s*<\/div>/s,
    );
    expect(html).toContain("Section 1</button>");
  });

  it("retire les classes bn-* et les attributs data-* non DSFR", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html).not.toMatch(/\bbn-/);
    expect(html).not.toContain("data-color-variant");
    expect(html).not.toContain("data-level");
    // les hooks JS DSFR restent
    expect(html).toContain("fr-callout--blue-ecume");
  });

  it("retire le placeholder ￼ et les blocs devenus vides", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html).not.toContain("￼");
    // la citation vide ne laisse pas de <blockquote> vide
    expect(html).not.toContain("<blockquote>");
    // titre d'accordéon vide -> repli « Section »
    expect(html).toContain(">Section</button>");
  });

  it("préserve le contenu hors accordéon dans l'ordre", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html.indexOf("Titre")).toBeLessThan(html.indexOf("Encadré"));
    expect(html.indexOf("fr-accordions-group")).toBeLessThan(html.indexOf("Fin"));
    expect(html).toContain("Corps 3");
    expect(html).toContain("Fin");
  });

  it("enveloppe dans une grille fr-container par défaut", () => {
    const html = renderPublishedHtml(fakeEditor(), doc);
    expect(html.startsWith('<div class="fr-container')).toBe(true);
  });
});
