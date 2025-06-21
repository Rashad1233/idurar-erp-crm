const { OpenAI } = require('openai');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { trackUsage, calculateCost } = require('./aiUsageController');

// Initialize OpenAI (you'll need to add your API key to environment variables)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Configure multer for image uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, // Reduced to 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Image optimization function - ultra aggressive for token reduction
const optimizeImage = async (imageBuffer) => {
  const sharp = require('sharp');
  
  try {
    // ULTRA aggressive optimization for keyword extraction only
    const optimizedBuffer = await sharp(imageBuffer)      .resize(300, 300, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 40,  // Very low quality - we only need keywords
        progressive: false
      })
      .toBuffer();
    
    console.log(`�️ Ultra-compressed: ${imageBuffer.length} → ${optimizedBuffer.length} bytes (${Math.round(optimizedBuffer.length/imageBuffer.length*100)}%)`);
    return optimizedBuffer;
  } catch (error) {
    console.log('⚠️ Image optimization failed, using original');
    return imageBuffer;
  }
};

// Analyze item image using AI
exports.analyzeItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imagePath = req.file.path;
    console.log('📸 Received image for analysis:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
        console.log('⚠️ OpenAI API key not configured, using mock response');
        
        // Clean up uploaded file
        await fs.unlink(imagePath).catch(console.error);        // Return mock response for testing (simplified format)
        const mockResult = {
          detectedItem: "Apple iMac",
          category: "Desktop Computers",
          features: [],
          suggestedKeywords: ["apple", "imac", "desktop", "computer"],
          confidence: 0.85,
          suggestions: "Keywords: apple, imac, desktop, computer"
        };

        return res.json({
          success: true,
          data: mockResult
        });
      }      // Convert image to base64 for OpenAI with ultra optimization
      const imageBuffer = await fs.readFile(imagePath);
      const optimizedBuffer = await optimizeImage(imageBuffer);
      
      let base64Image;
      
      // Check if image is still too large after optimization
      if (optimizedBuffer.length > 50000) { // 50KB limit
        console.log(`⚠️ Image still large (${optimizedBuffer.length}b), applying emergency compression...`);
        
        // Emergency ultra-compression
        const sharp = require('sharp');
        const emergencyBuffer = await sharp(optimizedBuffer)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 40 })
          .toBuffer();
        
        console.log(`🚨 Emergency compression: ${optimizedBuffer.length} → ${emergencyBuffer.length} bytes`);
        base64Image = emergencyBuffer.toString('base64');
      } else {
        base64Image = optimizedBuffer.toString('base64');
      }
      
      console.log(`📊 Final image stats: Original: ${imageBuffer.length}b, Optimized: ${optimizedBuffer.length}b, Base64: ${base64Image.length} chars`);// Analyze image with OpenAI Vision using GPT-4.1 nano model
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14", // GPT-4.1 nano - ultra cost-effective and perfect for keyword extraction
        messages: [
          {
            role: "user",
            content: [              {
                type: "text",
                text: `Item + 4 keywords only: {"item":"name","keywords":["k1","k2","k3","k4"]}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low"
                }
              }
            ]
          }
        ],
        max_tokens: 15, // Ultra-minimal for just item + 4 keywords
        temperature: 0
      });      let analysisResult;
      const aiContent = response.choices[0].message.content;
      
      // Log token usage for cost monitoring
      const usage = response.usage;
      console.log(`💰 Token Usage - Input: ${usage.prompt_tokens}, Output: ${usage.completion_tokens}, Total: ${usage.total_tokens}`);
      console.log(`📊 Estimated cost: $${((usage.prompt_tokens * 0.000003) + (usage.completion_tokens * 0.000006)).toFixed(6)}`);
      
      console.log('🤖 Raw AI Response:', aiContent);

      try {
        // Clean the response - remove any markdown formatting or extra text
        let cleanJson = aiContent.trim();
        
        // Remove any markdown code blocks
        cleanJson = cleanJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Find JSON object boundaries
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          cleanJson = cleanJson.substring(jsonStart, jsonEnd);
        }
        
        console.log('🧹 Cleaned JSON:', cleanJson);        analysisResult = JSON.parse(cleanJson);
          // Convert simplified AI response to expected format
        if (analysisResult.item && analysisResult.keywords) {
          // New simplified format
          const converted = {
            detectedItem: String(analysisResult.item).trim(),
            category: 'General',
            features: [],
            suggestedKeywords: Array.isArray(analysisResult.keywords) ? analysisResult.keywords : [],
            confidence: 0.8,
            suggestions: Array.isArray(analysisResult.keywords) ? 
              `Try searching with these keywords: ${analysisResult.keywords.join(', ')}` : 
              'Item identified for inventory search'
          };
          analysisResult = converted;        } else {
          // Legacy format - validate fields and ensure clean formatting
          if (!analysisResult.detectedItem) analysisResult.detectedItem = 'Unknown Item';
          if (!analysisResult.category) analysisResult.category = 'General';
          if (!Array.isArray(analysisResult.features)) analysisResult.features = [];
          if (!Array.isArray(analysisResult.suggestedKeywords)) analysisResult.suggestedKeywords = [];
          if (typeof analysisResult.confidence !== 'number') analysisResult.confidence = 0.7;
          
          // Ensure suggestions is always a clean, readable string
          if (!analysisResult.suggestions || typeof analysisResult.suggestions !== 'string') {
            analysisResult.suggestions = analysisResult.suggestedKeywords.length > 0 ? 
              `Search suggestions: ${analysisResult.suggestedKeywords.join(', ')}` : 
              'Item identified for inventory search';
          }
          
          // Clean any remaining JSON formatting from suggestions
          analysisResult.suggestions = String(analysisResult.suggestions)
            .replace(/[{}[\]"]/g, '')
            .replace(/:/g, ' -')
            .replace(/,/g, ', ')
            .trim();
        }
          console.log('✅ Validated AI Result:', analysisResult);
        
        // Track usage for cost monitoring
        const tokens = response.usage?.total_tokens || 300; // Estimate if not provided
        const cost = calculateCost('image-analysis', tokens, optimizedBuffer.length);
        const userId = req.user?.id || req.body?.userId || 'anonymous';
        
        trackUsage(userId, 'image-analysis', tokens, cost);
        console.log(`💰 Usage tracked: ${tokens} tokens, $${cost.toFixed(6)} cost`);
        
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.log('📄 Original content:', aiContent);
        
        // Enhanced fallback parsing
        const content = aiContent.toLowerCase();
        const detectedItem = content.includes('apple') ? 'Apple Device' :
                           content.includes('dell') ? 'Dell Equipment' :
                           content.includes('hp') ? 'HP Device' :
                           content.includes('computer') ? 'Computer Equipment' :
                           content.includes('monitor') ? 'Display Monitor' :
                           content.includes('printer') ? 'Printer' :
                           content.includes('laptop') ? 'Laptop Computer' :
                           content.includes('desktop') ? 'Desktop Computer' :
                           'Office Equipment';
          // Extract keywords from the content (clean, no JSON formatting)
        const words = aiContent
          .replace(/[{}[\]"':,]/g, ' ')  // Remove JSON characters
          .split(/\s+/)
          .filter(word => 
            word.length > 2 && 
            !['the', 'and', 'this', 'that', 'with', 'for', 'item', 'device', 'json', 'keywords', 'null'].includes(word.toLowerCase())
          )
          .slice(0, 8);
        
        analysisResult = {
          detectedItem,
          category: content.includes('computer') ? 'Computers' : 
                   content.includes('office') ? 'Office Supplies' : 'Electronics',
          features: words.slice(0, 4),
          suggestedKeywords: words,
          confidence: 0.6,
          suggestions: words.length > 0 ? 
            `Try searching with: ${words.join(', ')}` : 
            'Item detected - try manual search'
        };
        
        console.log('🔄 Fallback result:', analysisResult);
      }      // Clean up uploaded file
      await fs.unlink(imagePath).catch(console.error);

      // Final cleanup to ensure no JSON formatting in display fields
      const cleanResult = {
        detectedItem: String(analysisResult.detectedItem || 'Unknown Item').replace(/[{}[\]"]/g, '').trim(),
        category: String(analysisResult.category || 'General').replace(/[{}[\]"]/g, '').trim(),
        features: Array.isArray(analysisResult.features) ? 
          analysisResult.features.map(f => String(f).replace(/[{}[\]"]/g, '').trim()) : [],
        suggestedKeywords: Array.isArray(analysisResult.suggestedKeywords) ? 
          analysisResult.suggestedKeywords.map(k => String(k).replace(/[{}[\]"]/g, '').trim()) : [],
        confidence: typeof analysisResult.confidence === 'number' ? analysisResult.confidence : 0.7,
        suggestions: String(analysisResult.suggestions || 'Item analysis complete')
          .replace(/[{}[\]"]/g, '')
          .replace(/:/g, ' -')
          .trim()
      };

      console.log('✅ Final cleaned result:', cleanResult);

      res.json({
        success: true,
        data: cleanResult
      });

    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      
      // Clean up uploaded file
      await fs.unlink(imagePath).catch(console.error);
      
      res.status(500).json({
        success: false,
        message: 'AI analysis failed: ' + aiError.message
      });
    }

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing image: ' + error.message
    });
  }
};

// Generate AI description for items
exports.generateDescription = async (req, res) => {
  try {
    const { itemName, context } = req.body;

    if (!itemName) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    const prompt = `Generate a professional purchase requisition description for: "${itemName}"
                   
                   Context:
                   - Department: ${context?.department || 'General'}
                   - Quantity: ${context?.quantity || 1}
                   - Urgency: ${context?.urgency || 'Normal'}
                   
                   Requirements:
                   - Professional business tone
                   - Include key specifications if applicable
                   - Mention intended use/purpose
                   - Keep under 200 words
                   - Focus on business justification
                   
                   Generate only the description text, no additional formatting.`;    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Updated to GPT-4.1 nano for better performance
      messages: [
        {
          role: "system",
          content: "You are a professional procurement assistant helping write item descriptions for purchase requisitions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });    const description = response.choices[0].message.content.trim();

    // Track usage for cost monitoring
    const tokens = response.usage?.total_tokens || 200;
    const cost = calculateCost('description-generation', tokens);
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    
    trackUsage(userId, 'description-generation', tokens, cost);
    console.log(`💰 Description usage: ${tokens} tokens, $${cost.toFixed(6)} cost`);

    res.json({
      success: true,
      data: {
        description,
        itemName,
        context
      }
    });

  } catch (error) {
    console.error('Description generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating description: ' + error.message
    });
  }
};

// Smart search with natural language processing
exports.smartSearch = async (req, res) => {
  try {
    const { query, context } = req.body;
    const { Inventory, ItemMaster } = require('../models/sequelize');

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters'
      });
    }    // First, enhance the search query with AI
    const enhancePrompt = `Convert this natural language search into structured search terms for inventory management:
                          
                          User query: "${query}"
                          Department context: ${context?.department || 'General'}
                          
                          Extract and return ONLY valid JSON:
                          {
                            "primaryKeywords": ["most", "important", "terms"],
                            "categories": ["suggested", "categories"],
                            "alternatives": ["synonyms", "variations"],
                            "specs": ["technical", "specifications"]
                          }
                          
                          Focus on:
                          - Individual searchable terms (not phrases)
                          - Brand names, model numbers
                          - Technical specifications
                          - Synonyms and alternatives`;    try {      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14", // Updated to GPT-4.1 nano for better performance
        messages: [
          {
            role: "system",
            content: "You are an inventory search specialist. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: enhancePrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      let enhancedSearch;
      try {
        enhancedSearch = JSON.parse(aiResponse.choices[0].message.content);
      } catch (parseError) {
        // Fallback to basic search
        enhancedSearch = {
          primaryKeywords: query.split(' '),
          categories: [],
          alternatives: [],
          specs: []
        };
      }      // Build search terms combining all enhanced keywords with deduplication
      const allSearchTerms = [
        ...enhancedSearch.primaryKeywords,
        ...enhancedSearch.alternatives,
        ...enhancedSearch.specs
      ].filter((term, index, arr) => 
        term && 
        term.length > 2 && 
        arr.indexOf(term.toLowerCase()) === index // Remove duplicates
      ).slice(0, 10); // Limit to 10 terms for performance

      console.log('🔍 Enhanced search terms:', allSearchTerms);

      // Search inventory with enhanced terms using OR logic for broader results
      const { Op } = require('sequelize');
      
      // Create individual search conditions for each term
      const searchConditions = [];
      allSearchTerms.forEach(term => {
        searchConditions.push({
          [Op.or]: [
            { '$itemMaster.shortDescription$': { [Op.iLike]: `%${term}%` } },
            { '$itemMaster.longDescription$': { [Op.iLike]: `%${term}%` } },
            { '$itemMaster.manufacturerName$': { [Op.iLike]: `%${term}%` } },
            { '$itemMaster.manufacturerPartNumber$': { [Op.iLike]: `%${term}%` } },
            { inventoryNumber: { [Op.iLike]: `%${term}%` } }
          ]
        });
      });

      const inventoryItems = await Inventory.findAll({
        where: searchConditions.length > 0 ? {
          [Op.or]: searchConditions
        } : {
          // Fallback to basic search if no enhanced terms
          [Op.or]: [
            { '$itemMaster.shortDescription$': { [Op.iLike]: `%${query}%` } },
            { '$itemMaster.longDescription$': { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: ItemMaster,
            as: 'itemMaster',
            attributes: ['id', 'itemNumber', 'shortDescription', 'longDescription', 'uom', 'manufacturerName', 'manufacturerPartNumber']
          }
        ],
        limit: 50,
        order: [['updatedAt', 'DESC']]
      });

      console.log(`✅ Smart search found ${inventoryItems.length} items for query: "${query}"`);

      const suggestions = enhancedSearch.categories.length > 0 
        ? `AI suggested categories: ${enhancedSearch.categories.join(', ')}`
        : `Found ${inventoryItems.length} items using AI-enhanced search`;

      res.json({
        success: true,
        data: {
          items: inventoryItems,
          enhancedSearch,
          suggestions,
          originalQuery: query
        }
      });

    } catch (aiError) {
      console.error('AI search enhancement failed, falling back to basic search:', aiError);
      
      // Fallback to basic search
      const { Op } = require('sequelize');
      const inventoryItems = await Inventory.findAll({
        where: {
          [Op.or]: [
            { '$itemMaster.shortDescription$': { [Op.iLike]: `%${query}%` } },
            { '$itemMaster.longDescription$': { [Op.iLike]: `%${query}%` } },
            { inventoryNumber: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: ItemMaster,
            as: 'itemMaster',
            attributes: ['id', 'itemNumber', 'shortDescription', 'longDescription', 'uom', 'manufacturerName', 'manufacturerPartNumber']
          }
        ],
        limit: 50,
        order: [['updatedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          items: inventoryItems,
          suggestions: 'Basic search completed (AI enhancement unavailable)',
          originalQuery: query
        }
      });
    }

  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing smart search: ' + error.message
    });
  }
};

// Generate AI comments/purpose for Purchase Requisition
exports.generatePRComments = async (req, res) => {
  try {
    const { items, department, urgency, totalAmount, context } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    // Create a summary of items
    const itemSummary = items.map(item => 
      `${item.itemName || item.description || 'Item'} (Qty: ${item.quantity || 1})`
    ).join(', ');

    const prompt = `Generate a professional business justification comment for a Purchase Requisition with the following details:

Items Requested: ${itemSummary}
Department: ${department || 'General'}
Urgency Level: ${urgency || 'Normal'}
${totalAmount ? `Total Amount: $${totalAmount}` : ''}
${context?.projectName ? `Project: ${context.projectName}` : ''}
${context?.costCenter ? `Cost Center: ${context.costCenter}` : ''}

Requirements:
- Professional business tone
- Clear business justification
- Explain why these items are needed
- Mention operational impact or benefits
- Include timeline implications if urgent
- Keep under 150 words
- Focus on business value and necessity

Generate only the comment text, no additional formatting or labels.`;    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Updated to GPT-4.1 nano for better performance
      messages: [
        {
          role: "system",
          content: "You are a professional procurement manager writing business justifications for purchase requisitions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.7
    });

    const comments = response.choices[0].message.content.trim();

    // Track usage for cost monitoring
    const tokens = response.usage?.total_tokens || 200;
    const cost = calculateCost('pr-comments-generation', tokens);
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    
    trackUsage(userId, 'pr-comments-generation', tokens, cost);
    console.log(`💰 PR Comments usage: ${tokens} tokens, $${cost.toFixed(6)} cost`);

    res.json({
      success: true,
      data: {
        comments,
        itemCount: items.length,
        context: {
          department,
          urgency,
          totalAmount
        }
      }
    });

  } catch (error) {
    console.error('PR comments generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PR comments: ' + error.message
    });
  }
};

// Generate AI supplier recommendations
exports.generateSupplierRecommendations = async (req, res) => {
  try {
    const { items, location, budget, timeline } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const itemCategories = items.map(item => 
      item.category || item.itemName || 'General Item'
    ).join(', ');

    const prompt = `Based on the following procurement requirements, suggest supplier search criteria and evaluation factors:

Items/Categories: ${itemCategories}
Location: ${location || 'Not specified'}
Budget Range: ${budget || 'Not specified'}
Timeline: ${timeline || 'Standard'}

Provide recommendations for:
1. Supplier type and characteristics to look for
2. Key evaluation criteria
3. Negotiation points
4. Risk factors to consider

Keep response under 200 words and focus on actionable insights.`;    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Updated to GPT-4.1 nano for better performance
      messages: [
        {
          role: "system",
          content: "You are a procurement specialist providing supplier selection guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.6
    });

    const recommendations = response.choices[0].message.content.trim();

    // Track usage
    const tokens = response.usage?.total_tokens || 200;
    const cost = calculateCost('supplier-recommendations', tokens);
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    
    trackUsage(userId, 'supplier-recommendations', tokens, cost);

    res.json({
      success: true,
      data: {
        recommendations,
        context: { items: itemCategories, location, budget, timeline }
      }
    });

  } catch (error) {
    console.error('Supplier recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating supplier recommendations: ' + error.message
    });
  }
};

// Enhance item description with AI
exports.enhanceItemDescription = async (req, res) => {
  try {
    const { description, category, manufacturer } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const prompt = `Enhance this item description for inventory management:
                   
                   Original Description: "${description}"
                   Equipment Category: ${category || 'Not specified'}
                   Manufacturer: ${manufacturer || 'Not specified'}
                   
                   Please provide:
                   1. Enhanced long description with technical details
                   2. Standard description in NOUN, MODIFIER: specifications format
                   3. Suggested UNSPSC code (8-digit)
                   
                   Format as JSON:
                   {
                     "longDescription": "detailed technical description",
                     "standardDescription": "NOUN, MODIFIER: specifications",
                     "suggestedUnspscCode": "12345678"
                   }`;    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Updated to GPT-4.1 nano for better performance
      messages: [
        {
          role: "system",
          content: "You are an inventory management specialist. Provide detailed, accurate technical descriptions for industrial equipment and materials."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    let enhancementResult;
    try {
      const aiContent = response.choices[0].message.content.trim();
      // Clean and parse JSON response
      const cleanJson = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonStart = cleanJson.indexOf('{');
      const jsonEnd = cleanJson.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonContent = cleanJson.substring(jsonStart, jsonEnd);
        enhancementResult = JSON.parse(jsonContent);
      } else {
        throw new Error('No valid JSON found');
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback enhancement');
      enhancementResult = {
        longDescription: `Enhanced ${description.toLowerCase()} for ${category || 'industrial'} applications. Manufactured by ${manufacturer || 'approved supplier'}. Suitable for industrial maintenance and operations.`,
        standardDescription: `${category || 'EQUIPMENT'}: ${description.toUpperCase()}`,
        suggestedUnspscCode: '39120000'
      };
    }

    // Track usage
    const tokens = response.usage?.total_tokens || 300;
    const cost = calculateCost('description-enhancement', tokens);
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    
    trackUsage(userId, 'description-enhancement', tokens, cost);

    res.json({
      success: true,
      data: enhancementResult
    });

  } catch (error) {
    console.error('Description enhancement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enhancing description: ' + error.message
    });
  }
};

// Generate complete item master data with AI
exports.generateCompleteItemData = async (req, res) => {
  try {
    const { shortDescription, manufacturer, category, additionalInfo } = req.body;

    if (!shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Short description is required'
      });
    }    const prompt = `Based on this item information, generate complete item master data for an ERP system following these rules:

INPUT DESCRIPTION: "${shortDescription}"
MANUFACTURER: ${manufacturer || 'Not specified'}
CATEGORY: ${category || 'Not specified'}
ADDITIONAL INFO: ${additionalInfo || 'None'}

BUSINESS RULES TO FOLLOW:
1. Short Description: Improve/optimize the input description to be clear, professional, and under 44 characters
   - Make it concise but descriptive
   - Use proper terminology
   - Remove unnecessary words
   - Example: "High pressure water pump" → "Water Pump, High Pressure"

2. Standard Description must use "NOUN, MODIFIER: specifications" format
   Examples: 
   - "VALVE, GATE: 12IN, CLASS 300, STAINLESS STEEL"
   - "GASKET, SPIRAL WOUND: 2IN, STAINLESS STEEL"
   - "PUMP, CENTRIFUGAL: 10HP, 3450 RPM"

3. Equipment Categories: VALVE, PUMP, MOTOR, GASKET, FITTING, INSTRUMENT, ELECTRICAL, MECHANICAL, OTHER

4. Stock Codes Logic:
   - Planned Stock = N, but keep stock for critical/long lead time → ST1
   - Planned Stock = Y, with min/max levels → ST2  
   - Non-stock item for contracts/direct orders → NS3

5. UNSPSC Codes must be accurate 8-digit industry standard codes

6. Criticality based on: HIGH (critical equipment), MEDIUM (important), LOW (standard), NO (consumable/general)

Please provide comprehensive item data in this exact JSON format:
{
  "shortDescription": "improved/optimized short description (max 44 chars, professional, clear)",
  "longDescription": "detailed business description with specifications and applications",
  "technicalDescription": "separate technical specifications field for engineering details (materials, dimensions, ratings, standards)",
  "standardDescription": "NOUN, MODIFIER: technical specifications format (follow examples above)",
  "manufacturerName": "realistic manufacturer name for this item type",
  "manufacturerPartNumber": "realistic part number pattern for this manufacturer",
  "equipmentCategory": "VALVE|PUMP|MOTOR|GASKET|FITTING|INSTRUMENT|ELECTRICAL|MECHANICAL|OTHER",
  "equipmentSubCategory": "specific subcategory (GATE, CENTRIFUGAL, SPIRAL WOUND, etc.)",
  "unitOfMeasure": "EA|PC|BOX|KG|LTR|M|CM|SET|FT|GAL",
  "unspscCode": "accurate 8-digit UNSPSC code",
  "unspscTitle": "UNSPSC code description",
  "stockItem": true/false (true for items that could be stocked),
  "plannedStock": false (false for ST1, true for ST2),
  "criticality": "HIGH|MEDIUM|LOW|NO",
  "serialNumber": "Y|N (Y for expensive equipment, N for consumables)",
  "estimatedPrice": "realistic price range with currency",
  "contractNumber": "",
  "supplierName": "realistic supplier name",
  "technicalSpecs": {
    "material": "material type/grade",
    "dimensions": "typical dimensions with units",
    "weight": "typical weight with units", 
    "pressure": "pressure rating if applicable",
    "temperature": "temperature rating if applicable",
    "operatingConditions": "operating parameters and environment"
  }
}

Make realistic, industry-standard suggestions. Follow the NOUN, MODIFIER format strictly for standardDescription.`;    const response = await openai.chat.completions.create({
      model: "gpt-4.1-2025-04-14", // Updated to GPT-4.1 for complex reasoning and item generation
      messages: [
        {
          role: "system",
          content: "You are an expert inventory management and procurement specialist with deep knowledge of industrial equipment, materials, and UNSPSC classification codes. Provide accurate, realistic item data for ERP systems."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.2
    });

    let itemData;
    try {
      const aiContent = response.choices[0].message.content.trim();
      // Clean and parse JSON response
      const cleanJson = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonStart = cleanJson.indexOf('{');
      const jsonEnd = cleanJson.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonContent = cleanJson.substring(jsonStart, jsonEnd);
        itemData = JSON.parse(jsonContent);
        
        // Ensure short description doesn't exceed 44 characters
        if (itemData.shortDescription && itemData.shortDescription.length > 44) {
          itemData.shortDescription = itemData.shortDescription.substring(0, 44).trim();
        }
      } else {
        throw new Error('No valid JSON found');
      }
    } catch (parseError) {      console.log('JSON parsing failed, creating fallback data');
      
      // Smart fallback based on description analysis
      const desc = shortDescription.toLowerCase();
      let equipmentCat = "OTHER";
      let subCat = "General";
      let standardDesc = `EQUIPMENT: ${shortDescription.toUpperCase()}`;
      let unspscCode = "39120000";
      let stockItem = true;
      let criticality = "LOW";      // Analyze description for better categorization
      let unspscTitle = "Industrial equipment component";
      
      // Generate improved short description
      let improvedShortDesc = shortDescription;
      
      if (desc.includes('valve')) {
        equipmentCat = "VALVE";
        subCat = desc.includes('gate') ? "GATE" : desc.includes('ball') ? "BALL" : "GENERAL";
        standardDesc = `VALVE, ${subCat}: ${shortDescription.toUpperCase()}`;
        unspscCode = "40141700";
        unspscTitle = "Industrial valves and valve parts";
        criticality = "MEDIUM";
        // Improve short description for valves
        improvedShortDesc = desc.includes('gate') ? 'Gate Valve' : 
                           desc.includes('ball') ? 'Ball Valve' : 
                           desc.includes('pressure') ? 'Pressure Valve' : 'Industrial Valve';
      } else if (desc.includes('pump')) {
        equipmentCat = "PUMP";
        subCat = desc.includes('centrifugal') ? "CENTRIFUGAL" : "GENERAL";
        standardDesc = `PUMP, ${subCat}: ${shortDescription.toUpperCase()}`;
        unspscCode = "40191500";
        unspscTitle = "Pumps and pump accessories";
        criticality = "HIGH";
        // Improve short description for pumps
        improvedShortDesc = desc.includes('centrifugal') ? 'Centrifugal Pump' :
                           desc.includes('pressure') ? 'High Pressure Pump' :
                           desc.includes('water') ? 'Water Pump' : 'Industrial Pump';
      } else if (desc.includes('motor')) {
        equipmentCat = "MOTOR";
        subCat = "ELECTRIC";
        standardDesc = `MOTOR, ELECTRIC: ${shortDescription.toUpperCase()}`;
        unspscCode = "26111700";
        unspscTitle = "Electric motors and motor accessories";
        criticality = "MEDIUM";
        // Improve short description for motors
        improvedShortDesc = desc.includes('electric') ? 'Electric Motor' : 'Motor';
      } else if (desc.includes('gasket')) {
        equipmentCat = "GASKET";
        subCat = desc.includes('spiral') ? "SPIRAL WOUND" : "FLAT";
        standardDesc = `GASKET, ${subCat}: ${shortDescription.toUpperCase()}`;
        unspscCode = "31201600";
        unspscTitle = "Gaskets and gasket materials";
        criticality = "LOW";
        // Improve short description for gaskets
        improvedShortDesc = desc.includes('spiral') ? 'Spiral Wound Gasket' : 'Gasket';
      } else if (desc.includes('printer') || desc.includes('electronic')) {
        equipmentCat = "ELECTRICAL";
        subCat = "ELECTRONIC";
        standardDesc = `EQUIPMENT, ELECTRONIC: ${shortDescription.toUpperCase()}`;
        unspscCode = "43211503";
        unspscTitle = "Printers and plotters and facsimile machines";
        stockItem = false; // Office equipment typically non-stock
        criticality = "NO";
        // Improve short description for electronics
        improvedShortDesc = desc.includes('printer') ? 'Printer' : 
                           desc.includes('computer') ? 'Computer Equipment' : 'Electronic Device';
      } else {
        // Generic improvement - capitalize and clean up
        improvedShortDesc = shortDescription.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Ensure improved description doesn't exceed 44 characters
      if (improvedShortDesc.length > 44) {
        improvedShortDesc = improvedShortDesc.substring(0, 44).trim();
      }

      itemData = {
        shortDescription: improvedShortDesc,
        longDescription: `${shortDescription}. Industrial grade equipment suitable for maintenance and operations. Manufactured to industry standards with quality certifications.`,
        technicalDescription: `Material: TBD, Dimensions: TBD, Operating conditions: Standard industrial environment. Compliance with relevant industry standards required.`,
        standardDescription: standardDesc,
        manufacturerName: manufacturer || "TBD",
        manufacturerPartNumber: "TBD",
        equipmentCategory: equipmentCat,
        equipmentSubCategory: subCat,        unitOfMeasure: "EA",
        unspscCode: unspscCode,
        unspscTitle: unspscTitle,
        stockItem: stockItem,
        plannedStock: false, // Default to ST1 logic
        criticality: criticality,
        serialNumber: criticality === "HIGH" ? "Y" : "N",
        estimatedPrice: "TBD",
        contractNumber: "",
        supplierName: "TBD",
        technicalSpecs: {
          material: "TBD",
          dimensions: "TBD", 
          weight: "TBD",
          pressure: "Standard industrial pressure",
          temperature: "Standard operating temperature",
          operatingConditions: "Standard industrial conditions"
        }
      };
    }

    // Track usage
    const tokens = response.usage?.total_tokens || 600;
    const cost = calculateCost('complete-item-generation', tokens);
    const userId = req.user?.id || req.body?.userId || 'anonymous';
    
    trackUsage(userId, 'complete-item-generation', tokens, cost);

    res.json({
      success: true,
      data: itemData,
      message: 'Item data generated successfully by AI'
    });

  } catch (error) {
    console.error('Complete item generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating item data: ' + error.message
    });
  }
};

// Fallback intelligent content generation without external AI
const generateIntelligentContent = (itemData) => {
  const {
    shortDescription = '',
    manufacturerName = '',
    manufacturerPartNumber = '',
    equipmentCategory = '',
    equipmentSubCategory = '',
    criticality = 'MEDIUM'
  } = itemData;

  // Extract key information
  const itemType = shortDescription.toLowerCase();
  const isElectrical = /electric|electronic|sensor|motor|switch|relay|transformer/i.test(itemType);
  const isMechanical = /pump|valve|bearing|gear|coupling|shaft|mechanical/i.test(itemType);
  const isInstrumentation = /gauge|meter|indicator|transmitter|controller/i.test(itemType);
  const isHVAC = /fan|blower|heater|cooler|ventilation|hvac/i.test(itemType);
  const is3DPrinter = /3d|printer|printing|additive|manufacturing|fdm|sla/i.test(itemType);

  // Generate intelligent long description
  let longDescription = '';
  if (is3DPrinter) {
    longDescription = `Professional-grade ${shortDescription.toLowerCase()} designed for precision additive manufacturing applications. Features advanced ${manufacturerName ? manufacturerName + ' ' : ''}technology for reliable operation in industrial environments. Suitable for prototyping, small-batch production, and complex geometries requiring high dimensional accuracy.`;
  } else if (isElectrical) {
    longDescription = `Industrial ${shortDescription.toLowerCase()} engineered for reliable electrical performance in demanding operational environments. ${manufacturerName ? 'Manufactured by ' + manufacturerName + ', ' : ''}designed to meet industry standards for ${criticality.toLowerCase()} criticality applications with enhanced durability and safety features.`;
  } else if (isMechanical) {
    longDescription = `Heavy-duty ${shortDescription.toLowerCase()} designed for robust mechanical performance in industrial applications. ${manufacturerName ? manufacturerName + ' ' : ''}construction ensures reliable operation under varying load conditions with minimal maintenance requirements.`;
  } else if (isInstrumentation) {
    longDescription = `Precision ${shortDescription.toLowerCase()} providing accurate measurement and control capabilities for industrial process monitoring. ${manufacturerName ? manufacturerName + ' ' : ''}technology ensures reliable performance with high accuracy and long-term stability.`;
  } else if (isHVAC) {
    longDescription = `Industrial-grade ${shortDescription.toLowerCase()} designed for efficient climate control and air handling applications. ${manufacturerName ? manufacturerName + ' ' : ''}engineering provides reliable operation with energy-efficient performance characteristics.`;
  } else {
    longDescription = `Industrial ${shortDescription.toLowerCase()} designed for reliable performance in ${equipmentCategory.toLowerCase()} applications. ${manufacturerName ? 'Manufactured by ' + manufacturerName + ', ' : ''}engineered to meet demanding operational requirements with proven durability and performance.`;
  }

  // Generate standard description (technical format)
  let standardDescription = '';
  if (is3DPrinter) {
    const techSpecs = manufacturerPartNumber ? `: ${manufacturerPartNumber}` : '';
    standardDescription = `${shortDescription.toUpperCase()}${techSpecs}, ADDITIVE MANUFACTURING, FDM/SLA COMPATIBLE, INDUSTRIAL GRADE`;
  } else {
    const category = equipmentCategory || 'EQUIPMENT';
    const subCat = equipmentSubCategory ? `, ${equipmentSubCategory}` : '';
    const partNum = manufacturerPartNumber ? `, P/N: ${manufacturerPartNumber}` : '';
    standardDescription = `${category.toUpperCase()}${subCat}${partNum}, ${shortDescription.toUpperCase()}, ${criticality.toUpperCase()} CRITICALITY`;
  }

  // Generate intelligent suggestions
  let suggestions = 'Technical Considerations:\n';
  
  if (is3DPrinter) {
    suggestions += '• Verify material compatibility (PLA, ABS, PETG, etc.)\n';
    suggestions += '• Check build volume requirements\n';
    suggestions += '• Consider layer resolution specifications\n';
    suggestions += '• Ensure proper ventilation and safety protocols\n';
    suggestions += '• Plan for consumables and maintenance supplies';
  } else if (isElectrical) {
    suggestions += '• Verify voltage and current requirements\n';
    suggestions += '• Check environmental ratings (IP rating)\n';
    suggestions += '• Ensure proper grounding and safety compliance\n';
    suggestions += '• Consider spare parts and replacement strategy\n';
    suggestions += '• Validate compatibility with existing control systems';
  } else if (isMechanical) {
    suggestions += '• Verify load capacity and operating conditions\n';
    suggestions += '• Check material compatibility and corrosion resistance\n';
    suggestions += '• Consider maintenance access and serviceability\n';
    suggestions += '• Ensure proper lubrication and wear part availability\n';
    suggestions += '• Validate mounting and installation requirements';
  } else {
    suggestions += '• Verify technical specifications match requirements\n';
    suggestions += '• Check compatibility with existing systems\n';
    suggestions += '• Consider installation and commissioning needs\n';
    suggestions += '• Ensure spare parts and service support availability\n';
    suggestions += '• Validate regulatory compliance and certifications';
  }

  return {
    longDescription,
    standardDescription,
    suggestions
  };
};

// Main AI content generation function for item descriptions
exports.generateItemContent = async (req, res) => {
  console.log('🤖 AI content generation requested');
  try {
    const { userPrompt } = req.body;

    if (!userPrompt || userPrompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User prompt is required for AI content generation'
      });
    }

    console.log('🎯 Generating content for:', userPrompt);

    let generatedContent;

    // Try to use OpenAI if available
    if (openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        console.log('🔥 Using OpenAI for comprehensive content generation');
        
        const prompt = `You are an expert procurement and technical specification specialist. Generate comprehensive and professional content for ALL fields of an industrial equipment item master record based ONLY on this user input: "${userPrompt.trim()}"

Generate ALL the following fields with professional, accurate, and industry-standard content based ONLY on the user's input:

1. SHORT_DESCRIPTION: A concise, professional description (max 100 characters)
2. LONG_DESCRIPTION: Detailed technical description with specifications, features, and applications (200-500 words)
3. STANDARD_DESCRIPTION: Standardized format description following industry conventions
4. MANUFACTURER_NAME: Most likely or common manufacturer for this item
5. MANUFACTURER_PART_NUMBER: Realistic part/model number for this type of item
6. EQUIPMENT_CATEGORY: Primary equipment category (ELECTRICAL, MECHANICAL, INSTRUMENTATION, HVAC, IT, SAFETY, OFFICE, OTHER)
7. EQUIPMENT_SUB_CATEGORY: Specific sub-category
8. CRITICALITY: Equipment criticality (HIGH, MEDIUM, LOW, CRITICAL) based on operational importance
9. UOM: Unit of measure (EA, M, KG, L, SET, BOX, ROLL, SHEET, etc.)
10. STOCK_ITEM: Whether this should be a stock item (Y/N)
11. PLANNED_STOCK: Whether planned stock is required (Y/N)
12. UNSPSC_CODE: Appropriate UNSPSC commodity code (8-digit number)
13. EQUIPMENT_TAG: Suggested equipment tag format

Format your response as a JSON object with these exact field names:
{
  "shortDescription": "...",
  "longDescription": "...",
  "standardDescription": "...",
  "manufacturerName": "...",
  "manufacturerPartNumber": "...",
  "equipmentCategory": "...",
  "equipmentSubCategory": "...",
  "criticality": "...",
  "uom": "...",
  "stockItem": "...",
  "plannedStock": "...",
  "unspscCode": "...",
  "equipmentTag": "..."
}

Ensure all content is:
- Technically accurate and professional
- Industry-standard compliant
- Properly formatted and consistent
- Suitable for procurement and maintenance use
- Generated ONLY from the user input, ignore any existing data`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            {
              role: "system",
              content: "You are an expert technical writer and procurement specialist with deep knowledge of industrial equipment, manufacturing standards, and supply chain management. Always provide accurate, professional, and industry-compliant content based ONLY on user input."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;
        console.log('🤖 Raw AI Response:', aiResponse);

        // Parse the JSON response
        try {
          // Extract JSON from response (in case there's extra text)
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedContent = JSON.parse(jsonMatch[0]);
          } else {
            generatedContent = JSON.parse(aiResponse);
          }
        } catch (parseError) {
          console.error('❌ JSON Parse Error:', parseError);
          throw new Error('Failed to parse AI response as JSON');
        }
        
        console.log('✅ OpenAI comprehensive content generated successfully');
      } catch (aiError) {
        console.log('⚠️ OpenAI failed, falling back to intelligent generation:', aiError.message);
        generatedContent = generateIntelligentContent(req.body);
      }
    } else {
      console.log('💡 Using intelligent fallback generation');
      generatedContent = generateIntelligentContent(req.body);
    }

    res.status(200).json({
      success: true,
      message: 'Comprehensive content generated successfully',
      data: generatedContent,
      method: openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' ? 'OpenAI' : 'Intelligent Fallback',
      originalRequest: {
        shortDescription,
        manufacturerName,
        manufacturerPartNumber,
        equipmentCategory,
        equipmentSubCategory,
        criticality,
        userPrompt
      }
    });

  } catch (error) {
    console.error('❌ AI content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: error.message
    });
  }
};

// Analyze UNSPSC code and provide breakdown
exports.analyzeUNSPSC = async (req, res) => {
  console.log('🔍 UNSPSC Analysis called');
  try {
    const { unspscCode } = req.body;
    
    if (!unspscCode || unspscCode.length !== 8 || !/^\d{8}$/.test(unspscCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UNSPSC code. Must be 8 digits.'
      });
    }

    // Import the UnspscBreakdown model
    const { UnspscBreakdown } = require('../models/sequelize');

    // Check if we already have this UNSPSC code analyzed
    let existingBreakdown = await UnspscBreakdown.findOne({
      where: { unspscCode: unspscCode }
    });

    if (existingBreakdown) {
      console.log(`📋 Found cached UNSPSC breakdown for ${unspscCode}`);
      
      const result = {
        unspscCode: existingBreakdown.unspscCode,
        breakdown: {
          segment: { 
            code: existingBreakdown.segmentCode, 
            name: existingBreakdown.segmentName 
          },
          family: { 
            code: existingBreakdown.familyCode, 
            name: existingBreakdown.familyName 
          },
          commodity: { 
            code: existingBreakdown.commodityCode, 
            name: existingBreakdown.commodityName 
          },
          businessFunction: { 
            code: existingBreakdown.businessFunctionCode, 
            name: existingBreakdown.businessFunctionName 
          }
        },
        isValid: existingBreakdown.isValid,
        analysis: existingBreakdown.fullAnalysis,
        formattedDisplay: existingBreakdown.formattedDisplay,
        segmentName: existingBreakdown.segmentName,
        familyName: existingBreakdown.familyName,
        commodityName: existingBreakdown.commodityName,
        businessFunctionName: existingBreakdown.businessFunctionName,
        cached: true,
        cachedAt: existingBreakdown.createdAt
      };

      return res.status(200).json({
        success: true,
        data: result,
        message: 'UNSPSC code analyzed successfully (from cache)'
      });
    }

    // Break down UNSPSC code into segments
    const segment = unspscCode.substring(0, 2);
    const family = unspscCode.substring(2, 4);
    const commodity = unspscCode.substring(4, 6);
    const businessFunction = unspscCode.substring(6, 8);

    console.log(`🔍 Analyzing new UNSPSC: ${unspscCode} = ${segment}-${family}-${commodity}-${businessFunction}`);

    // Create the analysis prompt
    const analysisPrompt = `Analyze this UNSPSC code: ${unspscCode}

UNSPSC Code Breakdown:
- Segment: ${segment}
- Family: ${family}  
- Commodity: ${commodity}
- Business Function: ${businessFunction}

Please provide:
1. The name/description for each level (Segment, Family, Commodity, Business Function)
2. Whether this appears to be a valid/real UNSPSC code
3. What type of products/services this code represents
4. Any common uses or examples

Format your response as a clear breakdown with practical information for procurement professionals.`;const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are a procurement and classification expert specializing in UNSPSC (United Nations Standard Products and Services Code) analysis. Provide clear, practical information about UNSPSC codes.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 800,
      temperature: 0.1
    });

    const analysis = response.choices[0].message.content;
    
    // Try to extract structured information from the response
    let segmentName = 'Unknown Segment';
    let familyName = 'Unknown Family';
    let commodityName = 'Unknown Commodity';
    let businessFunctionName = 'Unknown Business Function';
    let isValid = true;
    let description = analysis;

    // Simple parsing to extract names (this could be enhanced)
    const lines = analysis.split('\n');
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('segment') && lowerLine.includes(':')) {
        segmentName = line.split(':')[1]?.trim() || segmentName;
      }
      if (lowerLine.includes('family') && lowerLine.includes(':')) {
        familyName = line.split(':')[1]?.trim() || familyName;
      }
      if (lowerLine.includes('commodity') && lowerLine.includes(':')) {
        commodityName = line.split(':')[1]?.trim() || commodityName;
      }
      if (lowerLine.includes('business function') && lowerLine.includes(':')) {
        businessFunctionName = line.split(':')[1]?.trim() || businessFunctionName;
      }
      if (lowerLine.includes('invalid') || lowerLine.includes('not valid') || lowerLine.includes('not found')) {
        isValid = false;
      }
    });    // Track usage
    await trackUsage('unspsc-analysis', response.usage.prompt_tokens, response.usage.completion_tokens);

    // Save the analysis to database for future use
    try {
      const savedBreakdown = await UnspscBreakdown.create({
        unspscCode: unspscCode,
        segmentCode: segment,
        segmentName: segmentName,
        familyCode: family,
        familyName: familyName,
        commodityCode: commodity,
        commodityName: commodityName,
        businessFunctionCode: businessFunction,
        businessFunctionName: businessFunctionName,
        isValid: isValid,
        fullAnalysis: description,
        formattedDisplay: `${segment}-${family}-${commodity}-${businessFunction}`,
        aiModel: 'gpt-4.1-nano-2025-04-14'
      });
      
      console.log(`💾 Saved UNSPSC breakdown to database: ${unspscCode}`);
    } catch (saveError) {
      console.error('⚠️ Failed to save UNSPSC breakdown to database:', saveError);
      // Continue anyway - don't fail the request if save fails
    }

    const result = {
      unspscCode,
      breakdown: {
        segment: { code: segment, name: segmentName },
        family: { code: family, name: familyName },
        commodity: { code: commodity, name: commodityName },
        businessFunction: { code: businessFunction, name: businessFunctionName }
      },
      isValid,
      analysis: description,
      formattedDisplay: `${segment}-${family}-${commodity}-${businessFunction}`,
      segmentName: segmentName,
      familyName: familyName,
      commodityName: commodityName,
      businessFunctionName: businessFunctionName,
      cached: false,
      generatedAt: new Date()
    };

    console.log('✅ UNSPSC Analysis completed:', result);

    res.status(200).json({
      success: true,
      data: result,
      message: 'UNSPSC code analyzed successfully'
    });

  } catch (error) {
    console.error('❌ UNSPSC Analysis error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error analyzing UNSPSC code',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Export upload middleware
exports.uploadMiddleware = upload.single('image');
