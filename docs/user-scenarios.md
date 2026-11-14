# Mobile timeline gesture acceptance

| ID | Steps | Expected result | Coverage |
| --- | --- | --- | --- |
| MOBILE-03 | In Vertical and Horizontal, in Presbyterian and All branches, spread two fingers inside the timeline, pinch inward, then drag with one finger and tap a node. | Pinch narrows/widens proportional time around the fingers; nearby dates separate/collapse into meaningful groups. Page scale stays fixed. Drag pans; pinch never opens a profile; taps and controls still work. | `scripts/test-mobile.cjs`: real Chromium CDP multi-touch, reverse pinch, domain/page-scale assertions, drag, profile tap and controls at five viewport sizes. |

Also manually test adding/removing a finger during a drag, touch cancellation,
midpoint movement near viewport edges, and browser pinch outside the graph.
The graph alone uses `touch-action: none` with nonpassive touch listeners;
page user scaling remains enabled. Finger changes rebase the gesture and
end/cancel clears active contacts. Desktop wheel, trackpad and controls retain
their existing handlers (`scripts/test-explorer.cjs`).

Chromium desktop with mobile emulation exercises browser touch input but is not
physical Android certification. iOS Safari uses the same scoped touch-action
and cancelable Touch Event handlers; real iPhone/iPad testing remains required,
including Safari page zoom outside the viewport and interruption by system UI.
