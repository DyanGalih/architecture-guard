tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                navy: {
                    950: '#050814',
                    900: '#070C1E',
                    850: '#0B132B',
                    800: '#111C3A',
                    700: '#1C2B54',
                },
                brand: {
                    cyan: '#00E5FF',
                    blue: '#0066FF',
                    purple: '#7C3AED',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'spin-slow': 'spin 20s linear infinite',
                'glow': 'glow 3s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                glow: {
                    '0%': { filter: 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.4))' },
                    '100%': { filter: 'drop-shadow(0 0 35px rgba(0, 102, 255, 0.8))' },
                }
            }
        }
    }
};

// Theme Controller (Light-First Default with Dark Mode Toggle)
function updateThemeIcons(isDark) {
    const iconDesktop = document.getElementById('theme-toggle-icon');
    const iconMobile = document.getElementById('theme-toggle-icon-mobile');
    const labelMobile = document.getElementById('theme-label-mobile');

    if (iconDesktop) {
        iconDesktop.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
    }
    if (iconMobile) {
        iconMobile.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
    }
    if (labelMobile) {
        labelMobile.textContent = isDark ? 'Light Theme' : 'Dark Theme';
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

// GitHub Star & Release Tag Fetch
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
        // Graceful silent fallback to static counters if GitHub API is unavailable
        const heroVersionEl = document.getElementById('hero-version-text');
        if (heroVersionEl && !heroVersionEl.textContent.trim()) {
            heroVersionEl.textContent = 'Latest Release v3.6.0: Multi-Host Agent Teams & PR Queue';
        }
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

// Interactive Workflow Walkthrough Dictionary
const workflowData = {
    workflow: {
        badge: "ALL-IN-ONE HERO CONDUCTOR",
        title: "/ag-workflow — Complete Governed Lifecycle",
        desc: "Single-command interactive conductor: drives discovery, specification, delivery, implementation, deep verification, and archival with 4 structured human gates and agent teams coordination.",
        code: `# Run the full end-to-end SDD lifecycle in one interactive command
/ag-workflow "Add real-time notifications with webhook fallback"

# Structured Human Gates:
# Gate 0: Approve specification & clarified acceptance criteria
# Gate 1: Approve technical design, task list, and artifact review
# Gate 2: Review multi-agent implementation evidence & test outputs
# Gate 3: Sign off on final verification against destination branch (base=main)`
    },
    backlog: {
        badge: "AUTONOMOUS SPRINT & QUEUE DELIVERY",
        title: "/ag-governed-backlog — Multi-Item Queue Engine",
        desc: "Deliver prioritized work items from Jira JQL, Beads (bd), or backlog.yml across Full, Fix, Light, and Research lanes with isolated worktrees and one PR per group.",
        code: `# 1. Validate backlog dependencies and cycle safety
architecture-guard validate-backlog .architecture-guard/backlog.yml

# 2. Run backlog delivery queue across matched lanes:
#    - Full: Stories & Features (spec -> plan -> tasks -> code)
#    - Fix: Bugs (failing test reproduced before fix)
#    - Light: Chores & Tasks (direct task execution)
#    - Research: Spikes (discovery only)
/ag-governed-backlog

# Batched Gates:
# Gate Q: Approve queue, lane mapping, and git worktrees
# Gate S: Approve all generated specifications together
# Gate I: Approve exact implementation file scopes
# Gate P: Approve push and create Pull Requests`
    },
    pr: {
        badge: "AUTONOMOUS PULL REQUEST OPS",
        title: "/ag-pr-queue — Review & Feedback Automation",
        desc: "Scan repository pull requests, triage review comments in isolated worktrees, and conduct team code reviews with batched human decisions across GitHub, GitLab, Bitbucket, Azure DevOps.",
        code: `# Scan repository and resume active PR queue
/ag-pr-queue

# Or target specific pull requests across any code host:
/ag-pr-queue https://github.com/org/repo/pull/142

# Batched Decision Gates:
# Gate D: Decide review drafts and minimal bug fixes
# Gate P: Approve commits and pushes (never force-pushes)
# Gate R: Post replies and resolve eligible review threads`
    }
};

let currentWorkflowKey = 'workflow';

function selectWorkflowTab(tabKey) {
    if (!workflowData[tabKey]) return;
    currentWorkflowKey = tabKey;

    const tabs = ['workflow', 'backlog', 'pr'];
    tabs.forEach(key => {
        const btn = document.getElementById(`wf-tab-${key}`);
        if (btn) {
            if (key === tabKey) {
                btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md shadow-cyan-500/20";
            } else {
                btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60";
            }
        }
    });

    const badgeEl = document.getElementById('wf-badge');
    const titleEl = document.getElementById('wf-title');
    const descEl = document.getElementById('wf-desc');
    const codeEl = document.getElementById('wf-code');

    if (badgeEl) badgeEl.textContent = workflowData[tabKey].badge;
    if (titleEl) titleEl.textContent = workflowData[tabKey].title;
    if (descEl) descEl.textContent = workflowData[tabKey].desc;
    if (codeEl) codeEl.textContent = workflowData[tabKey].code;
}

function copyWorkflowCode() {
    const codeText = workflowData[currentWorkflowKey].code;
    copyToClipboard(codeText, "Workflow CLI commands copied!");
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
