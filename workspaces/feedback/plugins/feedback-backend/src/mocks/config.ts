export const mockConfig = {
  app: {
    title: 'Backstage Test App',
    baseUrl: 'http://localhost:3000',
  },
  backend: {
    baseUrl: 'http://localhost:7007',
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
  feedback: {
    integrations: {
      email: {
        host: 'smtp-host',
        port: 587,
        auth: {},
        secure: false,
        from: '"Example" <noreply@example.com>',
        caCert: process.env.NODE_EXTRA_CA_CERTS,
      },
      jira: [
        {
          host: 'https://jira.host',
          token: '###',
        },
      ],
    },
  },
};
