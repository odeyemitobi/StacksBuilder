#!/usr/bin/env node

/**
 * Check and Delete Profile Script for Testnet
 * 
 * This script checks if a profile exists on the deployed testnet contract
 * and provides instructions for deletion.
 */

const { StacksTestnet } = require('@stacks/network');
const { 
  callReadOnlyFunction, 
  standardPrincipalCV,
  cvToValue
} = require('@stacks/transactions');

// The actual deployed contract on testnet (v2 with delete functionality)
const CONTRACT_CONFIG = {
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'developer-profiles-v2',
  network: new StacksTestnet()
};

/**
 * Check if a profile exists on the testnet
 */
async function checkProfileExists(userAddress) {
  try {
    console.log(`🔍 Checking if profile exists for: ${userAddress}`);
    console.log(`📍 Contract: ${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}`);
    
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'profile-exists',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: CONTRACT_CONFIG.network,
      senderAddress: userAddress,
    });

    const exists = cvToValue(result);
    console.log(`📋 Profile exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('❌ Error checking profile existence:', error.message);
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

    const profileData = cvToValue(result);
    if (profileData) {
      console.log('📋 Profile data found:');
      console.log('  Display Name:', profileData['display-name']);
      console.log('  Bio:', profileData.bio);
      console.log('  Location:', profileData.location);
      console.log('  Website:', profileData.website);
      console.log('  GitHub:', profileData['github-username']);
      console.log('  Created At:', profileData['created-at']);
      return profileData;
    } else {
      console.log('📋 No profile data found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting profile:', error.message);
    return null;
  }
}

/**
 * Instructions for deletion via Stacks Explorer
 */
function showDeletionInstructions(userAddress) {
  console.log('\n🔧 PROFILE DELETION INSTRUCTIONS:');
  console.log('=================================');
  console.log('\nTo delete your profile from the testnet blockchain:');
  console.log('\n1. Go to Stacks Explorer (testnet):');
  console.log('   https://explorer.stacks.co/?chain=testnet');
  console.log('\n2. Search for the contract:');
  console.log(`   ${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}`);
  console.log('\n3. Or go directly to:');
  console.log(`   https://explorer.stacks.co/txid/${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}?chain=testnet`);
  console.log('\n4. Click on "Call Function"');
  console.log('\n5. Select the "delete-profile" function');
  console.log('\n6. Connect your wallet (the same one used for the profile)');
  console.log(`   Make sure it's the wallet for address: ${userAddress}`);
  console.log('\n7. Submit the transaction');
  console.log('\n8. Wait for confirmation (usually 1-2 minutes)');
  console.log('\n9. Verify deletion by running this script again');
  console.log('\n💡 Alternative: Use your app\'s delete function - it should work now!');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('❌ Usage: node scripts/check-and-delete-profile.js <user-address>');
    console.error('❌ Example: node scripts/check-and-delete-profile.js ST37TKJWKMEXTCGPD3FFZS4QCF1V7QEM1P7WY0R8B');
    process.exit(1);
  }

  const userAddress = args[0];
  
  console.log('🚀 Testnet Profile Check & Delete Utility');
  console.log('=========================================');
  console.log(`📍 Target Address: ${userAddress}`);
  console.log(`📍 Contract: ${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}`);
  console.log(`📍 Network: Testnet`);
  console.log('');

  // Check if profile exists
  const exists = await checkProfileExists(userAddress);
  
  if (!exists) {
    console.log('✅ Profile does not exist on the blockchain.');
    console.log('✅ You can now create a new profile without conflicts!');
    return;
  }

  // Get profile data
  await getProfile(userAddress);

  // Show deletion instructions
  showDeletionInstructions(userAddress);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkProfileExists,
  getProfile,
  showDeletionInstructions
};
