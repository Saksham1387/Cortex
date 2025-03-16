import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Get the query parameter and ensure it's a string
  const query = searchParams.get('query') || '';
  console.log('Search query:', query);
  
  if (!query.trim()) {
    // Return recent or popular queries if no search term is provided
    const recentQueries = await prisma.userQuery.findMany({
      orderBy: {
        createdAt: 'desc', // Assuming you have a timestamp field
      },
      select: {
        queryText: true,
      },
      distinct: ["queryText"],
      take: 10,
    });

    console.log('Recent queries:', recentQueries);
    return NextResponse.json({ 
      suggestions: recentQueries.map(item => item.queryText) 
    });
  }

  // Split the query into words to facilitate more flexible matching
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1];
  
  // Create an array of conditions for the Prisma query
  const conditions = [
    // Exact matches with higher priority
    { queryText: { startsWith: query.toLowerCase() } },
    
    // Match queries that contain all words in the input
    ...words.map(word => ({ 
      queryText: { contains: word.toLowerCase() } 
    })),
    
    // Match the beginning of any word in the text
    { queryText: { contains: ` ${lastWord.toLowerCase()}` } },
  ];

  const suggestions = await prisma.userQuery.findMany({
    where: {
      OR: conditions,
    },
    select: {
      queryText: true,
      // Add frequency or relevance field if you have one
      // frequency: true,
    },
    distinct: ["queryText"],
    // Order by relevance if you have such field, otherwise by recency
    orderBy: {
      // frequency: 'desc', // Uncomment if you track query frequency 
      createdAt: 'desc',    // Assuming you have this field
    },
    take: 5,
  });

  // Process results to prioritize better matches
  const results = suggestions
    .map(item => ({
      text: item.queryText,
      // Calculate a simple relevance score based on how well it matches
      score: calculateRelevanceScore(item.queryText, query)
    }))
    .sort((a, b) => b.score - a.score) // Sort by relevance score
    .map(item => item.text);           // Return just the text

  return NextResponse.json({ 
    suggestions: results 
  });
}

/**
 * Calculate a simple relevance score for a suggestion
 */
function calculateRelevanceScore(suggestion: string, query: string): number {
  const lowercaseQuery = query.toLowerCase();
  const lowercaseSuggestion = suggestion.toLowerCase();
  
  let score = 0;
  
  // Exact match at start gets highest score
  if (lowercaseSuggestion.startsWith(lowercaseQuery)) {
    score += 10;
  }
  
  // Word boundary match gets high score
  if (lowercaseSuggestion.includes(` ${lowercaseQuery}`)) {
    score += 7;
  }
  
  // Contains the query anywhere gets medium score
  if (lowercaseSuggestion.includes(lowercaseQuery)) {
    score += 5;
  }
  
  // Calculate word overlap
  const queryWords = lowercaseQuery.split(/\s+/).filter(Boolean);
  const suggestionWords = lowercaseSuggestion.split(/\s+/).filter(Boolean);
  
  // Count matching words
  for (const word of queryWords) {
    if (word.length > 1) { // Ignore single characters
      for (const suggWord of suggestionWords) {
        if (suggWord.includes(word)) {
          score += 2;
        }
        // Bonus for word starts with
        if (suggWord.startsWith(word)) {
          score += 1;
        }
      }
    }
  }
  
  return score;
}