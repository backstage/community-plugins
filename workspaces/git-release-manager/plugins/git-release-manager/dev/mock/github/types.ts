interface Release {
  targetCommitish: string;
  tagName: string;
  prerelease: boolean;
  id: number;
  htmlUrl: string;
  name: string | null;
  createdAt: string | null;
  body?: string | null;
}

interface Repository {
  pushPermissions: boolean | undefined;
  defaultBranch: string;
  name: string;
}

interface User {
  username: string;
  email?: string;
}

interface Commit {
  htmlUrl: string;
  sha: string;
  author: {
    htmlUrl?: string | undefined;
    login?: string | undefined;
  };
  commit: { message: string };
  firstParentSha?: string | undefined;
}

interface Branch {
  name: string;
  links: {
    html: string;
  };
  commit: {
    sha: string;
    commit: {
      tree: {
        sha: string;
      };
    };
  };
  commits: Record<string, Commit>;
}

interface Tag {
  tagName: string;
  tagSha: string;
  tagType: 'tag' | 'commit';
  info: {
    date: string;
    username: string;
    userEmail: string;
    objectSha: string;
  };
}

export interface OwnerData {
  user: User;
  repositories: Record<
    string,
    {
      info: Repository;
      releases: Record<string, Release>;
      branches: Record<string, Branch>;
      tags: Record<string, Tag>;
    }
  >;
}
