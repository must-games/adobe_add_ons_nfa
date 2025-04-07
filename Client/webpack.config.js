const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const webpack = require('webpack')

const isEnvProduction = process.env.NODE_ENV === 'production'

const uiPath = path.resolve(__dirname, './src/ui')
const sandboxPath = path.resolve(__dirname, './src/sandbox')


module.exports = {
    mode: isEnvProduction ? 'production' : 'development',
    devtool: 'source-map',
    entry: {
        index: './src/ui/index.ts',
        code: './src/sandbox/code.ts',
    },
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        module: true,
        filename: '[name].js',
    },
    externalsType: 'module',
    externalsPresets: { web: true },
    externals: {
        'add-on-sdk-document-sandbox': 'add-on-sdk-document-sandbox',
        'express-document-sdk': 'express-document-sdk',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.PACKAGE_TYPE': JSON.stringify(
                process.env.PACKAGE_TYPE || 'private'
            ),
            'process.env.DEBUG': JSON.stringify(
                process.env.DEBUG || 'false'
            ),
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            scriptLoading: 'module',
            excludeChunks: ['code'],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/*.json',
                    to: '[name][ext]',
                    noErrorOnMissing: true,
                }, // 파일이 없어도 오류 발생 안 함 ,
                {
                    from: 'src/assets/images/*.{png,jpg}',
                    to: 'images/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/Casual-female/*.{png,jpg}',
                    to: 'images/Casual-female/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/Casual-male/*.{png,jpg}',
                    to: 'images/Casual-male/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/hanbok-female/*.{png,jpg}',
                    to: 'images/hanbok-female/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/hanbok-male/*.{png,jpg}',
                    to: 'images/hanbok-male/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/K-Pop-female/*.{png,jpg}',
                    to: 'images/K-Pop-female/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/K-Pop-male/*.{png,jpg}',
                    to: 'images/K-Pop-male/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/*.json',
                    to: '[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/*.svg',
                    to: 'images/[name][ext]',
                    noErrorOnMissing: true,
                }, //필수
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(uiPath, 'tsconfig.json'),
                        },
                    },
                ],
                include: uiPath,
                exclude: /node_modules/,
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(
                                sandboxPath,
                                'tsconfig.json'
                            ),
                        },
                    },
                ],
                include: sandboxPath,
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
}
