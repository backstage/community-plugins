export enum FeedbackCategory {
  BUG = 'BUG',
  FEEDBACK = 'FEEDBACK',
}

export type FeedbackModel = {
  feedbackId?: string;
  summary?: string;
  projectId?: string;
  description?: string;
  url?: string;
  userAgent?: string;
  tag?: string;
  ticketUrl?: string;
  feedbackType?: FeedbackCategory;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
