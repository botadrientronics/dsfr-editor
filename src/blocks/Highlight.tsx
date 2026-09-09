/**
 * Bloc « Mise en relief » (DSFR Highlight).
 * Corps rich-text éditable en place. Aucune JS DSFR (pur CSS) -> sûr en édition.
 */
import { createReactBlockSpec } from "@blocknote/react";
import { HIGHLIGHT_SIZE_OPTIONS, type HighlightSize } from "./dsfrOptions";
import { BlockShell, serializeForKey } from "./blockKit";

const SIZE_VALUES = HIGHLIGHT_SIZE_OPTIONS.map((o) => o.value);

const textClass = (size: HighlightSize) =>
  size === "md" ? undefined : `fr-text--${size}`;

function HighlightMarkup(props: {
  size: HighlightSize;
  contentRef: (node: HTMLElement | null) => void;
}) {
  return (
    <div className="fr-highlight">
      <p className={textClass(props.size)} ref={props.contentRef} />
    </div>
  );
}

export const highlightBlock = createReactBlockSpec(
  {
    type: "dsfrHighlight",
    content: "inline",
    propSchema: {
      size: { default: "md" as HighlightSize, values: SIZE_VALUES },
    },
  },
  {
    render: (props) => {
      const { size } = props.block.props;
      return (
        <BlockShell
          name="Mise en relief"
          resetKey={serializeForKey(props.block.props)}
          blockId={props.block.id}
          blockType="dsfrHighlight"
        >
          <HighlightMarkup size={size} contentRef={props.contentRef} />
        </BlockShell>
      );
    },
    toExternalHTML: (props) => (
      <HighlightMarkup
        size={props.block.props.size}
        contentRef={props.contentRef}
      />
    ),
  },
);
