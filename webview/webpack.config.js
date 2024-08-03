// @ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'web',

    entry: './src/webview.ts',
    output: {
        path: path.resolve(__dirname, '../extension/out'),
        filename: 'webview.js',
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            },
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(ttf)$/,
                type: 'asset/resource'
            },
        ]
    },
    performance: {
        hints: false,
        maxEntrypointSize: 2048,
        maxAssetSize: 2048
    },
    ignoreWarnings: [/Failed to parse source map/]
};
module.exports = config;