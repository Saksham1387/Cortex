import { NextApiResponse } from "next";
import { NextResponse } from "next/server";
const { getJson } = require("serpapi");

export async function GET(request: Request, res: NextApiResponse) {
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

  return NextResponse.json({
    data: searchRes,
  });
}
