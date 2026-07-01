const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not defined in the environment variables.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// A client wrapper that implements automatic fallback to smaller/faster models in case of rate limits
groq.createChatCompletionWithFallback = async (options) => {
  const primaryModel = options.model || "llama-3.3-70b-versatile";
  const fallbacks = ["llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768"];
  
  // Create a unique array of models to try
  const models = [primaryModel, ...fallbacks.filter(m => m !== primaryModel)];

  let lastError;
  for (const model of models) {
    try {
      console.log(`[Groq Client] Attempting chat completion with model: ${model}`);
      const attemptOptions = { ...options, model };
      return await groq.chat.completions.create(attemptOptions);
    } catch (err) {
      lastError = err;
      const isRateLimit = err.status === 429 || 
                          (err.message && err.message.toLowerCase().includes("rate limit")) ||
                          (err.code && err.code === "rate_limit_exceeded") ||
                          (err.error && err.error.error && err.error.error.code === "rate_limit_exceeded");
      
      if (isRateLimit) {
        console.warn(`[Groq Client] Rate limit exceeded for ${model}. Falling back to next model...`);
        continue;
      }
      // If it's a different error, throw it immediately
      throw err;
    }
  }
  throw lastError;
};

module.exports = groq;

