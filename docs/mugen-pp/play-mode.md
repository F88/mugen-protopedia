---
lang: en
title: Play Mode Specification
title-en: Play Mode Specification
title-ja: プレイモード仕様
related:
    - docs/*
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Play Mode Specification

This document summarizes the roles and state transitions of play modes.

Play modes:

- normal
- playlist

## `normal`: Normal Mode

Activation condition: No other play mode is active.

Mode overview:

- Prototypes can be displayed individually from the control panel.

## `playlist`: Play Playlist Mode

Activation condition: The direct launch parameters contain a valid prototype ID list, or a non-empty title is specified.

Mode overview:

- A mode that continuously displays prototypes based on the specified list of prototype IDs.
- After processing all specified prototype IDs, the play mode remains unchanged.
