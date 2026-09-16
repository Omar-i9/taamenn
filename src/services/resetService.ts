import { resetTaamenData as resetIndexedDB } from './localDb';
import { removeProfile } from './profileRepository';

/**
 * TAAMEN Security & Data Reset Service
 * 
 * This service provides a single authoritative pipeline for resetting all TAAMEN-owned local data.
 * It coordinates cleanup across:
 * - IndexedDB stores
 * - localStorage keys
 * - sessionStorage keys
 * - Runtime state is managed by the caller (App.tsx)
 */

// TAAMEN-owned localStorage keys. Every key the app writes must appear here.
const TAAMEN_LOCALSTORAGE_KEYS = [
  'taamen-language',
  'taamen-consent-version',
  'taamen-sidebar-collapsed',
  'taamen-install-dismissed-v1'
] as const;

/**
 * TAAMEN keeps no session identity in web storage: the signed-in state lives in an
 * HttpOnly cookie and a server-side record. Ending that session is the caller's
 * responsibility (App.tsx calls the logout endpoint alongside this reset).
 */
const TAAMEN_SESSIONSTORAGE_KEYS = [] as const;

export interface ResetResult {
  success: boolean;
  clearedStores: string[];
  errors: string[];
}

/**
 * Complete TAAMEN local data reset
 * 
 * This function:
 * 1. Clears all IndexedDB stores
 * 2. Clears all TAAMEN-owned localStorage keys
 * 3. Clears all TAAMEN-owned sessionStorage keys
 * 4. Verifies deletion where practical
 * 5. Returns detailed result
 * 
 * Does NOT delete:
 * - Unrelated browser data
 * - Other websites' data
 * - Browser history
 * - User files
 */
export async function resetTaamenComplete(): Promise<ResetResult> {
  const result: ResetResult = {
    success: false,
    clearedStores: [],
    errors: []
  };

  try {
    // Step 1: Clear IndexedDB stores
    try {
      await resetIndexedDB();
      result.clearedStores.push('IndexedDB (all stores)');
    } catch (error) {
      result.errors.push(`IndexedDB reset failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 2: Clear TAAMEN-owned localStorage keys
    for (const key of TAAMEN_LOCALSTORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
        result.clearedStores.push(`localStorage.${key}`);
      } catch (error) {
        result.errors.push(`localStorage.${key} cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Step 3: Clear TAAMEN-owned sessionStorage keys
    for (const key of TAAMEN_SESSIONSTORAGE_KEYS) {
      try {
        sessionStorage.removeItem(key);
        result.clearedStores.push(`sessionStorage.${key}`);
      } catch (error) {
        result.errors.push(`sessionStorage.${key} cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Step 4: Verify every key this service claims to clear is actually gone
    try {
      for (const key of TAAMEN_LOCALSTORAGE_KEYS) {
        if (localStorage.getItem(key) !== null) {
          result.errors.push(`Verification failed: ${key} still exists`);
        }
      }
      for (const key of TAAMEN_SESSIONSTORAGE_KEYS) {
        if (sessionStorage.getItem(key) !== null) {
          result.errors.push(`Verification failed: ${key} still exists`);
        }
      }
    } catch (error) {
      result.errors.push(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 5: Determine overall success
    result.success = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Reset process failed: ${error instanceof Error ? error.message : String(error)}`);
    result.success = false;
  }

  return result;
}
