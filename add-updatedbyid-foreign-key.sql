-- Add foreign key constraint for updatedById column in Suppliers table
ALTER TABLE "Suppliers" 
ADD CONSTRAINT fk_suppliers_updatedbyid 
FOREIGN KEY ("updatedById") 
REFERENCES "Users"("id") 
ON UPDATE CASCADE 
ON DELETE NO ACTION;
