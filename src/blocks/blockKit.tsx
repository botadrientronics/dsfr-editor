/**
 * Boîte à outils partagée par les blocs DSFR custom.
 *
 * - `BlockShell` : enveloppe standard d'un bloc en édition (frontière d'erreur +
 *   engrenage de configuration en surimpression).
 * - `BlockErrorBoundary` : isole un bloc mal configuré (portée depuis dsfr-puck).
 * - `orUndef` : normalise `""` -> `undefined` (react-dsfr distingue les deux).
 *
 * La configuration d'un bloc (champs, modale) vit dans `./blockConfig`.
 */
import { Component, type ReactNode } from "react";
import {
  BlockGearButton,
  type ConfigurableBlockType,
} from "./blockConfig";

/** `""` / `null` -> `undefined`. */
export const orUndef = <T,>(v: T): T | undefined =>
  v === "" || v === null ? undefined : v;

/** Clé de reset stable pour l'error boundary (ignore les fonctions). */
export const serializeForKey = (props: Record<string, unknown>): string => {
  try {
    return JSON.stringify(props, (_k, v) =>
      typeof v === "function" ? undefined : v,
    );
  } catch {
    return String(Date.now());
  }
};

type BoundaryProps = {
  name: string;
  /** Quand cette valeur change, on retente le rendu. */
  resetKey: string;
  children: ReactNode;
};

/**
 * Un bloc qui lève (prop structurée manquante côté react-dsfr, etc.) ne doit
 * pas démonter tout l'éditeur : on affiche un encadré d'erreur à sa place.
 */
export class BlockErrorBoundary extends Component<
  BoundaryProps,
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="fr-alert fr-alert--warning fr-alert--sm"
          role="alert"
          contentEditable={false}
        >
          <h3 className="fr-alert__title">
            « {this.props.name} » n'a pas pu s'afficher
          </h3>
          <p>
            Ce bloc a besoin d'être reconfiguré.
            {this.state.error.message ? ` (${this.state.error.message})` : ""}
          </p>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}

/**
 * Enveloppe standard d'un bloc DSFR en mode édition : frontière d'erreur +
 * engrenage `⚙` (visible au survol/focus, ouvre la modale de config).
 */
export function BlockShell({
  name,
  resetKey,
  blockId,
  blockType,
  children,
}: {
  name: string;
  resetKey: string;
  /** Id + type -> affiche l'engrenage de configuration. */
  blockId?: string;
  blockType?: ConfigurableBlockType;
  children: ReactNode;
}) {
  return (
    <BlockErrorBoundary name={name} resetKey={resetKey}>
      <div className="dsfr-block">
        {blockId && blockType ? <BlockGearButton blockId={blockId} /> : null}
        {children}
      </div>
    </BlockErrorBoundary>
  );
}
