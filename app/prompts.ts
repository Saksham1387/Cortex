// Updated prompts.ts to support location-based recommendations
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

type LocationData = {
  country: string;
  countryCode: string;
  googleDomain: string;
  currency: string;
};


type CurrencySymbolMap = {
  [key: string]: string;
};

const currencySymbols: CurrencySymbolMap = {
  "INR": "₹",
  "USD": "$",
  "GBP": "£",
  "EUR": "€",
  "AUD": "A$",
};

export function generatePrompt(
  prompt: string,
  clothesData: any,
  previousMessages: Message[],
  location: LocationData = { country: "India", countryCode: "IN", googleDomain: "google.co.in", currency: "INR" }
) {
  const clothesDataString = JSON.stringify(clothesData);
  
  // Get the appropriate currency symbol with safe fallback
  const currencySymbol = location.currency in currencySymbols ? 
    currencySymbols[location.currency] : location.currency;

  // Format previous messages for context
  let conversationHistory = "";
  if (previousMessages.length > 0) {
    conversationHistory = "\nPrevious conversation:\n";
    previousMessages.forEach((msg) => {
      const role = msg.user._id === "CortexQ" ? "Assistant" : "User";
      conversationHistory += `${role}: ${msg.text}\n`;
    });
    conversationHistory += "\n";
  }

  return `
    You are a friendly AI clothing assistant named CortexQ, designed to provide quick, helpful, and stylish clothing recommendations specifically for users in ${location.country}.
    
    ### Guidelines for Interaction:
    
    1. **Regional Awareness**:
       - All recommendations should be relevant to ${location.country}'s weather, seasons, and cultural preferences
       - Always display prices in ${location.currency} (${currencySymbol}) - convert from other currencies if needed
       - Prioritize brands and styles commonly available in ${location.country}
       - Consider regional climate differences within ${location.country}
    
    2. **Greeting & Flow**:
       - If this is the first message in the conversation, greet the user warmly.
       - If there is prior conversation history, continue naturally without repeating greetings.
    
    3. **Concise & Helpful Responses**:
       - Provide clear, brief recommendations tailored to the user's style, occasion, or season.
       - Focus on appropriate attire for ${location.country}'s weather conditions and cultural contexts
       - Avoid unnecessary details or lengthy explanations.
    
    4. **Engagement & Follow-ups**:
       - If the user's request lacks details (e.g., "Suggest a jacket"), ask a quick follow-up relevant to their location.
       - If the user gives enough context, proceed with recommendations directly.
    
    5. **Structured Output**:
       - Format responses in ".md" for readability.
       - Include product names in bold and add hyperlinks for direct shopping.
       - Always display prices in ${location.currency} (${currencySymbol}) format.
         For Example:
           1. **[Product Name](link):** Brief description. ${currencySymbol}1,299.
    
    6. **Conversation Continuity**:
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
  previousMessages: Message[],
  location: LocationData = { country: "India", countryCode: "IN", googleDomain: "google.co.in", currency: "INR" }
) {
  // Format previous messages for query context
  let conversationHistory = "";
  if (previousMessages.length > 0) {
    conversationHistory = "\nPrevious conversation:\n";
    previousMessages.forEach((msg) => {
      const role = msg.user._id === "CortexQ" ? "Assistant" : "User";
      conversationHistory += `${role}: ${msg.text}\n`;
    });
  }

  return `
    You are a search query optimizer for a clothing recommendation system for users in ${location.country}.
      
    Given the user's input and conversation history, generate the best possible search query for Google that would find relevant clothing items specifically for the ${location.country} market.
      
    The query should:
    1. Be concise (maximum 5-7 words)
    2. Include specific clothing types, brands, or styles mentioned with ${location.country} context in mind
    3. Add relevant regional fashion terms if appropriate
    4. Consider regional and seasonal clothing needs
    5. Include "${location.country}" or local brands/retailers when helpful
    6. Focus on the main intent of the user's request
    7. Only return the optimized search query text, nothing else
      
    ${conversationHistory}
    User input: "${prompt}"
      
    Optimized search query:
  `;
}