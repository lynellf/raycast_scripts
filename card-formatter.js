#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Format Converted CDB Files
// @raycast.mode compact

// Optional parameters:
// @raycast.icon edopro.png
// @raycast.packageName CardFormatter

// Documentation:
// @raycast.description Format Converted CDB Files
// @raycast.author Ezell
// @raycast.authorURL https://github.com/lynellf

const fs = require("fs");
const cardFormatter = require("cdb-formatter");
const CONFIG_PATH = "./config.json";
const APP_NAME = "card-formatter";

function getConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const appConfig = config[APP_NAME];
  const { inputDir, outputDir } = appConfig;
  return { inputDir, outputDir };
}

function main() {
  const { inputDir, outputDir } = getConfig();
  cardFormatter(inputDir, outputDir);
}

main();
