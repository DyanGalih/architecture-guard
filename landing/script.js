// Theme Controller (Light-First Default with Dark Mode Toggle)
function updateThemeIcons(isDark) {
    const iconDesktop = document.getElementById('theme-toggle-icon');
    const iconMobile = document.getElementById('theme-toggle-icon-mobile');

    if (iconDesktop) {
        iconDesktop.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
    }
    if (iconMobile) {
        iconMobile.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
    }
}

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcons(isDark);
}

function toggleTheme() {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const nextDark = !isCurrentlyDark;
    applyTheme(nextDark);
    try {
        localStorage.setItem('ag-theme', nextDark ? 'dark' : 'light');
    } catch {
        // Ignore localStorage restrictions
    }
}

// Initial theme setup: default is light unless explicitly saved as 'dark'
(function initTheme() {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('ag-theme');
    } catch {
        // Ignore
    }
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
})();

const themeBtn = document.getElementById('theme-toggle-btn');
const themeBtnMobile = document.getElementById('theme-toggle-btn-mobile');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
if (themeBtnMobile) themeBtnMobile.addEventListener('click', toggleTheme);

// Mobile Navigation Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// GitHub Star Counter Fetch
fetch('https://api.github.com/repos/DyanGalih/architecture-guard')
    .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(data => {
        if (data && typeof data.stargazers_count === 'number') {
            const countStr = data.stargazers_count > 999 ? (data.stargazers_count / 1000).toFixed(1) + 'k' : data.stargazers_count;
            const starCountEl = document.getElementById('star-count');
            const starCountMobileEl = document.getElementById('star-count-mobile');
            if (starCountEl) starCountEl.textContent = countStr;
            if (starCountMobileEl) starCountMobileEl.textContent = countStr;
        }
    })
    .catch(() => {
        // Silent fallback: static counters preserved in HTML
    });

// How It Works Dynamic Steps Dictionary
const stepDetails = {
    1: {
        title: "1. Discover & Backlog Shaping",
        desc: "Brainstorm features with Flash-Mem historical context and Jira/Beads story scope. Architecture Guard warns on architectural drift early and decomposes multi-item initiatives into clean backlog items."
    },
    2: {
        title: "2. Specification & Premise Grounding",
        desc: "Generate schema-aware delta specs (OpenSpec / SpecKit). Premise Grounding reads base-branch code to verify citations and contracts before any implementation starts."
    },
    3: {
        title: "3. Governed Planning & Guardrails",
        desc: "Convert specs into actionable developer tasks with explicit boundary constraints. Applies Ponytail pragmatism, minimal abstractions, and task tagging for AI agents."
    },
    4: {
        title: "4. Multi-Agent Implementation & E2E",
        desc: "Execute tasks safely with Claude Code Teammates, Antigravity Subagents, OpenCode Parallel Subagents, or Codex sessions within strict file ownership envelopes. Validate user journeys with Playwright E2E tests."
    },
    5: {
        title: "5. Deep Verification & Change Checks",
        desc: "Automated checks against base branches: Consumer Inventory (catching unlisted writers), Artifact Self-Consistency, SonarLint cognitive checks, and Repository Hygiene."
    },
    6: {
        title: "6. Autonomous PR Queue & Multi-Forge Delivery",
        desc: "Deploy via ag-pr-queue across GitHub, GitLab, Bitbucket, or Azure DevOps. Automatically triage feedback threads and run code reviews in isolated worktrees with batched human gates."
    }
};

function selectStep(stepNum) {
    document.querySelectorAll('.step-card').forEach((card, index) => {
        if (index + 1 === stepNum) {
            card.classList.add('border-cyan-500', 'ring-2', 'ring-cyan-500/20');
            card.classList.remove('border-slate-200', 'dark:border-white/10');
        } else {
            card.classList.remove('border-cyan-500', 'ring-2', 'ring-cyan-500/20');
            card.classList.add('border-slate-200', 'dark:border-white/10');
        }
    });

    const stepNumEl = document.getElementById('detail-step-num');
    const titleEl = document.getElementById('detail-title');
    const descEl = document.getElementById('detail-desc');

    if (stepNumEl && titleEl && descEl && stepDetails[stepNum]) {
        stepNumEl.textContent = `STEP ${stepNum} HIGHLIGHT`;
        titleEl.textContent = stepDetails[stepNum].title;
        descEl.textContent = stepDetails[stepNum].desc;
    }
}

function copySnippet(cmdText) {
    copyToClipboard(cmdText, "Command copied to clipboard!");
}

// Modal Handlers
function openModal() {
    const modal = document.getElementById('get-started-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal() {
    const modal = document.getElementById('get-started-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openDocsModal() {
    const modal = document.getElementById('docs-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeDocsModal() {
    const modal = document.getElementById('docs-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Copy Code Snippet Handler
function copyCode() {
    const codeText = "npx architecture-guard";
    copyToClipboard(codeText, "CLI setup command copied!");
}

function fallbackCopy(text, successMsg) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast(successMsg);
    } catch {
        // Silent catch for unsupported environments
    } finally {
        document.body.removeChild(textarea);
    }
}

function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast(successMsg);
            })
            .catch(() => {
                fallbackCopy(text, successMsg);
            });
    } else {
        fallbackCopy(text, successMsg);
    }
}

// Toast Helper
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (toast && msgEl) {
        msgEl.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}
