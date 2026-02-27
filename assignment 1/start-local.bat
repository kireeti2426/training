@echo off
echo.
echo ====================================
echo  Insecure WebApp - Local Startup
echo ====================================
echo.
echo Note: MongoDB must be running!
echo.
echo Make sure MongoDB is accessible at:
echo mongodb://localhost:27017
echo.
echo Starting application...
echo.

npm start

echo.
echo ====================================
echo Application available at:
echo http://localhost:3000
echo ====================================
echo.
pause
