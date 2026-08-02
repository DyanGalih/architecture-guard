## Context

Architecture Guard provides a suite of skills for AI agents. Currently, these skills have generic names like `init`, `verify`, etc. When Architecture Guard is used as a standalone tool, this works fine. However, when Architecture Guard is used alongside other extensions or tools (like as a Spec-kit extension), generic names cause naming collisions.

## Goals / Non-Goals

**Goals:**
- Enforce the `ag-` prefix on all generated skill directories and configurations.
- Ensure backwards compatibility or clear migration for users transitioning from unprefixed skills.
- Make the skill injection generalized to work regardless of where Architecture Guard is hosted.

**Non-Goals:**
- Renaming internal modules or non-skill artifacts to have the `ag-` prefix.
- Changing how the skills operate internally beyond their identifiers and invocation commands.

## Decisions

- **Prefix Choice**: We will use `ag-` (Architecture Guard) as the standard prefix. It's short, recognizable, and avoids conflicts with `spec-` (Spec-kit) or other common terms.
- **Dynamic Generation**: The skill names will be prefixed during the generation/installation phase (`install.js` and template generators), not just hardcoded, ensuring that any future skills automatically inherit this prefixing logic.
- **Skill Pathing**: The directory names in `.agent/skills/` and `.codex/skills/` will become `.agent/skills/ag-<skill-name>/`.

## Risks / Trade-offs

- [Risk] Users have existing workflows depending on `/init`. → Mitigation: We will update the documentation and possibly emit a warning in the CLI if old skill paths are detected, prompting them to re-initialize.
- [Risk] Hardcoded references to skill names within skill prompts themselves. → Mitigation: Update the markdown templates to use the prefixed names when referencing other Architecture Guard skills.

## Migration Plan

1. Update the skill generator scripts and templates in `src/` to prepend `ag-`.
2. Update the `interactive-installer` prompts to refer to the prefixed commands.
3. Release the update. Existing projects will continue using their installed skills until they re-run the `ag-init` command to upgrade them.

## Open Questions

- None at the moment.
