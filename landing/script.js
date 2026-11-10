tailwind.config = {
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
            card.classList.add('border-cyan-400');
            card.classList.remove('border-white/10');
        } else {
            card.classList.remove('border-cyan-400');
            card.classList.add('border-white/10');
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
    streamlined: {
        badge: "RECOMMENDED FOR FEATURES",
        title: "Streamlined Governed Delivery",
        desc: "Single-feature end-to-end flow: automatically chains Spec, Plan, and Task generation with auto-fixing review loops before implementation.",
        code: `# 1. Explore idea with architecture context & story scope
/ag-governed-discover "Real-time analytics dashboard"

# 2. Automatically generate Spec, Plan, and Tasks with artifact repair loops
/ag-governed-delivery

# 3. Implement tasks within strict architecture boundaries
/ag-governed-implement

# 4. Verify against destination branch (same checks as PR review)
/ag-verify base=main

# 5. Open PR and manage feedback queue
/ag-pr-queue`
    },
    backlog: {
        badge: "QUEUE-DRIVEN DELIVERY",
        title: "Governed Backlog Delivery Queue",
        desc: "Deliver an entire backlog from Jira, Beads (bd), or local backlog.yml through 4 batched human approval gates and dedicated lanes.",
        code: `# 1. Validate backlog dependencies and cycle safety
architecture-guard validate-backlog .architecture-guard/backlog.yml

# 2. Run backlog delivery queue across matched lanes:
#    - Full: Stories & Features
#    - Fix: Bugs (failing test created before fix)
#    - Light: Chores & Tasks
#    - Research: Spikes
/ag-governed-backlog

# Batched Gates:
# Gate 1: Approve queue and worktrees
# Gate 2: Approve all generated specifications
# Gate 3: Approve exact implementation file scopes
# Gate 4: Approve git push and Pull Requests`
    },
    pr: {
        badge: "AUTONOMOUS PULL REQUEST OPS",
        title: "Pull Request Queue & Reviews",
        desc: "Scan repository pull requests, triage review comments in isolated worktrees, and conduct team code reviews with batched human decisions.",
        code: `# Scan repository and resume active PR queue
/ag-pr-queue

# Or target specific pull requests across any code host:
# GitHub, GitLab, Bitbucket, Azure DevOps
/ag-pr-queue https://github.com/org/repo/pull/142

# Batched Decision Gates:
# Gate D: Decide review drafts and minimal bug fixes
# Gate P: Approve commits and pushes (never force-pushes)
# Gate R: Post replies and resolve eligible review threads`
    }
};

let currentWorkflowKey = 'streamlined';

function selectWorkflowTab(tabKey) {
    if (!workflowData[tabKey]) return;
    currentWorkflowKey = tabKey;

    const tabs = ['streamlined', 'backlog', 'pr'];
    tabs.forEach(key => {
        const btn = document.getElementById(`wf-tab-${key}`);
        if (btn) {
            if (key === tabKey) {
                btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20";
            } else {
                btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-slate-800/60";
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
