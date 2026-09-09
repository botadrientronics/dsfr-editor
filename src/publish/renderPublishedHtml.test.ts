import { describe, expect, it } from "vitest";
import { renderPublishedHtml } from "./renderPublishedHtml";
import type { DsfrEditorInstance, DsfrPartialBlock } from "../schema";

/**
 * Éditeur factice : `renderPublishedHtml` n'utilise que `blocksToHTMLLossy` et
 * `document`. On simule une sortie « brute » BlockNote (classes `bn-*`,
 * attributs `data-*`) pour vérifier le regroupement des accordéons ET le
 * nettoyage.
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
        switch (b.type) {
          case "heading":
            return `<h2 data-level="2">${text}</h2>`;
          case "bulletListItem":
            return `<ul><li><p class="bn-inline-content">${text}</p></li></ul>`;
          case "dsfrCallout":
            return `<div class="fr-callout fr-callout--blue-ecume" data-color-variant="blue-ecume"><div class="bn-inline-content fr-callout__text">${text}</div></div>`;
          default:
            return `<p>${text}</p>`;
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
    {
      type: "dsfrAccordionSection",
      id: "s1",
      content: t("Section 1"),
      children: [
        { type: "bulletListItem", content: t("Point A") },
      ],
    } as DsfrPartialBlock,
    {
      type: "dsfrAccordionSection",
      id: "s2",
      content: t("Section 2"),
      children: [{ type: "paragraph", content: t("Corps 2") }],
    } as DsfrPartialBlock,
    { type: "paragraph", content: t("Fin") } as DsfrPartialBlock,
  ];

  it("groupe les sections d'accordéon adjacentes dans un seul fr-accordions-group", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html.match(/fr-accordions-group/g)).toHaveLength(1);
    expect(html.match(/<section class="fr-accordion">/g)).toHaveLength(2);
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
    expect(html).not.toContain('data-level');
    // les hooks JS DSFR restent
    expect(html).toContain("fr-callout--blue-ecume");
  });

  it("préserve le contenu hors accordéon dans l'ordre", () => {
    const html = renderPublishedHtml(fakeEditor(), doc, { wrapInContainer: false });
    expect(html.indexOf("Titre")).toBeLessThan(html.indexOf("Encadré"));
    expect(html.indexOf("fr-accordions-group")).toBeLessThan(html.indexOf("Fin"));
  });

  it("enveloppe dans une grille fr-container par défaut", () => {
    const html = renderPublishedHtml(fakeEditor(), doc);
    expect(html.startsWith('<div class="fr-container')).toBe(true);
  });
});
