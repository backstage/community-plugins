import { GitReleaseApi, OwnerRepo } from '../../../src/api/GitReleaseClient';
import DATA from './data';

export const mockGitReleaseManagerApi: GitReleaseApi = {
  getUser: () =>
    Promise.resolve({
      user: { username: 'goodreleaser' },
    }),
  getHost: function (): string {
    return 'github.com';
  },
  getRepoPath: function (args: OwnerRepo): string {
    return `${args.owner}/${args.repo}`;
  },
  getOwners: () =>
    Promise.resolve({
      owners: Object.keys(DATA),
    }),
  getRepositories: (args: { owner: string }) => {
    const repositories = Object.values(DATA[args.owner].repositories).map(
      r => r.info.name,
    );

    return Promise.resolve({
      repositories,
    });
  },
  getRepository: (args: OwnerRepo) => {
    const repository = DATA[args.owner].repositories[args.repo].info;

    return Promise.resolve({
      repository,
    });
  },

  getLatestRelease: (args: OwnerRepo) => {
    const latestRelease = Object.values(
      DATA[args.owner].repositories[args.repo].releases,
    )[0];

    return Promise.resolve({ latestRelease });
  },

  getBranch: (args: { branch: string } & OwnerRepo) => {
    const branch =
      DATA[args.owner].repositories[args.repo].branches![args.branch];

    return Promise.resolve({
      branch,
    });
  },
  getAllReleases: (args: OwnerRepo) => {
    const releases = Object.values(
      DATA[args.owner].repositories[args.repo].releases,
    );
    return Promise.resolve({ releases });
  },
  getAllTags: (args: OwnerRepo) => {
    const tags = Object.values(DATA[args.owner].repositories[args.repo].tags);

    return Promise.resolve({ tags });
  },
  getRecentCommits: (
    args: { releaseBranchName?: string | undefined } & OwnerRepo,
  ) => {
    const recentCommits = Object.values(
      DATA[args.owner].repositories[args.repo].branches[
        args.releaseBranchName || 'main'
      ].commits,
    );

    return Promise.resolve({ recentCommits });
  },

  getTag: function (args: { tagSha: string } & OwnerRepo): Promise<{
    tag: {
      date: string;
      username: string;
      userEmail: string;
      objectSha: string;
    };
  }> {
    const tag = DATA[args.owner].repositories[args.repo].tags[args.tagSha].info;

    return Promise.resolve({ tag });
  },
  // WRITE

  getCommit: function (_args: { ref: string } & OwnerRepo): Promise<{
    commit: {
      sha: string;
      htmlUrl: string;
      commit: { message: string };
      createdAt?: string | undefined;
    };
  }> {
    throw new Error('Function getCommit not implemented.');
  },

  createRef: function (
    _args: { ref: string; sha: string } & OwnerRepo,
  ): Promise<{ reference: { ref: string; objectSha: string } }> {
    throw new Error('Function createRef not implemented.');
  },
  deleteRef: function (
    _args: { ref: string } & OwnerRepo,
  ): Promise<{ success: boolean }> {
    throw new Error('Function deleteRef not implemented.');
  },
  getComparison: function (
    _args: { base: string; head: string } & OwnerRepo,
  ): Promise<{ comparison: { htmlUrl: string; aheadBy: number } }> {
    throw new Error('Function getComparison not implemented.');
  },
  createRelease: function (
    _args: {
      tagName: string;
      name: string;
      targetCommitish: string;
      body: string;
    } & OwnerRepo,
  ): Promise<{
    release: { name: string | null; htmlUrl: string; tagName: string };
  }> {
    throw new Error('Function createRelease not implemented.');
  },
  createTagObject: function (
    _args: {
      tag: string;
      taggerEmail?: string | undefined;
      message: string;
      object: string;
      taggerName: string;
    } & OwnerRepo,
  ): Promise<{ tagObject: { tagName: string; tagSha: string } }> {
    throw new Error('Function createTagObject not implemented.');
  },
  createCommit: function (
    _args: { message: string; tree: string; parents: string[] } & OwnerRepo,
  ): Promise<{ commit: { message: string; sha: string } }> {
    throw new Error('Function createCommit not implemented.');
  },
  updateRef: function (
    _args: { sha: string; ref: string; force: boolean } & OwnerRepo,
  ): Promise<{ reference: { ref: string; object: { sha: string } } }> {
    throw new Error('Function updateRef not implemented.');
  },
  merge: function (_args: { base: string; head: string } & OwnerRepo): Promise<{
    merge: {
      htmlUrl: string;
      commit: { message: string; tree: { sha: string } };
    };
  }> {
    throw new Error('Function merge not implemented.');
  },
  updateRelease: function (
    _args: {
      releaseId: number;
      tagName: string;
      body?: string | undefined;
      prerelease?: boolean | undefined;
    } & OwnerRepo,
  ): Promise<{
    release: { name: string | null; tagName: string; htmlUrl: string };
  }> {
    throw new Error('Function updateRelease not implemented.');
  },
};
