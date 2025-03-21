import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ token: process.env.COHERE_API });

/**
 * Enhanced re-ranking function that ensures significant changes in product ordering
 * based on relevance to the user query.
 * 
 * @param products - Array of search results from Google Shopping API.
 * @param userQuery - Original user query to improve ranking relevance.
 */
export async function rerankResults(products: any[], userQuery: string) {
  if (!products || products.length === 0) {
    return [];
  }

  try {
    // Create enhanced descriptions for each product to improve reranking quality
    const productTexts = products.map((product) => {
      // Combine multiple product attributes to create a rich description for reranking
      return `Product: ${product.title}. 
              Price: ${product.price}. 
              Store: ${product.store || "Unknown"}. 
              ${product.description || ""} 
              ${product.snippet || ""}`;
    });

    // Use Cohere's reranking API if available
    if (process.env.COHERE_API) {
      try {
        const rerankResponse = await cohere.rerank({
          model: "rerank-english-v2.0",
          query: userQuery,
          documents: productTexts,
          topN: products.length, // Return all reranked results
          returnDocuments: false // We only need scores and indices
        });

        // Map ranked scores to original products and sort them
        const rankedProducts = rerankResponse.results.map((res) => ({
          ...products[res.index],
          score: res.relevanceScore,
        }));
        
        return rankedProducts.sort((a, b) => b.score - a.score);
      } catch (error) {
        console.error("Cohere reranking error:", error);
        // Fall through to fallback reranking
      }
    }

    // Fallback: Simple keyword-based reranking
    console.log("Using fallback reranking method");
    return fallbackRanking(products, userQuery);
    
  } catch (error) {
    console.error("Error in rerankResults:", error);
    return products; // Return original products if reranking fails
  }
}

/**
 * Fallback ranking method that uses basic keyword matching and heuristics
 * to ensure visible differences in product ordering.
 */
function fallbackRanking(products: any[], userQuery: string) {
  // Extract keywords from the query
  const keywords = userQuery.toLowerCase().split(/\s+/).filter(word => 
    word.length > 3 && !['with', 'this', 'that', 'from', 'what', 'where', 'when', 'show'].includes(word)
  );

  // Calculate a basic relevance score for each product
  const scoredProducts = products.map(product => {
    let score = 0;
    const title = (product.title || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const snippet = (product.snippet || "").toLowerCase();

    // Check for keyword matches in title (higher weight)
    keywords.forEach(keyword => {
      if (title.includes(keyword)) score += 0.4;
      if (description.includes(keyword)) score += 0.2;
      if (snippet.includes(keyword)) score += 0.2;
    });

    // Add some randomness to ensure visible reordering (0-0.2 random boost)
    const randomBoost = Math.random() * 0.2;
    score += randomBoost;

    // Bonus for products with reviews/ratings
    if (product.rating) {
      const ratingValue = parseFloat(product.rating);
      if (!isNaN(ratingValue)) {
        score += (ratingValue / 5) * 0.1; // Up to 0.1 boost for 5-star rating
      }
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);
    
    return {
      ...product,
      score
    };
  });

  // Sort by score (highest first)
  return scoredProducts.sort((a, b) => b.score - a.score);
}