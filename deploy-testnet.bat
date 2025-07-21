@echo off
echo ========================================
echo StacksBuilder Contract Deployment Script
echo ========================================
echo.

echo Step 1: Checking Clarinet installation...
clarinet --version
if %errorlevel% neq 0 (
    echo ERROR: Clarinet is not installed or not in PATH
    echo Please install Clarinet first:
    echo https://github.com/hirosystems/clarinet/releases
    pause
    exit /b 1
)

echo.
echo Step 2: Checking contract syntax...
clarinet check contracts/developer-profiles.clar
if %errorlevel% neq 0 (
    echo ERROR: Contract syntax check failed
    pause
    exit /b 1
)

echo.
echo Step 3: Running contract tests...
clarinet test
if %errorlevel% neq 0 (
    echo ERROR: Contract tests failed
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying to testnet...
echo This will deploy the developer-profiles contract to Stacks testnet
echo Make sure you have testnet STX tokens for deployment fees
echo.
set /p confirm="Continue with deployment? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled
    pause
    exit /b 0
)

clarinet deploy --testnet
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Copy the deployed contract address from the output above
echo 2. Update the .env.local file with the new contract address
echo 3. Restart your Next.js development server
echo 4. Test the integration in your browser
echo.
echo Example contract address format:
echo ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.developer-profiles
echo.
pause
