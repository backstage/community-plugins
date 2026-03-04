import plugin from 'tailwindcss/plugin';

/** @type {import("tailwindcss").Config} */
const config = {
  content: ['./plugins/tech-radar/src/**/*.{jsx,tsx,ts}'],
  corePlugins: {
    preflight: false,
  },
  important: '.with-custom-css',
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('fullscreen', '&:fullscreen');
      addVariant('group-fullscreen', ':merge(.group):fullscreen &');
    }),
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--bui-border)',
        ring: 'var(--bui-ring)',
        'active-quadrant-filter': 'hsl(210 79% 46%)',
        background: 'var(--bui-bg-surface-0)',
        card: 'var(--bui-bg-surface-1)',
        foreground: 'var(--bui-fg-primary)',
        primary: {
          DEFAULT: 'var(--bui-bg-solid)',
        },
        destructive: {
          DEFAULT: 'var(--bui-bg-danger)',
          foreground: 'var(--bui-fg-danger)',
        },
        muted: {
          DEFAULT: 'var(--bui-bg-surface-1)',
          foreground: 'var(--bui-fg-secondary)',
        },
      },
      borderRadius: {
        lg: 'var(--bui-radius-3)',
        md: 'var(--bui-radius-2)',
        sm: 'var(--bui-radius-1)',
      },
    },
  },
};

exports.default = config;
