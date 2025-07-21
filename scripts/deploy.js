#!/usr/bin/env node

/**
 * Deployment script for StacksBuilder smart contracts
 * 
 * This script helps deploy contracts to testnet and update the frontend configuration
 */

const fs = require('fs');
const path = require('path');

// Contract deployment configuration
const DEPLOYMENT_CONFIG = {
  testnet: {
    network: 'testnet',
    nodeUrl: 'https://stacks-node-api.testnet.stacks.co',
  },
  mainnet: {
    network: 'mainnet', 
    nodeUrl: 'https://stacks-node-api.mainnet.stacks.co',
  }
};

async function updateContractConfig(contractAddress, network = 'testnet') {
  const contractsFilePath = path.join(__dirname, '../src/lib/contracts.ts');
  
  try {
    let contractsContent = fs.readFileSync(contractsFilePath, 'utf8');
    
    // Update the contract address
    contractsContent = contractsContent.replace(
      /CONTRACT_ADDRESS: '[^']*'/,
      `CONTRACT_ADDRESS: '${contractAddress}'`
    );
    
    fs.writeFileSync(contractsFilePath, contractsContent);
    console.log(`✅ Updated contract address to: ${contractAddress}`);
    
  } catch (error) {
    console.error('❌ Error updating contract configuration:', error);
  }
}

async function deployContract(network = 'testnet') {
  console.log(`🚀 Starting deployment to ${network}...`);
  
  // This would typically use Clarinet CLI commands
  console.log(`
📋 Manual Deployment Steps:

1. Make sure Clarinet is installed:
   npm install -g @hirosystems/clarinet
   
2. Initialize Clarinet project (if not done):
   clarinet new stacksbuilder-contracts
   
3. Copy your contract to the contracts folder:
   cp contracts/developer-profiles.clar ./contracts/
   
4. Update Clarinet.toml with your contract configuration
   
5. Check contract syntax:
   clarinet check
   
6. Run tests:
   clarinet test
   
7. Deploy to ${network}:
   clarinet deploy --${network}
   
8. Update the contract address in src/lib/contracts.ts
   
9. Test the integration with your frontend

🔗 Useful Commands:
   - clarinet console: Interactive REPL
   - clarinet requirements: Manage dependencies
   - clarinet integrate: Run integration tests
  `);
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];
const network = args[1] || 'testnet';

switch (command) {
  case 'deploy':
    deployContract(network);
    break;
    
  case 'update-config':
    const contractAddress = args[1];
    if (!contractAddress) {
      console.error('❌ Please provide a contract address');
      process.exit(1);
    }
    updateContractConfig(contractAddress, network);
    break;
    
  default:
    console.log(`
🛠️  StacksBuilder Contract Deployment Tool

Usage:
  node scripts/deploy.js deploy [testnet|mainnet]     Deploy contracts
  node scripts/deploy.js update-config <address>     Update contract address
  
Examples:
  node scripts/deploy.js deploy testnet
  node scripts/deploy.js update-config ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
    `);
}
