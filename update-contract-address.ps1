# Script to update contract address after deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractAddress,
    
    [Parameter(Mandatory=$false)]
    [string]$ContractName = "developer-profiles"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Contract Address Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Updating contract configuration..." -ForegroundColor Yellow
Write-Host "Contract Address: $ContractAddress" -ForegroundColor White
Write-Host "Contract Name: $ContractName" -ForegroundColor White
Write-Host ""

# Update .env.local file
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "Updating $envFile..." -ForegroundColor Yellow
    
    $content = Get-Content $envFile
    $newContent = @()
    
    foreach ($line in $content) {
        if ($line -match "^NEXT_PUBLIC_CONTRACT_ADDRESS=") {
            $newContent += "NEXT_PUBLIC_CONTRACT_ADDRESS=$ContractAddress"
            Write-Host "✓ Updated CONTRACT_ADDRESS" -ForegroundColor Green
        } elseif ($line -match "^NEXT_PUBLIC_CONTRACT_NAME=") {
            $newContent += "NEXT_PUBLIC_CONTRACT_NAME=$ContractName"
            Write-Host "✓ Updated CONTRACT_NAME" -ForegroundColor Green
        } else {
            $newContent += $line
        }
    }
    
    $newContent | Set-Content $envFile
    Write-Host "✓ Environment file updated successfully" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
}

Write-Host ""

# Update contracts.ts file
$contractsFile = "src/lib/contracts.ts"
if (Test-Path $contractsFile) {
    Write-Host "Updating $contractsFile..." -ForegroundColor Yellow
    
    $content = Get-Content $contractsFile -Raw
    
    # Update the default contract address in the file
    $pattern = "CONTRACT_ADDRESS: process\.env\.NEXT_PUBLIC_CONTRACT_ADDRESS \|\| '[^']*'"
    $replacement = "CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '$ContractAddress'"
    
    $newContent = $content -replace $pattern, $replacement
    
    $newContent | Set-Content $contractsFile
    Write-Host "✓ Contracts file updated successfully" -ForegroundColor Green
} else {
    Write-Host "✗ src/lib/contracts.ts file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuration updated successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your Next.js development server" -ForegroundColor White
Write-Host "2. Test the contract integration in your browser" -ForegroundColor White
Write-Host "3. Try creating a profile to test the deployment" -ForegroundColor White
Write-Host ""
Write-Host "To restart the dev server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
