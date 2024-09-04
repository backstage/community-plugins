export type BuildkiteBuild = {
  id: string;
  finished_at: string;
  started_at: string;
  created_at: string;
  source: string;
  state: string;
  branch: string;
  jobs: Job[];
};

export type Job = {
  name: string;
  finished_at: string;
  started_at: string;
  state: string;
};
