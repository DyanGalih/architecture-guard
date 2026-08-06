#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
program
    .name('architecture-guard')
    .description('SDD-tool-agnostic architecture governance orchestrator for Spec Kit, OpenSpec, and generic Markdown workflows')
    .version('2.2.0');
const install_1 = require("../cli/install");
const detect_changed_files_1 = require("../cli/detect-changed-files");
const check_architecture_1 = require("../cli/check-architecture");
const validate_setup_1 = require("../cli/validate-setup");
const create_context_budget_fixtures_1 = require("../cli/create-context-budget-fixtures");
const test_install_1 = require("../cli/test-install");
const review_artifacts_1 = require("../cli/review-artifacts");
const review_implementation_1 = require("../cli/review-implementation");
program
    .command('init [target]')
    .description('Install governance commands')
    .option('-y, --yes', 'Non-interactive: use defaults or required flags')
    .option('--agent <names>', 'Comma-separated agent keys')
    .option('--framework <f>', 'spec-kit | openspec | none')
    .option('--commands <list>', 'Comma-separated command names or indices')
    .option('--overwrite <mode>', 'replace | skip | keep-both')
    .action(install_1.runInstallCommand);
program
    .command('detect-changed-files')
    .description('Detect changed files via git diff')
    .action(detect_changed_files_1.runDetectChangedFiles);
program
    .command('check-architecture')
    .action(check_architecture_1.runCheckArchitecture);
program
    .command('validate-setup')
    .action(validate_setup_1.runValidateSetup);
program
    .command('create-fixtures')
    .action(create_context_budget_fixtures_1.runCreateContextBudgetFixtures);
program
    .command('test-install')
    .action(test_install_1.runTestInstall);
program
    .command('review-artifacts')
    .description('Evaluate specification and planning artifacts against architecture constraints')
    .action(review_artifacts_1.runReviewArtifacts);
program
    .command('review-implementation')
    .description('Evaluate implementation code against the planned architecture and constraints')
    .action(review_implementation_1.runReviewImplementation);
program.parse(process.argv);
