@echo off
echo.
echo ===========================================
echo  UNSPSC Description Optimization Utility
echo ===========================================
echo.
echo This script will optimize UNSPSC code descriptions in the database
echo by truncating overly long descriptions for better performance.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Running optimization script...
node optimize-unspsc-descriptions.js

echo.
echo Script completed. Press any key to exit...
pause > nul
