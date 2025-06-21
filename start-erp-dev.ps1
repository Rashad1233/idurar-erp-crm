# Start both backend and frontend servers
echo "====== ERP System Starter ======"
echo "This script will start both the backend and frontend servers."
echo ""

# Check if there's already a backend server running
$backendRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*backend*index.js*" }
if ($backendRunning) {
    echo "Backend server is already running."
} else {
    echo "Starting backend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\rasha\Desktop\test erp\backend'; node src/index.js"
    echo "Backend server started."
}

echo ""
echo "Starting frontend development server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\rasha\Desktop\test erp\frontend'; npm run dev"
echo "Frontend server started."

echo ""
echo "====== ERP System Started ======"
echo "Both servers are now running."
echo "- Backend: http://localhost:8888/"
echo "- Frontend: http://localhost:3001/"
echo ""
echo "You can now access the application at: http://localhost:3001/"
