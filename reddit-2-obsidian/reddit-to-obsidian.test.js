const faker = require("faker");
const allPosts = require("../posts.json");
const {
  format,
  add,
  sub,
  compareDesc,
  compareAsc,
  fromUnixTime,
} = require("date-fns");

/**
 * @description we need a unique list of dates to categorize posts by within the template
 * @param {Child[]} posts list of posts
 * @returns {Promise<{ dates: number[]; posts: Child[] }>} list of dates
 **/
async function parseDatesFromPosts(posts) {
  const dates = Array.from(
    new Set(
      posts
        .map((post) =>
          format(fromUnixTime(post.data.created_utc), "MM-dd-yyyy")
        )
        .sort((a, b) => b - a)
    )
  ).map((year) => new Date(year));

  return { dates, posts };
}

/**
 * @param {number} query timestamp in utc seconds
 * @param {Date} checkpoint year to compare against
 * @returns {boolean} true if query is greater than checkpoint
 * @description checks if query is greater than checkpoint
 **/
const isWithinAYear = (query, checkpoint) => {
  const a = fromUnixTime(query);
  const oneYearBefore = sub(checkpoint, { years: 1 });
  const oneYearAfter = add(checkpoint, { years: 1 });
  const isGreaterThanOneYearBefore = compareAsc(a, oneYearBefore) === 1;
  const isLessThanOneYearAfter = compareDesc(a, oneYearAfter) === -1;
  const isWithinRange = isGreaterThanOneYearBefore && isLessThanOneYearAfter;
  return isWithinRange;
};

/**
 * @param {{ dates: number[]; posts: Post[] }} { dates, posts }}
 * @returns {{ [key: string]: Post[] }} grouped by date
 **/
function assignPostsToDates({ dates, posts }) {
  return dates.reduce((output, year) => {
    const textDate = format(year, "yyyy");
    const associatedPosts = posts.filter((post) =>
      isWithinAYear(post.data.created_utc, year)
    );
    return {
      ...output,
      [textDate]: associatedPosts,
    };
  }, {});
}

// ok, this may be the coolest way to creat a number range
function rangeFrom(number) {
  return Array.from({ length: number }, (_, i) => i);
}

async function generatePosts(quantity) {
  return rangeFrom(quantity).map(() => ({
    kind: "t3",
    data: {
      subreddit: faker.hacker.noun(),
      title: faker.lorem.sentence(),
      permalink: `/r/${faker.hacker.noun()}/${faker.lorem.word}/`,
      url: faker.internet.url(),
      created_utc: format(faker.date.between("2015-01-01", "2021-08-21"), "t"),
    },
  }));
}

describe("creating a markdown template from a collection of reddit posts", () => {
  it("generates 10 posts", async () => {
    const posts = await generatePosts(10);
    expect(posts.length).toBe(10);
  });

  it("groups posts by date", async () => {
    const rawPosts = allPosts;
    const { dates, posts } = await parseDatesFromPosts(rawPosts);
    const groupedPosts = assignPostsToDates({ dates, posts });
    console.log(groupedPosts);
    console.log("total posts", rawPosts.length);
    expect(Object.entries(groupedPosts).length).toBeGreaterThan(0);
  });
});
