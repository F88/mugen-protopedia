# MUGEN ProtoPedia Feature Guide

Use this guide to document _features_ at a product/UX level. Feature docs describe what the user experiences, why the change exists, and which success metrics or qualitative goals you target. Leave engineering details to specification documents.

## Goals of a Feature Doc

- Capture customer problem statements and desired outcomes.
- Describe the primary user journeys and their non-functional expectations (latency, accessibility, device coverage, etc.).
- Enumerate success metrics and guardrails (e.g., no more than one blocking dialog in the happy path).
- Link to prototypes, design files, or research artifacts.

## Recommended Sections

1. **Background & Goals** – Motivation, hypotheses, related OKRs.
2. **Personas & Entry Points** – Who uses the feature, where they find it.
3. **User Journeys** – Step-by-step flows with diagrams or sequence tables.
4. **States & Copy** – Screens, empty states, error messaging, localization needs.
5. **Success Metrics & Rollout** – KPIs, experiment toggles, rollout plan.
6. **Open Questions** – Items that need validation or follow-up.
7. **Spec Link** – Reference the engineering specification (see `docs/mugen-protopedia-specification-guide.md`).

## File Placement

- Store features under `docs/features/<feature-name>.md`.
- Keep file names stable so specifications and tests can reference them.

## Relationship to Specifications

- Feature docs explain _what_ we need and _why_.
- Specification docs (see `docs/mugen-protopedia-specification-guide.md`) translate the feature into testable engineering requirements.
- Implementation notes (in code comments, ADRs, or README sections) explain _how_ it was built.
