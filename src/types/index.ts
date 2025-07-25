// Core data types for StacksBuilder

// Wallet provider type declarations
export interface WalletProvider {
  connect(): Promise<void>;
  disconnect?(): Promise<void>;
  getAddresses?(): Promise<string[]>;
  signTransaction?(transaction: unknown): Promise<unknown>;
}

export interface XverseStacksProvider extends WalletProvider {
  request(method: string, params?: unknown): Promise<unknown>;
}

export interface LeatherProvider extends WalletProvider {
  request(method: string, params?: unknown): Promise<unknown>;
}

export interface AsignaProvider extends WalletProvider {
  request(method: string, params?: unknown): Promise<unknown>;
}

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
    HiroWalletProvider?: LeatherProvider;
    XverseProviders?: {
      StacksProvider: XverseStacksProvider;
    };
    AsignaProvider?: AsignaProvider;
    // Debug functions
    debugWalletState?: () => void;
    forceSetWallet?: (wallet: 'hiro' | 'leather' | 'xverse' | 'asigna') => void;
    refreshWalletState?: () => void;
    protectWalletSelection?: (expectedWallet: 'hiro' | 'leather' | 'xverse' | 'asigna') => void;
    testWalletProviders?: () => void;
    manuallySetWallet?: (wallet: 'hiro' | 'leather' | 'xverse' | 'asigna') => void;
    autoFixWalletDetection?: () => void;
  }
}

export interface DeveloperProfile {
  address: string; // Stacks address as primary key
  bnsName?: string; // Optional .btc domain
  displayName: string;
  bio: string;
  skills: string[];
  githubUsername?: string;
  twitterHandle?: string;
  linkedinUsername?: string;
  portfolioProjects: Project[];
  reputation: ReputationScore;
  isVerified: boolean;
  joinedAt: number;
  lastActive: number;
  profileImageUrl?: string;
  websiteUrl?: string;
  location?: string;
  availableForWork: boolean;
  hourlyRate?: number; // in STX
  specialties?: string[]; // Add specialties field
}

export interface Project {
  id: string;
  developerId: string; // Stacks address of creator
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  contractAddress?: string; // For Stacks projects
  screenshots: string[]; // IPFS hashes or URLs
  featured: boolean;
  createdAt: number;
  updatedAt: number;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  likes: number;
  views: number;
}

export interface ReputationScore {
  overall: number; // 0-100
  contractContributions: number;
  communityEndorsements: number;
  projectCompletions: number;
  mentorshipHours: number;
  githubContributions?: number;
  stacksTransactions: number;
  lastUpdated: number;
}

export interface Endorsement {
  id: string;
  endorserId: string; // Stacks address
  endorseeId: string; // Stacks address
  message: string;
  skills: string[];
  createdAt: number;
  txId: string; // Transaction hash
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  techStack: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: 'USD' | 'STX' | 'BTC';
  };
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  postedAt: number;
  expiresAt: number;
  applications: number;
  status: 'active' | 'closed' | 'filled';
}

export interface BountyPosting {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  requirements: string[];
  reward: number; // in STX
  deadline: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: string[]; // Stacks addresses
  assignedTo?: string; // Stacks address
  createdAt: number;
  completedAt?: number;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo?: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  location: string;
  remote: boolean;
  stacksAddress?: string;
  verified: boolean;
  jobPostings: string[]; // Job IDs
  createdAt: number;
}

// Enums and Union Types
export type ProjectCategory = 
  | 'defi' 
  | 'nft' 
  | 'dao' 
  | 'infrastructure' 
  | 'gaming' 
  | 'social' 
  | 'education' 
  | 'tools' 
  | 'other';

export type ProjectStatus = 
  | 'concept' 
  | 'development' 
  | 'beta' 
  | 'live' 
  | 'maintenance' 
  | 'deprecated';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface CreateProfileForm extends Record<string, unknown> {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  githubUsername: string;
  twitterUsername: string;
  linkedinUsername: string;
  skills: string[];
  specialties: string[];
}

export interface CreateProjectForm {
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  contractAddress?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  skills?: string[];
  location?: string;
  availableForWork?: boolean;
  minReputation?: number;
  verified?: boolean;
}

// Contract and Blockchain Types
export interface ContractCallData {
  txId: string;
  stacksTransaction?: unknown;
}

export interface StacksUserData {
  profile?: {
    stxAddress: {
      testnet: string;
      mainnet: string;
    };
  };
  username?: string;
  identityAddress?: string;
  appPrivateKey?: string;
  coreSessionToken?: string;
  authResponseToken?: string;
  hubUrl?: string;
  gaiaHubUrl?: string;
}

export interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  githubUsername: string;
  twitterUsername: string;
  linkedinUsername: string;
  skills: string[];
  specialties: string[];
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
}

// Import ContractProfile from contracts
export interface ContractProfile {
  'display-name': string;
  bio: string;
  location: string;
  website: string;
  'github-username': string;
  'twitter-username': string;
  'linkedin-username': string;
  skills: string[];
  specialties: string[];
  'created-at': number;
  'updated-at': number;
  'is-verified': boolean;
}



// Contract function argument types
export type ContractFunctionArg =
  | { type: 'uint'; value: number }
  | { type: 'int'; value: number }
  | { type: 'bool'; value: boolean }
  | { type: 'principal'; value: string }
  | { type: 'string-ascii'; value: string }
  | { type: 'string-utf8'; value: string }
  | { type: 'buffer'; value: Uint8Array }
  | { type: 'list'; value: ContractFunctionArg[] }
  | { type: 'tuple'; value: Record<string, ContractFunctionArg> }
  | { type: 'optional'; value: ContractFunctionArg | null }
  | { type: 'response'; value: { ok: ContractFunctionArg } | { error: ContractFunctionArg } };

// Form data types
export interface SocialMediaFormData {
  githubUsername?: string;
  twitterUsername?: string;
  linkedinUsername?: string;
  [key: string]: unknown;
}

export interface ProjectFilters {
  category?: ProjectCategory;
  status?: ProjectStatus;
  techStack?: string[];
  featured?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}
