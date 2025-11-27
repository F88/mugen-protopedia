# Documentation

This directory contains all documentation for MUGEN ProtoPedia.

## Directory Structure

```plaintext
docs/
├── README.md                              # This file
├── DEVELOPMENT.md                         # Development setup and guidelines
├── mugen-protopedia-feature-guide.md      # Guide for writing feature docs
├── mugen-protopedia-specification-guide.md # Guide for writing spec docs
├── mugen-pp/                              # Main application (/) documentation
│   ├── data-fetching-strategy.md          # Data fetching and caching strategy
│   ├── ui-fetch-paths.md                  # UI data flow and fetch patterns
│   └── ui-strategy.md                     # UI architecture and state management
├── playlist/                              # Playlist feature documentation
│   ├── play-mode.md                       # Play modes specification
│   ├── slot-and-scroll-behavior.md        # Slot and scroll UI behavior
│   └── url-direct-launch.md               # URL-based playlist direct launch
└── observatory/                           # Observatory feature documentation
    ├── observatory-architecture.md        # Observatory design and patterns
    ├── analysis.md                        # Analysis pipeline specification
    └── analysis-ideas.md                  # Future analysis feature ideas
```

## Documentation Categories

### Root Level

Files in the root level apply to the entire project:

- **DEVELOPMENT.md** - Local setup, configuration, scripts, testing, and quality tooling
- **mugen-protopedia-feature-guide.md** - Template and guidelines for feature documentation
- **mugen-protopedia-specification-guide.md** - Template and guidelines for technical specifications

### mugen-pp/

Documentation for the main application (`/` route):

- Core UI architecture and state management
- Data fetching strategies and caching
- Component patterns and interactions

### playlist/

Documentation for the playlist feature (`/playlist` route):

- Play mode specifications (explore, playlist)
- URL-based direct launch functionality
- Slot navigation and scroll behavior

### observatory/

Documentation for the Observatory feature (`/observatory` routes):

- Design philosophy and architectural patterns
- Analysis pipeline and metrics
- Future feature ideas and expansion plans

## Writing Documentation

### For Features

Follow the guidelines in `mugen-protopedia-feature-guide.md` when documenting new features. Feature docs should:

- Explain **what** users experience and **why** the feature exists
- Focus on user journeys and success metrics
- Link to related specifications

Place feature docs in the appropriate subdirectory (`mugen-pp/`, `playlist/`, `observatory/`).

### For Specifications

Follow the guidelines in `mugen-protopedia-specification-guide.md` when writing technical specs. Specification docs should:

- Define **what must be true** and **how to verify it**
- Cover acceptance criteria, data requirements, and edge cases
- Reference related feature docs

Place specs in the appropriate subdirectory based on the feature area.

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
