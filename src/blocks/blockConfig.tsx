/**
 * Configuration d'un bloc DSFR via une **modale** partagée.
 *
 * - Un engrenage `⚙` en surimpression du bloc (voir `BlockGearButton`, monté par
 *   `BlockShell`) ouvre la modale — aucune barre au survol, donc aucun décalage
 *   du contenu.
 * - Une seule modale DSFR pour tout l'éditeur (`blockConfigModal`), montée hors
 *   de `.bn-editor` par `BlockConfigModalHost` (rendu par `DsfrEditor`).
 * - Le bloc ciblé est gardé dans un petit store module-scope ; ses champs sont
 *   recalculés à chaque rendu du host à partir de `editor.getBlock(id)` frais,
 *   donc jamais périmés.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Input } from "@codegouvfr/react-dsfr/Input";
import {
  ACCENT_COLOR_OPTIONS,
  CALLOUT_ICON_OPTIONS,
  HIGHLIGHT_SIZE_OPTIONS,
  SEVERITY_OPTIONS,
  type AccentColor,
  type CalloutIcon,
  type HighlightSize,
  type Option,
  type Severity,
} from "./dsfrOptions";
import type { DsfrBlock, DsfrEditorInstance } from "../schema";

/* --------------------------------------------------------------------------
 * Champs de configuration
 * ---------------------------------------------------------------------- */

export type ConfigSelectField = {
  kind: "select";
  key: string;
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
};

export type ConfigBooleanField = {
  kind: "boolean";
  key: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

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

export type ConfigPanel = { title: string; fields: ConfigField[] };

/** Rendu des champs dans le corps de la modale (empilés, pleine largeur). */
export function ConfigFields({ fields }: { fields: ConfigField[] }) {
  return (
    <div className="dsfr-block-config-modal">
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

/* --------------------------------------------------------------------------
 * Registre : type de bloc -> panneau de config (fonction pure)
 * ---------------------------------------------------------------------- */

export type ConfigurableBlockType =
  | "dsfrCallout"
  | "dsfrAlert"
  | "dsfrHighlight";

type CalloutProps = {
  colorVariant: AccentColor;
  icon: CalloutIcon;
  title: string;
};
type AlertProps = { severity: Severity; small: boolean; title: string };
type HighlightProps = { size: HighlightSize };

export const configFieldsFor: Record<
  ConfigurableBlockType,
  (block: DsfrBlock, editor: DsfrEditorInstance) => ConfigPanel
> = {
  dsfrCallout: (block, editor) => {
    const p = block.props as CalloutProps;
    const update = (patch: Partial<CalloutProps>) =>
      editor.updateBlock(block, { type: "dsfrCallout", props: patch });
    return {
      title: "Configurer l'encadré",
      fields: [
        {
          kind: "select",
          key: "colorVariant",
          label: "Couleur d'accent",
          value: p.colorVariant,
          options: ACCENT_COLOR_OPTIONS,
          onChange: (v) => update({ colorVariant: v as AccentColor }),
        },
        {
          kind: "select",
          key: "icon",
          label: "Icône",
          value: p.icon,
          options: CALLOUT_ICON_OPTIONS,
          onChange: (v) => update({ icon: v as CalloutIcon }),
        },
        {
          kind: "text",
          key: "title",
          label: "Titre (optionnel)",
          value: p.title,
          placeholder: "Sans titre",
          onChange: (v) => update({ title: v }),
        },
      ],
    };
  },

  dsfrAlert: (block, editor) => {
    const p = block.props as AlertProps;
    const update = (patch: Partial<AlertProps>) =>
      editor.updateBlock(block, { type: "dsfrAlert", props: patch });
    return {
      title: "Configurer l'alerte",
      fields: [
        {
          kind: "select",
          key: "severity",
          label: "Sévérité",
          value: p.severity,
          options: SEVERITY_OPTIONS,
          onChange: (v) => update({ severity: v as Severity }),
        },
        {
          kind: "boolean",
          key: "small",
          label: "Version compacte",
          value: p.small,
          onChange: (v) => update({ small: v }),
        },
        {
          kind: "text",
          key: "title",
          label: p.small ? "Titre (optionnel)" : "Titre",
          value: p.title,
          placeholder: p.small ? "Sans titre" : "Titre de l'alerte",
          onChange: (v) => update({ title: v }),
        },
      ],
    };
  },

  dsfrHighlight: (block, editor) => {
    const p = block.props as HighlightProps;
    return {
      title: "Configurer la mise en relief",
      fields: [
        {
          kind: "select",
          key: "size",
          label: "Taille du texte",
          value: p.size,
          options: HIGHLIGHT_SIZE_OPTIONS,
          onChange: (v) =>
            editor.updateBlock(block, {
              type: "dsfrHighlight",
              props: { size: v as HighlightSize },
            }),
        },
      ],
    };
  },
};

/* --------------------------------------------------------------------------
 * Modale partagée + store du bloc ciblé
 * ---------------------------------------------------------------------- */

export const blockConfigModal = createModal({
  id: "dsfr-block-config-modal",
  isOpenedByDefault: false,
});

let openBlockId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openBlockConfig(blockId: string) {
  if (openBlockId === blockId) {
    blockConfigModal.open();
    return;
  }
  openBlockId = blockId;
  emit();
}

export function closeBlockConfig() {
  if (openBlockId === null) return;
  openBlockId = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const getSnapshot = () => openBlockId;

function useOpenBlockId() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* --------------------------------------------------------------------------
 * Bouton engrenage (dans le bloc) + host de la modale (hors éditeur)
 * ---------------------------------------------------------------------- */

export function BlockGearButton({ blockId }: { blockId: string }) {
  return (
    <span className="dsfr-block__gear" contentEditable={false}>
      <button
        type="button"
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-settings-5-line"
        title="Configurer le bloc"
        aria-label="Configurer le bloc"
        aria-haspopup="dialog"
        draggable={false}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openBlockConfig(blockId);
        }}
      />
    </span>
  );
}

/**
 * Rendu unique de la modale de config. À monter par `DsfrEditor`, **hors** de
 * `<BlockNoteView>` (donc hors du contentEditable et de `.bn-container`).
 */
export function BlockConfigModalHost({
  editor,
}: {
  editor: DsfrEditorInstance;
}) {
  const targetId = useOpenBlockId();
  const [, setTick] = useState(0);
  const force = () => setTick((t) => t + 1);

  // Recalcule les champs à chaque modif du document -> jamais périmés.
  useEffect(() => editor.onChange(() => force()), [editor]);

  // X / clic sur le fond / Échap -> refléter dans le store et rendre la main
  // à l'éditeur (curseur restauré à sa dernière position).
  useIsModalOpen(blockConfigModal, {
    onConceal: () => {
      closeBlockConfig();
      editor.focus();
    },
  });

  // Ouvre la modale APRÈS le rendu qui a calculé `panel` (évite une frame vide).
  useEffect(() => {
    if (targetId) blockConfigModal.open();
  }, [targetId]);

  const block = targetId ? editor.getBlock(targetId) : undefined;

  // Bloc supprimé pendant que la modale est ouverte.
  useEffect(() => {
    if (targetId && !block) {
      closeBlockConfig();
      blockConfigModal.close();
    }
  }, [targetId, block]);

  const panel =
    block && block.type in configFieldsFor
      ? configFieldsFor[block.type as ConfigurableBlockType](
          block,
          editor,
        )
      : undefined;

  return (
    <blockConfigModal.Component
      title={panel?.title ?? ""}
      size="small"
      buttons={[{ children: "Fermer", priority: "secondary" }]}
    >
      {panel ? <ConfigFields fields={panel.fields} /> : null}
    </blockConfigModal.Component>
  );
}
