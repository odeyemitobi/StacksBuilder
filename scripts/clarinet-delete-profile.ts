/**
 * Clarinet-based Profile Deletion Script
 * 
 * This script uses Clarinet to delete profiles in a local simnet environment
 * or can be adapted for testnet operations.
 * 
 * Usage:
 * cd stacksbuilder-contracts
 * clarinet console
 * Then run the commands from this script
 */

// Clarinet console commands for profile deletion

export const clarinetCommands = {
  // Check if a profile exists
  checkProfile: (address: string) => `
(contract-call? .developer-profiles profile-exists '${address})
`,

  // Get profile data
  getProfile: (address: string) => `
(contract-call? .developer-profiles get-profile '${address})
`,

  // Delete a profile (must be called by the profile owner)
  deleteProfile: (address: string) => `
(as-contract (contract-call? .developer-profiles delete-profile))
`,

  // Get total profiles count
  getTotalProfiles: () => `
(contract-call? .developer-profiles get-total-profiles)
`,

  // Complete deletion workflow
  fullDeletionWorkflow: (address: string) => `
;; Step 1: Check if profile exists
(print "Checking if profile exists...")
(contract-call? .developer-profiles profile-exists '${address})

;; Step 2: Get profile data (optional, for verification)
(print "Getting profile data...")
(contract-call? .developer-profiles get-profile '${address})

;; Step 3: Delete the profile (as the profile owner)
(print "Deleting profile...")
(as-contract (contract-call? .developer-profiles delete-profile))

;; Step 4: Verify deletion
(print "Verifying deletion...")
(contract-call? .developer-profiles profile-exists '${address})

;; Step 5: Check total profiles count
(print "Checking total profiles count...")
(contract-call? .developer-profiles get-total-profiles)
`
};

// Instructions for using Clarinet
export const instructions = `
CLARINET PROFILE DELETION INSTRUCTIONS:
======================================

1. Navigate to the contracts directory:
   cd stacksbuilder-contracts

2. Start Clarinet console:
   clarinet console

3. In the Clarinet console, run these commands:

   a) Check if profile exists:
   (contract-call? .developer-profiles profile-exists 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

   b) Delete the profile:
   (contract-call? .developer-profiles delete-profile)

   c) Verify deletion:
   (contract-call? .developer-profiles profile-exists 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

4. For testnet operations, you can deploy and interact with the contract using:
   clarinet deployments apply --devnet

NOTES:
- Replace the address with the actual user address
- The delete-profile function can only be called by the profile owner
- In simnet, you can use 'as-contract' to simulate different callers
- For testnet, you'll need to use the actual wallet that created the profile
`;

console.log(instructions);
