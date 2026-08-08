#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const packageJsonPath = [(0, node_path_1.join)(__dirname, '..', 'package.json'), (0, node_path_1.join)(__dirname, '..', '..', 'package.json')]
    .find((candidate) => (0, node_fs_1.existsSync)(candidate)) ?? (0, node_path_1.join)(__dirname, '..', '..', 'package.json');
const packageVersion = JSON.parse((0, node_fs_1.readFileSync)(packageJsonPath, 'utf8')).version ?? '0.0.0';
const program = new commander_1.Command();
program
    .name('architecture-guard')
    .description('SDD-tool-agnostic architecture governance orchestrator for Spec Kit, OpenSpec, and generic Markdown workflows')
    .version(packageVersion);
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
    .description('Detect staged, unstaged, and untracked files')
    .option('--json', 'Output results in JSON format')
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
const self_update_1 = require("../cli/self-update");
program
    .command('update')
    .alias('self-update')
    .description('Update the globally installed architecture-guard CLI to the latest version')
    .action(self_update_1.runSelfUpdate);
program.parse(process.argv);
