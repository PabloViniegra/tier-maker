## Agent skills

### Issue tracker

Issues for this repo are tracked in GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

This repo uses the default five canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repo is configured as a single-context repo. See `docs/agents/domain.md`.

# Workflow

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Design System

**Rule: Use Shadcn UI components exclusively.**

- All UI components must be added via `pnpm dlx shadcn@latest add <component>`.
- Custom components are only permitted when Shadcn has no equivalent.
- Never install third-party component libraries (MUI, Ant Design, Chakra, etc.).
- Icon library: `lucide-react` (already configured in `components.json`).

## Animations

**Rule: Use Motion (`motion/react`) for all animations.**

- Import from `motion/react`, never `framer-motion`.
- All animation variants live in `lib/motion-variants.ts`. Add new ones there; never hardcode transition values inline.
- Entrance animations use `fadeUpVariants` + `whileInView` (scroll) or `onMount` via the `<FadeUp>` component (immediate mount).
- Stagger lists use `staggerIndex(i) * STAGGER_DELAY` per child — not a stagger container.
- Drag feedback uses `dragActiveVariants`. For `@hello-pangea/dnd` items: keep the outer `ref`/props div plain, animate an inner `motion.div`.
- Page transitions use `<PageTransition>` in the root layout (already wired).
- `<MotionConfig reducedMotion="user">` is set at the root — do not override it per component.
- CSS `transition-*` Tailwind utilities are allowed only for color/border changes on hover. Never use them for `transform` or `opacity` — those belong to Motion.
- `tw-animate-css` is retained exclusively for Shadcn UI component internals (`data-open:animate-in` etc.). Do not use its classes in custom components.

<!-- graphify:start -->
## Graphify Knowledge Graph

This project keeps a queryable knowledge graph of the source in `graphify-out/`
(git-ignored, rebuilt after each commit). Use it to navigate the code instead of
broad file searches.

Before grepping or reading many files, query the graph:

    python -m graphify query "where is the project store defined?"
    python -m graphify path "ModuleA" "ModuleB"
    python -m graphify explain "concept-name"

Read `graphify-out/GRAPH_REPORT.md` for a high-level map.
Missing graph? Build once: pip install graphifyy && python -m graphify .

> Windows: always use `python -m graphify`, never `graphify` (may not be on PATH).
<!-- graphify:end -->
