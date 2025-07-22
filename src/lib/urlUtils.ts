/**
 * Utility functions for extracting usernames from social media URLs
 */

/**
 * Extract GitHub username from URL or return as-is if already a username
 * @param input - GitHub URL or username
 * @returns GitHub username
 */
export function extractGitHubUsername(input: string): string {
  if (!input) return '';
  
  // Remove whitespace
  const cleaned = input.trim();
  
  // If it doesn't contain github.com, assume it's already a username
  if (!cleaned.includes('github.com')) {
    return cleaned.replace(/^@/, ''); // Remove @ if present
  }
  
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/\?#]+)/i,
      /github\.io\/([^\/\?#]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return cleaned;
  } catch (error) {
    return cleaned;
  }
}

/**
 * Extract Twitter username from URL or return as-is if already a username
 * @param input - Twitter URL or username
 * @returns Twitter username
 */
export function extractTwitterUsername(input: string): string {
  if (!input) return '';
  
  // Remove whitespace
  const cleaned = input.trim();
  
  // If it doesn't contain twitter.com or x.com, assume it's already a username
  if (!cleaned.includes('twitter.com') && !cleaned.includes('x.com')) {
    return cleaned.replace(/^@/, ''); // Remove @ if present
  }
  
  try {
    // Handle various Twitter/X URL formats
    const patterns = [
      /(?:twitter\.com|x\.com)\/([^\/\?#]+)/i,
      /(?:twitter\.com|x\.com)\/intent\/user\?screen_name=([^&]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return cleaned;
  } catch (error) {
    return cleaned;
  }
}

/**
 * Extract LinkedIn username from URL or return as-is if already a username
 * @param input - LinkedIn URL or username
 * @returns LinkedIn username
 */
export function extractLinkedInUsername(input: string): string {
  if (!input) return '';
  
  // Remove whitespace
  const cleaned = input.trim();
  
  // If it doesn't contain linkedin.com, assume it's already a username
  if (!cleaned.includes('linkedin.com')) {
    return cleaned;
  }
  
  try {
    // Handle various LinkedIn URL formats
    const patterns = [
      /linkedin\.com\/in\/([^\/\?#]+)/i,
      /linkedin\.com\/pub\/([^\/\?#]+)/i,
      /linkedin\.com\/profile\/view\?id=([^&]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return cleaned;
  } catch (error) {
    return cleaned;
  }
}

/**
 * Validate and clean website URL
 * @param input - Website URL
 * @returns Clean website URL with protocol
 */
export function cleanWebsiteUrl(input: string): string {
  if (!input) return '';
  
  const cleaned = input.trim();
  
  // If it already has a protocol, return as-is
  if (cleaned.match(/^https?:\/\//i)) {
    return cleaned;
  }
  
  // If it looks like a domain, add https://
  if (cleaned.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/)) {
    return `https://${cleaned}`;
  }
  
  // If it starts with www., add https://
  if (cleaned.match(/^www\./i)) {
    return `https://${cleaned}`;
  }
  
  // Otherwise, return as-is (might be a path or other format)
  return cleaned;
}

/**
 * Validate field length for contract constraints
 * @param value - Field value
 * @param maxLength - Maximum allowed length
 * @param fieldName - Field name for error messages
 * @returns Object with isValid boolean and error message
 */
export function validateFieldLength(value: string, maxLength: number, fieldName: string) {
  const trimmed = value.trim();
  
  if (trimmed.length === 0) {
    return { isValid: true, error: null };
  }
  
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be ${maxLength} characters or less (currently ${trimmed.length})`
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Process all social media inputs and return cleaned values
 * @param formData - Form data object
 * @returns Processed form data with extracted usernames
 */
export function processSocialMediaInputs(formData: any) {
  return {
    ...formData,
    githubUsername: extractGitHubUsername(formData.githubUsername),
    twitterUsername: extractTwitterUsername(formData.twitterUsername),
    linkedinUsername: extractLinkedInUsername(formData.linkedinUsername),
    website: cleanWebsiteUrl(formData.website)
  };
}
