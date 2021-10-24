const {join, resolve} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const OutputDir = join(__dirname, "wwwroot", "dist");
const SrcDir = join(__dirname, "src");
const Mode = (process.env.NODE_ENV || "development").toLowerCase();
const Development = Mode === "development";

module.exports = (env, argv) => {
    return {
        mode: Mode,
        entry: {
            index: {import: join(SrcDir, "index.tsx"), dependOn: ["shared"]},
            shared: ["react", "react-dom"]
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".jsx"],
        },
        output: {
            filename: "[name].js",
            path: OutputDir,
            assetModuleFilename: "images/[hash][ext][query]"
        },
        optimization: {
            removeAvailableModules: true,
            mergeDuplicateChunks: true
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: "asset/resource"
                },
                {
                    test: /\.tsx?$/,
                    exclude: /(node_modules)/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                compiler: "ttypescript"
                            }
                        }
                    ]
                },
                {
                    test: /\.(less|css)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "less-loader",
                            options: {
                                lessOptions: {
                                    javascriptEnabled: true,
                                    paths: [resolve(__dirname)]
                                }
                            }
                        }
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].[ext]",
                                outputPath: "fonts",
                            }
                        }
                    ]
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: {minimize: true}
                        }
                    ]
                }
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                 filename: "../index.html",
                template: join(__dirname, "public", "index.html")
            }),
            new MiniCssExtractPlugin(),
            Development && new ReactRefreshWebpackPlugin()
        ].filter(Boolean),
        devtool: "source-map",
        devServer: {
            contentBase: join(__dirname, "wwwroot"),
            publicPath: "/dist/",
            index: "index.html",
            hot: true,
            historyApiFallback: true
        },
        externals: []
    };
};