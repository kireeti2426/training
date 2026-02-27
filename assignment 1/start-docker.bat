@echo off
echo.
echo ====================================
echo  Insecure WebApp - Docker Startup
echo ====================================
echo.
echo Starting Docker Compose...
echo.

docker-compose up

echo.
echo ====================================
echo Application will be available at:
echo http://localhost:3000
echo ====================================
echo.
pause
