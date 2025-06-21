-- Rename table to Suppliers (replace 'your_current_table_name' with the actual name)
ALTER TABLE "your_current_table_name" RENAME TO "Suppliers";

-- If you also need to rename the foreign key constraints, use these commands:
-- (Replace 'your_current_table_name' with the actual name you used)

-- Drop existing foreign key constraints
ALTER TABLE "Suppliers" DROP CONSTRAINT IF EXISTS fk_your_current_table_name_createdbyid;
ALTER TABLE "Suppliers" DROP CONSTRAINT IF EXISTS fk_your_current_table_name_updatedbyid;

-- Add new foreign key constraints with correct naming
ALTER TABLE "Suppliers" 
ADD CONSTRAINT fk_suppliers_createdbyid 
FOREIGN KEY ("createdById") 
REFERENCES "Users"("id") 
ON UPDATE CASCADE 
ON DELETE NO ACTION;

ALTER TABLE "Suppliers" 
ADD CONSTRAINT fk_suppliers_updatedbyid 
FOREIGN KEY ("updatedById") 
REFERENCES "Users"("id") 
ON UPDATE CASCADE 
ON DELETE NO ACTION;
