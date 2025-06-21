// Delegation of Financial Authority (DoFA) configuration
// This file defines approval thresholds and approvers for financial transactions

export const dofaThresholds = [
  {
    threshold: 500,
    approver: "Farhad",
    level: 1,
    description: "First level approval - up to $500"
  },
  {
    threshold: 3000,
    approver: "Rashad",
    level: 2,
    description: "Second level approval - $501 to $3,000"
  },
  {
    threshold: 5000,
    approver: "Fakhri",
    level: 3,
    description: "Third level approval - $3,001 to $5,000"
  },
  {
    threshold: 10000,
    approver: "Samira",
    level: 4,
    description: "Fourth level approval - $5,001 to $10,000"
  },
  {
    threshold: Infinity,
    approver: "Rufat",
    level: 5,
    description: "Final approval - above $10,000"
  }
];

// Helper function to get the required approval levels based on amount
export const getRequiredApprovalLevels = (amount) => {
  const requiredLevels = [];
  
  for (const threshold of dofaThresholds) {
    if (amount <= threshold.threshold) {
      requiredLevels.push(threshold);
      break;
    }
    requiredLevels.push(threshold);
  }
  
  return requiredLevels;
};

// Helper function to determine if a user is authorized to approve at a specific level
export const isUserAuthorizedForLevel = (userId, level) => {
  const thresholdEntry = dofaThresholds.find(entry => entry.level === level);
  return thresholdEntry && thresholdEntry.approver === userId;
};

// Helper function to get the next approval level for a document
export const getNextApprovalLevel = (currentApprovals) => {
  if (!currentApprovals || currentApprovals.length === 0) {
    return 1; // First approval level
  }
  
  // Find the highest approval level so far
  const highestLevel = Math.max(...currentApprovals.map(approval => approval.level));
  
  // Return the next level, unless we've reached the maximum
  return highestLevel < dofaThresholds.length ? highestLevel + 1 : null;
};

// Map cost centers to approvers
export const costCenterApprovers = {
  "CC001": ["Farhad", "Rashad"],
  "CC002": ["Fakhri", "Samira"],
  "CC003": ["Rashad", "Rufat"],
  // Add more cost centers and their approvers as needed
};

// Helper function to get approvers for a cost center
export const getApproversForCostCenter = (costCenter) => {
  return costCenterApprovers[costCenter] || [];
};
