import { FeedbackCategory, FeedbackModel } from '../model/feedback.model';

export const mockFeedback: FeedbackModel = {
  feedbackId: 'bubuPsc93VRYAwByZe8ZQ9',
  summary: 'Unit Test Issue',
  description: 'This is mock description',
  tag: 'UI Issues',
  projectId: 'component:default/example-website',
  ticketUrl: 'https://demo-ticket-url/ticket-id',
  feedbackType: FeedbackCategory.BUG,
  createdBy: 'user:default/guest',
  url: 'http://localhost:3000/catalog/default/component/example-website/feedback',
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
};
