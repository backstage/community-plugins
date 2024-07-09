"use strict";

const conf = require("pkg-conf").sync("odo", {
  cwd: process.cwd(),
  defaults: {
    skipDownload: false,
  },
});

if (conf.skipDownload) {
  console.info("Skipping download of odo as requested in package.json");
} else {
  const download = require("./download");
  download().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
