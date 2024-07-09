import { Git } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

export class GitService {
  private readonly git: Git;

  private readonly logger: LoggerService;
  private authenticated: boolean;

  private readonly author = {
    name: 'backstage-orchestrator',
    email: 'orchestrator@backstage.io',
  };

  private readonly committer = {
    name: 'backstage-orchestrator',
    email: 'orchestrator@backstage.io',
  };

  constructor(logger: LoggerService, config: Config) {
    this.logger = logger;
    const githubIntegration = ScmIntegrations.fromConfig(config)
      .github.list()
      .pop();
    this.git = Git.fromAuth({
      username: 'x-access-token',
      password: githubIntegration?.config.token,
    });
    this.authenticated = !!githubIntegration?.config.token;
  }

  async clone(repoURL: string, localPath: string): Promise<void> {
    this.logger.info(`cloning repo ${repoURL} into ${localPath}`);
    return this.git
      .clone({
        url: repoURL,
        dir: localPath,
        depth: 1,
      })
      .then(() => this.git.checkout({ dir: localPath, ref: 'main' }));
  }

  async push(dir: string, message: string): Promise<void> {
    if (!this.authenticated) {
      this.logger.warn(
        'Git integration is required to be configured for push, with the token or credentials',
      );
      return;
    }
    const branch = 'main';
    const force = true;
    const remote = 'origin';
    const filepath = '.';
    this.git
      .fetch({ remote, dir })
      .then(() => this.git.checkout({ dir, ref: branch }))
      .then(() => this.git.add({ dir, filepath }))
      .then(() =>
        this.git.commit({
          dir,
          message,
          author: this.author,
          committer: this.committer,
        }),
      )
      .then(() => this.git.push({ dir, remote, remoteRef: branch, force }))
      .finally(() => this.logger.info('push completed'))
      .catch(ex => this.logger.error(ex));
  }

  async pull(localPath: string): Promise<void> {
    const remoteBranch = 'origin/main';
    const localBranch = 'main';
    const remote = 'origin';
    this.git
      .fetch({ remote, dir: localPath })
      .then(() => this.git.checkout({ dir: localPath, ref: localBranch }))
      .then(() =>
        this.git.merge({
          dir: localPath,
          ours: localBranch,
          theirs: remoteBranch,
          author: this.author,
          committer: this.committer,
        }),
      )
      .finally(() => this.logger.info('merge completed'))
      .catch(ex => this.logger.error(ex));
  }
}
