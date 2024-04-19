/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @public */
export enum BuildResult {
  /**
   * No result
   */
  None = 0,
  /**
   * The build completed successfully.
   */
  Succeeded = 2,
  /**
   * The build completed compilation successfully but had other errors.
   */
  PartiallySucceeded = 4,
  /**
   * The build completed unsuccessfully.
   */
  Failed = 8,
  /**
   * The build was canceled before starting.
   */
  Canceled = 32,
}

/** @public */
export enum BuildStatus {
  /**
   * No status.
   */
  None = 0,
  /**
   * The build is currently in progress.
   */
  InProgress = 1,
  /**
   * The build has completed.
   */
  Completed = 2,
  /**
   * The build is cancelling
   */
  Cancelling = 4,
  /**
   * The build is inactive in the queue.
   */
  Postponed = 8,
  /**
   * The build has not yet started.
   */
  NotStarted = 32,
  /**
   * All status.
   */
  All = 47,
}

/** @public */
export type RepoBuild = {
  id?: number;
  title: string;
  link?: string;
  status?: BuildStatus;
  result?: BuildResult;
  queueTime?: string;
  startTime?: string;
  finishTime?: string;
  source: string;
  uniqueName?: string;
};

/** @public */
export type RepoBuildOptions = {
  top?: number;
};

/** @public */
export enum PullRequestStatus {
  /**
   * Status not set. Default state.
   */
  NotSet = 0,
  /**
   * Pull request is active.
   */
  Active = 1,
  /**
   * Pull request is abandoned.
   */
  Abandoned = 2,
  /**
   * Pull request is completed.
   */
  Completed = 3,
  /**
   * Used in pull request search criteria to include all statuses.
   */
  All = 4,
}

/** @public */
export type GitTag = {
  objectId?: string;
  peeledObjectId?: string;
  name?: string;
  createdBy?: string;
  link: string;
  commitLink: string;
};

/** @public */
export type PullRequest = {
  pullRequestId?: number;
  repoName?: string;
  title?: string;
  uniqueName?: string;
  createdBy?: string;
  creationDate?: string;
  sourceRefName?: string;
  targetRefName?: string;
  status?: PullRequestStatus;
  isDraft?: boolean;
  link: string;
};

/** @public */
export type PullRequestOptions = {
  top: number;
  status: PullRequestStatus;
  teamsLimit?: number;
};

/** @public */
export interface DashboardPullRequest {
  pullRequestId?: number;
  title?: string;
  description?: string;
  repository?: Repository;
  createdBy?: CreatedBy;
  hasAutoComplete: boolean;
  policies?: Policy[];
  reviewers?: Reviewer[];
  creationDate?: string;
  status?: PullRequestStatus;
  isDraft?: boolean;
  link?: string;
}

/** @public */
export interface Reviewer {
  id?: string;
  displayName?: string;
  uniqueName?: string;
  imageUrl?: string;
  isRequired?: boolean;
  isContainer?: boolean;
  voteStatus: PullRequestVoteStatus;
}

/** @public */
export interface Policy {
  id?: number;
  type: PolicyType;
  status?: PolicyEvaluationStatus;
  text?: string;
  link?: string;
}

/** @public */
export interface CreatedBy {
  id?: string;
  displayName?: string;
  uniqueName?: string;
  imageUrl?: string;
  teamIds?: string[];
  teamNames?: string[];
}

/** @public */
export interface Repository {
  id?: string;
  name?: string;
  url?: string;
}

/** @public */
export interface Team {
  id?: string;
  name?: string;
  projectId?: string;
  projectName?: string;
  members?: string[];
}

/** @public */
export interface ReadmeConfig {
  project: string;
  repo: string;
  entityRef: string;
  host?: string;
  org?: string;
  path?: string;
}

/** @public */
export interface Readme {
  url: string;
  content: string;
}

/** @public */
export interface TeamMember {
  id?: string;
  displayName?: string;
  uniqueName?: string;
  memberOf?: string[];
}

/**
 * Status of a policy which is running against a specific pull request.
 */
/** @public */
export enum PolicyEvaluationStatus {
  /**
   * The policy is either queued to run, or is waiting for some event before progressing.
   */
  Queued = 0,
  /**
   * The policy is currently running.
   */
  Running = 1,
  /**
   * The policy has been fulfilled for this pull request.
   */
  Approved = 2,
  /**
   * The policy has rejected this pull request.
   */
  Rejected = 3,
  /**
   * The policy does not apply to this pull request.
   */
  NotApplicable = 4,
  /**
   * The policy has encountered an unexpected error.
   */
  Broken = 5,
}

/** @public */
export enum PolicyType {
  Build = 'Build',
  Status = 'Status',
  MinimumReviewers = 'MinimumReviewers',
  Comments = 'Comments',
  RequiredReviewers = 'RequiredReviewers',
  MergeStrategy = 'MergeStrategy',
}

/** @public */
export enum PolicyTypeId {
  /**
   * This policy will require a successful build has been performed before updating protected refs.
   */
  Build = '0609b952-1397-4640-95ec-e00a01b2c241',
  /**
   * This policy will require a successful status to be posted before updating protected refs.
   */
  Status = 'cbdc66da-9728-4af8-aada-9a5a32e4a226',
  /**
   * This policy will ensure that a minimum number of reviewers have approved a pull request before completion.
   */
  MinimumReviewers = 'fa4e907d-c16b-4a4c-9dfa-4906e5d171dd',
  /**
   * Check if the pull request has any active comments.
   */
  Comments = 'c6a1889d-b943-4856-b76f-9e46bb6b0df2',
  /**
   * This policy will ensure that required reviewers are added for modified files matching specified patterns.
   */
  RequiredReviewers = 'fd2167ab-b0be-447a-8ec8-39368250530e',
  /**
   * This policy ensures that pull requests use a consistent merge strategy.
   */
  MergeStrategy = 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
}

/** @public */
export enum PullRequestVoteStatus {
  Approved = 10,
  ApprovedWithSuggestions = 5,
  NoVote = 0,
  WaitingForAuthor = -5,
  Rejected = -10,
}

/** @public */
export type BuildRun = {
  id?: number;
  title: string;
  link?: string;
  status?: BuildStatus;
  result?: BuildResult;
  queueTime?: string;
  startTime?: string;
  finishTime?: string;
  source: string;
  uniqueName?: string;
};

/** @public */
export type BuildRunOptions = {
  top?: number;
};

/** @public */
export type Project = {
  id?: string;
  name?: string;
  description?: string;
};
