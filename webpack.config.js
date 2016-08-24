'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let config = {
    entry: './src/main.js',
    output: {
        path: './dist',
        filename: 'index.js',
        publicPath: '/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react'],
                    plugins: ['transform-object-rest-spread']
                }
            },
            {test: /\.html$/, loader: 'raw'},
            {test: /\.css$/, loaders: ['style', 'css']}
        ]
    },
    resolve: {
        extensions: ['', '.js', '.html', '.css']
    },
    plugins: [],
    devServer: {
        historyApiFallback: true,
        contentBase: './src'
    }
};

if (process.env.NODE_ENV == 'production') {
    config.entry = './src/player.js';
    config.output.library = 'SoundCloudLikePlayer';
    config.output.libraryTarget = 'umd';// 'commonjs2';
    config.plugins.push(
        new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production')}})
    );
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}})
    );
} else {
    config.plugins.push(
        new HtmlWebpackPlugin({template: './src/index.html'})
    );

}

module.exports = config;