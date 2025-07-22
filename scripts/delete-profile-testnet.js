#!/usr/bin/env node

/**
 * Manual Profile Deletion Script for Testnet
 * 
 * This script allows you to manually delete profiles from the testnet
 * when the UI deletion fails or for testing purposes.
 * 
 * Usage:
 * node scripts/delete-profile-testnet.js <user-address>
 * 
 * Example:
 * node scripts/delete-profile-testnet.js ST37TKJWKMEXTCGPD3FFZS4QCF1V7QEM1P7WY0R8B
 */

const { StacksTestnet } = require('@stacks/network');
const { 
  callReadOnlyFunction, 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV
} = require('@stacks/transactions');

// Contract configuration for testnet
const CONTRACT_CONFIG = {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Update with your deployed contract address
  contractName: 'developer-profiles',
  network: new StacksTestnet()
};

/**
 * Check if a profile exists on the testnet
 */
async function checkProfileExists(userAddress) {
  try {
    console.log(`🔍 Checking if profile exists for: ${userAddress}`);
    
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'profile-exists',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.network,
      senderAddress: userAddress,
    });

    const exists = result.value;
    console.log(`📋 Profile exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('❌ Error checking profile existence:', error);
    return false;
  }
}

/**
 * Get profile data from the testnet
 */
async function getProfile(userAddress) {
  try {
    console.log(`📖 Getting profile data for: ${userAddress}`);
    
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'get-profile',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.network,
      senderAddress: userAddress,
    });

    if (result.value) {
      console.log('📋 Profile data:', JSON.stringify(result.value, null, 2));
      return result.value;
    } else {
      console.log('📋 No profile data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting profile:', error);
    return null;
  }
}

/**
 * Instructions for manual deletion via Stacks Explorer
 */
function showManualDeletionInstructions(userAddress) {
  console.log('\n🔧 MANUAL DELETION INSTRUCTIONS:');
  console.log('================================');
  console.log('\nSince this script cannot sign transactions, you need to manually call the delete function:');
  console.log('\n1. Go to Stacks Explorer (testnet):');
  console.log('   https://explorer.stacks.co/?chain=testnet');
  console.log('\n2. Navigate to the contract:');
  console.log(`   https://explorer.stacks.co/txid/${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}?chain=testnet`);
  console.log('\n3. Click on "Call Function"');
  console.log('\n4. Select the "delete-profile" function');
  console.log('\n5. Connect your wallet (the same one used for the profile)');
  console.log('\n6. Submit the transaction');
  console.log('\n7. Wait for confirmation (usually 1-2 minutes)');
  console.log('\nAlternatively, you can use the Clarinet console or other Stacks tools.');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('❌ Usage: node scripts/delete-profile-testnet.js <user-address>');
    console.error('❌ Example: node scripts/delete-profile-testnet.js ST37TKJWKMEXTCGPD3FFZS4QCF1V7QEM1P7WY0R8B');
    process.exit(1);
  }

  const userAddress = args[0];
  
  console.log('🚀 Testnet Profile Deletion Utility');
  console.log('===================================');
  console.log(`📍 Target Address: ${userAddress}`);
  console.log(`📍 Contract: ${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}`);
  console.log(`📍 Network: Testnet`);
  console.log('');

  // Check if profile exists
  const exists = await checkProfileExists(userAddress);
  
  if (!exists) {
    console.log('✅ Profile does not exist on the blockchain. No deletion needed.');
    return;
  }

  // Get profile data
  await getProfile(userAddress);

  // Show manual deletion instructions
  showManualDeletionInstructions(userAddress);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkProfileExists,
  getProfile,
  showManualDeletionInstructions
};
