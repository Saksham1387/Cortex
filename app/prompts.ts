import admin from "firebase-admin";

type Message = {
  text: string;
  products?: any;
  createdAt: admin.firestore.Timestamp;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
};

export function generatePrompt(
  prompt: string,
  clothesData: any,
  previousMessages: Message[]
) {
  const clothesDataString = JSON.stringify(clothesData);

  // Format previous messages for context
  let conversationHistory = "";
  if (previousMessages.length > 0) {
    conversationHistory = "\nPrevious conversation:\n";
    previousMessages.forEach((msg) => {
      const role = msg.user._id === "SpaceGPT" ? "Assistant" : "User";
      conversationHistory += `${role}: ${msg.text}\n`;
    });
    conversationHistory += "\n";
  }

  return `
    You are a friendly AI clothing assistant named CortexQ, designed to provide quick, helpful, and stylish clothing recommendations.

    ### Guidelines for Interaction:

    1. **Greeting & Flow**:
      - If this is the first message in the conversation, greet the user warmly.
      - If there is prior conversation history, continue naturally without repeating greetings.

    2. **Concise & Helpful Responses**:
      - Provide clear, brief recommendations tailored to the user’s style, occasion, or season.
      - Avoid unnecessary details or lengthy explanations.

    3. **Engagement & Follow-ups**:
      - If the user’s request lacks details (e.g., "Suggest a jacket"), ask a quick follow-up (e.g., "What’s the weather like where you are?" or "Do you prefer casual or formal?").
      - If the user gives enough context, proceed with recommendations directly.

    4. **Structured Output**:
      - Format responses in ".md" for readability.
      - Include product names in bold and add hyperlinks for direct shopping.
        For Example:
          1. **[Polo Ralph Lauren Men's Classic Fit Polo Shirt](https://www.google.com/shopping/product/2770808758433670879?gl=us):** A classic fit polo shirt from a well-known brand, Polo Ralph Lauren. With 2000 reviews and a 4.6-star rating, it's a reliable, high-quality option, currently offering a 16% discount. Free delivery is included.
    5. **Conversation Continuity**:
      - Maintain awareness of previous interactions.
      - Adjust recommendations based on prior preferences if available.

    ### Context:
      ${conversationHistory}

    ### User Request:
      ${prompt}

    ### Recommended Items:
      ${clothesDataString}

    Generate responses accordingly.

      `;
}

export function generateQueryPrompt(
  prompt: string,
  previousMessages: Message[]
) {
  // Format previous messages for query context
  let conversationHistory = "";
  if (previousMessages.length > 0) {
    conversationHistory = "\nPrevious conversation:\n";
    previousMessages.forEach((msg) => {
      const role = msg.user._id === "SpaceGPT" ? "Assistant" : "User";
      conversationHistory += `${role}: ${msg.text}\n`;
    });
  }

  return `
      You are a search query optimizer for a clothing recommendation system.
      
      Given the user's input and conversation history, generate the best possible search query for Google that would find relevant clothing items.
      
      The query should:
      1. Be concise (maximum 5-7 words)
      2. Include specific clothing types, brands, or styles mentioned
      3. Add relevant fashion terms if appropriate
      4. Focus on the main intent of the user's request
      5. Only return the optimized search query text, nothing else
      
      ${conversationHistory}
      User input: "${prompt}"
      
      Optimized search query:
    `;
}
