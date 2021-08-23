#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Migrate Saved Posts to Obsidian
// @raycast.mode compact

// Optional parameters:
// @raycast.icon reddit-icon.png
// @raycast.packageName Reddit2Obsidian

// Documentation:
// @raycast.description Pull Reddit Likes and Bookmarks into Obsidian Vault
// @raycast.author Ezell
// @raycast.authorURL https://github.com/lynellf

const {
  getConfig,
  getSavedPosts,
  saveToDisk,
  initConnection,
  extractPostData,
  sortPostsByDate,
  groupPostsBySubreddit,
  appendPostsToTemplate,
  sortGroupsByName,
} = require("./reddit-2-obsidian/index.js");

function main() {
  const config = getConfig();
  const getSavedPostsWithConfig = getSavedPosts(config);
  const save = saveToDisk(config);
  initConnection(config)
    .then(getSavedPostsWithConfig)
    .then(extractPostData)
    .then(sortPostsByDate)
    .then(groupPostsBySubreddit)
    .then(sortGroupsByName)
    .then(appendPostsToTemplate)
    .then(save)
    .catch(console.error);
}

main();
