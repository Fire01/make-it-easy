const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: process.env.NODE_ENV,
    entry: {
        main: [
            __dirname + '/resources/assets/javascripts/main.js',
            __dirname + '/resources/assets/javascripts/app.js',
            __dirname + '/resources/assets/javascripts/uuid.js',
            __dirname + '/resources/assets/javascripts/tabs.js',
            __dirname + '/resources/assets/stylesheets/main.scss',
        ],
        app: [ 
            __dirname + '/resources/assets/javascripts/app.js',
            __dirname + '/resources/assets/stylesheets/app.scss',
        ],
        view: [ 
            __dirname + '/resources/assets/javascripts/view.js',
            __dirname + '/resources/assets/stylesheets/view.scss'
        ],
        form: [ 
            __dirname + '/resources/assets/javascripts/form.js',
            __dirname + '/resources/assets/stylesheets/form.scss'
        ],
        login: [ 
            __dirname + '/resources/assets/stylesheets/login.scss'
        ],
    },
    output: {
        path: __dirname + '/resources/public/dist',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
            ],
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new FixStyleOnlyEntriesPlugin(),
        new CleanWebpackPlugin()
    ],
    performance: { hints: false }
};