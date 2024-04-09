import { program } from 'commander';
import chalk from 'chalk';
import { exitWithError } from './lib/errors';
import { registerCommands } from './commands';

const main = (argv: string[]) => {
  program.name('community-cli');

  registerCommands(program);

  program.on('command:*', () => {
    console.log();
    console.log(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log();
    program.outputHelp();
    process.exit(1);
  });

  program.parse(argv);
};

process.on('unhandledRejection', rejection => {
  if (rejection instanceof Error) {
    exitWithError(rejection);
  } else {
    exitWithError(new Error(`Unknown rejection: '${rejection}'`));
  }
});

main(process.argv);
