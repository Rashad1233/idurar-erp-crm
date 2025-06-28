const OpenAIService = require('./openAIService');

// Instantiate OpenAIService with API key from environment
const aiService = new OpenAIService(process.env.OPENAI_API_KEY);

/**
 * Generate text content using OpenAI
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} - Generated text content
 */
async function generateText(prompt) {
  try {
    const response = await aiService.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-nano-2025-04-14', // Updated model
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant specialized in professional business communications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Error in aiService.generateText:', error);
    throw error;
  }
}

module.exports = { generateText };
