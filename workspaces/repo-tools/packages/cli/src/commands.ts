import { Command } from 'commander';

export const registerCommands = (program: Command) => {
  program
    .command('monorepo:migrate:plugin')
    .option('--monorepo-path <path>', 'Path to the monorepo')
    .option('--plugin-name <name>', 'Name of the plugin')
}
