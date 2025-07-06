// Core data types for StacksBuilder

export interface DeveloperProfile {
  address: string; // Stacks address as primary key
  bnsName?: string; // Optional .btc domain
  displayName: string;
  bio: string;
  skills: string[];
  githubUsername?: string;
  twitterHandle?: string;
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
export interface CreateProfileForm {
  displayName: string;
  bio: string;
  skills: string[];
  githubUsername?: string;
  twitterHandle?: string;
  websiteUrl?: string;
  location?: string;
  availableForWork: boolean;
  hourlyRate?: number;
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

export interface ProjectFilters {
  category?: ProjectCategory;
  status?: ProjectStatus;
  techStack?: string[];
  featured?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}
