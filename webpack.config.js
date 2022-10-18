const path = require("path");

module.exports = {
  context: path.resolve(__dirname, "client"),
  devtool: "inline-source-map",
  entry: "demorse.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: "demorse.js",
    path: path.resolve(__dirname, "docs"),
  },
  resolve: {
    extensions: [".ts", ".jsx", ".js"],
    modules: ["."],
  },
};
