# Clarinet Installation Guide for Windows

Since the automated installation didn't work, here's how to install Clarinet manually:

## Option 1: Direct Download (Recommended)

1. **Download the Windows installer:**
   - Go to: https://github.com/hirosystems/clarinet/releases/latest
   - Download: `clarinet-windows-x64.msi`

2. **Install Clarinet:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Clarinet will be added to your PATH automatically

3. **Verify installation:**
   ```bash
   clarinet --version
   ```

## Option 2: Using PowerShell (Alternative)

If the direct download doesn't work, try this PowerShell approach:

```powershell
# Create a temporary directory
$tempDir = "$env:TEMP\clarinet-install"
New-Item -ItemType Directory -Path $tempDir -Force

# Download the installer
$url = "https://github.com/hirosystems/clarinet/releases/download/v3.3.0/clarinet-windows-x64.msi"
$output = "$tempDir\clarinet-installer.msi"
Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing

# Install Clarinet
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$output`" /quiet"

# Clean up
Remove-Item -Path $tempDir -Recurse -Force

# Verify installation
clarinet --version
```

## Option 3: Using Chocolatey (If Available)

```bash
# This might not work as the package may not exist
choco install clarinet
```

## After Installation

Once Clarinet is installed, you can:

1. **Initialize your contracts project:**
   ```bash
   cd "C:\Users\USER\Desktop\My Projects\StacksBuilder"
   clarinet new stacksbuilder-contracts
   ```

2. **Copy your existing contracts:**
   ```bash
   cp contracts/developer-profiles.clar stacksbuilder-contracts/contracts/
   cp Clarinet.toml stacksbuilder-contracts/
   ```

3. **Test your contracts:**
   ```bash
   cd stacksbuilder-contracts
   clarinet check
   clarinet test
   ```

4. **Deploy to testnet:**
   ```bash
   clarinet deploy --testnet
   ```

## Troubleshooting

### If Clarinet command is not found:
1. Restart your terminal/PowerShell
2. Check if Clarinet is in your PATH:
   ```bash
   $env:PATH -split ';' | Select-String clarinet
   ```
3. If not found, add it manually or reinstall

### If you get permission errors:
1. Run PowerShell as Administrator
2. Try the installation again

### Alternative: Use Clarinet in Docker
If installation continues to fail, you can use Clarinet in Docker:

```bash
# Pull the Clarinet Docker image
docker pull hirosystems/clarinet

# Run Clarinet commands
docker run --rm -v ${PWD}:/workspace hirosystems/clarinet clarinet check
```

## Next Steps After Installation

1. **Test the smart contract:**
   ```bash
   clarinet check contracts/developer-profiles.clar
   ```

2. **Run the test suite:**
   ```bash
   clarinet test
   ```

3. **Deploy to testnet:**
   ```bash
   clarinet deploy --testnet
   ```

4. **Update your frontend configuration:**
   - Copy the deployed contract address
   - Update `src/lib/contracts.ts` with the new address
   - Test the integration

## Manual Installation Verification

After installation, you should be able to run:

```bash
clarinet --version
# Should output something like: clarinet 3.3.0
```

If you see the version number, Clarinet is successfully installed and you can proceed with contract deployment!
