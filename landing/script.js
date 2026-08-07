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
        }

// Mobile Navigation Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when a link is clicked
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });

        // GitHub Star Fetch
        fetch('https://api.github.com/repos/DyanGalih/architecture-guard')
            .then(res => res.json())
            .then(data => {
                if(data.stargazers_count !== undefined) {
                    const countStr = data.stargazers_count > 999 ? (data.stargazers_count/1000).toFixed(1) + 'k' : data.stargazers_count;
                    const starCountEl = document.getElementById('star-count');
                    const starCountMobileEl = document.getElementById('star-count-mobile');
                    if (starCountEl) starCountEl.textContent = countStr;
                    if (starCountMobileEl) starCountMobileEl.textContent = countStr;
                }
            })
            .catch(err => console.error(err));

        // How It Works Dynamic Steps
        const stepDetails = {
            1: {
                title: "1. Explore Phase with Contextual AI",
                desc: "Understand architectural requirements, identify dependencies, and explore architectural decisions using AI co-pilots prior to writing specs."
            },
            2: {
                title: "2. Propose Phase",
                desc: "Define the change requirements, design, and tasks that align with architecture."
            },
            3: {
                title: "3. Plan & Work Breakdown",
                desc: "Convert specs into actionable developer tasks with defined guardrails for modules and interfaces."
            },
            4: {
                title: "4. Implement with Guardrails",
                desc: "Developers and AI agents build code within active architectural constraints, preventing structural technical debt."
            },
            5: {
                title: "5. Continuous Verification",
                desc: "Automated checks, unit tests, and structural validation execute on every commit to enforce design integrity."
            },
            6: {
                title: "6. Ship & Deliver with Confidence",
                desc: "Deploy release candidates verified against all architectural parameters, maintaining full traceability."
            }
        };

        function selectStep(stepNum) {
            // Update active state border on step cards
            document.querySelectorAll('.step-card').forEach((card, index) => {
                if (index + 1 === stepNum) {
                    card.classList.add('border-cyan-400');
                    card.classList.remove('border-white/10');
                } else {
                    card.classList.remove('border-cyan-400');
                    card.classList.add('border-white/10');
                }
            });

            // Update details panel text
            document.getElementById('detail-step-num').textContent = `STEP ${stepNum} HIGHLIGHT`;
            document.getElementById('detail-title').textContent = stepDetails[stepNum].title;
            document.getElementById('detail-desc').textContent = stepDetails[stepNum].desc;
        }

        // Modal Handlers
        function openModal() {
            document.getElementById('get-started-modal').classList.remove('hidden');
            document.getElementById('get-started-modal').classList.add('flex');
        }

        function closeModal() {
            document.getElementById('get-started-modal').classList.add('hidden');
            document.getElementById('get-started-modal').classList.remove('flex');
        }

        function openDocsModal() {
            document.getElementById('docs-modal').classList.remove('hidden');
            document.getElementById('docs-modal').classList.add('flex');
        }

        function closeDocsModal() {
            document.getElementById('docs-modal').classList.add('hidden');
            document.getElementById('docs-modal').classList.remove('flex');
        }

        // Copy Code Snippet Handler
        function copyCode() {
            const codeText = "npx architecture-guard";
            
            // Clipboard fallback
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(codeText);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = codeText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            showToast("CLI setup commands copied!");
        }

        // Toast Helper
        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').textContent = message;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

