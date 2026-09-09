# dsfr-editor

Éditeur de **contenu de page** type Notion, construit sur [BlockNote](https://www.blocknotejs.org/) et [`@codegouvfr/react-dsfr`](https://github.com/codegouvfr/react-dsfr).

L'édition se fait **en place, en WYSIWYG** : slash menu (`/`), poignée de glisser, imbrication, et quelques blocs du Système de Design de l'État (encadré, accordéon, alerte, mise en relief) qui s'éditent directement dans le flux.

Le périmètre est **le corps de la page** (titres, listes, citation, encadrés…) : ni en-tête, ni pied de page, ni navigation, ni arborescence.
C'est le pendant « éditeur de blocs » de [`dsfr-puck`](https://github.com/…/dsfr-puck) (qui, lui, suit le modèle panneau + rendu de Puck).

## Statut

MVP fonctionnel. Blocs DSFR livrés : **Encadré (CallOut)**, **Accordéon**, **Alerte**, **Mise en relief (Highlight)**.
Blocs natifs conservés : paragraphe, titres **h2–h4** (pas de h1, fourni par le gabarit), listes à puces / numérotées / à cocher, citation, bloc de code, séparateur, image.

## Architecture

```
src/                     LA LIBRAIRIE (build tsc -> dist/)
  DsfrEditor.tsx          <DsfrEditor> + useDsfrEditor()  (shell @blocknote/ariakit)
  schema.ts               dsfrSchema — sous-ensemble curé + blocs DSFR
  slashMenu.tsx           entrées du slash menu (groupe « DSFR »)
  useDsfrColorScheme.ts   pont thème react-dsfr <-> BlockNote
  blocks/
    Callout / Alert / Highlight / AccordionSection
    blockKit.tsx          BlockShell, BlockConfigBar, BlockErrorBoundary
    dsfrOptions.ts        constantes portées de dsfr-puck
  publish/
    renderPublishedHtml.ts  document -> page HTML DSFR statique
  styles/
    index.css  ->  editor-dsfr-reset.css + dsfr-blocknote-theme.css
demo/                     WORKSPACE VITE SPA (consomme ../src)
```

### Points de conception

- **En édition, les blocs n'émettent que du markup DSFR présentationnel** (jamais de `fr-collapse` interactif) : la JS vanilla DSFR (`MutationObserver`) entrerait sinon en conflit avec ProseMirror. L'accordéon se replie via le `ToggleWrapper` React de BlockNote.
- **La publication** passe par `renderPublishedHtml(editor, blocks)` : il sérialise avec `blocksToHTMLLossy` (qui appelle les `toExternalHTML`), assemble à la main les sections d'accordéon adjacentes en `fr-accordions-group`, et nettoie les classes `bn-*` / attributs `data-*` internes. C'est **là** que la JS DSFR anime les accordéons.
- **Une section d'accordéon = un bloc** (`dsfrAccordionSection`) : contenu inline = le titre, blocs enfants = le corps. Il n'y a pas d'objet « accordéon » conteneur (BlockNote ne donne qu'une zone `contentRef` par bloc) ; les sections adjacentes sont regroupées visuellement.
- **Thème** : les variables `--bn-*` sont mappées sur les tokens DSFR (clair + sombre suivent `data-fr-theme`). Police Marianne.

## Développement

```bash
npm install
npm run demo:dev        # http://localhost:5173  (la démo consomme ../src en direct)

npm run typecheck       # lib + démo
npm test                # vitest (renderPublishedHtml)
npm run build           # tsc -> dist/
npm run demo:build
```

La démo est déployée automatiquement sur **GitHub Pages** à chaque push sur `main` :
**https://botadrientronics.github.io/dsfr-editor/**
(Vite bundle les polices et icônes DSFR ; pas de `copy-dsfr-to-public` nécessaire.)

## Utilisation (dans une app)

```tsx
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import "@codegouvfr/react-dsfr/dsfr/utility/utility.min.css";
import { DsfrEditor, useDsfrEditor, renderPublishedHtml } from "dsfr-editor";
import "dsfr-editor/style.css";

startReactDsfr({ defaultColorScheme: "system" });

function Editeur({ doc, onChange }) {
  const editor = useDsfrEditor({ initialContent: doc });
  return <DsfrEditor editor={editor} onChange={onChange} />;
}
```

Le document est un arbre de blocs BlockNote (`editor.document`), à persister en JSON.

## Licences

Code : MIT. Dépendances : BlockNote (MPL-2.0), react-dsfr (MIT).
Le DSFR lui-même est réservé aux sites de l'État — voir les mentions légales de `@codegouvfr/react-dsfr`.
