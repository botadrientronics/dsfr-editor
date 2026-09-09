/**
 * Pont entre le thème de couleur react-dsfr et celui de BlockNote.
 * react-dsfr pilote `data-fr-theme` sur `<html>` ; `useIsDark()` en donne l'état.
 */
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";

export function useDsfrColorScheme(): "light" | "dark" {
  const { isDark } = useIsDark();
  return isDark ? "dark" : "light";
}
