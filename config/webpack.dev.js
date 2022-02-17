const path = require("path");
const { merge } = require("webpack-merge");
const commonWebpackConfig = require("./webpack.common");

module.exports = merge(commonWebpackConfig, {
  mode: "development",
  devServer: {
    port: 8888,
    static: {
      directory: path.join(__dirname, "../dist"),
      watch: true,
    },
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    open: true,
  },
});
