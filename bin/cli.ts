#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const packageJsonPath =
  [join(__dirname, '..', 'package.json'), join(__dirname, '..', '..', 'package.json')]
    .find((candidate) => existsSync(candidate)) ?? join(__dirname, '..', '..', 'package.json');
const packageVersion = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version ?? '0.0.0';

const program = new Command();

program
  .name('architecture-guard')
  .description('SDD-tool-agnostic architecture governance orchestrator for Spec Kit, OpenSpec, and generic Markdown workflows')
  .version(packageVersion);

import { runInstallCommand, runSyncTeamRoles } from '../cli/install';
import { runDetectChangedFiles } from '../cli/detect-changed-files';
import { runValidateSyncConfig } from '../cli/validate-sync-config';
import { runValidateSetup } from '../cli/validate-setup';
import { runCreateContextBudgetFixtures } from '../cli/create-context-budget-fixtures';
import { runReviewArtifacts } from '../cli/review-artifacts';
import { runReviewImplementation } from '../cli/review-implementation';
import { runArchive } from '../cli/archive';

program
  .command('init [target]')
  .description('Install governance commands')
  .option('-y, --yes', 'Non-interactive; --agent and --framework are required unless auto-detected')
  .option('--agent <names>', 'Comma-separated agent keys')
  .option('--framework <f>', 'spec-kit | openspec | none | <custom adapter name>')
  .option('--forge <name>', 'auto | github | gitlab | bitbucket | azure-devops | generic | <custom forge> (default: auto)')
  .option('--commands <list>', 'Comma-separated command names, indices, or aliases (all, review, pr)')
  .option('--overwrite <mode>', 'replace | skip | keep-both')
  .option('--vendor', 'Copy immutable runtime resources locally (for air-gapped setups)')
  .option('--full', 'Alias for --vendor')
  .option('--codex-agents', 'Install native Codex roles without activating coordinated execution')
  .option('--claude-agent-teams', 'Enable Claude Code Agent Teams (Beta / Experimental)')
  .option('--claude-teams', 'Alias for --claude-agent-teams')
  .action(async (target, options) => {
    try {
      if (options.claudeTeams) {
        options.claudeAgentTeams = true;
      }
      await runInstallCommand(target, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error: " + message);
      process.exitCode = 1;
    }
  });

program
  .command('detect-changed-files')
  .description('Detect files changed since the merge-base with the default branch, plus staged, unstaged, and untracked files')
  .option('--json', 'Output results in JSON format')
  .option('--base <ref>', 'Compare against this ref instead of the default branch')
  .option('--security-sensitive', 'List only changed files matching security_sensitive_paths in .architecture-guard/config.yml')
  .option('--repo <name>', 'Limit to one repository listed under repositories in .architecture-guard/config.yml')
  .action(runDetectChangedFiles);

program
  .command('validate-sync-config [path]')
  .description('Strictly validate the external sync configuration (default: .architecture-guard/sync.yml)')
  .action(runValidateSyncConfig);

program
  .command('validate-setup [target]')
  .description('Check the selected adapter, resolvable resources, constitutions, and governance config (exits non-zero on errors)')
  .action(runValidateSetup);

program
  .command('sync-team-roles [target]')
  .description('Regenerate owned host role files (default: Claude)')
  .option('--agent <name>', 'Role target: claude | codex (default: claude)')
  .action((target, options) => { runSyncTeamRoles(target, options); });

program
  .command('create-fixtures <target>')
  .description('Generate context-budget benchmark fixtures into an empty directory')
  .action(runCreateContextBudgetFixtures);

program
  .command('review-artifacts')
  .description('Evaluate specification and planning artifacts against architecture constraints')
  .action(runReviewArtifacts);

program
  .command('review-implementation')
  .description('Evaluate implementation code against the planned architecture and constraints')
  .action(runReviewImplementation);

program
  .command('archive <changeName>')
  .description('Finalize or archive a completed SDD feature')
  .option('--json', 'Output a machine-readable result')
  .option('--framework <framework>', 'Override the selected adapter: spec-kit | openspec | generic')
  .action(async (changeName, options) => {
    try {
      await runArchive(changeName, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error: " + message);
      process.exitCode = 1;
    }
  });

import { runHygiene } from '../cli/hygiene';
import { runResolveCommand } from '../cli/resolve';

program
  .command('hygiene')
  .description('Run the deterministic repository hygiene checks')
  .option('--json', 'Output a machine-readable report')
  .option('--target <dir>', 'Target workspace directory (default: current working directory)')
  .option('--rules <ids>', 'Comma-separated rule identifiers to run')
  .option('--files <paths>', 'Comma-separated file paths relative to the target; report findings only for these files (for example, a pull request\'s changed files)')
  .option('--policy-root <dir>', 'Take the policy and local rules from this directory\'s .architecture-guard/ instead of the target\'s (for reviewing a checkout you do not trust)')
  .action(async (options) => {
    await runHygiene(options);
  });

program
  .command('resolve <category> [name]')
  .description('Resolve Architecture Guard engine assets or local overrides')
  .option('--list', 'List bundled resources and local workspace overrides in the category')
  .option('--path', 'Print the resolved file path instead of file content')
  .option('--json', 'Output structured JSON metadata')
  .option('--target <dir>', 'Target workspace directory (default: current working directory)')
  .action(async (category, name, options) => {
    await runResolveCommand(category, name, options);
  });

import { runSelfUpdate } from '../cli/self-update';

program
  .command('update')
  .alias('self-update')
  .description('Update the globally installed architecture-guard CLI to the latest version')
  .action(runSelfUpdate);

program.parse(process.argv);
