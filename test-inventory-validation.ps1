# Test-ItemMaster-Validation.ps1
# PowerShell script to test inventory field validation

Write-Host "Testing inventory field validation..." -ForegroundColor Cyan

# Sample inventory data with required fields
$validInventory = @{
    itemMasterId = "valid-id"  # Replace with a real ID
    unitPrice = 99.99
    shortDescription = "Test Item"
    criticality = "MEDIUM"
    unspscCode = "00000000" 
    uom = "EA"
    physicalBalance = 10
    condition = "A"
}

# Function to validate inventory data
function Test-InventoryValidation {
    param (
        [Parameter(Mandatory=$true)]
        [hashtable]$inventoryData,
        
        [Parameter(Mandatory=$false)]
        [string]$fieldToRemove = $null
    )
    
    # Make a copy of the inventory data
    $testData = $inventoryData.Clone()
    
    # Remove a field if specified
    if ($fieldToRemove -and $testData.ContainsKey($fieldToRemove)) {
        $testData.Remove($fieldToRemove)
        Write-Host "Testing validation without '$fieldToRemove' field..." -ForegroundColor Yellow
    } else {
        Write-Host "Testing validation with all required fields..." -ForegroundColor Yellow
    }
    
    # Output the test data
    Write-Host "Inventory data:" -ForegroundColor Gray
    $testData.GetEnumerator() | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
    }
    
    # Check for required fields
    $requiredFields = @("itemMasterId", "unitPrice", "shortDescription", "criticality", "unspscCode", "uom")
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $testData.ContainsKey($field) -or [string]::IsNullOrEmpty($testData[$field])) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -gt 0) {
        Write-Host "❌ Validation failed: Missing required fields: $($missingFields -join ', ')" -ForegroundColor Red
        return $false
    } else {
        Write-Host "✅ Validation passed: All required fields are present" -ForegroundColor Green
        return $true
    }
}

# Test with all required fields
Test-InventoryValidation -inventoryData $validInventory

Write-Host "`n--- Testing individual field validation ---" -ForegroundColor Magenta

# Test removing each required field one by one
@("itemMasterId", "unitPrice", "shortDescription", "criticality", "unspscCode", "uom") | ForEach-Object {
    Write-Host "`n"
    Test-InventoryValidation -inventoryData $validInventory -fieldToRemove $_
}

Write-Host "`nTesting complete. These validation tests simulate the checks that occur" -ForegroundColor Cyan
Write-Host "when creating or updating inventory items in the application." -ForegroundColor Cyan
