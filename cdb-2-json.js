#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Convert CDB files to JSON files
// @raycast.mode compact

// Optional parameters:
// @raycast.icon edopro.png
// @raycast.packageName CDB2JSON

// Documentation:
// @raycast.description Convert CDB files to JSON files
// @raycast.author Ezell
// @raycast.authorURL https://github.com/lynellf

const fs = require("fs");
const cdb2json = require("cdb-to-json");
const CONFIG_PATH = "./config.json";
const APP_NAME = "cdb-2-json";

function getConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const appConfig = config[APP_NAME];
  const { inputDir, outputDir } = appConfig;
  return { inputDir, outputDir };
}

function main() {
  const { inputDir, outputDir } = getConfig();
  cdb2json(inputDir, outputDir);
}

main();
