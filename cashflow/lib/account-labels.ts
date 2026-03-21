import { DEFAULT_ACCOUNT_ID } from '@/lib/firebase';

/** Firebase account id → display name (extend when more accounts are in RTDB). */
export const ACCOUNT_ID_TO_NAME: Record<string, string> = {
  [DEFAULT_ACCOUNT_ID]: 'Залуусын харилцах',
};

export function accountLabelForId(accountId: string | undefined): string {
  if (!accountId) return ACCOUNT_ID_TO_NAME[DEFAULT_ACCOUNT_ID];
  return ACCOUNT_ID_TO_NAME[accountId] ?? accountId;
}
