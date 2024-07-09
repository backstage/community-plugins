const path = require('node:path');
const editorAssets = require('@kie-tools/serverless-workflow-diagram-editor-assets');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const loaders = new Map();
loaders.set('style-loader', require.resolve('style-loader'));
loaders.set('css-loader', require.resolve('css-loader'));
loaders.set('sass-loader', require.resolve('sass-loader'));

const paths = new Map();
paths.set('src', path.resolve(__dirname, 'src'));
paths.set('dist', path.resolve(__dirname, 'dist'));
paths.set('diagram', path.resolve(paths.get('dist'), 'diagram'));
paths.set('tsconfig', path.resolve(__dirname, 'tsconfig.json'));

const entryPoints = new Map();
entryPoints.set(
  'diagram',
  path.resolve(paths.get('src'), 'init/SwfEditorEnvelopeDiagram.ts'),
);
entryPoints.set(
  'combined',
  path.resolve(paths.get('src'), 'init/SwfEditorEnvelopeCombined.ts'),
);
entryPoints.set(
  'text',
  path.resolve(paths.get('src'), 'init/SwfEditorEnvelopeText.ts'),
);

function makeHtmlWebpackPluginOptions(editorType) {
  return {
    title: 'Serverless Workflow Editor Envelope',
    filename: `serverless-workflow-${editorType}-editor-envelope.html`,
    templateParameters: {
      jsBundleFilename: `${editorType}.bundle.js`,
    },
    inject: false,
  };
}

/** @type {import('webpack-cli').CallableOption} */
module.exports = (_env, argv) => ({
  mode: argv.mode ?? 'production',
  optimization: {
    splitChunks: {
      cacheGroups: {
        monacoEditorMin: {
          test: /[\\/]node_modules[\\/]monaco-editor/,
          name: 'monaco-editor',
          chunks: 'async',
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  performance: {
    maxEntrypointSize: 1024 * 1024 * 15,
    maxAssetSize: 1024 * 1024 * 15,
  },
  entry: {
    combined: entryPoints.get('combined'),
    diagram: entryPoints.get('diagram'),
    text: entryPoints.get('text'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin(makeHtmlWebpackPluginOptions('combined')),
    new HtmlWebpackPlugin(makeHtmlWebpackPluginOptions('diagram')),
    new HtmlWebpackPlugin(makeHtmlWebpackPluginOptions('text')),
    new MonacoWebpackPlugin({
      languages: ['json'],
      customLanguages: [
        {
          label: 'yaml',
          entry: ['monaco-yaml', 'vs/basic-languages/yaml/yaml.contribution'],
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker.js',
          },
        },
      ],
    }),
    new FileManagerPlugin({
      events: {
        onEnd: [
          {
            copy: [
              {
                source: editorAssets.swEditorPath(),
                destination: paths.get('diagram'),
                options: {
                  globOptions: { ignore: ['**/WEB-INF/**/*'] },
                },
              },
            ],
          },
        ],
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        include: [paths.get('src')],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: paths.get('tsconfig'),
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          loaders.get('style-loader'),
          loaders.get('css-loader'),
          loaders.get('sass-loader'),
        ],
      },
      {
        test: /\.css$/,
        use: [loaders.get('style-loader'), loaders.get('css-loader')],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        type: 'asset/inline',
      },
    ],
  },
  output: {
    path: paths.get('dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    alias: {
      prettier$: require.resolve('prettier/standalone'),
    },
  },
});
