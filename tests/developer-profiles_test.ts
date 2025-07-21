import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can create a new developer profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'create-profile', [
                types.ascii("John Doe"),
                types.ascii("Full-stack developer passionate about Bitcoin and Stacks"),
                types.ascii("San Francisco, CA"),
                types.ascii("https://johndoe.dev"),
                types.ascii("johndoe"),
                types.ascii("johndoe_dev"),
                types.ascii("john-doe"),
                types.list([types.ascii("JavaScript"), types.ascii("Clarity"), types.ascii("React")]),
                types.list([types.ascii("DeFi"), types.ascii("NFTs")])
            ], user1.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Verify profile was created
        let getProfileBlock = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'get-profile', [
                types.principal(user1.address)
            ], user1.address)
        ]);
        
        const profile = getProfileBlock.receipts[0].result.expectSome();
        assertEquals(profile['display-name'], "John Doe");
        assertEquals(profile['bio'], "Full-stack developer passionate about Bitcoin and Stacks");
    },
});

Clarinet.test({
    name: "Cannot create duplicate profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Create first profile
        let block1 = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'create-profile', [
                types.ascii("John Doe"),
                types.ascii("Full-stack developer"),
                types.ascii("San Francisco, CA"),
                types.ascii("https://johndoe.dev"),
                types.ascii("johndoe"),
                types.ascii("johndoe_dev"),
                types.ascii("john-doe"),
                types.list([types.ascii("JavaScript")]),
                types.list([types.ascii("DeFi")])
            ], user1.address)
        ]);
        
        assertEquals(block1.receipts[0].result.expectOk(), true);
        
        // Try to create second profile with same user
        let block2 = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'create-profile', [
                types.ascii("Jane Doe"),
                types.ascii("Another developer"),
                types.ascii("New York, NY"),
                types.ascii("https://janedoe.dev"),
                types.ascii("janedoe"),
                types.ascii("janedoe_dev"),
                types.ascii("jane-doe"),
                types.list([types.ascii("Python")]),
                types.list([types.ascii("AI")])
            ], user1.address)
        ]);
        
        assertEquals(block2.receipts[0].result.expectErr(), types.uint(102)); // ERR-PROFILE-ALREADY-EXISTS
    },
});

Clarinet.test({
    name: "Can update existing profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        // Create profile first
        let createBlock = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'create-profile', [
                types.ascii("John Doe"),
                types.ascii("Full-stack developer"),
                types.ascii("San Francisco, CA"),
                types.ascii("https://johndoe.dev"),
                types.ascii("johndoe"),
                types.ascii("johndoe_dev"),
                types.ascii("john-doe"),
                types.list([types.ascii("JavaScript")]),
                types.list([types.ascii("DeFi")])
            ], user1.address)
        ]);
        
        assertEquals(createBlock.receipts[0].result.expectOk(), true);
        
        // Update profile
        let updateBlock = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'update-profile', [
                types.ascii("John Smith"),
                types.ascii("Senior full-stack developer with 5 years experience"),
                types.ascii("Austin, TX"),
                types.ascii("https://johnsmith.dev"),
                types.ascii("johnsmith"),
                types.ascii("johnsmith_dev"),
                types.ascii("john-smith"),
                types.list([types.ascii("JavaScript"), types.ascii("TypeScript"), types.ascii("Clarity")]),
                types.list([types.ascii("DeFi"), types.ascii("NFTs"), types.ascii("DAOs")])
            ], user1.address)
        ]);
        
        assertEquals(updateBlock.receipts[0].result.expectOk(), true);
        
        // Verify profile was updated
        let getProfileBlock = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'get-profile', [
                types.principal(user1.address)
            ], user1.address)
        ]);
        
        const profile = getProfileBlock.receipts[0].result.expectSome();
        assertEquals(profile['display-name'], "John Smith");
        assertEquals(profile['bio'], "Senior full-stack developer with 5 years experience");
    },
});

Clarinet.test({
    name: "Profile exists check works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        // Check non-existent profile
        let checkBlock1 = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'profile-exists', [
                types.principal(user1.address)
            ], user1.address)
        ]);
        
        assertEquals(checkBlock1.receipts[0].result.expectBool(), false);
        
        // Create profile
        let createBlock = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'create-profile', [
                types.ascii("John Doe"),
                types.ascii("Developer"),
                types.ascii("SF"),
                types.ascii(""),
                types.ascii("johndoe"),
                types.ascii(""),
                types.ascii(""),
                types.list([types.ascii("JavaScript")]),
                types.list([types.ascii("DeFi")])
            ], user1.address)
        ]);
        
        assertEquals(createBlock.receipts[0].result.expectOk(), true);
        
        // Check existing profile
        let checkBlock2 = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'profile-exists', [
                types.principal(user1.address)
            ], user1.address)
        ]);
        
        assertEquals(checkBlock2.receipts[0].result.expectBool(), true);
        
        // Check different user (should still be false)
        let checkBlock3 = chain.mineBlock([
            Tx.contractCall('developer-profiles', 'profile-exists', [
                types.principal(user2.address)
            ], user1.address)
        ]);
        
        assertEquals(checkBlock3.receipts[0].result.expectBool(), false);
    },
});
