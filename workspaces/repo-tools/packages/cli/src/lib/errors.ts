import chalk from 'chalk';

export class CustomError extends Error {
  get name(): string {
    return this.constructor.name;
  }
}

export class ExitCodeError extends CustomError {
  readonly code: number;

  constructor(code: number, command?: string) {
    super(
      command
        ? `Command '${command}' exited with code ${code}`
        : `Child exited with code ${code}`,
    );
    this.code = code;
  }
}

export function exitWithError(error: Error): never {
  if (error instanceof ExitCodeError) {
    process.stderr.write(`\n${chalk.red(error.message)}\n\n`);
    process.exit(error.code);
  } else {
    process.stderr.write(`\n${chalk.red(`${error}`)}\n\n`);
    process.exit(1);
  }
}
