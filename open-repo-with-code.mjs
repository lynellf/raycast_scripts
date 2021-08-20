#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Open Repo With Code
// @raycast.mode compact

// Optional parameters:
// @raycast.icon code.png
// @raycast.argument1 { "type": "text", "placeholder": "directory" }
// @raycast.packageName Open w Code

// Documentation:
// @raycast.description Open Local Repo With VSCode
// @raycast.author Ezell
// @raycast.authorURL https://github.com/lynellf
import shell from "shelljs";
import fs from "fs";

const BASE_PATH = "~/Documents/repos/";
const CONFIG_PATH = "./config.json";
const APP_NAME = "open-repo-with-code";
const QUERY = process.argv.slice(2)[0].toLowerCase();

function getConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const appConfig = config[APP_NAME];
  const { basePath, codeCommand } = appConfig;
  return { basePath, codeCommand };
}

async function listSubDirectories() {
  return shell.ls(BASE_PATH);
}

async function getClosestMatch(subDirectories = []) {
  const matchedDir = subDirectories.find((dir) =>
    dir.toLowerCase().includes(QUERY)
  );
  if (!matchedDir) {
    throw new Error("No Directory Found");
  }
  return matchedDir;
}

function commandFactory(command = "code .") {
  const runCommand = async () => shell.exec(`${command}`);
  return runCommand;
}

function goToFactory(defaultPath = BASE_PATH) {
  const goTo = async (path = defaultPath) => shell.cd(path);
  return goTo;
}

function main() {
  const { basePath, codeCommand } = getConfig();
  const runCommand = commandFactory(codeCommand);
  const goToPath = goToFactory(basePath);

  goToPath(basePath)
    .then(listSubDirectories)
    .then(getClosestMatch)
    .then(goToPath)
    .then(runCommand)
    .catch(console.error);
}

main();
