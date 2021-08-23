const Reddit = require("reddit");
const fs = require("fs");
const { format, fromUnixTime } = require("date-fns");

const APP_NAME = "reddit-2-obsidian";
const CONFIG_PATH = "./config.json";
const DEFAULT_CONFIG = {
  username: "",
  password: "",
  appId: "",
  appSecret: "",
  userAgent: "",
  vaultPath: "",
};

const BASE_URL = "https://www.reddit.com";

function getConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const appConfig = config[APP_NAME];
  const { username, password, appId, appSecret, userAgent, vaultPath } =
    appConfig;
  return { username, password, appId, appSecret, userAgent, vaultPath };
}

async function initConnection(config = DEFAULT_CONFIG) {
  const reddit = new Reddit(config);
  return reddit;
}

/**
 * @param {Object} config app configuration
 * @returns {(reddit: object, after: null|string, posts: Child[]) => Promise<Child[]>} response
 **/
function getSavedPosts(config) {
  const withConfig = async (reddit, after = null, posts = []) => {
    const response = await reddit.get(`/user/${config.username}/saved`, {
      limit: 100,
      after,
    });
    after = response.data.after;
    posts = [...posts, ...response.data.children];
    return after ? withConfig(reddit, after, posts) : posts;
  };
  return withConfig;
}

/**
 * @description array map callback fn moved outside for better spacing/readability
 * @param {Post} { author, title, permalink, subreddit }
 * @returns {string} output line
 **/
const byPost = ({ author, title, permalink, created_utc }, index) =>
  `${index !== 0 ? "  " : ""}* ${format(
    fromUnixTime(created_utc),
    "yyyy-MM-dd"
  )} - [${title}](${BASE_URL}${permalink}) by [${author}](${BASE_URL}/u/${author})`;

/**
 * @param {[string, Post[]]} groupedPosts list of posts by subreddit
 * @returns {string} markdown template
 **/
function appendPostsToTemplate(groupedPosts) {
  const template = `
Reddit Saved Posts
-----
${groupedPosts
  .map(
    ([subreddit, posts]) => `
  ${subreddit}
  ---
  ${posts.map(byPost).join("\n")}
`
  )
  .join("\n")}
  `;

  return template;
}

function saveToDisk(config = DEFAULT_CONFIG) {
  const save = (template) => {
    const filename = "Saved Reddit Posts.md";
    fs.writeFileSync(`${config.vaultPath}/${filename}`, template, "utf8");
  };
  return save;
}

/**
 * @param {Child[]} rawPosts list of posts
 * @returns {Promise<Post[]} list of actual posts
 **/
async function extractPostData(rawPosts) {
  return rawPosts.map(({ data }) => data);
}

/**
 * @param {Post[]} posts list of posts
 * @returns {Promise<Post[]} sorted list of posts (descending)
 **/
async function sortPostsByDate(posts) {
  return posts.sort((a, b) => b.created_utc - a.created_utc);
}

/**
 * @description for debugging / testing / caching purposes. Not required.
 * @param {Post[]} posts list of posts
 **/
async function writePostsToDisk(posts) {
  fs.writeFileSync("./posts.json", JSON.stringify(posts));
  return posts;
}

/**
 * @param {Post[]} posts list of ungrouped posts
 * @returns {Promise<[string, Post[]]>} tuple of posts by subreddit
 **/
async function groupPostsBySubreddit(posts) {
  const subreddits = Array.from(new Set(posts.map((post) => post.subreddit)));
  const groupedPosts = subreddits.reduce((output, subreddit) => {
    const subPosts = posts.filter((post) => post.subreddit === subreddit);
    return [...output, [subreddit, subPosts]];
  }, []);

  return groupedPosts;
}

/**
 * @param {[string, Post[]]} groupedPosts list of posts by subreddit
 * @returns {Promise<[string, Post[]]>} tuple of posts by subreddit
 **/
async function sortGroupsByName(groupedPosts) {
  return groupedPosts.sort((a, b) => a[0].localeCompare(b[0]));
}

module.exports = {
  writePostsToDisk,
  getConfig,
  groupPostsBySubreddit,
  sortPostsByDate,
  extractPostData,
  saveToDisk,
  appendPostsToTemplate,
  getSavedPosts,
  initConnection,
  sortGroupsByName,
};

/**
 * Typedefs
 **/

/**
 * @description this is a partial. full api reference is here:
 * https://www.reddit.com/dev/api/oauth#listings
 *
 * @typedef {Object} Post post/comment item
 * @property {string} subreddit sub
 * @property {string} author author
 * @property {string} title title
 * @property {string} permalink path to thread
 * @property {string} url link url
 * @property {number} created_utc unix timestamp
 **/

/**
 * @typedef {Object} Child child item
 * @property {string} kind kind of child
 * @property {Post} data post metadata
 **/

/**
 * @typedef {Object} Data response data
 * @property {string | null} before id previous "thing"
 * @property {string | null} after id of next "thing"
 * @property {number} dist total number of children
 * @property {null} modhash not sure what this is
 * @property {string} geo_filter not sure what this is either
 * @property {Child[]} children list of children
 **/

/**
 * @typedef {Object} Response
 * @property {string} kind type of response
 * @property {Data} data result data
 * */
