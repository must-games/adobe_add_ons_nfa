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
            'process.env.SERVER_TYPE': JSON.stringify(
                process.env.SERVER_TYPE || 'private'
            ),
            'process.env.DAILY_IMAGE_GENERATION_LIMIT': JSON.stringify(
                process.env.DAILY_IMAGE_GENERATION_LIMIT || '-1'
            ),
            'process.env.DEBUG': JSON.stringify(process.env.DEBUG || 'false'),
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
                    from: 'src/assets/images/Common/*.{png,jpg}',
                    to: 'images/Common/[name][ext]',
                    noErrorOnMissing: true,
                },
                {
                    from: 'src/assets/images/Endangered/*.{png,jpg}',
                    to: 'images/Endangered/[name][ext]',
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
                },
                {
                    from: 'src/assets/*.mp4',
                    to: 'assets/[name][ext]',
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
