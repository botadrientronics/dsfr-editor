import type { DsfrPartialBlock } from "dsfr-editor";
import { INITIAL_DOC } from "./initialDoc";

const STORAGE_KEY = "dsfr-editor:document";

export function loadDoc(): DsfrPartialBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as DsfrPartialBlock[];
      }
    }
  } catch {
    /* stockage indisponible ou JSON invalide -> contenu initial */
  }
  return INITIAL_DOC;
}

export function saveDoc(blocks: DsfrPartialBlock[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch {
    /* ignore */
  }
}

export function clearDoc(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
