const fs = require("fs");
const glob = require("glob");
const path = require("path");
const util = require("util");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpckPlugin = require("copy-webpack-plugin");

function getEntries() {
  function isDir(dir) {
    return fs.lstatSync(dir).isDirectory();
  }

  const entries = {
    // index: path.join(__dirname, `../src/index.tsx`),
  };

  const dir = path.join(__dirname, "../src/components");
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const absolutePath = path.join(dir, file);
    if (isDir(absolutePath)) {
      entries[`runtime_${file}`] = path.join(
        __dirname,
        `../src/components/${file}/runtime.tsx`
      );
      entries[`editor_${file}`] = path.join(
        __dirname,
        `../src/components/${file}/editor.tsx`
      );
    }
  });
  return entries;
}

const entries = getEntries();

const keyMap = {};

const mode = process.env.NODE_ENV ? process.env.NODE_ENV : "production";

const outDir = mode === "production" ? "build" : "dist";

module.exports = {
  entry: entries,
  output: {
    filename: (chunkData) => {
      if (chunkData.chunk.name === "index") {
        return `../${outDir}/[name].js`;
      } else {
        const names = chunkData.chunk.name.split("_");

        chunkData.chunk.name = names[1];
        if (keyMap[names[1]]) {
          keyMap[names[1]][
            names[0]
          ] = `${names[0]}.${chunkData.chunk.contentHash.javascript}.js`;
        } else {
          keyMap[names[1]] = {
            [names[0]]: `${names[0]}.${chunkData.chunk.contentHash.javascript}.js`,
          };
        }
        return `../${outDir}/[name]/${names[0]}.[contenthash].js`;
      }
    },
    path: path.resolve(__dirname, `../${outDir}`),
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
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, `../${outDir}`)],
    }),
    new CopyWebpckPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../src/components/**/*.json"),
          to({ context, absolutePath, absoluteFilename }) {
            const splitedPath = absoluteFilename.split("/").slice(-2, -1)[0];
            return `${splitedPath}/[name].[contenthash][ext]`;
          },
        },
        {
          from: path.resolve(__dirname, "../manifest.json"),
          transform: (content, absoluteFilename) => {
            const dirPath = path.resolve(__dirname, `../${outDir}`);
            console.log("dirPath", dirPath);
            const files = glob.sync(`${dirPath}/**/*.json`);
            files.forEach((filePath) => {
              const splitedPath = filePath.split("/").slice(-2);
              if (splitedPath[1] !== "manifest.json") {
                if (keyMap[splitedPath[0]]) {
                  keyMap[splitedPath[0]] = {
                    ...keyMap[splitedPath[0]],
                    entry: `${splitedPath[1]}`,
                  };
                } else {
                  keyMap[splitedPath[0]] = {
                    entry: `${splitedPath[1]}`,
                  };
                }
              }
            });

            const json = JSON.parse(content.toString());
            json.components = {
              ...keyMap,
            };
            return JSON.stringify(json);
          },
        },
      ],
    }),
  ],
};
