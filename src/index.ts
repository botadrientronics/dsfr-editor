/**
 * dsfr-editor — éditeur de contenu type Notion (BlockNote) avec des blocs du
 * Système de Design de l'État (DSFR).
 *
 * CSS : `import "dsfr-editor/style.css";` (en plus du CSS DSFR de l'app hôte).
 */
export { DsfrEditor, useDsfrEditor } from "./DsfrEditor";
export type { DsfrEditorProps, UseDsfrEditorOptions } from "./DsfrEditor";

export {
  dsfrSchema,
  DSFR_BLOCK_TYPES,
} from "./schema";
export type {
  DsfrSchema,
  DsfrEditorInstance,
  DsfrBlock,
  DsfrPartialBlock,
} from "./schema";

export { getDsfrSlashMenuItems, getDsfrSlashMenuGetItems } from "./slashMenu";
export { useDsfrColorScheme } from "./useDsfrColorScheme";

export {
  renderPublishedHtml,
} from "./publish/renderPublishedHtml";
export type { RenderPublishedHtmlOptions } from "./publish/renderPublishedHtml";

export {
  calloutBlock,
  alertBlock,
  highlightBlock,
  accordionSectionBlock,
  BlockErrorBoundary,
  BlockShell,
  BlockConfigModalHost,
  orUndef,
} from "./blocks";
export * from "./blocks/dsfrOptions";
