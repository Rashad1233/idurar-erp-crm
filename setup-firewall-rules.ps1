# Run this script as Administrator to allow ERP access from Android devices
Write-Host "Setting up Windows Firewall rules for ERP Android access..." -ForegroundColor Cyan

# Add firewall rules for the ERP application
Write-Host "Adding firewall rule for Frontend (port 3000)..." -ForegroundColor Green
netsh advfirewall firewall add rule name="ERP Frontend Port 3000" dir=in action=allow protocol=TCP localport=3000

Write-Host "Adding firewall rule for Backend (port 8888)..." -ForegroundColor Green  
netsh advfirewall firewall add rule name="ERP Backend Port 8888" dir=in action=allow protocol=TCP localport=8888

Write-Host "Firewall rules added successfully!" -ForegroundColor Green
Write-Host "You can now access the ERP system from your Android device at:" -ForegroundColor Magenta
Write-Host "http://192.168.0.200:3000" -ForegroundColor Yellow

# List the rules to confirm they were added
Write-Host "`nConfirming firewall rules:" -ForegroundColor Cyan
netsh advfirewall firewall show rule name="ERP Frontend Port 3000"
netsh advfirewall firewall show rule name="ERP Backend Port 8888"
