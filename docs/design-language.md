# Design language · working foundation

Status: a shared implementation foundation with three proposed color directions. Parchment remains the default. None of these palettes is a final brand decision.

## Preview and current choices

Open **Appearance** in the explorer header. Radio cards apply immediately to the actual explorer, including SVG graphs and historical details. Close the dialog to examine the result. The browser remembers the choice across reloads; **Reset to Parchment** removes the preference. Storage failures fall back to the current visit. No account preference is created. Escape closes the dialog and focus returns to its trigger.

| Palette | Rationale | Status |
| --- | --- | --- |
| Parchment | Existing warm paper and garden greens; blue continuity and plum splits. Familiar, bookish starting point. | Active default |
| Slate | Cool paper, blue-gray surfaces and more architectural structure. | Proposal |
| Ink | Deep blue surfaces, luminous text and softer blue/plum connections for a dark reading environment. | Proposal |

Color is accompanied by labels, selection outlines, and dashed mixed relationships. Relationship colors retain consistent meaning between palettes; the legend displays actual themed strokes rather than naming a fixed hue. Focus remains separately visible. The existing layout and Georgia typography remain the baseline while color is evaluated.

## Shared contract

Load `/theme.css` before a page's own stylesheet. Optionally load `/theme.js` synchronously in the head, after theme.css, to apply the saved preference before content paints. It safely initializes on pages without the explorer chooser. Nested pages should use `../theme.css` and `../theme.js` when hosted beneath the same site directory. The root `data-theme` attribute accepts `parchment`, `slate`, or `ink`; absent or invalid values use default colors. Storage key: `churchtree.theme`. The stylesheet intentionally supplies tokens rather than global component rules, so a reader can reuse the contract without adopting explorer layout.

Use `var(--ct-ROLE)` in CSS and SVG presentation attributes; variables update existing SVG elements immediately without rerendering. Keep literal palette values in theme.css. New themes must define every role and native `color-scheme`. Fixed chooser swatches also live in theme.css.

| Roles | Intended use |
| --- | --- |
| `page`, `surface` | Page canvas and raised/content surfaces, including dialogs and inputs |
| `text`, `text-secondary`, `text-muted` | Main content, supporting prose, compact metadata |
| `border`, `border-control` | Quiet dividers and stronger interactive outlines |
| `link`, `focus`, `error` | Links, keyboard focus, validation messages |
| `accent`, `on-accent`, `hover` | Active controls with paired foreground, pointer hover |
| `node-border`, `node-selected` | Graph node outline and selected fill |
| `relationship`, `relationship-split`, `relationship-mixed` | Origin/continuation/merger, split, mixed grouped edges |
| `arrow`, `axis`, `grid` | Graph direction markers, axes, gridlines |
| `lane`, `group`, `group-border` | Timeline grouping surfaces and group outlines |
| `splitter`, `splitter-hover` | Resizable panel divider and interaction state |
| `shadow`, `backdrop` | Elevation shadow and modal scrim |

These names describe roles, not colors. Avoid introducing page-specific palette copies. A reader can use page/surface/text/link/border/focus now; propose new roles when an existing role cannot describe the intended meaning.

## Typography and spacing starting points

Current implementation: Georgia/Times for historical content and headings; system UI for controls, metadata, and graph labels. This supports a reading-oriented history experience with compact, recognizable controls. Proposed principle: retain that division while we evaluate a shared type scale across the explorer and reader. Font families, scale, and spacing are not yet shared tokens.

Current spacing uses compact graph controls and more generous prose rhythm. Proposed principle: prefer a 4px spacing rhythm, 8–12px within related controls, 16–24px between content groups, comfortable reading line-height around 1.6, and touch targets at least 44px. These are starting points, not a layout migration or a claim that every existing measurement already follows the scale.

## Evolution with the user

Next decisions: compare actual reading and graph use in each palette; select or combine a direction; review link/relationship distinction; then agree on shared typography, spacing, elevation, and component states. Dark mode is an explicit choice for now, not an automatic system preference. Main-branch.com naming, logo, and final brand identity remain open. Changes to the token contract should update this document and check both explorer and reader consumers before removing or renaming roles.
