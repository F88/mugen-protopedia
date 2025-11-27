---
lang: en
title: Documentation
title-en: Documentation
title-ja: ドキュメント
related:
    - README.md "Project Overview"
    - docs/*
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Documentation

This directory contains all documentation for MUGEN ProtoPedia.

## Application Structure

MUGEN ProtoPedia consists of three main areas:

### 無限ProtoPedia (`/`) - Main Application

The core functionality of the application:

- **Random prototype display**: Continuously shows random prototypes from ProtoPedia
- **Basic analysis**: Simple analytical features and statistics
- **Main content**: This is the primary feature that defines MUGEN ProtoPedia

### Playlist (`/playlist/edit/`) - Auxiliary Tool

A supplementary tool that leverages the main app's ID-based sequential display feature:

- **URL generator**: Creates URLs to launch the auto-play feature with specific prototype IDs
- **No persistence**: Playlists are not saved anywhere, only `/playlist/edit/` exists
- **Auxiliary nature**: Built on top of the main app's direct launch functionality

### Observatory (`/observatory`) - Analytical Content

An independent feature for ProtoPedia enthusiasts:

- **Deep analysis**: Provides unique perspectives and insights into ProtoPedia data
- **Data reuse**: Leverages the same data used in the main app's basic analysis
- **Editorial content**: Curated analytical articles for dedicated ProtoPedia fans
- **Separate identity**: Operates almost independently from the main app with its own design philosophy

## Directory Structure

```plaintext
docs/
├── README.md                              # This file
├── DEVELOPMENT.md                         # Development setup and guidelines
├── analysis.md                            # Analysis pipeline specification (shared)
├── url-direct-launch.md                   # URL-based direct launch (shared)
├── mugen-pp/                              # Main application (/) specific docs
│   ├── data-fetching-strategy.md          # Data fetching and caching strategy
│   ├── play-mode.md                       # Play modes specification
│   ├── slot-and-scroll-behavior.md        # Slot and scroll UI behavior
│   ├── ui-fetch-paths.md                  # UI data flow and fetch patterns
│   └── ui-strategy.md                     # UI architecture and state management
└── observatory/                           # Observatory feature documentation
    ├── observatory-architecture.md        # Observatory design and patterns
    └── analysis-ideas.md                  # Future analysis feature ideas
```

## Documentation Categories

### Root Level

Files in the root level apply to multiple areas or the entire project:

- **DEVELOPMENT.md** - Local setup, configuration, scripts, testing, and quality tooling for the entire project
- **analysis.md** - Analysis pipeline specification (shared between main app's basic analysis and Observatory's deep analysis)
- **url-direct-launch.md** - URL-based direct launch functionality (core feature used by both main app and playlist tool)

### mugen-pp/

Documentation for the main application (`/` route) and its core features:

- **Core UI architecture and state management**: How the main app manages prototypes and user interactions
- **Data fetching strategies and caching**: Efficient data retrieval and performance optimization
- **Play modes and navigation patterns**: Explore mode (random) and playlist mode (sequential ID-based playback)
- **Slot and scroll behavior**: UI interaction patterns for prototype browsing
- **Component patterns**: Reusable UI components and their interactions

Note: Playlist-related documentation (play-mode, slot-and-scroll-behavior) is stored here because the playlist feature is built entirely on top of the main app's infrastructure. The `/playlist/edit/` tool generates URLs that invoke the main app's playlist playback mode.

### observatory/

Documentation for the Observatory feature (`/observatory` routes):

- Design philosophy and architectural patterns
- Future feature ideas and expansion plans

## Writing Documentation

### For Features and Specifications

When documenting new features or technical specifications:

- Explain **what** users experience and **why** the feature exists
- Define **what must be true** and **how to verify it**
- Cover acceptance criteria, data requirements, and edge cases
- Include code examples where helpful

Place documentation in the appropriate location:

- **Shared features** (used across multiple areas) → `docs/` root
- **Main app specific** → `docs/mugen-pp/`
- **Observatory specific** → `docs/observatory/`

### For Architecture

When documenting architectural patterns or design decisions:

- Create a descriptive file name (e.g., `observatory-architecture.md`)
- Include code examples and directory structure diagrams
- Explain the philosophy behind design choices
- Document best practices and conventions

## Related Documentation

- Code comments and inline documentation
- Storybook stories for component documentation
- Test files for behavioral specifications
- README files in specific directories
