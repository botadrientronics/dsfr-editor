/**
 * Listes d'options DSFR partagées par les blocs.
 * Portées depuis `dsfr-puck/src/puckConfig.tsx`.
 */

export type Option<V extends string = string> = { label: string; value: V };

/** Sévérités d'alerte DSFR (`fr-alert--*`, `role` associé). */
export const SEVERITY_OPTIONS = [
  { label: "Information", value: "info" },
  { label: "Succès", value: "success" },
  { label: "Avertissement", value: "warning" },
  { label: "Erreur", value: "error" },
] as const satisfies readonly Option[];

export type Severity = (typeof SEVERITY_OPTIONS)[number]["value"];

/** `role` ARIA attendu par le DSFR selon la sévérité. */
export const SEVERITY_ROLE: Record<Severity, "alert" | "status"> = {
  info: "status",
  success: "status",
  warning: "alert",
  error: "alert",
};

/** Couleurs d'accent DSFR (`fr-callout--*`). `""` = couleur par défaut. */
export const ACCENT_COLOR_OPTIONS = [
  { label: "Défaut", value: "" },
  { label: "Vert bourgeon", value: "green-bourgeon" },
  { label: "Vert émeraude", value: "green-emeraude" },
  { label: "Vert menthe", value: "green-menthe" },
  { label: "Bleu écume", value: "blue-ecume" },
  { label: "Bleu cumulus", value: "blue-cumulus" },
  { label: "Violet glycine", value: "purple-glycine" },
  { label: "Rose macaron", value: "pink-macaron" },
  { label: "Jaune tournesol", value: "yellow-tournesol" },
  { label: "Marron caramel", value: "brown-caramel" },
] as const satisfies readonly Option[];

export type AccentColor = (typeof ACCENT_COLOR_OPTIONS)[number]["value"];

/** Taille du texte d'une mise en relief (`fr-highlight--sm|lg`). */
export const HIGHLIGHT_SIZE_OPTIONS = [
  { label: "Petite", value: "sm" },
  { label: "Normale", value: "md" },
  { label: "Grande", value: "lg" },
] as const satisfies readonly Option[];

export type HighlightSize = (typeof HIGHLIGHT_SIZE_OPTIONS)[number]["value"];

/**
 * Sélection restreinte d'icônes DSFR pertinentes pour un encadré de contenu.
 * Un champ libre serait trop fragile (classe invalide -> pas d'icône, silencieux).
 */
export const CALLOUT_ICON_OPTIONS = [
  { label: "Aucune", value: "" },
  { label: "Information", value: "fr-icon-information-line" },
  { label: "Ampoule (astuce)", value: "fr-icon-lightbulb-line" },
  { label: "Alerte", value: "fr-icon-alert-line" },
  { label: "Question", value: "fr-icon-question-line" },
  { label: "Case cochée", value: "fr-icon-checkbox-circle-line" },
  { label: "Document", value: "fr-icon-file-text-line" },
  { label: "Calendrier", value: "fr-icon-calendar-line" },
  { label: "Horloge", value: "fr-icon-time-line" },
  { label: "Euro", value: "fr-icon-money-euro-circle-line" },
  { label: "Cadenas", value: "fr-icon-lock-line" },
  { label: "Boussole", value: "fr-icon-compass-3-line" },
  { label: "Mégaphone", value: "fr-icon-megaphone-line" },
] as const satisfies readonly Option[];

export type CalloutIcon = (typeof CALLOUT_ICON_OPTIONS)[number]["value"];
