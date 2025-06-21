const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    
    // Initialize OpenAI client
    try {
      this.client = new OpenAI({
        apiKey: this.apiKey
      });
      this.useOpenAI = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error.message);
      this.useOpenAI = false;
    }
  }

  /**
   * Search for UNSPSC codes using GPT-4.1 Nano
   * 
   * @param {string} query - The description or keywords to search for
   * @returns {Promise<Array>} - Promise resolving to array of UNSPSC codes and descriptions
   */
  async searchUnspscCodes(query) {
    try {
      console.log(`🔍 Searching UNSPSC codes for: "${query}"`);
      
      // Check if API key is valid or in demo mode
      if (!this.apiKey || this.apiKey === 'your-openai-api-key-here' || !this.useOpenAI) {
        console.log('⚠️ Using demo mode with mock UNSPSC data since no valid API key is provided');
        return this.getMockUnspscResults(query);
      }        const systemPrompt = `
        You are an expert in UNSPSC (United Nations Standard Products and Services Code) classification.
        Your task is to match product descriptions to the most appropriate UNSPSC code concisely.
        
        For the given product description, you will:
        1. Identify the most relevant UNSPSC code (8-digit format)
        2. Provide the hierarchy: Segment (first 2 digits), Family (next 2 digits), Class (next 2 digits), and Commodity (final 2 digits)
        3. Include short titles for each level
        4. Provide a brief explanation for the match (max 50 words)
        
        Return your answer in the following JSON format (ensure proper escaping and valid JSON):
        {
          "results": [
            {
              "unspscCode": "12345678",
              "segment": {"code": "12", "title": "Segment Title"},
              "family": {"code": "1234", "title": "Family Title"},
              "class": {"code": "123456", "title": "Class Title"},
              "commodity": {"code": "12345678", "title": "Commodity Title"},
              "fullTitle": "Complete product title",
              "confidence": 0.95,
              "explanation": "Brief explanation of why this code matches the product (max 50 words)"
            }
          ]
        }
        
        Return up to 3 of the most relevant results, ordered by relevance.
      `;
      const userPrompt = `Find UNSPSC codes for: ${query}`;
      
      try {
        // Using new OpenAI client format
        const response = await this.client.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });
        
        // Parse the completion response to extract JSON
        const completion = response.choices[0].message.content;
        
        try {
          const parsedResults = JSON.parse(completion);
          console.log(`✅ Found ${parsedResults.results?.length || 0} UNSPSC codes matching query`);
          return parsedResults.results || [];
        } catch (parseError) {
          console.error('Failed to parse JSON response from GPT:', parseError);
          console.log('⚠️ Falling back to mock data due to JSON parsing error');
          return this.getMockUnspscResults(query);
        }
      } catch (apiError) {
        console.error('Error calling OpenAI API:', apiError.message);
        console.log('⚠️ Falling back to mock data due to API error');
        return this.getMockUnspscResults(query);
      }
    } catch (error) {
      console.error('Error searching UNSPSC codes with OpenAI:', error);
      throw error;
    }
  }
  /**
   * Get detailed information about a specific UNSPSC code
   * 
   * @param {string} code - The UNSPSC code to look up
   * @returns {Promise<Object>} - Promise resolving to detailed UNSPSC code information
   */
  async getUnspscDetails(code) {
    try {
      console.log(`🔍 Getting details for UNSPSC code: "${code}"`);
      
      // Check if API key is valid or in demo mode
      if (!this.apiKey || this.apiKey === 'your-openai-api-key-here' || !this.useOpenAI) {
        console.log('⚠️ Using demo mode with mock UNSPSC data since no valid API key is provided');
        return this.getMockUnspscDetails(code);
      }      const systemPrompt = `
        You are an expert in UNSPSC (United Nations Standard Products and Services Code) classification.
        Your task is to provide concise information about a specific UNSPSC code.
        
        For the given UNSPSC code, you will:
        1. Break down the code into its hierarchy: Segment (first 2 digits), Family (next 2 digits), Class (next 2 digits), and Commodity (final 2 digits)
        2. Provide short descriptive titles for each level (TITLES ONLY, NO descriptions for hierarchy levels)
        3. Give a brief description of the specific commodity only (max 100 words)
        
        Return your answer in the following JSON format (ensure proper escaping and valid JSON):
        {
          "unspscCode": "12345678",
          "segment": {"code": "12", "title": "Segment Title"},
          "family": {"code": "1234", "title": "Family Title"},
          "class": {"code": "123456", "title": "Class Title"},
          "commodity": {"code": "12345678", "title": "Commodity Title"},
          "fullTitle": "Complete product title",
          "description": "Brief description of this specific commodity (max 100 words)"
        }
      `;
      const userPrompt = `Provide detailed information for UNSPSC code: ${code}`;
      
      try {
        // Using new OpenAI client format
        const response = await this.client.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });
        
        // Parse the completion response to extract JSON
        const completion = response.choices[0].message.content;
        
        try {
          const parsedResult = JSON.parse(completion);
          console.log(`✅ Retrieved details for UNSPSC code: ${code}`);
          return parsedResult;
        } catch (parseError) {
          console.error('Failed to parse JSON response from GPT:', parseError);
          console.log('⚠️ Falling back to mock data due to JSON parsing error');
          return this.getMockUnspscDetails(code);
        }
      } catch (apiError) {
        console.error('Error calling OpenAI API:', apiError.message);
        console.log('⚠️ Falling back to mock data due to API error');
        return this.getMockUnspscDetails(code);
      }
    } catch (error) {
      console.error('Error getting UNSPSC details with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Generate item descriptions based on item parameters
   * 
   * @param {Object} itemParams - The item parameters
   * @param {string} itemParams.manufacturer - Manufacturer name
   * @param {string} itemParams.partNumber - Manufacturer part number
   * @param {string} itemParams.category - Equipment category
   * @param {string} itemParams.subCategory - Equipment sub-category
   * @param {string} itemParams.unspscCode - UNSPSC code
   * @param {string} itemParams.unspscTitle - UNSPSC title
   * @param {string} itemParams.specifications - Additional specifications
   * @returns {Promise<Object>} - Promise resolving to generated descriptions
   */
  async generateItemDescriptions(itemParams) {
    try {
      console.log(`🔍 Generating descriptions for item:`, itemParams);
      
      // Check if API key is valid or in demo mode
      if (!this.apiKey || this.apiKey === 'your-openai-api-key-here' || !this.useOpenAI) {
        console.log('⚠️ Using demo mode with mock descriptions since no valid API key is provided');
        return this.getMockDescriptions(itemParams);
      }

      const systemPrompt = `
        You are an expert in industrial equipment and inventory management.
        Your task is to generate professional item descriptions for ERP systems.
        
        Based on the provided item information, generate:
        1. Short Description: Following NOUN, MODIFIER format (max 44 characters)
        2. Long Description: Detailed description including specifications (max 200 words)
        3. Standard Description: Technical description for procurement (max 100 words)
        
        Requirements:
        - Short description should be concise, following "NOUN, MODIFIER: size, class, material" format
        - Long description should include technical specifications, applications, and key features
        - Standard description should be suitable for procurement and technical documentation
        - Use industry-standard terminology
        - Be specific and accurate
        
        Return your answer in the following JSON format:
        {
          "shortDescription": "NOUN, MODIFIER: specifications",
          "longDescription": "Detailed technical description with specifications, applications, and features",
          "standardDescription": "Standard technical description for procurement"
        }
      `;
      
      const userPrompt = `Generate descriptions for this item:
        Manufacturer: ${itemParams.manufacturer || 'Unknown'}
        Part Number: ${itemParams.partNumber || 'N/A'}
        Category: ${itemParams.category || 'Unknown'}
        Sub-Category: ${itemParams.subCategory || 'Unknown'}
        UNSPSC Code: ${itemParams.unspscCode || 'N/A'}
        UNSPSC Title: ${itemParams.unspscTitle || 'N/A'}
        Additional Specifications: ${itemParams.specifications || 'None provided'}`;
      
      try {
        // Using new OpenAI client format
        const response = await this.client.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });
        
        // Parse the completion response to extract JSON
        const completion = response.choices[0].message.content;
        
        try {
          const parsedResult = JSON.parse(completion);
          console.log(`✅ Generated descriptions for item`);
          return parsedResult;
        } catch (parseError) {
          console.error('Failed to parse JSON response from GPT:', parseError);
          console.log('⚠️ Falling back to mock data due to JSON parsing error');
          return this.getMockDescriptions(itemParams);
        }
      } catch (apiError) {
        console.error('Error calling OpenAI API:', apiError.message);
        console.log('⚠️ Falling back to mock data due to API error');
        return this.getMockDescriptions(itemParams);
      }
    } catch (error) {
      console.error('Error generating item descriptions:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive item details based on basic description
   * 
   * @param {string} itemDescription - Basic description of the item
   * @param {Object} additionalInfo - Additional context (manufacturer, category, etc.)
   * @returns {Promise<Object>} - Promise resolving to comprehensive item details
   */
  async generateComprehensiveItemDetails(itemDescription, additionalInfo = {}) {
    try {
      console.log(`🤖 Generating comprehensive item details for: "${itemDescription}"`);
      
      if (!this.apiKey || this.apiKey === 'your-openai-api-key-here' || !this.useOpenAI) {
        console.log('⚠️ Using demo mode with mock comprehensive data');
        return this.getMockComprehensiveDetails(itemDescription);
      }      const systemPrompt = `
        You are an expert in industrial procurement and item master data management.
        Your task is to generate comprehensive, professional item details based on a basic description.
        
        For the given item description, you will:
        1. Generate appropriate short description (max 44 chars, NOUN + MODIFIER format)
        2. Generate detailed long description (technical specifications)
        3. Generate standard description (procurement-ready format)
        4. Suggest appropriate UNSPSC code and justify the selection
        5. Suggest equipment category and subcategory
        6. Suggest likely manufacturers and typical part numbers
        7. Suggest appropriate unit of measure
        8. Assess criticality level
        9. Suggest potential suppliers
        10. Generate a professional procurement email template
        
        Categories: VALVE, PUMP, MOTOR, ELECTRICAL, INSTRUMENTATION, PIPING, HARDWARE, CONSUMABLE, SAFETY, TOOLS, OTHER
        Subcategories: GATE, BALL, GLOBE, BUTTERFLY, CHECK (for VALVE), CENTRIFUGAL, POSITIVE, SUBMERSIBLE (for PUMP), etc.
        Units: EA, PCS, KG, G, L, ML, M, CM, MM, BOX, CTN, DZ, PR, SET
        Criticality: NO, LOW, MEDIUM, HIGH
        
        Return your answer in the following JSON format:
        {          "shortDescription": "NOUN, MODIFIER: concise description (max 44 chars)",
          "longDescription": "Detailed technical description with specifications",
          "standardDescription": "Standard procurement description format",
          "unspscSuggestion": {
            "code": "12345678",
            "title": "Suggested UNSPSC title",
            "confidence": 0.95,
            "justification": "Why this code is appropriate"
          },
          "equipmentCategory": "Primary category from list",
          "equipmentSubCategory": "Subcategory from list",
          "manufacturerSuggestions": ["Manufacturer 1", "Manufacturer 2", "Manufacturer 3"],
          "manufacturerPartNumber": "Typical part number format/example",
          "recommendedUOM": "Appropriate unit from list",
          "criticalityLevel": "Criticality level from list"
        }
      `;
      
      const userPrompt = `Generate comprehensive details for this item: "${itemDescription}"
      ${additionalInfo.manufacturer ? `Known manufacturer: ${additionalInfo.manufacturer}` : ''}
      ${additionalInfo.category ? `Suggested category: ${additionalInfo.category}` : ''}
      ${additionalInfo.specifications ? `Additional specs: ${additionalInfo.specifications}` : ''}`;
      
      try {
        const response = await this.client.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        });
        
        const completion = response.choices[0].message.content;
        
        try {
          const parsedResults = JSON.parse(completion);
          console.log(`✅ Generated comprehensive item details successfully`);
          return parsedResults;
        } catch (parseError) {
          console.error('Failed to parse JSON response from GPT:', parseError);
          console.log('⚠️ Falling back to mock data due to JSON parsing error');
          return this.getMockComprehensiveDetails(itemDescription);
        }
      } catch (apiError) {
        console.error('Error calling OpenAI API:', apiError.message);
        console.log('⚠️ Falling back to mock data due to API error');
        return this.getMockComprehensiveDetails(itemDescription);
      }
    } catch (error) {
      console.error('Error generating comprehensive item details:', error);
      throw error;
    }
  }

  /**
   * Generate supplier procurement email
   * 
   * @param {Object} itemData - Item details
   * @param {Object} requestDetails - Procurement request details
   * @returns {Promise<Object>} - Promise resolving to email template
   */
  async generateSupplierEmail(itemData, requestDetails = {}) {
    try {
      console.log(`📧 Generating supplier email for: "${itemData.shortDescription}"`);
      
      if (!this.apiKey || this.apiKey === 'your-openai-api-key-here' || !this.useOpenAI) {
        console.log('⚠️ Using demo mode with mock email data');
        return this.getMockSupplierEmail(itemData);
      }

      const systemPrompt = `
        You are an expert in professional procurement communications.
        Generate a professional, concise email to suppliers requesting quotations.
        
        The email should be:
        - Professional and formal
        - Include all necessary technical details
        - Request pricing, delivery time, and technical specifications
        - Include UNSPSC code for reference
        - Be ready to send without modification
        
        Return JSON format:
        {
          "subject": "Professional email subject",
          "body": "Complete professional email body",
          "attachmentRequests": ["List of documents to request from supplier"]
        }
      `;
      
      const userPrompt = `Generate supplier email for:
      Item: ${itemData.shortDescription}
      Description: ${itemData.longDescription || ''}
      UNSPSC: ${itemData.unspscCode || ''}
      Manufacturer: ${itemData.manufacturerName || 'Any suitable manufacturer'}
      Quantity: ${requestDetails.quantity || 'TBD'}
      Urgency: ${requestDetails.urgency || 'Standard'}
      Special requirements: ${requestDetails.specialRequirements || 'None'}`;
      
      try {
        const response = await this.client.chat.completions.create({
          model: "gpt-4.1-nano-2025-04-14",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });
        
        const completion = response.choices[0].message.content;
        const parsedResults = JSON.parse(completion);
        console.log(`✅ Generated supplier email successfully`);
        return parsedResults;
      } catch (error) {
        console.error('Error generating supplier email:', error);
        return this.getMockSupplierEmail(itemData);
      }
    } catch (error) {
      console.error('Error in generateSupplierEmail:', error);
      throw error;
    }
  }

  /**
   * Get mock UNSPSC results for demo mode when no valid API key is available
   * 
   * @param {string} query - The search query
   * @returns {Array} - Array of mock UNSPSC code results
   */
  getMockUnspscResults(query) {
    const mockResults = [
      {
        unspscCode: "43211503",
        segment: { code: "43", title: "Information Technology Broadcasting and Telecommunications" },
        family: { code: "4321", title: "Computer Equipment and Accessories" },
        class: { code: "432115", title: "Computers" },
        commodity: { code: "43211503", title: "Notebook computers" },
        fullTitle: "Notebook computers",
        confidence: 0.95,
        explanation: "This code is appropriate for laptop computers and portable computing devices."
      },
      {
        unspscCode: "43211508",
        segment: { code: "43", title: "Information Technology Broadcasting and Telecommunications" },
        family: { code: "4321", title: "Computer Equipment and Accessories" },
        class: { code: "432115", title: "Computers" },
        commodity: { code: "43211508", title: "Personal computers" },
        fullTitle: "Personal computers",
        confidence: 0.9,
        explanation: "This code is appropriate for desktop computers and personal computing systems."
      },
      {
        unspscCode: "43211509",
        segment: { code: "43", title: "Information Technology Broadcasting and Telecommunications" },
        family: { code: "4321", title: "Computer Equipment and Accessories" },
        class: { code: "432115", title: "Computers" },
        commodity: { code: "43211509", title: "Tablet computers" },
        fullTitle: "Tablet computers",
        confidence: 0.85,
        explanation: "This code is appropriate for tablet computers and touchscreen devices."
      }
    ];

    // Filter results if query has specific keywords
    if (query.toLowerCase().includes('laptop') || query.toLowerCase().includes('notebook')) {
      return [mockResults[0]];
    } else if (query.toLowerCase().includes('desktop') || query.toLowerCase().includes('pc')) {
      return [mockResults[1]];
    } else if (query.toLowerCase().includes('tablet') || query.toLowerCase().includes('ipad')) {
      return [mockResults[2]];
    }

    return mockResults;
  }
  /**
   * Get mock UNSPSC details for demo mode when no valid API key is available
   * 
   * @param {string} code - The UNSPSC code
   * @returns {Object} - Mock UNSPSC code details
   */
  getMockUnspscDetails(code) {
    const segmentCode = code.substring(0, 2);
    const familyCode = code.substring(0, 4);
    const classCode = code.substring(0, 6);
      // Enhanced mock data with proper hierarchy (titles only, no descriptions)
    const mockDetails = {
      unspscCode: code,
      segment: {
        code: segmentCode,
        title: this.getSegmentDescription(segmentCode)
      },
      family: {
        code: familyCode,
        title: `Family ${familyCode}`
      },
      class: {
        code: classCode,
        title: `Class ${classCode}`
      },
      commodity: {
        code: code,
        title: `Commodity ${code}`
      },
      fullTitle: `UNSPSC Code ${code}`,
      description: `This UNSPSC code represents a specific commodity classification within ${this.getSegmentDescription(segmentCode)}`,
      examples: [
        `Example product for ${code}`,
        `Related item for ${code}`,
        `Similar commodity for ${code}`
      ]
    };

    return mockDetails;
  }

  /**
   * Get segment description for a given segment code
   * @param {string} segmentCode - 2-digit segment code
   * @returns {string} - Description of the segment
   */
  getSegmentDescription(segmentCode) {
    const segmentDescriptions = {
      '10': 'Live Animals and Animal Products',
      '11': 'Live Plant and Animal Materials and Accessories and Supplies',
      '12': 'Chemicals including Bio Chemicals and Gas Materials',
      '13': 'Resin and Rosin and Rubber and Foam and Film and Elastomeric Materials',
      '14': 'Paper Materials and Products',
      '15': 'Fuels and Fuel Additives and Lubricants and Anti corrosive Materials',
      '20': 'Mining and Well Drilling Machinery and Accessories',
      '21': 'Farming and Fishing and Forestry and Wildlife Machinery and Accessories',
      '22': 'Building and Construction and Maintenance Machinery and Accessories',
      '23': 'Material Handling and Conditioning and Storage Machinery and their Accessories and Supplies',
      '24': 'Commercial and Military and Private Vehicles and their Accessories and Components',
      '25': 'Tools and General Machinery',
      '26': 'Power Generation and Distribution Machinery and Accessories',
      '27': 'Tools and General Machinery',
      '30': 'Structures and Building and Construction and Manufacturing Components and Supplies',
      '31': 'Manufacturing Components and Supplies',
      '32': 'Electronic Components and Supplies',
      '39': 'Electrical Systems and Lighting and Components and Accessories and Supplies',
      '40': 'Distribution and Conditioning Systems and Equipment and Components',
      '41': 'Laboratory and Measuring and Observing and Testing Equipment',
      '42': 'Medical Equipment and Accessories and Supplies',
      '43': 'Information Technology Broadcasting and Telecommunications',
      '44': 'Office Equipment and Accessories and Supplies',
      '45': 'Printing and Photographic and Audio and Visual Equipment and Supplies',
      '46': 'Musical Instruments and Games and Toys and Arts and Crafts and Educational Equipment and Materials and Accessories and Supplies',
      '47': 'Cleaning Equipment and Supplies',
      '48': 'Service Industry Machinery and Equipment and Supplies',
      '49': 'Transportation and Storage and Mail Services',
      '50': 'Food Beverage and Tobacco Products',
      '51': 'Drugs and Pharmaceutical Products',
      '52': 'Domestic Appliances and Supplies and Consumer Electronic Products',
      '53': 'Apparel and Luggage and Personal Care Products',
      '54': 'Personal Safety and Protection',
      '55': 'Printed Media',
      '56': 'Furniture and Furnishings',
      '60': 'Musical Recording',
      '70': 'Farming and Fishing and Forestry and Wildlife Contracting Services',
      '71': 'Mining and oil and gas services',
      '72': 'Building and Construction and Maintenance Services',
      '73': 'Industrial Production and Manufacturing Services',
      '76': 'Industrial Cleaning Services',
      '77': 'Environmental Services',
      '78': 'Transportation and Storage and Mail Services',
      '80': 'Management and Business Professionals and Administrative Services',
      '81': 'Engineering and Research and Technology Based Services',
      '82': 'Editorial and Design and Graphic and Fine Art Services',
      '83': 'Public Utilities and Public Sector Related Services',
      '84': 'Financial and Insurance Services',
      '85': 'Healthcare Services',
      '86': 'Education and Training Services',
      '90': 'Travel and Food and Lodging and Entertainment Services',
      '91': 'Personal and Domestic Services',
      '92': 'National Defense and Public Order and Security and Safety Services',
      '93': 'Politics and Civic Affairs Services',
      '94': 'Organizations and Clubs',
      '95': 'Land and Buildings and Structures and Facilities'
    };

    return segmentDescriptions[segmentCode] || `Segment ${segmentCode}`;
  }

  /**
   * Get mock comprehensive item details for demo mode when no valid API key is available
   * 
   * @param {string} itemDescription - The item description
   * @returns {Object} - Mock comprehensive item details
   */
  getMockComprehensiveDetails(itemDescription) {
    const lowerDesc = itemDescription.toLowerCase();
    
    // Determine category based on description keywords
    let category = 'OTHER';
    let subCategory = 'MISC';
    let uom = 'EA';
    let criticality = 'LOW';
    let unspscCode = '90000000';
    let manufacturers = ['Generic Manufacturer', 'Standard Industries', 'Quality Corp'];
    let suppliers = ['Local Supplier', 'Industrial Supply Co', 'Equipment Distributors'];
    
    if (lowerDesc.includes('pump')) {
      category = 'PUMP';
      subCategory = 'CENTRIFUGAL';
      uom = 'EA';
      criticality = 'HIGH';
      unspscCode = '40101702';
      manufacturers = ['Grundfos', 'Flowserve', 'KSB'];
      suppliers = ['Pump Supply Co', 'Industrial Pumps Ltd', 'Flow Solutions'];
    } else if (lowerDesc.includes('valve')) {
      category = 'VALVE';
      subCategory = 'BALL';
      uom = 'EA';
      criticality = 'HIGH';
      unspscCode = '40141706';
      manufacturers = ['Emerson', 'Cameron', 'Flowserve'];
      suppliers = ['Valve World', 'Industrial Controls', 'Flow Control Systems'];
    } else if (lowerDesc.includes('motor')) {
      category = 'MOTOR';
      subCategory = 'AC';
      uom = 'EA';
      criticality = 'HIGH';
      unspscCode = '26111604';
      manufacturers = ['ABB', 'Siemens', 'WEG'];
      suppliers = ['Electric Motors Inc', 'Power Solutions', 'Motor Supply Co'];
    } else if (lowerDesc.includes('computer') || lowerDesc.includes('laptop') || lowerDesc.includes('printer')) {
      category = 'OTHER';
      subCategory = 'MISC';
      uom = 'EA';
      criticality = 'LOW';
      unspscCode = '43211503';
      manufacturers = ['Dell', 'HP', 'Lenovo'];
      suppliers = ['Tech Supply', 'Computer World', 'IT Solutions'];
    } else if (lowerDesc.includes('tool')) {
      category = 'TOOLS';
      subCategory = 'MISC';
      uom = 'PCS';
      criticality = 'LOW';
      unspscCode = '27111801';
      manufacturers = ['Makita', 'DeWalt', 'Bosch'];
      suppliers = ['Tool Supply Co', 'Industrial Tools', 'Equipment Express'];
    }
    
    // Generate descriptions
    const shortDesc = itemDescription.length > 44 
      ? itemDescription.substring(0, 41) + '...' 
      : itemDescription.toUpperCase();
      return {
      shortDescription: shortDesc,
      longDescription: `Professional ${itemDescription} with high-quality construction and reliable performance. Suitable for industrial and commercial applications. Meets industry standards and specifications.`,
      standardDescription: `Standard ${itemDescription} for procurement purposes. Complies with relevant specifications and quality requirements.`,
      unspscSuggestion: {
        code: unspscCode,
        title: `UNSPSC ${unspscCode} - ${itemDescription}`,
        confidence: 0.9,
        justification: `This UNSPSC code is appropriate for ${itemDescription} based on standard classification guidelines.`
      },
      equipmentCategory: category,
      equipmentSubCategory: subCategory,
      manufacturerSuggestions: manufacturers,
      manufacturerPartNumber: `${manufacturers[0].toUpperCase().replace(/\s+/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      recommendedUOM: uom,
      criticalityLevel: criticality
    };
  }

  /**
   * Get mock supplier email for demo mode when no valid API key is available
   * 
   * @param {Object} itemData - The item data
   * @returns {Object} - Mock supplier email
   */
  getMockSupplierEmail(itemData) {
    const itemName = itemData.shortDescription || 'Industrial Item';
    const manufacturer = itemData.manufacturerName || 'Various manufacturers';
    const unspscCode = itemData.unspscCode || 'TBD';
    
    return {
      subject: `RFQ - ${itemName} (UNSPSC: ${unspscCode})`,
      body: `Dear Supplier,

We are requesting a quotation for the following item:

Item Description: ${itemName}
${itemData.longDescription ? `Detailed Description: ${itemData.longDescription}\n` : ''}UNSPSC Code: ${unspscCode}
Preferred Manufacturer: ${manufacturer}
Quantity: TBD (Please provide quantity breaks)

Please provide the following information:
- Unit price and quantity discounts
- Delivery lead time
- Technical specifications and datasheet
- Warranty terms and conditions
- Payment terms
- Availability status

We appreciate your prompt response and look forward to establishing a successful business relationship.

Best regards,
Procurement Team

Note: This is an automated RFQ generated by our ERP system. Please reply with complete technical and commercial details.`,
      attachmentRequests: [
        'Technical Datasheet',
        'Product Catalog',
        'Compliance Certificates',
        'Warranty Information'
      ]
    };
  }
}

module.exports = OpenAIService;
