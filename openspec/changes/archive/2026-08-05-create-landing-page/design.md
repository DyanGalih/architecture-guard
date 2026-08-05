## Context

Architecture Guard is currently hosted on GitHub, but lacks a dedicated marketing landing page to showcase its features. GitHub Pages is a natural fit for this, as it integrates directly with the existing repository.

## Goals / Non-Goals

**Goals:**
- Design a static landing page (HTML/CSS/JS) to serve as the marketing site.
- Set up automated deployment to GitHub Pages via GitHub Actions.

**Non-Goals:**
- Do not build a complex dynamic web application (e.g., using a heavy framework like Next.js or React) since this is purely a marketing page with static content.
- Do not alter the existing documentation structure (`docs/` and `src/README.md`) unless it's necessary for the landing page content.

## Decisions

- **Tech Stack**: Use standard HTML, Tailwind CSS (via CDN or build), and basic JavaScript. This keeps the footprint small and ensures the page loads fast.
- **Layout Reference**: Adopt the structure from `tmp/source.html`, but extract its inline styles and scripts into dedicated asset files (`styles.css` and `script.js`) to maintain a clean `index.html` structure.
- **Hosting**: GitHub Pages via a dedicated `gh-pages` branch or from the `/docs` folder on the main branch. The decision is to use a GitHub Actions workflow that deploys a dedicated `public/` or `landing/` directory to the `gh-pages` branch to keep the main branch clean of generated HTML artifacts.
- **Design Aesthetic**: The design must follow a modern, sleek, and premium aesthetic (e.g., dark mode, glassmorphism, subtle micro-animations) to appeal to developers.

## Risks / Trade-offs

- **Risk: Content Drift** → The landing page content might drift from the actual repository features.
  - **Mitigation**: Keep the landing page content high-level and refer to the main repository README and docs for detailed, up-to-date instructions.
