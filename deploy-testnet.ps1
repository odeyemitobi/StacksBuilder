# StacksBuilder Contract Deployment Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "StacksBuilder Contract Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Clarinet installation
Write-Host "Step 1: Checking Clarinet installation..." -ForegroundColor Yellow
try {
    $clarinetVersion = & clarinet --version 2>$null
    Write-Host "✓ Clarinet found: $clarinetVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Clarinet is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Clarinet first:" -ForegroundColor Red
    Write-Host "https://github.com/hirosystems/clarinet/releases" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 2: Check contract syntax
Write-Host "Step 2: Checking contract syntax..." -ForegroundColor Yellow
try {
    & clarinet check contracts/developer-profiles.clar
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Contract syntax is valid" -ForegroundColor Green
    } else {
        throw "Contract check failed"
    }
} catch {
    Write-Host "✗ ERROR: Contract syntax check failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 3: Run tests
Write-Host "Step 3: Running contract tests..." -ForegroundColor Yellow
try {
    & clarinet test
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All tests passed" -ForegroundColor Green
    } else {
        throw "Tests failed"
    }
} catch {
    Write-Host "✗ ERROR: Contract tests failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 4: Deploy to testnet
Write-Host "Step 4: Deploying to testnet..." -ForegroundColor Yellow
Write-Host "This will deploy the developer-profiles contract to Stacks testnet" -ForegroundColor White
Write-Host "Make sure you have testnet STX tokens for deployment fees" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

try {
    & clarinet deploy --testnet
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Deployment completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Copy the deployed contract address from the output above" -ForegroundColor White
        Write-Host "2. Update the .env.local file with the new contract address" -ForegroundColor White
        Write-Host "3. Restart your Next.js development server" -ForegroundColor White
        Write-Host "4. Test the integration in your browser" -ForegroundColor White
        Write-Host ""
        Write-Host "Example contract address format:" -ForegroundColor Cyan
        Write-Host "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5.developer-profiles" -ForegroundColor White
    } else {
        throw "Deployment failed"
    }
} catch {
    Write-Host "✗ ERROR: Deployment failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"
