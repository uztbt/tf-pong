const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: "development", 
    entry: [
        path.resolve(__dirname, "src", "index.ts")
    ],
    devServer: {
        open: true,
        hot: true,
        publicPath: "/"
    },
    devtool: "source-map", // Enable sourcemaps for debugging webpack's output.
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependences, which allows browsers to cache those libraries between builds.
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: "ts-loader", exclude: '/node_modules/' },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    
     plugins: [
        new HtmlWebpackPlugin({template: 'src/index.html'}),
        new webpack.HotModuleReplacementPlugin()
    ]
}