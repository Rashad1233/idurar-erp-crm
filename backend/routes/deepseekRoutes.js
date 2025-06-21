const express = require('express');
const axios = require('axios');
const { UnspscCode } = require('../models/sequelize');
const { Op } = require('sequelize');
const router = express.Router();

// Configuration for DeepSeek API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Search UNSPSC codes by description using DeepSeek AI
router.post('/search', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || description.trim().length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a description with at least 3 characters' 
      });
    }

    // Prioritize AI-based search if DeepSeek API key is available
    if (DEEPSEEK_API_KEY) {
      try {
        const aiResults = await searchWithDeepSeek(description);
        return res.json({
          success: true,
          source: 'ai',
          data: aiResults,
          message: 'Results powered by AI analysis'
        });
      } catch (aiError) {
        console.error('DeepSeek API error:', aiError);
        // Fall back to local database search if AI fails
        console.log('Falling back to database search...');
        const localResults = await searchLocalDatabase(description);
        return res.json({
          success: true,
          source: 'database_fallback',
          data: localResults,
          message: 'AI search failed, showing database results'
        });
      }
    } else {
      // No API key available, fall back to database search
      const localResults = await searchLocalDatabase(description);
      return res.json({
        success: true,
        source: 'database',
        data: localResults,
        message: 'AI search not configured, showing database results'
      });
    }
  } catch (error) {
    console.error('Error searching UNSPSC codes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search UNSPSC codes', 
      error: error.message 
    });
  }
});

// Search UNSPSC codes in local database only
router.post('/search-database', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description || description.trim().length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a description with at least 3 characters' 
      });
    }

    const localResults = await searchLocalDatabase(description);
    
    return res.json({
      success: true,
      source: 'database',
      data: localResults,
      message: `Found ${localResults.length} matches in local database`
    });
  } catch (error) {
    console.error('Error searching local database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search local database', 
      error: error.message 
    });
  }
});

// Function to search the local UNSPSC database
async function searchLocalDatabase(description) {
  const keywords = description.toLowerCase().split(' ');
  
  // Create a WHERE condition to search for each keyword
  const whereConditions = keywords.map(keyword => ({
    title: { [Op.iLike]: `%${keyword}%` }
  }));
  
  // Get all matches
  const unspscCodes = await UnspscCode.findAll({
    where: { [Op.or]: whereConditions },
    attributes: ['id', 'code', 'segment', 'family', 'class', 'commodity', 'title', 'level'],
    order: [['code', 'ASC']],
    limit: 20
  });
  
  return unspscCodes;
}

// Function to search for UNSPSC codes using DeepSeek AI
async function searchWithDeepSeek(description) {
  // Format the prompt for the DeepSeek API
  const prompt = `
I need to find the appropriate UNSPSC code for the following product or service:
"${description}"

Please provide the most relevant UNSPSC code(s) in this JSON format:
[
  {
    "code": "43211501",
    "title": "Desktop computers",
    "level": "COMMODITY",
    "confidence": 0.95,
    "reasoning": "This is a desktop computer"
  }
]

Include up to 5 potential matches with confidence scores and brief reasoning.`;
  // Call the DeepSeek API
  const response = await axios.post(
    DEEPSEEK_API_URL,
    {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.2
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      }
    }
  );

  // Extract and parse the JSON response
  try {
    const content = response.data.choices[0].message.content;
    // Extract JSON from the response (which might have extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      return jsonData;
    } else {
      // If no valid JSON was found, return an empty array
      console.warn('DeepSeek response did not contain valid JSON', content);
      return [];
    }
  } catch (error) {
    console.error('Error parsing DeepSeek response:', error);
    throw new Error('Failed to parse AI response');
  }
}

module.exports = router;
