export type LocalProfile = {
  id: 'current';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarData?: string;
  bannerData?: string;
  emailVerified: boolean;
  verifiedAt?: number;
  updatedAt: number;
};

export const PROFILE_EDITABLE_KEYS = ['firstName', 'lastName', 'email', 'phone', 'avatarData', 'bannerData'] as const;

export function profileDraftDiffKeys(saved: LocalProfile, draft: LocalProfile): Array<(typeof PROFILE_EDITABLE_KEYS)[number]> {
  return PROFILE_EDITABLE_KEYS.filter((key) => (saved[key] || '') !== (draft[key] || ''));
}

export function isProfileDraftDirty(saved: LocalProfile, draft: LocalProfile): boolean {
  return profileDraftDiffKeys(saved, draft).length > 0;
}

export function allowProfileRouteChange(from: string, to: string, dirty: boolean): boolean {
  if (from === to) return true;
  return !dirty;
}
