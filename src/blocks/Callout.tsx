/**
 * Bloc « Encadré » (DSFR CallOut).
 *
 * Corps rich-text éditable en place (`content: "inline"`).
 * Le markup est écrit à la main — identique en édition et à l'export — pour
 * garantir que `render` et `toExternalHTML` produisent exactement la même chose
 * et rester indépendant de la structure interne du composant react-dsfr.
 */
import { createReactBlockSpec } from "@blocknote/react";
import {
  ACCENT_COLOR_OPTIONS,
  CALLOUT_ICON_OPTIONS,
  type AccentColor,
  type CalloutIcon,
} from "./dsfrOptions";
import { BlockShell, serializeForKey } from "./blockKit";

const ACCENT_VALUES = ACCENT_COLOR_OPTIONS.map((o) => o.value);
const ICON_VALUES = CALLOUT_ICON_OPTIONS.map((o) => o.value);

const calloutClassName = (colorVariant: string, icon: string) =>
  [
    "fr-callout",
    colorVariant && `fr-callout--${colorVariant}`,
    icon,
  ]
    .filter(Boolean)
    .join(" ");

/** Markup DSFR statique commun à l'édition et à l'export. */
function CalloutMarkup(props: {
  colorVariant: string;
  icon: string;
  title: string;
  contentRef: (node: HTMLElement | null) => void;
}) {
  return (
    <div className={calloutClassName(props.colorVariant, props.icon)}>
      {props.title ? (
        <p className="fr-callout__title">{props.title}</p>
      ) : null}
      <div className="fr-callout__text" ref={props.contentRef} />
    </div>
  );
}

export const calloutBlock = createReactBlockSpec(
  {
    type: "dsfrCallout",
    content: "inline",
    propSchema: {
      colorVariant: { default: "" as AccentColor, values: ACCENT_VALUES },
      icon: { default: "" as CalloutIcon, values: ICON_VALUES },
      title: { default: "" },
    },
  },
  {
    render: (props) => {
      const { colorVariant, icon, title } = props.block.props;
      return (
        <BlockShell
          name="Encadré"
          resetKey={serializeForKey(props.block.props)}
          blockId={props.block.id}
          blockType="dsfrCallout"
        >
          <CalloutMarkup
            colorVariant={colorVariant}
            icon={icon}
            title={title}
            contentRef={props.contentRef}
          />
        </BlockShell>
      );
    },
    toExternalHTML: (props) => (
      <CalloutMarkup
        colorVariant={props.block.props.colorVariant}
        icon={props.block.props.icon}
        title={props.block.props.title}
        contentRef={props.contentRef}
      />
    ),
  },
);
