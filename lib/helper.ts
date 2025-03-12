const { getJson } = require("serpapi");

const cache = new Map();

export async function getTrendingSection() {
  const cacheKey = "trending";
  if (cache.has(cacheKey)) {
    return { data: cache.get(cacheKey) };
  }
  const trendingQuery = "trending clothes fashion industry 2025";
  const searchPromise = new Promise((resolve, reject) => {
    getJson(
      {
        engine: "google_shopping",
        q: trendingQuery,
        location: "India",
        api_key: process.env.SERP_API,
      },
      (json: any) => {
        resolve(json["shopping_results"]);
      }
    );
  });

  const searchRes = await searchPromise;

  cache.set(cacheKey, searchRes);

  return {
    data: searchRes,
  };
}
