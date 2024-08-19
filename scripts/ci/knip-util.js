import { exec } from 'child_process';
import os from 'os';
import pLimit from 'p-limit';

const limiter = pLimit(os.cpus().length);

export function createBinRunner(cwd) {
  return async (...command) =>
    limiter(
      () =>
        new Promise((resolve, reject) => {
          exec(
            command.join(' '), 
            {
              cwd,
              shell: '/bin/bash', 
              timeout: 60000,
              maxBuffer: 1024 * 1024,
            },
            (err, stdout, stderr) => {
              if (err) {
                reject(new Error(`${err.message}\n${stderr}`));
              } else if (stderr) {
                reject(new Error(`Command printed error output: ${stderr}`));
              } else {
                resolve(stdout);
              }
            }
          );
        })
    );
}
