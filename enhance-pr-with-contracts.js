// Script to enhance Purchase Requisition to use supplier contracts for pricing
const { sequelize, PurchaseRequisition, PurchaseRequisitionItem, Contract, ContractItem, Supplier } = require('./backend/models/sequelize');

async function enhancePurchaseRequisitionPricing() {
  try {
    console.log('Starting to enhance Purchase Requisition pricing with contract data...');
    
    // 1. Add contract reference to PurchaseRequisitionItem model if not exists
    await sequelize.query(`
      ALTER TABLE "PurchaseRequisitionItems" 
      ADD COLUMN IF NOT EXISTS "contractId" UUID,
      ADD COLUMN IF NOT EXISTS "contractItemId" UUID,
      ADD COLUMN IF NOT EXISTS "contractPrice" DECIMAL(10, 2)
    `);
    
    console.log('Added contract reference columns to PurchaseRequisitionItems table');
    
    // 2. Create a view or function to easily get contract pricing for items
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION get_item_contract_price(item_id UUID, supplier_id UUID)
      RETURNS TABLE(
        contract_id UUID,
        contract_item_id UUID,
        unit_price DECIMAL(10, 2),
        currency VARCHAR(10),
        contract_number VARCHAR(50),
        contract_name VARCHAR(255)
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          c.id as contract_id,
          ci.id as contract_item_id,
          ci."unitPrice" as unit_price,
          ci.currency,
          c."contractNumber" as contract_number,
          c."contractName" as contract_name
        FROM "Contracts" c
        JOIN "ContractItems" ci ON c.id = ci."contractId"
        WHERE ci."itemId" = item_id
          AND c."supplierId" = supplier_id
          AND c.status = 'active'
          AND c."endDate" >= CURRENT_DATE
        ORDER BY c."startDate" DESC
        LIMIT 1;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('Created function to get contract pricing for items');
    
    // 3. Update existing Purchase Requisition Items with contract prices where applicable
    const purchaseRequisitions = await PurchaseRequisition.findAll({
      where: {
        status: ['draft', 'submitted']
      },
      include: [
        {
          model: Supplier,
          as: 'supplier'
        }
      ]
    });
    
    console.log(`Found ${purchaseRequisitions.length} active purchase requisitions to update`);
    
    for (const pr of purchaseRequisitions) {
      if (!pr.supplier) {
        console.log(`PR ${pr.id} does not have a supplier assigned, skipping`);
        continue;
      }
      
      const prItems = await PurchaseRequisitionItem.findAll({
        where: {
          purchaseRequisitionId: pr.id
        }
      });
      
      console.log(`Processing ${prItems.length} items for PR ${pr.prNumber}`);
      
      for (const item of prItems) {
        // Get contract price for this item and supplier
        const [contractPriceResults] = await sequelize.query(`
          SELECT * FROM get_item_contract_price($1, $2)
        `, {
          bind: [item.itemId, pr.supplierId]
        });
        
        if (contractPriceResults.length > 0) {
          const contractPrice = contractPriceResults[0];
          
          // Update the item with contract pricing
          await item.update({
            contractId: contractPrice.contract_id,
            contractItemId: contractPrice.contract_item_id,
            contractPrice: contractPrice.unit_price,
            // If price is not set, use contract price as the default
            price: item.price || contractPrice.unit_price,
            unitPrice: item.unitPrice || contractPrice.unit_price,
            currency: contractPrice.currency || pr.currency || 'USD'
          });
          
          console.log(`Updated item ${item.id} with contract price ${contractPrice.unit_price} from contract ${contractPrice.contract_number}`);
        } else {
          console.log(`No contract price found for item ${item.id} with supplier ${pr.supplierId}`);
        }
      }
    }
    
    console.log('Successfully enhanced Purchase Requisition pricing with contract data!');
    
  } catch (error) {
    console.error('Error enhancing Purchase Requisition pricing:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
enhancePurchaseRequisitionPricing();
