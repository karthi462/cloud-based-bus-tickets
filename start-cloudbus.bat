@echo off
title CloudBus - Smart Fingerprint Ticketing System
color 0b

echo ===============================================================================
echo                CLOUDBUS - FULL-STACK SYSTEM LAUNCHER
echo        Smart Fingerprint Ticketing ^& Emergency Travel Credit Platform
echo ===============================================================================
echo.

echo [1/3] Checking Node.js runtime environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js v20+.
    pause
    exit /b 1
)

echo [2/3] Starting Backend API Server (Port 5000)...
start "CloudBus Backend API (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Web Application (Port 5173)...
start "CloudBus Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ===============================================================================
echo CLOUDBUS SERVICES ARE NOW RUNNING!
echo.
echo   - Frontend Portal:  http://localhost:5173
echo   - Backend API:      http://localhost:5000/api
echo   - API Health Check: http://localhost:5000/api/health
echo.
echo Pre-seeded Demo Accounts:
echo   - Administrator:    admin@cloudbus.gov / admin123
echo   - Conductor:        CB-EMP-2001 / conductor123
echo   - Passenger #1:     passenger@cloudbus.com / pass123 (Funded: ₹250)
echo   - Passenger #2:     emergency@cloudbus.com / pass123 (Zero Bal: ₹0)
echo   - Passenger #3:     nearlimit@cloudbus.com / pass123 (Limit test: ₹190)
echo ===============================================================================
echo.

start http://localhost:5173
