const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

function getEntries() {
  function isDir(dir) {
    return fs.lstatSync(dir).isDirectory();
  }

  const entries = {
    index: path.join(__dirname, `./src/index.tsx`),
  };
  const dir = path.join(__dirname, "./src/components");
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const absolutePath = path.join(dir, file);
    if (isDir(absolutePath)) {
      entries[file] = path.join(
        __dirname,
        `./src/components/${file}/index.tsx`
      );
    }
  });
  return entries;
}

const entries = getEntries();

module.exports = {
  entry: entries,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
    library: "ComlibH5Normal",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {},
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.(jpg | png | gif | jpeg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              esModule: false,
              limit: 10240, //图片小于10k  webpack会对图片做base64，编译到js文件中
              name: "img/[name].[hash:16].[ext]",
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["dist"],
    }),
  ],
};
