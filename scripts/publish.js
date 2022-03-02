const fs = require("fs");
const path = require("path");
const { series, src, dest } = require("gulp");
const del = require("del");
const through2 = require("through2");
const crypto = require("crypto");
const COS = require("cos-nodejs-sdk-v5");

const mode = process.env.NODE_ENV || "production";

const outDir = mode === "production" ? "build" : "dist";

const cos = new COS({
  SecretId: "AKIDnPktlMgjW1FCsHQItDG2WkhNmvoQlpc9",
  SecretKey: "HH0SdX9UYKq53kAJ2VhcGdjZ8QRBeqlP",
});

const hash = crypto.createHash("md5");

function uploadToCos(fileName, fileContent) {
  cos.putObject(
    {
      Bucket: "quark-1258189652" /* 填入您自己的存储桶，必须字段 */,
      Region: "ap-shanghai" /* 存储桶所在地域，例如ap-beijing，必须字段 */,
      Key: fileName /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
      StorageClass: "STANDARD",
      /* 当Body为stream类型时，ContentLength必传，否则onProgress不能返回正确的进度信息 */
      Body: fileContent,
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
    function (err, data) {
      console.log(err | data);
    }
  );
}

function clean(cb) {
  del([
    `${outDir}/manifest.json`,
    `!${outDir}/editor/**`,
    `!${outDir}/runtime/*`,
  ]);
  cb();
}

function handleManifest() {
  return through2(function (file, encoding, cb) {
    if (file.isNull()) {
      cb(null, file);
    }

    if (file.isBuffer()) {
      console.log("buffer");
    }

    if (file.isStream()) {
      console.log("stream");
    }
    const str = file.contents.toString();
    const data = JSON.parse(str);
    const comList = [];

    data.components.forEach((filePath) => {
      const splitedPath = filePath.split("/");

      const comFile = fs.readFileSync(path.resolve(__dirname, filePath), {
        encoding: "utf8",
      });

      const comData = JSON.parse(comFile);
      const folderName = splitedPath[splitedPath.length - 2];

      const readFolderFile = (folder) => {
        return fs.readFileSync(
          path.resolve(
            __dirname,
            `./${outDir}/${folder}/${folderName}/index.js`
          ),
          "utf-8"
        );
      };

      comData["editor"] = readFolderFile("editor");

      comData["runtime"] = readFolderFile("runtime");

      comList.push(comData);
    });

    // data.components = [...comList];
    // console.log(data.components);
    // file.contents = new Buffer(JSON.stringify(data));
    cb(null, file);
  });
}

function copyJSON(cb) {
  src(["./src/components/**/*.json"]).pipe(dest(`${outDir}/`));
  cb();
}

function merge(cb) {
  src(["manifest.json"])
    .pipe(
      through2.obj(function (file, encoding, cb) {
        const str = file.contents.toString();
        const data = JSON.parse(str);
        // const comList = [];

        // data.components.forEach((filePath) => {
        //   const splitedPath = filePath.split("/");

        //   const comFile = fs.readFileSync(path.resolve(__dirname, filePath), {
        //     encoding: "utf8",
        //   });

        //   const comData = JSON.parse(comFile);
        //   const folderName = splitedPath[splitedPath.length - 2];

        //   const readFolderFile = (folder) => {
        //     return fs.readFileSync(
        //       path.resolve(
        //         __dirname,
        //         `./${outDir}/${folder}/${folderName}/index.js`
        //       ),
        //       "utf-8"
        //     );
        //   };

        //   comData["editor"] = readFolderFile("editor");

        //   comData["runtime"] = readFolderFile("runtime");

        //   comList.push(comData);
        // });

        // data.components = [...comList];
        file.contents = Buffer.from(JSON.stringify(data));
        cb(null, file);
      })
    )
    .pipe(dest(`${outDir}/`));
  cb();
}

exports.default = series(clean, merge);
