---
lang: en
title: UI Strategy & Design Philosophy
title-en: UI Strategy & Design Philosophy
title-ja: UI戦略と設計思想
related:
    - docs/specs/data-fetching-strategy.md "Data Fetching Strategy"
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# UI Strategy & Design Philosophy

## Core Philosophy: Precision over Simplicity

This application is designed for developers, engineers, and power users who interact with the ProtoPedia ecosystem. Unlike consumer-facing applications that prioritize "friendly" ambiguity, MUGEN ProtoPedia prioritizes **technical accuracy and transparency**.

### Mottoes

1. **No "Something went wrong"**: Never hide the underlying cause of an error behind a generic message. If we know it's a CORS error, say "CORS Error". If it's a 503, say "503 Service Unavailable".
2. **Assume Competence**: The user understands what "DNS failure" or "Timeout" means. Do not patronize them with simplified explanations.
3. **Expose the Machinery**: When data is stale, loading, or retrying, the UI should reflect this state clearly.
4. **Raw Data is Better than No Data**: If a partial failure occurs, show what we have and clearly label what failed.
5. **Technical Correctness is the Best UX**: For our audience, knowing _why_ something failed is more valuable than a polite apology.

## Implementation Guidelines

### Error Handling

- **Network Errors**: Distinguish between offline status, DNS resolution failures, and server unreachability where possible.
- **HTTP Status Codes**: Display the exact status code (4xx, 5xx) returned by the API.
- **Timeouts**: Explicitly state when a request was aborted due to a timeout (e.g., "504 Gateway Timeout" or "Connection Timed Out after 30s").

### Loading States

- Avoid fake progress bars.
- Use skeletons or spinners that accurately reflect the component being loaded.

### Data Presentation

- When displaying API data, prefer preserving the terminology used by the upstream API rather than inventing new "friendly" labels, unless the upstream terminology is confusingly abstract.
