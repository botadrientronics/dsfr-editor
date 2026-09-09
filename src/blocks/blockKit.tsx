/**
 * Boîte à outils partagée par les blocs DSFR custom.
 *
 * - `BlockShell` : enveloppe standard d'un bloc en édition (error boundary +
 *   pile verticale « barre de config » puis « corps »).
 * - `BlockConfigBar` : barre de contrôles affichée au survol / à la sélection du bloc.
 * - `orUndef` : normalise `""` -> `undefined` (react-dsfr distingue les deux).
 *
 * NB : on ne fournit volontairement pas de « factory » générique enveloppant
 * `createReactBlockSpec` — les génériques de BlockNote se prêtent mal à ça et
 * chaque bloc reste plus lisible en appelant `createReactBlockSpec` directement.
 */
import { Component, type ReactNode } from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Input } from "@codegouvfr/react-dsfr/Input";
import type { Option } from "./dsfrOptions";

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
 * conteneur vertical (barre de config au-dessus, corps en dessous).
 */
export function BlockShell({
  name,
  resetKey,
  config,
  children,
}: {
  name: string;
  resetKey: string;
  config?: ReactNode;
  children: ReactNode;
}) {
  return (
    <BlockErrorBoundary name={name} resetKey={resetKey}>
      <div className="dsfr-block">
        {config}
        {children}
      </div>
    </BlockErrorBoundary>
  );
}

/** Un champ « select » de la barre de configuration d'un bloc. */
export type ConfigSelectField = {
  kind: "select";
  key: string;
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
};

/** Un champ « oui / non » de la barre de configuration d'un bloc. */
export type ConfigBooleanField = {
  kind: "boolean";
  key: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/** Un champ texte libre de la barre de configuration d'un bloc. */
export type ConfigTextField = {
  kind: "text";
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export type ConfigField =
  | ConfigSelectField
  | ConfigBooleanField
  | ConfigTextField;

/**
 * Barre de configuration d'un bloc, rendue `contentEditable={false}` au-dessus
 * du corps. Masquée par défaut, révélée au survol / focus du bloc (voir le CSS
 * `.dsfr-block-config` dans `styles/dsfr-blocknote-theme.css`).
 *
 * Tous les contrôles sont des composants de formulaire DSFR *sans* JS vanilla
 * (pas de `Modal`, pas d'`Accordion`) : sûrs à l'intérieur de `.bn-editor`.
 */
export function BlockConfigBar({ fields }: { fields: ConfigField[] }) {
  return (
    <div className="dsfr-block-config" contentEditable={false}>
      {fields.map((field) => {
        if (field.kind === "select") {
          return (
            <Select
              key={field.key}
              label={field.label}
              nativeSelectProps={{
                value: field.value,
                onChange: (e) => field.onChange(e.target.value),
              }}
            >
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          );
        }
        if (field.kind === "text") {
          return (
            <Input
              key={field.key}
              label={field.label}
              nativeInputProps={{
                value: field.value,
                placeholder: field.placeholder,
                onChange: (e) => field.onChange(e.target.value),
              }}
            />
          );
        }
        return (
          <Select
            key={field.key}
            label={field.label}
            nativeSelectProps={{
              value: field.value ? "oui" : "non",
              onChange: (e) => field.onChange(e.target.value === "oui"),
            }}
          >
            <option value="non">Non</option>
            <option value="oui">Oui</option>
          </Select>
        );
      })}
    </div>
  );
}
