## Purpose
Provides a public-facing landing page for Architecture Guard on GitHub Pages to improve adoption and visibility.

## ADDED Requirements

### Requirement: Marketing Landing Page
The project SHALL have a dedicated landing page deployed via GitHub Pages that outlines its features and benefits.

#### Scenario: User visits the GitHub Pages URL
- **WHEN** a user navigates to the project's GitHub Pages URL
- **THEN** they see a professional marketing landing page highlighting key features like Built-in Pragmatism, DRY, and Hygiene Guards.

### Requirement: GitHub Actions Workflow
The project SHALL include a GitHub Actions workflow to automatically build and deploy the landing page to GitHub Pages.

#### Scenario: Code is merged to main branch
- **WHEN** new code is pushed to the main branch (or specific deployment branch)
- **THEN** the GitHub Actions workflow automatically builds the site and publishes it to the GitHub Pages environment.
