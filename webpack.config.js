var webpack = require("webpack");
var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    entry: {        
        vendor: ["react", "react-dom", "react-addons-update", "redux", "react-redux"],
        index: "./src/index",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            {
                include: path.resolve(__dirname, "src"),
                test: /\.jsx?$/,
                loader: "babel",
                query: {
                    presets: ["es2015", "react"]
                }
            }
        ]
    },
    resolve: { 
        extensions: ["", ".js", ".jsx"]
    },
    plugins: [
        new CommonsChunkPlugin({
            name: "vendor",
            filename: "[name].bundle.js"
        })
    ]    
}