# StacksBuilder 🚀

The premier platform for Stacks developers to showcase their work, build their reputation, and connect with opportunities in the Bitcoin ecosystem.

## 🌟 Features

### Core Platform Features

- **Developer Profiles**: Create comprehensive profiles with verified GitHub integration
- **Project Showcase**: Display your Stacks and Bitcoin projects with rich metadata
- **Reputation System**: Build credibility through community endorsements and contributions
- **Job Board**: Connect with Bitcoin companies and opportunities
- **Bounty System**: Participate in community-driven development challenges

### 🚀 Stacks Ecosystem Integration

- **Stacks Ascent Program Integration**: Display your Ascent level badges (Trailblazer → Sherpa), track grants, and connect with mentors
- **sBTC Portfolio Tracking**: Showcase sBTC holdings, DeFi positions, and Bitcoin yield opportunities
- **Smart Contract Analysis**: Automated Clarity code security scanning and optimization suggestions
- **Contract Verification System**: On-chain verification of deployed contracts with source code

### 🎨 Digital Assets & NFTs

- **Bitcoin NFT Gallery**: Display Ordinals, BRC-20 tokens, and Stacks NFTs in your portfolio
- **Asset Portfolio Tracking**: Monitor digital asset holdings, creations, and marketplace performance
- **Creator Analytics**: Track NFT sales, royalties, and collection metrics

### 💰 DeFi Integration

- **DeFi Protocol Positions**: Integration with Zest Protocol, BitFlow, Velar, and other Stacks DeFi platforms
- **Yield Farming Tracker**: Display LP positions, stacking rewards, and farming yields
- **Cross-chain Project Display**: Support for projects bridging Bitcoin L1 and Stacks L2

### 🛠️ Advanced Developer Tools

- **Clarity Code Templates**: Curated library of audited smart contract templates
- **Multi-wallet Support**: Compatible with Leather, Xverse, Asigna, and other Stacks wallets
- **Development Environment**: Integrated Clarinet Cloud support for browser-based development
- **API Integration Hub**: Connect with Hiro APIs, Stacks blockchain APIs, and third-party services

### 📊 Analytics & Insights

- **Ecosystem Health Metrics**: Track Stacks network activity, TVL, and developer adoption trends
- **Market Intelligence**: Bitcoin and STX price correlation analysis
- **Developer Activity Heatmap**: Visualize contribution patterns across the ecosystem

## 🛠️ Tech Stack

### Frontend & Core
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS v4 with custom design system and dark mode
- **Icons**: React Icons (Feather Icons)
- **Themes**: next-themes for dark/light mode support

### Blockchain & Web3
- **Blockchain**: Stacks blockchain with Clarity smart contracts
- **Bitcoin Integration**: sBTC, Ordinals, and Bitcoin L1 transaction tracking
- **Authentication**: Multi-wallet support (Leather, Xverse, Asigna, Stacks Connect)
- **Smart Contracts**: Clarity language with automated analysis and verification
- **DeFi Integration**: Zest Protocol, BitFlow, Velar, and other Stacks DeFi platforms

### APIs & Services
- **Stacks APIs**: Hiro APIs for blockchain data and transaction broadcasting
- **Stacks Ascent API**: Integration with official Stacks developer program
- **NFT APIs**: Gamma.io and other Stacks NFT marketplace integrations
- **Analytics**: Custom analytics engine for ecosystem metrics and insights

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

- `developer-profiles.clar` - Core developer profile management with Stacks Ascent integration
- `project-showcase.clar` - Project registration and metadata with sBTC and NFT support
- `reputation-system.clar` - Community reputation and endorsements
- `job-board.clar` - Job posting and application system
- `defi-integration.clar` - DeFi protocol position tracking and yield calculations
- `nft-gallery.clar` - Bitcoin NFT and digital asset management
- `contract-verification.clar` - On-chain contract verification and security analysis

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

### Stacks Ecosystem Integration
- **Multi-wallet Authentication**: Support for Leather, Xverse, Asigna, and Stacks Connect
- **sBTC Integration**: Native support for Bitcoin-backed assets and DeFi positions
- **Stacks Ascent Program**: Official integration with Stacks developer advancement program
- **Data Storage**: Combines on-chain contracts with Gaia storage and IPFS

### Enhanced Reputation System
- **Stacks Ascent Levels**: Display official program progression (Trailblazer → Sherpa)
- **DeFi Contributions**: Track lending, staking, and liquidity provision activities
- **NFT Creation**: Showcase Bitcoin NFT and digital asset creation
- **Smart Contract Security**: Reputation based on contract audits and security practices
- **Community Endorsements**: Peer validation and skill endorsements
- **Educational Content**: Reward tutorial creation and knowledge sharing

### Advanced Project Verification
- **GitHub Integration**: Verify project ownership and contribution history
- **On-chain Contract Verification**: Automated source code verification system
- **Security Analysis**: Clarity code analysis and vulnerability detection
- **DeFi Protocol Integration**: Verify protocol deployments and TVL metrics
- **NFT Collection Verification**: Validate digital asset collections and ownership
- **Community Review**: Multi-layered peer validation system

### Bitcoin L1 & L2 Bridge
- **Cross-chain Tracking**: Monitor Bitcoin L1 transactions related to Stacks operations
- **Ordinals Integration**: Display and manage Bitcoin Ordinals inscriptions
- **sBTC Bridge Monitoring**: Track sBTC minting, burning, and cross-chain operations
- **Multi-sig Support**: Integration with Bitcoin multi-signature wallet solutions

## �️ Development Roadmap

### Phase 1: Core Platform + Stacks Ascent Integration
- ✅ Basic developer profiles and project showcase
- ✅ Reputation system and job board
- 🚧 Stacks Ascent program integration
- 🚧 sBTC portfolio tracking
- 🚧 Multi-wallet authentication

### Phase 2: Smart Contract & DeFi Features
- 📋 Clarity code analysis and security scanning
- 📋 Contract verification system
- 📋 DeFi protocol integrations (Zest, BitFlow, Velar)
- 📋 Yield farming and stacking rewards tracking

### Phase 3: NFT & Digital Assets
- 📋 Bitcoin NFT gallery (Ordinals, BRC-20, Stacks NFTs)
- 📋 Creator analytics and marketplace integration
- 📋 Digital asset portfolio management

### Phase 4: Advanced Analytics & Bitcoin L1
- 📋 Ecosystem health metrics and insights
- 📋 Bitcoin L1 transaction tracking
- 📋 Cross-chain operation monitoring
- 📋 Advanced developer tools and APIs

**Legend**: ✅ Complete | 🚧 In Progress | 📋 Planned

## �🚀 Deployment

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

- [Stacks Foundation](https://stacks.org) for the amazing Bitcoin L2 and Stacks Ascent program
- [Hiro Systems](https://hiro.so) for excellent developer tools and APIs
- [Trust Machines](https://trustmachines.co) for Leather wallet and Bitcoin ecosystem development
- [Zest Protocol](https://zestprotocol.com) for Bitcoin lending infrastructure
- [BitFlow](https://bitflow.finance) and [Velar](https://velar.co) for DeFi innovation on Stacks
- [Gamma.io](https://gamma.io) for Bitcoin NFT marketplace integration
- The Bitcoin and Stacks developer community for continuous innovation

---

Built with ❤️ for the Bitcoin developer community
