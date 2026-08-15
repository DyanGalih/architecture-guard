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

import { runInstallCommand } from '../cli/install';
import { runDetectChangedFiles } from '../cli/detect-changed-files';
import { runCheckArchitecture } from '../cli/check-architecture';
import { runValidateSetup } from '../cli/validate-setup';
import { runCreateContextBudgetFixtures } from '../cli/create-context-budget-fixtures';
import { runTestInstall } from '../cli/test-install';
import { runReviewArtifacts } from '../cli/review-artifacts';
import { runReviewImplementation } from '../cli/review-implementation';
import { runArchive } from '../cli/archive';

program
  .command('init [target]')
  .description('Install governance commands')
  .option('-y, --yes', 'Non-interactive: use defaults or required flags')
  .option('--agent <names>', 'Comma-separated agent keys')
  .option('--framework <f>', 'spec-kit | openspec | none')
  .option('--commands <list>', 'Comma-separated command names or indices')
  .option('--overwrite <mode>', 'replace | skip | keep-both')
  .action(async (target, options) => {
    try {
      await runInstallCommand(target, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error: " + message);
      process.exitCode = 1;
    }
  });

program
  .command('detect-changed-files')
  .description('Detect staged, unstaged, and untracked files')
  .option('--json', 'Output results in JSON format')
  .action(runDetectChangedFiles);

program
  .command('check-architecture')
  .action(runCheckArchitecture);

program
  .command('validate-setup')
  .action(runValidateSetup);

program
  .command('create-fixtures')
  .action(runCreateContextBudgetFixtures);

program
  .command('test-install')
  .action(runTestInstall);

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
  .option('--framework <framework>', 'Override detection: speckit | openspec')
  .action(async (changeName, options) => { await runArchive(changeName, options); });

import { runSelfUpdate } from '../cli/self-update';

program
  .command('update')
  .alias('self-update')
  .description('Update the globally installed architecture-guard CLI to the latest version')
  .action(runSelfUpdate);

program.parse(process.argv);
