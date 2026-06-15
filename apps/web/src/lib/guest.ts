const GUEST_ID_KEY = 'playground_guest_id';
const GUEST_NAME_KEY = 'playground_guest_name';

export interface GuestIdentity {
  guestId: string;
  displayName: string;
}

export function getGuestIdentity(): GuestIdentity | null {
  if (typeof window === 'undefined') return null;
  const guestId = localStorage.getItem(GUEST_ID_KEY);
  const displayName = localStorage.getItem(GUEST_NAME_KEY);
  if (!guestId || !displayName) return null;
  return { guestId, displayName };
}

export function setGuestIdentity(guestId: string, displayName: string) {
  localStorage.setItem(GUEST_ID_KEY, guestId);
  localStorage.setItem(GUEST_NAME_KEY, displayName);
}

export function clearGuestIdentity() {
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
}
