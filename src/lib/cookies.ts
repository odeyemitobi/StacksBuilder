/**
 * Cookie utility module for secure data persistence in StacksBuilder
 * Provides production-ready cookie management with proper security flags
 */

export interface CookieOptions {
  expires?: number; // Days until expiration
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

// Default cookie options for production security
const DEFAULT_OPTIONS: CookieOptions = {
  expires: 30, // 30 days default
  httpOnly: false, // Client-side cookies for now, can be true for server-side
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'lax',
  path: '/',
};

/**
 * Set a cookie with secure options
 */
export function setCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void {
  if (typeof window === 'undefined') {
    // Server-side rendering - we'll handle this with Next.js API routes if needed
    return;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (opts.expires) {
    const date = new Date();
    date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }

  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }

  if (opts.secure) {
    cookieString += '; secure';
  }

  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }

  // Note: httpOnly cannot be set from client-side JavaScript
  // For true httpOnly cookies, we'd need server-side API routes

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by setting it to expire immediately
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof window === 'undefined') {
    return;
  }

  setCookie(name, '', {
    expires: -1,
    path,
  });
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// Specific cookie names used in the application
export const COOKIE_NAMES = {
  PROFILE_CREATED: 'sb_profile_created',
  WALLET_PREFERENCE: 'sb_wallet_pref',
  USER_PREFERENCES: 'sb_user_prefs',
} as const;

// Specific cookie options for different data types
export const COOKIE_OPTIONS = {
  PROFILE_TRACKING: {
    expires: 30, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  WALLET_PREFERENCE: {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  SESSION_DATA: {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
} as const;

/**
 * Profile-specific cookie functions
 */
export const ProfileCookies = {
  /**
   * Mark that a user has created a profile
   */
  setProfileCreated(userAddress: string): void {
    const cookieName = `${COOKIE_NAMES.PROFILE_CREATED}_${userAddress}`;
    setCookie(cookieName, 'true', COOKIE_OPTIONS.PROFILE_TRACKING);
  },

  /**
   * Check if a user has created a profile
   */
  hasProfileCreated(userAddress: string): boolean {
    const cookieName = `${COOKIE_NAMES.PROFILE_CREATED}_${userAddress}`;
    return getCookie(cookieName) === 'true';
  },

  /**
   * Remove profile creation marker
   */
  removeProfileCreated(userAddress: string): void {
    const cookieName = `${COOKIE_NAMES.PROFILE_CREATED}_${userAddress}`;
    deleteCookie(cookieName);
  },

  /**
   * Store profile data
   */
  setProfileData(userAddress: string, profileData: any): void {
    const cookieName = `profile_data_${userAddress}`;
    setCookie(cookieName, JSON.stringify(profileData), COOKIE_OPTIONS.PROFILE_TRACKING);
  },

  /**
   * Get stored profile data
   */
  getProfileData(userAddress: string): any | null {
    const cookieName = `profile_data_${userAddress}`;
    const data = getCookie(cookieName);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Error parsing profile data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Remove stored profile data
   */
  removeProfileData(userAddress: string): void {
    const cookieName = `profile_data_${userAddress}`;
    deleteCookie(cookieName);
  },

  /**
   * Clear profile deletion marker (when profile is recreated) - Legacy cleanup
   */
  clearProfileDeletionMarker(userAddress: string): void {
    if (typeof window === 'undefined') return;

    // Clean up any old deletion markers
    localStorage.removeItem(`stacksbuilder_profile_deleted_${userAddress}`);
  },

  /**
   * Clean up all old deletion markers from localStorage
   */
  cleanupOldDeletionMarkers(): void {
    if (typeof window === 'undefined') return;

    Object.keys(localStorage).forEach(key => {
      if (key.includes('stacksbuilder_profile_deleted_')) {
        localStorage.removeItem(key);
        console.log('🧹 Cleaned up old deletion marker:', key);
      }
    });
  },

  /**
   * Delete all profile data (cookies, localStorage, drafts)
   */
  deleteAllProfileData(userAddress: string): void {
    // Remove profile cookies
    this.removeProfileCreated(userAddress);
    this.removeProfileData(userAddress);

    // Clear localStorage data
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('stacksbuilder') && key.includes(userAddress) && !key.includes('deleted')) {
          localStorage.removeItem(key);
        }
      });

      // Clear form drafts
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('stacksbuilder_profile_') && key.includes(userAddress)) {
          localStorage.removeItem(key);
        }
      });
    }

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().includes('stacksbuilder') || name.trim().includes(userAddress)) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      });
    }
  },
};

/**
 * Wallet preference cookie functions
 */
export const WalletCookies = {
  /**
   * Set the user's preferred wallet
   */
  setWalletPreference(walletId: string): void {
    setCookie(COOKIE_NAMES.WALLET_PREFERENCE, walletId, COOKIE_OPTIONS.WALLET_PREFERENCE);
  },

  /**
   * Get the user's preferred wallet
   */
  getWalletPreference(): string | null {
    return getCookie(COOKIE_NAMES.WALLET_PREFERENCE);
  },

  /**
   * Remove wallet preference
   */
  removeWalletPreference(): void {
    deleteCookie(COOKIE_NAMES.WALLET_PREFERENCE);
  },
};

/**
 * Server-side cookie utilities for enhanced security
 */
export const ServerCookies = {
  /**
   * Set a secure HTTP-only cookie via API route
   */
  async setSecureCookie(name: string, value: string, options: CookieOptions = {}): Promise<boolean> {
    try {
      const response = await fetch('/api/cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set',
          name,
          value,
          options,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to set secure cookie:', error);
      return false;
    }
  },

  /**
   * Get a secure HTTP-only cookie via API route
   */
  async getSecureCookie(name: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/cookies?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error('Failed to get secure cookie:', error);
      return null;
    }
  },

  /**
   * Delete a secure HTTP-only cookie via API route
   */
  async deleteSecureCookie(name: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          name,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete secure cookie:', error);
      return false;
    }
  },
};

/**
 * Migration utility to move data from localStorage to cookies
 */
export const MigrationUtils = {
  /**
   * Migrate profile creation data from localStorage to cookies
   */
  migrateProfileData(userAddress: string): void {
    if (typeof window === 'undefined') return;

    const localStorageKey = `profile-created-${userAddress}`;
    const hasLocalStorageData = localStorage.getItem(localStorageKey) === 'true';

    if (hasLocalStorageData && !ProfileCookies.hasProfileCreated(userAddress)) {
      ProfileCookies.setProfileCreated(userAddress);
      localStorage.removeItem(localStorageKey); // Clean up old data
    }

    // Also migrate any stored profile data
    const profileDataKey = `profile-data-${userAddress}`;
    const storedProfileData = localStorage.getItem(profileDataKey);

    if (storedProfileData && !ProfileCookies.getProfileData(userAddress)) {
      try {
        const profileData = JSON.parse(storedProfileData);
        ProfileCookies.setProfileData(userAddress, profileData);
        localStorage.removeItem(profileDataKey); // Clean up old data
      } catch (error) {
        console.error('Error migrating profile data:', error);
      }
    }
  },

  /**
   * Migrate wallet preference from localStorage to cookies
   */
  migrateWalletPreference(): void {
    if (typeof window === 'undefined') return;

    const localStorageKey = 'stacksbuilder-wallet';
    const walletPref = localStorage.getItem(localStorageKey);

    if (walletPref && !WalletCookies.getWalletPreference()) {
      WalletCookies.setWalletPreference(walletPref);
      localStorage.removeItem(localStorageKey); // Clean up old data
    }
  },

  /**
   * Run all migrations
   */
  runAllMigrations(userAddress?: string): void {
    this.migrateWalletPreference();
    if (userAddress) {
      this.migrateProfileData(userAddress);
    }
  },
};
