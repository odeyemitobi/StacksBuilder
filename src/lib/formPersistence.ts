/**
 * Form persistence utilities for saving and restoring form data
 * Uses localStorage to persist form data across page reloads
 */

import { CreateProfileForm } from '@/types';

const FORM_STORAGE_KEY = 'stacksbuilder_profile_form_draft';
const FORM_TIMESTAMP_KEY = 'stacksbuilder_profile_form_timestamp';

// Form data expires after 24 hours to prevent stale data
const FORM_EXPIRY_HOURS = 24;

/**
 * Save form data to localStorage
 * @param formData - The form data to save
 * @param userAddress - User's wallet address (for user-specific storage)
 */
export function saveFormDraft(formData: CreateProfileForm, userAddress?: string): void {
  try {
    const storageKey = userAddress ? `${FORM_STORAGE_KEY}_${userAddress}` : FORM_STORAGE_KEY;
    const timestampKey = userAddress ? `${FORM_TIMESTAMP_KEY}_${userAddress}` : FORM_TIMESTAMP_KEY;
    
    const dataToSave = {
      ...formData,
      // Don't save empty values to keep storage clean
      displayName: formData.displayName.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
      githubUsername: formData.githubUsername.trim(),
      twitterUsername: formData.twitterUsername.trim(),
      linkedinUsername: formData.linkedinUsername.trim(),
    };
    
    // Only save if there's meaningful data
    const hasData = Object.values(dataToSave).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return typeof value === 'string' && value.length > 0;
    });
    
    if (hasData) {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      localStorage.setItem(timestampKey, Date.now().toString());
    }
  } catch (error) {
    console.warn('Failed to save form draft:', error);
  }
}

/**
 * Load form data from localStorage
 * @param userAddress - User's wallet address (for user-specific storage)
 * @returns Saved form data or null if not found/expired
 */
export function loadFormDraft(userAddress?: string): CreateProfileForm | null {
  try {
    const storageKey = userAddress ? `${FORM_STORAGE_KEY}_${userAddress}` : FORM_STORAGE_KEY;
    const timestampKey = userAddress ? `${FORM_TIMESTAMP_KEY}_${userAddress}` : FORM_TIMESTAMP_KEY;
    
    const savedData = localStorage.getItem(storageKey);
    const savedTimestamp = localStorage.getItem(timestampKey);
    
    if (!savedData || !savedTimestamp) {
      return null;
    }
    
    // Check if data has expired
    const timestamp = parseInt(savedTimestamp, 10);
    const now = Date.now();
    const expiryTime = FORM_EXPIRY_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds
    
    if (now - timestamp > expiryTime) {
      // Data has expired, clean it up
      clearFormDraft(userAddress);
      return null;
    }
    
    const parsedData = JSON.parse(savedData) as CreateProfileForm;
    
    // Validate the structure to ensure it matches current form structure
    const defaultForm: CreateProfileForm = {
      displayName: '',
      bio: '',
      location: '',
      website: '',
      githubUsername: '',
      twitterUsername: '',
      linkedinUsername: '',
      skills: [],
      specialties: []
    };
    
    // Merge with defaults to handle any missing fields
    return {
      ...defaultForm,
      ...parsedData,
      // Ensure arrays are arrays
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      specialties: Array.isArray(parsedData.specialties) ? parsedData.specialties : []
    };
    
  } catch (error) {
    console.warn('Failed to load form draft:', error);
    return null;
  }
}

/**
 * Clear saved form data
 * @param userAddress - User's wallet address (for user-specific storage)
 */
export function clearFormDraft(userAddress?: string): void {
  try {
    const storageKey = userAddress ? `${FORM_STORAGE_KEY}_${userAddress}` : FORM_STORAGE_KEY;
    const timestampKey = userAddress ? `${FORM_TIMESTAMP_KEY}_${userAddress}` : FORM_TIMESTAMP_KEY;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
  } catch (error) {
    console.warn('Failed to clear form draft:', error);
  }
}

/**
 * Check if there's a saved draft for the user
 * @param userAddress - User's wallet address (for user-specific storage)
 * @returns True if there's a valid saved draft
 */
export function hasSavedDraft(userAddress?: string): boolean {
  const draft = loadFormDraft(userAddress);
  return draft !== null;
}

/**
 * Get the timestamp of the last saved draft
 * @param userAddress - User's wallet address (for user-specific storage)
 * @returns Timestamp of last save or null if no draft exists
 */
export function getDraftTimestamp(userAddress?: string): Date | null {
  try {
    const timestampKey = userAddress ? `${FORM_TIMESTAMP_KEY}_${userAddress}` : FORM_TIMESTAMP_KEY;
    const savedTimestamp = localStorage.getItem(timestampKey);
    
    if (!savedTimestamp) {
      return null;
    }
    
    return new Date(parseInt(savedTimestamp, 10));
  } catch (error) {
    return null;
  }
}

/**
 * Debounced save function to avoid excessive localStorage writes
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSaveFormDraft(formData: CreateProfileForm, userAddress?: string, delay: number = 1000): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveFormDraft(formData, userAddress);
  }, delay);
}
