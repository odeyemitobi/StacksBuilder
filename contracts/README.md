# StacksBuilder Smart Contracts

This directory contains the Clarity smart contracts for the StacksBuilder platform.

## Contracts

### `developer-profiles.clar`

The core contract for managing developer profiles on the platform.

**Features:**
- Create and update developer profiles
- Store profile metadata (name, bio, skills, etc.)
- Track profile statistics and reputation
- Profile verification system

**Functions:**

#### Public Functions
- `create-profile`: Create a new developer profile
- `update-profile`: Update an existing profile
- `update-profile-stats`: Update profile statistics
- `verify-profile`: Mark a profile as verified

#### Read-Only Functions
- `get-profile`: Get profile data by address
- `get-profile-stats`: Get profile statistics
- `profile-exists`: Check if a profile exists
- `get-total-profiles`: Get total number of profiles

## Development Setup

### Prerequisites
- [Clarinet](https://github.com/hirosystems/clarinet) - Stacks smart contract development tool
- Node.js (for deployment scripts)

### Installation

1. Install Clarinet:
```bash
# Using the installer (recommended)
curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.io | sh

# Or download from GitHub releases
# https://github.com/hirosystems/clarinet/releases
```

2. Initialize the project:
```bash
clarinet new stacksbuilder-contracts
cd stacksbuilder-contracts
```

3. Copy contracts:
```bash
cp ../contracts/*.clar ./contracts/
```

### Testing

Run contract tests:
```bash
clarinet test
```

Check contract syntax:
```bash
clarinet check
```

### Deployment

#### Testnet Deployment

1. Deploy to testnet:
```bash
clarinet deploy --testnet
```

2. Update the contract address in `src/lib/contracts.ts`:
```typescript
export const CONTRACT_CONFIG = {
  CONTRACT_ADDRESS: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
  CONTRACT_NAME: 'developer-profiles',
  NETWORK: getStacksNetwork(),
};
```

#### Mainnet Deployment

1. Deploy to mainnet:
```bash
clarinet deploy --mainnet
```

2. Update the contract address for mainnet

### Contract Interaction

The contracts can be interacted with through:

1. **Frontend Integration**: Using `@stacks/transactions` and `@stacks/connect`
2. **Clarinet Console**: Interactive REPL for testing
3. **Stacks Explorer**: View deployed contracts and transactions

### Example Usage

```typescript
import { createProfileOnContract } from '@/lib/contracts';

// Create a new profile
await createProfileOnContract({
  displayName: "John Doe",
  bio: "Full-stack developer passionate about Bitcoin",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  githubUsername: "johndoe",
  twitterUsername: "johndoe_dev",
  linkedinUsername: "john-doe",
  skills: ["JavaScript", "Clarity", "React"],
  specialties: ["DeFi", "NFTs"]
});
```

## Contract Architecture

```
developer-profiles.clar
├── Data Maps
│   ├── profiles (principal -> profile data)
│   └── profile-stats (principal -> statistics)
├── Public Functions
│   ├── create-profile
│   ├── update-profile
│   ├── update-profile-stats
│   └── verify-profile
└── Read-Only Functions
    ├── get-profile
    ├── get-profile-stats
    ├── profile-exists
    └── get-total-profiles
```

## Security Considerations

- Profile creation is restricted to the transaction sender
- Profile updates can only be performed by the profile owner
- Input validation is performed on all user inputs
- Error handling with descriptive error codes

## Future Enhancements

- [ ] Profile endorsement system
- [ ] Reputation scoring algorithm
- [ ] Project showcase integration
- [ ] Job board integration
- [ ] Multi-signature profile management
