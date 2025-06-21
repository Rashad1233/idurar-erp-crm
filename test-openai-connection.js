const { OpenAI } = require('openai');
require('dotenv').config();

async function testOpenAIConnection() {
  console.log('Testing OpenAI connection...');
  
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.error('❌ Error: No valid OpenAI API key found in environment variables.');
    console.log('Please set your OpenAI API key by running:');
    console.log('  setup-openai-key.bat YOUR_API_KEY');
    return false;
  }
  
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Test with a simple completion
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working correctly?" }
      ],
      max_tokens: 50
    });
    
    console.log('✅ OpenAI connection successful!');
    console.log('Model response:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to OpenAI:', error.message);
    if (error.message.includes('API key')) {
      console.log('Please check that your API key is valid and has not expired.');
    } else if (error.message.includes('model')) {
      console.log('The specified model may not be available. Try updating the model name in openAIService.js.');
    }
    return false;
  }
}

// Run the test
testOpenAIConnection().then(success => {
  if (!success) {
    console.log('For more information on fixing this issue, see OPENAI-INTEGRATION.md');
    process.exit(1);
  }
  process.exit(0);
});
