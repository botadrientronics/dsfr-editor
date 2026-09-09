/**
 * Bloc « Alerte » (DSFR Alert).
 *
 * Le corps rich-text éditable est la *description* de l'alerte.
 * Markup écrit à la main : on évite le `useState` / bouton de fermeture du
 * composant react-dsfr à l'intérieur de l'éditeur, et on maîtrise le placement
 * du `contentRef`.
 *
 * Contrainte react-dsfr : `small: true` -> titre optionnel, description requise ;
 * `small: false` -> titre requis. L'auteur voit le rendu en direct, on se
 * contente donc de refléter la classe `fr-alert--sm`.
 */
import { createReactBlockSpec } from "@blocknote/react";
import { SEVERITY_OPTIONS, SEVERITY_ROLE, type Severity } from "./dsfrOptions";
import { BlockShell, serializeForKey } from "./blockKit";

const SEVERITY_VALUES = SEVERITY_OPTIONS.map((o) => o.value);

const alertClassName = (severity: Severity, small: boolean) =>
  ["fr-alert", `fr-alert--${severity}`, small && "fr-alert--sm"]
    .filter(Boolean)
    .join(" ");

function AlertMarkup(props: {
  severity: Severity;
  small: boolean;
  title: string;
  contentRef: (node: HTMLElement | null) => void;
}) {
  const { severity, small, title } = props;
  return (
    <div className={alertClassName(severity, small)} role={SEVERITY_ROLE[severity]}>
      {title && !small ? <h3 className="fr-alert__title">{title}</h3> : null}
      {title && small ? <p className="fr-alert__title">{title}</p> : null}
      <p ref={props.contentRef} />
    </div>
  );
}

export const alertBlock = createReactBlockSpec(
  {
    type: "dsfrAlert",
    content: "inline",
    propSchema: {
      severity: { default: "info" as Severity, values: SEVERITY_VALUES },
      small: { default: false },
      title: { default: "" },
    },
  },
  {
    render: (props) => {
      const { severity, small, title } = props.block.props;
      return (
        <BlockShell
          name="Alerte"
          resetKey={serializeForKey(props.block.props)}
          blockId={props.block.id}
          blockType="dsfrAlert"
        >
          <AlertMarkup
            severity={severity}
            small={small}
            title={title}
            contentRef={props.contentRef}
          />
        </BlockShell>
      );
    },
    toExternalHTML: (props) => (
      <AlertMarkup
        severity={props.block.props.severity}
        small={props.block.props.small}
        title={props.block.props.title}
        contentRef={props.contentRef}
      />
    ),
  },
);
