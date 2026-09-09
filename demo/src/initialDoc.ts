import type { DsfrPartialBlock } from "dsfr-editor";

/** Document de démarrage (centre d'aide fictif). */
export const INITIAL_DOC: DsfrPartialBlock[] = [
  {
    type: "heading",
    props: { level: 2 },
    content: "Comment créer une demande ?",
  },
  {
    type: "paragraph",
    content:
      "Tapez « / » pour ouvrir le menu et insérer un bloc (titre, liste, encadré, accordéon…).",
  },
  {
    type: "dsfrCallout",
    props: { colorVariant: "blue-ecume", icon: "fr-icon-information-line", title: "Bon à savoir" },
    content: "Le contenu d'un encadré s'édite directement ici, en place.",
  },
  {
    type: "dsfrAccordionSection",
    content: "Quels documents fournir ?",
    children: [
      {
        type: "bulletListItem",
        content: "Une pièce d'identité en cours de validité",
      },
      { type: "bulletListItem", content: "Un justificatif de domicile" },
    ],
  },
  {
    type: "dsfrAccordionSection",
    content: "Quel est le délai de traitement ?",
    children: [
      {
        type: "paragraph",
        content: "Le délai moyen est de 15 jours ouvrés.",
      },
    ],
  },
  {
    type: "dsfrAlert",
    props: { severity: "warning", small: false, title: "Service indisponible" },
    content: "La téléprocédure est fermée pour maintenance le dimanche.",
  },
];
