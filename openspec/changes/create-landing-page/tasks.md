## 1. Landing Page Setup

- [x] 1.1 Create `public/` or `landing/` directory for static assets
- [x] 1.2 Create `index.html` with basic structure and layout
- [x] 1.3 Create CSS stylesheet for modern dark mode/glassmorphism styling
- [x] 1.4 Create JS file for any required micro-animations or interactivity

## 2. Content Population

- [x] 2.1 Add hero section with marketing copy
- [x] 2.2 Add feature highlights (Built-in Pragmatism, DRY, Hygiene Guards)
- [x] 2.3 Add quick start instructions and link to main documentation

## 3. Deployment Configuration

- [x] 3.1 Create GitHub Actions workflow (`.github/workflows/pages.yml`) for deployment
- [x] 3.2 Configure the workflow to deploy the landing directory to the `gh-pages` branch

## 4. Layout Revision (tmp/source.html integration)

- [x] 4.1 Extract Tailwind config and inline styles from `tmp/source.html` into `src/landing/styles.css`
- [x] 4.2 Extract inline scripts (e.g. modals, interactions) from `tmp/source.html` into `src/landing/script.js`
- [x] 4.3 Replace `src/landing/index.html` structure with the `tmp/source.html` structure
- [x] 4.4 Verify all paths and links are correctly wired for GitHub Pages
