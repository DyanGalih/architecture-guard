# OpenSpec Spec-Driven Delta Template

Use this template for an OpenSpec `spec-driven` change. The file describes only the delta from the current main specification. Do not use a top-level `## Requirements` heading.

Include only non-empty delta sections; omit empty sections.

## ADDED Requirements

### Requirement: <short requirement name>

The system MUST <state one testable behavior>.

#### Scenario: <observable example>

- GIVEN <initial state>
- WHEN <action or event>
- THEN <observable result>

## MODIFIED Requirements

### Requirement: <existing requirement name>

The system MUST <state the complete replacement behavior>.

#### Scenario: <observable example>

- GIVEN <initial state>
- WHEN <action or event>
- THEN <observable result>

## REMOVED Requirements

### Requirement: <existing requirement name>

Remove this requirement because <reason>.
