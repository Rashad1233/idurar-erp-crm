// Script to enhance the Purchase Requisition API to include user info
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { User } = require('../models/sequelize');

// Mount this in your route system to enhance PR data with user info
router.use(protect);

// Middleware to enhance purchase requisition data with user info
const enhancePRWithUserInfo = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = async function(data) {
    try {
      // Check if we have PR data to enhance
      if (data && (data.result || data.data) && !req.query.skipEnhance) {
        const prData = data.result || data.data;
        
        // If single PR object
        if (prData && !Array.isArray(prData)) {
          await enhanceSinglePR(prData);
        }
        // If array of PR objects
        else if (Array.isArray(prData)) {
          await Promise.all(prData.map(pr => enhanceSinglePR(pr)));
        }
      }
      
      return originalJson.call(this, data);
    } catch (err) {
      console.error('Error enhancing PR data with user info:', err);
      return originalJson.call(this, data);
    }
  };
  
  next();
};

async function enhanceSinglePR(pr) {
  if (!pr) return;
  
  try {    // Enhance approver info
    if (pr.approverId || pr.approver) {
      const approverId = typeof pr.approver === 'object' ? pr.approver.id : (pr.approverId || pr.approver);
      console.log(`Enhancing PR approver with ID: ${approverId}`);
      
      if (approverId && approverId !== 'null') {
        const approverUser = await User.findByPk(approverId, {
          attributes: ['id', 'name', 'email', 'role']
        });
          if (approverUser) {
          console.log(`Found approver user: ${approverUser.name}`);
          pr.approver = {
            id: approverUser.id,
            name: approverUser.name, // Use actual name from database
            email: approverUser.email,
            role: approverUser.role
          };
          // Make sure approverId is also set correctly
          pr.approverId = approverUser.id;
        } else {          console.log(`Approver user not found for ID: ${approverId}`);
          pr.approver = { id: approverId, name: `User-${approverId.substr(0, 4)}` };
          // Make sure approverId is also set correctly
          pr.approverId = approverId;
        }
      }
    }    // Enhance currentApprover info
    if (pr.currentApproverId) {
      console.log(`Enhancing PR currentApprover with ID: ${pr.currentApproverId}`);
      
      const currentApproverUser = await User.findByPk(pr.currentApproverId, {
        attributes: ['id', 'name', 'email', 'role']
      });
        if (currentApproverUser) {
        console.log(`Found currentApprover user: ${currentApproverUser.name}`);
        pr.currentApprover = {
          id: currentApproverUser.id,
          name: currentApproverUser.name, // Use actual name from database
          email: currentApproverUser.email,
          role: currentApproverUser.role
        };
      } else {        console.log(`Current approver user not found for ID: ${pr.currentApproverId}`);
        pr.currentApprover = { 
          id: pr.currentApproverId, 
          name: `User-${pr.currentApproverId.substr(0, 4)}` 
        };
      }
    }
      // Enhance requestor/creator info
    if (pr.createdBy || pr.requestorId) {
      const creatorId = pr.requestorId || pr.createdBy;
      console.log(`Enhancing PR requestor/creator with ID: ${creatorId}`);
      
      if (creatorId && creatorId !== 'null') {
        const creatorUser = await User.findByPk(creatorId, {
          attributes: ['id', 'name', 'email', 'role']
        });
          if (creatorUser) {
          console.log(`Found requestor user: ${creatorUser.name}`);
          pr.requestor = {
            id: creatorUser.id,
            name: creatorUser.name, // Use actual name from database
            email: creatorUser.email,
            role: creatorUser.role
          };
          // Make sure requestorId is also set correctly
          pr.requestorId = creatorUser.id;
        } else {          console.log(`Requestor user not found for ID: ${creatorId}`);
          pr.requestor = { id: creatorId, name: `User-${creatorId.substr(0, 4)}` };
          // Make sure requestorId is also set correctly
          pr.requestorId = creatorId;
        }
      }
    }
    
    // Enhance approval history
    if (pr.approvals && pr.approvals.length) {
      await Promise.all(pr.approvals.map(async (approval) => {        if (approval.approverId) {
          const approverUser = await User.findByPk(approval.approverId, {
            attributes: ['id', 'name', 'email', 'role']
          });
          
          if (approverUser) {
            approval.approver = {
              id: approverUser.id,
              name: approverUser.name, // Use actual name from database
              email: approverUser.email,
              role: approverUser.role
            };
          } else {
            approval.approver = { id: approval.approverId, name: `Approver (ID: ${approval.approverId})` };
          }
        }
      }));
    }
  } catch (err) {
    console.error('Error enhancing PR data:', err);  }
}

// Export the middleware directly
module.exports = enhancePRWithUserInfo;
