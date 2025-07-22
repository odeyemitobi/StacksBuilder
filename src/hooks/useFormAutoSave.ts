import { useEffect, useCallback, useRef } from 'react';
import { CreateProfileForm } from '@/types';

interface UseFormAutoSaveOptions {
  key: string;
  data: CreateProfileForm;
  enabled?: boolean;
  debounceMs?: number;
  expirationHours?: number;
}

interface SavedFormData {
  data: CreateProfileForm;
  timestamp: number;
  currentStep: number;
}

export function useFormAutoSave({
  key,
  data,
  enabled = true,
  debounceMs = 1000,
  expirationHours = 24
}: UseFormAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  // Save form data to localStorage with debouncing
  const saveFormData = useCallback((formData: CreateProfileForm, step: number = 1) => {
    if (!enabled || typeof window === 'undefined') return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        const saveData: SavedFormData = {
          data: formData,
          timestamp: Date.now(),
          currentStep: step
        };
        
        localStorage.setItem(key, JSON.stringify(saveData));
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Form auto-saved:', key);
        }
      } catch (error) {
        console.warn('Failed to auto-save form data:', error);
      }
    }, debounceMs);
  }, [key, enabled, debounceMs]);

  // Load saved form data from localStorage
  const loadSavedData = useCallback((): { data: CreateProfileForm | null; currentStep: number } => {
    if (typeof window === 'undefined') {
      return { data: null, currentStep: 1 };
    }

    try {
      const saved = localStorage.getItem(key);
      if (!saved) {
        return { data: null, currentStep: 1 };
      }

      const parsedData: SavedFormData = JSON.parse(saved);
      
      // Check if data has expired
      const now = Date.now();
      const expirationTime = expirationHours * 60 * 60 * 1000; // Convert to milliseconds
      
      if (now - parsedData.timestamp > expirationTime) {
        localStorage.removeItem(key);
        return { data: null, currentStep: 1 };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Loaded saved form data:', key);
      }

      return {
        data: parsedData.data,
        currentStep: parsedData.currentStep || 1
      };
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
      // Clean up corrupted data
      localStorage.removeItem(key);
      return { data: null, currentStep: 1 };
    }
  }, [key, expirationHours]);

  // Clear saved form data
  const clearSavedData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cleared saved form data:', key);
      }
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }, [key]);

  // Check if there's saved data available
  const hasSavedData = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return false;

      const parsedData: SavedFormData = JSON.parse(saved);
      const now = Date.now();
      const expirationTime = expirationHours * 60 * 60 * 1000;
      
      return (now - parsedData.timestamp) <= expirationTime;
    } catch {
      return false;
    }
  }, [key, expirationHours]);

  // Auto-save when data changes (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Only save if form has meaningful data
    const hasData = data.displayName.trim() || 
                   data.bio.trim() || 
                   data.location.trim() || 
                   data.website.trim() || 
                   data.githubUsername.trim() || 
                   data.twitterUsername.trim() || 
                   data.linkedinUsername.trim() || 
                   data.skills.length > 0 || 
                   data.specialties.length > 0;

    if (hasData) {
      saveFormData(data);
    }
  }, [data, saveFormData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveFormData,
    loadSavedData,
    clearSavedData,
    hasSavedData
  };
}

// Utility function to get a unique key for the form
export function getFormAutoSaveKey(userAddress: string, isEditMode: boolean): string {
  const mode = isEditMode ? 'edit' : 'create';
  return `stacksbuilder_profile_${mode}_${userAddress}`;
}

// Utility function to clean up old auto-save data
export function cleanupOldAutoSaveData(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    const autoSaveKeys = keys.filter(key => key.startsWith('stacksbuilder_profile_'));
    
    autoSaveKeys.forEach(key => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsedData: SavedFormData = JSON.parse(saved);
          const now = Date.now();
          const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
          
          if (now - parsedData.timestamp > expirationTime) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Remove corrupted data
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to cleanup old auto-save data:', error);
  }
}
