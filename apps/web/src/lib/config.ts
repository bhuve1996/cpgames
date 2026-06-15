import { GUEST_PLAY_ENABLED } from '@playground/shared';

/** Client-side guest play toggle (set NEXT_PUBLIC_GUEST_PLAY_ENABLED=false to disable). */
export const guestPlayEnabled =
  GUEST_PLAY_ENABLED && process.env.NEXT_PUBLIC_GUEST_PLAY_ENABLED !== 'false';
