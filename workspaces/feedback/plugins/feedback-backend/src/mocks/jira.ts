export const mockJiraTicketDetailsResp = {
  fields: {
    status: {
      name: 'Backlog',
    },
    assignee: {
      displayName: 'John Doe',
      avatarUrls: {
        '10x10': [],
      },
    },
  },
};

export const mockJiraUsernameResp = [{ name: 'John Doe' }];

export const mockCreateJiraTicketResp = (key: any) => {
  return { id: '3490987634', key: `${key}-01` };
};
