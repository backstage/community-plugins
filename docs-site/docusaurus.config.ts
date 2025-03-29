import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Backstage Community Plugins Documentation',
  tagline: 'Explore the Backstage Community Plugins',
  url: 'https://bethgriggs.github.io',
  baseUrl: '/community-plugins/',

  organizationName: 'BethGriggs',
  projectName: 'community-plugins',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.ts'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Community Plugins',
    },
    footer: {
      style: 'dark',
      links: [],
    },
  },
};

export default config;
