const express = require('express');
const axios = require('axios');
const router = express.Router();

// Connect to an external UNSPSC API (mock implementation)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // In a real implementation, this would call an external API
    // For now, we'll simulate a response with a timeout
    setTimeout(() => {
      // Mock search results based on the query
      const results = mockSearchResults(query);
      res.json(results);
    }, 500);
  } catch (error) {
    console.error('Error searching external UNSPSC API:', error);
    res.status(500).json({ message: 'Failed to search UNSPSC codes', error: error.message });
  }
});

// Mock search function that returns results based on keywords
function mockSearchResults(query) {
  query = query.toLowerCase();
  
  const allResults = [
    {
      code: '31150000',
      title: 'Bearings and bushings and wheels and gears',
      level: 'FAMILY'
    },
    {
      code: '31151500',
      title: 'Bearings',
      level: 'CLASS'
    },
    {
      code: '31151501',
      title: 'Ball bearings',
      level: 'COMMODITY'
    },
    {
      code: '43210000',
      title: 'Computer Equipment and Accessories',
      level: 'FAMILY'
    },
    {
      code: '43211500',
      title: 'Computers',
      level: 'CLASS'
    },
    {
      code: '43211501',
      title: 'Desktop computers',
      level: 'COMMODITY'
    },
    {
      code: '43211502',
      title: 'Laptop computers',
      level: 'COMMODITY'
    },
    {
      code: '43211503',
      title: 'Notebooks',
      level: 'COMMODITY'
    },
    {
      code: '43211504',
      title: 'Tablet computers',
      level: 'COMMODITY'
    },
    {
      code: '43211505',
      title: 'Servers',
      level: 'COMMODITY'
    },
    {
      code: '44120000',
      title: 'Office Supplies',
      level: 'FAMILY'
    },
    {
      code: '44121700',
      title: 'Writing instruments',
      level: 'CLASS'
    },
    {
      code: '44121701',
      title: 'Pens',
      level: 'COMMODITY'
    },
    {
      code: '44121702',
      title: 'Pencils',
      level: 'COMMODITY'
    }
  ];
  
  // Filter results based on the search query
  return allResults.filter(item => 
    item.title.toLowerCase().includes(query) || 
    item.code.includes(query)
  );
}

module.exports = router;
