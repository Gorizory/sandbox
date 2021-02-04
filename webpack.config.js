'use strict';

require('module').Module._initPaths();

const path = require('path');

const AssetsPlugin = require('assets-webpack-plugin');
const _ = require('lodash');

const {
    NODE_ENV,
    NODE_PATH: NODE_PATH_CLI = './',
    PROJECT_ROOT: PROJECT_ROOT_CLI = './',
} = process.env;
const IS_DEVELOPMENT = NODE_ENV !== 'production';

const PUBLIC_PATH = './';

const NODE_PATH = path.resolve(NODE_PATH_CLI);
const PROJECT_ROOT = path.resolve(PROJECT_ROOT_CLI);

const OUTPUT_PATH = path.join(NODE_PATH, 'build_client');
const APP_ROOT = path.join(PROJECT_ROOT, 'app');

const HASH_REGEXP = /[0-9a-f]{20}/;

const APP_ENTRY_PATH = './index.tsx';

function buildAssetName(ext, isBundle) {
    if (isBundle) {
        return IS_DEVELOPMENT
            ? `[name].bundle.${ext}`
            : `[id].bundle.[chunkhash].${ext}`;
    }

    return IS_DEVELOPMENT
        ? `[name].chunk.${ext}`
        : `[id].chunk.[chunkhash].${ext}`;
}

function buildAssetNameWithPath() {
    return IS_DEVELOPMENT
        ? '[path][name].[ext]'
        : '[hash].[ext]';
}

module.exports = {
    performance: {
        maxEntrypointSize: Math.pow(10, 6),
        maxAssetSize: Math.pow(10, 6),
    },
    stats: {
        children: false,
    },
    context: APP_ROOT,
    mode: NODE_ENV,
    entry: {
        app: APP_ENTRY_PATH,
    },
    watchOptions: {
        aggregateTimeout: 300,
        poll: 500,
        ignored: [
            '.awcache',
            /build_/,
            'logs',
            'node_modules',
        ],
    },
    output: {
        filename: buildAssetName('js', true),
        chunkFilename: buildAssetName('js', false),
        path: OUTPUT_PATH,
        publicPath: PUBLIC_PATH,
        globalObject: 'this',
    },
    resolve: {
        alias: {
            app: path.join(PROJECT_ROOT, 'app'),
        },
        extensions: [
            '.ts',
            '.js',
            '.tsx',
            '.jsx',
            '.scss',
            '.css',
        ],
    },
    devtool: 'source-map',
    optimization: {
        noEmitOnErrors: true,
    },
    plugins: [
        new AssetsPlugin({
            filename: 'assets.json',
            prettyPrint: true,
            path: OUTPUT_PATH,
            fullPath: false,
            update: true,
            processOutput(assets) {
                Object.keys(assets).forEach(key => {
                    assets[key] = _.mapValues(assets[key], value => `${PUBLIC_PATH}${_.trim(value, PUBLIC_PATH)}`);
                });

                return JSON.stringify(assets, null, '  ');
            },
        }),
    ].filter(Boolean),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            useCache: true,
                            reportFiles: [
                                '(app|common)/**/*.{ts,tsx}',
                            ],
                        },
                    },
                ],
            },
            {
                test: /worker\.ts$/,
                use: [
                    {
                        loader: 'worker-loader',
                    },
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            useCache: true,
                            reportFiles: [
                                '(app|common)/**/*.{ts,tsx}',
                            ],
                        },
                    },
                ],
            },
        ],
    },
};
