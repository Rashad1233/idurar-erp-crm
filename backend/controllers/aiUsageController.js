const fs = require('fs').promises;
const path = require('path');

// Simple in-memory usage tracking (in production, use a database)
let usageStats = {
  daily: {},
  monthly: {},
  userStats: {}
};

// Load usage stats from file on startup
const loadUsageStats = async () => {
  try {
    const statsPath = path.join(__dirname, '../data/ai-usage.json');
    const data = await fs.readFile(statsPath, 'utf8');
    usageStats = JSON.parse(data);
  } catch (error) {
    console.log('No existing usage stats found, starting fresh');
  }
};

// Save usage stats to file
const saveUsageStats = async () => {
  try {
    const statsPath = path.join(__dirname, '../data/ai-usage.json');
    await fs.mkdir(path.dirname(statsPath), { recursive: true });
    await fs.writeFile(statsPath, JSON.stringify(usageStats, null, 2));
  } catch (error) {
    console.error('Failed to save usage stats:', error);
  }
};

// Track AI usage
const trackUsage = (userId, feature, tokens, cost) => {
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);
  
  // Initialize structures if needed
  if (!usageStats.daily[today]) usageStats.daily[today] = {};
  if (!usageStats.monthly[month]) usageStats.monthly[month] = {};
  if (!usageStats.userStats[userId]) usageStats.userStats[userId] = { daily: {}, monthly: {} };
  if (!usageStats.userStats[userId].daily[today]) usageStats.userStats[userId].daily[today] = {};
  if (!usageStats.userStats[userId].monthly[month]) usageStats.userStats[userId].monthly[month] = {};
  
  // Track system-wide stats
  if (!usageStats.daily[today][feature]) {
    usageStats.daily[today][feature] = { count: 0, tokens: 0, cost: 0 };
  }
  if (!usageStats.monthly[month][feature]) {
    usageStats.monthly[month][feature] = { count: 0, tokens: 0, cost: 0 };
  }
  
  // Track user stats
  if (!usageStats.userStats[userId].daily[today][feature]) {
    usageStats.userStats[userId].daily[today][feature] = { count: 0, tokens: 0, cost: 0 };
  }
  if (!usageStats.userStats[userId].monthly[month][feature]) {
    usageStats.userStats[userId].monthly[month][feature] = { count: 0, tokens: 0, cost: 0 };
  }
  
  // Update counts
  usageStats.daily[today][feature].count++;
  usageStats.daily[today][feature].tokens += tokens;
  usageStats.daily[today][feature].cost += cost;
  
  usageStats.monthly[month][feature].count++;
  usageStats.monthly[month][feature].tokens += tokens;
  usageStats.monthly[month][feature].cost += cost;
  
  usageStats.userStats[userId].daily[today][feature].count++;
  usageStats.userStats[userId].daily[today][feature].tokens += tokens;
  usageStats.userStats[userId].daily[today][feature].cost += cost;
  
  usageStats.userStats[userId].monthly[month][feature].count++;
  usageStats.userStats[userId].monthly[month][feature].tokens += tokens;
  usageStats.userStats[userId].monthly[month][feature].cost += cost;
  
  // Save stats asynchronously
  saveUsageStats();
};

// Calculate cost based on tokens and feature
const calculateCost = (feature, tokens, imageSize = 0) => {
  const costs = {
    'image-analysis': {
      input: 0.00000015, // GPT-4.1-nano: $0.15 per 1M input tokens (ultra-cheap!)
      output: 0.0000006, // GPT-4.1-nano: $0.60 per 1M output tokens  
      image: imageSize > 0 ? 0.001 : 0 // GPT-4.1-nano vision: much cheaper than 4o
    },
    'description-generation': {
      input: 0.0000015, // GPT-3.5-turbo: $1.5 per 1M input tokens
      output: 0.000002, // GPT-3.5-turbo: $2 per 1M output tokens
      image: 0
    },
    'smart-search': {
      input: 0.0000015,
      output: 0.000002,
      image: 0
    }
  };
  
  const featureCosts = costs[feature] || costs['description-generation'];
  
  // Estimate input/output split (typically 70% input, 30% output)
  const inputTokens = Math.floor(tokens * 0.7);
  const outputTokens = tokens - inputTokens;
  
  return (inputTokens * featureCosts.input) + (outputTokens * featureCosts.output) + featureCosts.image;
};

// Get usage statistics
exports.getUsageStats = async (req, res) => {
  try {
    const { userId, period = 'monthly', feature } = req.query;
    
    let stats = {};
    const currentMonth = new Date().toISOString().substring(0, 7);
    const today = new Date().toISOString().split('T')[0];
    
    if (userId) {
      // User-specific stats
      const userStats = usageStats.userStats[userId] || { daily: {}, monthly: {} };
      if (period === 'daily') {
        stats = userStats.daily[today] || {};
      } else {
        stats = userStats.monthly[currentMonth] || {};
      }
    } else {
      // System-wide stats
      if (period === 'daily') {
        stats = usageStats.daily[today] || {};
      } else {
        stats = usageStats.monthly[currentMonth] || {};
      }
    }
    
    // Calculate totals
    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;
    
    Object.values(stats).forEach(stat => {
      totalCost += stat.cost || 0;
      totalTokens += stat.tokens || 0;
      totalRequests += stat.count || 0;
    });
    
    res.json({
      success: true,
      data: {
        period,
        userId,
        stats,
        totals: {
          cost: totalCost,
          tokens: totalTokens,
          requests: totalRequests
        },
        costBreakdown: {
          estimated: {
            imageAnalysis: stats['image-analysis']?.cost || 0,
            descriptionGeneration: stats['description-generation']?.cost || 0,
            smartSearch: stats['smart-search']?.cost || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving usage statistics'
    });
  }
};

// Export tracking functions
exports.trackUsage = trackUsage;
exports.calculateCost = calculateCost;
exports.loadUsageStats = loadUsageStats;

// Initialize on module load
loadUsageStats();
