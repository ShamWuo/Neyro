# PARA Method — Neyro

The PARA Method is a universal system for organizing digital information, pioneered by Tiago Forte (Building a Second Brain). Neyro uses PARA to organize capture and work: Projects, Areas, Resources, and Archive.

## 1. Executive Summary

PARA is organized by actionability. We don't organize information to store it; we organize it to use.

## 2. The Four Categories

### Projects (P)
- Definition: A series of tasks linked to a goal with a specific deadline.
- Key traits: Short-term, high-effort, clear "Done" state.
- Neyro rule: Maximum of 7 active projects to prevent cognitive overload.

Examples:
- Complete Neyro Landing Page v1.0 (Due Friday)
- Plan Q3 Marketing Budget

### Areas (A)
- Definition: A sphere of activity with a standard to be maintained over time.
- Key traits: No end date; ongoing responsibilities.

Examples: Health, Finances, Professional development.

### Resources (R)
- Definition: Topics or themes of ongoing interest.
- Key traits: Reference libraries, research, inspiration.

### Archives (A)
- Definition: Completed or inactive items.
- Key traits: Read-only, hidden from daily view.

## 3. The PARA Flow (Neyro Workflow)

1. Capture: Everything starts in the Inbox.
2. Organize: Move items to Project/Area/Resource.
3. Finish: Focus on Projects.
4. Ship/Archive: Completed items move to Archive.

## 4. Why This Works
- Zeigarnik Effect — PARA closes unfinished loops by assigning items a home.
- Cognitive Load Theory — 7-project limit prevents overload.
- Production vs Consumption — Items that don't support a Project are deprioritized.

## 5. Implementation Notes for Neyro
- Inbox-first capture UI at `/inbox`.
- Weekly review wizard at `/review` that updates Area health and project priorities.
- Dashboard enforces the 7 active project limit when creating/activating projects.

For the canonical plain-text version see `docs/paramethod.txt` in the repository.
