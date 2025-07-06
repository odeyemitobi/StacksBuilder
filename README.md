# StacksBuilder 🚀

The premier platform for Stacks developers to showcase their work, build their reputation, and connect with opportunities in the Bitcoin ecosystem.

## 🌟 Features

- **Developer Profiles**: Create comprehensive profiles with verified GitHub integration
- **Project Showcase**: Display your Stacks and Bitcoin projects with rich metadata
- **Reputation System**: Build credibility through community endorsements and contributions
- **Job Board**: Connect with Bitcoin companies and opportunities
- **Bounty System**: Participate in community-driven development challenges

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Blockchain**: Stacks blockchain with Clarity smart contracts
- **Authentication**: Stacks Connect wallet integration
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS v4 with custom design system and dark mode
- **Icons**: React Icons (Feather Icons)
- **Themes**: next-themes for dark/light mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Stacks wallet (Hiro Wallet, Xverse, etc.)
- Basic knowledge of Stacks and Clarity


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/odeyemitobi/StacksBuilder.git
   cd stacksbuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   - Set `NEXT_PUBLIC_STACKS_NETWORK` to `testnet` for development
   - Update contract addresses once deployed

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Smart Contract Development

### Prerequisites for Contract Development

1. **Install Clarinet**
   ```bash
   # macOS
   brew install clarinet
   
   # Or download from: https://github.com/hirosystems/clarinet
   ```

2. **Initialize Clarinet project** (if not already done)
   ```bash
   clarinet new stacksbuilder-contracts
   cd stacksbuilder-contracts
   ```

### Contract Structure

The project uses several Clarity smart contracts:

- `developer-profiles.clar` - Core developer profile management
- `project-showcase.clar` - Project registration and metadata
- `reputation-system.clar` - Community reputation and endorsements
- `job-board.clar` - Job posting and application system

### Testing Contracts

```bash
# Run contract tests
clarinet test

# Check contract syntax
clarinet check

# Deploy to testnet
clarinet deploy --testnet
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   ├── globals.css     # Global styles with Tailwind v4
│   └── ...             # Other pages
├── components/         # React components
│   ├── layout/         # Layout components
│   ├── ui/             # Reusable UI components
│   ├── theme-provider.tsx  # Theme provider
│   ├── theme-toggle.tsx    # Theme toggle component
│   └── ...             # Feature components
├── hooks/              # Custom React hooks
│   ├── useStacks.ts    # Stacks blockchain hooks
│   └── ...             # Other hooks
├── lib/                # Utility libraries
│   ├── stacks.ts       # Stacks integration
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
```

## 🔧 Development Workflow

### 1. Smart Contract Development
- Write contracts in `contracts/` directory
- Test with `clarinet test`
- Deploy to testnet for integration testing

### 2. Frontend Development
- Build components in `src/components/`
- Create pages in `src/app/`
- Use TypeScript for type safety
- Follow the established design system

### 3. Integration Testing
- Test wallet connection
- Verify contract interactions
- Test user flows end-to-end

## 📚 Key Concepts

### Stacks Integration
- **Authentication**: Uses Stacks Connect for wallet-based auth
- **Data Storage**: Combines on-chain contracts with Gaia storage
- **Transactions**: All profile and project data stored on Stacks blockchain

### Reputation System
- **Endorsements**: Community members can endorse skills
- **Contributions**: GitHub activity and contract deployments
- **Participation**: Forum activity and mentorship

### Project Verification
- **GitHub Integration**: Verify project ownership
- **Contract Verification**: Validate deployed contracts
- **Community Review**: Peer validation system

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Smart Contract Deployment

1. **Testnet Deployment**
   ```bash
   clarinet deploy --testnet
   ```

2. **Mainnet Deployment**
   ```bash
   clarinet deploy --mainnet
   ```


### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stacks Foundation](https://stacks.org) for the amazing Bitcoin L2
- [Hiro Systems](https://hiro.so) for excellent developer tools
- The Bitcoin and Stacks developer community

---

Built with ❤️ for the Bitcoin developer community
