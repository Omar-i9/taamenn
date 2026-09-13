import { getItem, putItem, deleteItem } from './localDb';

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

export async function getProfile() { return getItem<LocalProfile>('profile', 'current'); }
export async function saveProfile(profile: Omit<LocalProfile, 'id' | 'updatedAt'> | LocalProfile) {
  const { bio: _legacyBio, ...clean } = profile as LocalProfile & { bio?: string };
  void _legacyBio;
  const value: LocalProfile = { ...clean, id:'current', updatedAt:Date.now() };
  await putItem('profile', value);
  return value;
}
export async function removeProfile() { 
  await deleteItem('profile', 'current');
}
