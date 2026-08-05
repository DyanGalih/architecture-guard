#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('architecture-guard')
  .description('SDD-tool-agnostic architecture governance orchestrator for Spec Kit, OpenSpec, and generic Markdown workflows')
  .version('2.0.0');

import { runInstallCommand } from '../cli/install';
import { runDetectChangedFiles } from '../cli/detect-changed-files';
import { runCheckArchitecture } from '../cli/check-architecture';
import { runValidateSetup } from '../cli/validate-setup';
import { runCreateContextBudgetFixtures } from '../cli/create-context-budget-fixtures';
import { runTestInstall } from '../cli/test-install';

program
  .command('init [target]')
  .description('Install governance commands')
  .option('-y, --yes', 'Non-interactive: use defaults or required flags')
  .option('--agent <names>', 'Comma-separated agent keys')
  .option('--framework <f>', 'spec-kit | openspec | none')
  .option('--commands <list>', 'Comma-separated command names or indices')
  .option('--overwrite <mode>', 'replace | skip | keep-both')
  .action(runInstallCommand);

program
  .command('detect-changed-files')
  .description('Detect changed files via git diff')
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

program.parse(process.argv);
