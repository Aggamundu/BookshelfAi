/** localStorage key for anonymous user id (syncs with API via x-user-id). */
export const USER_ID_STORAGE_KEY = 'bookshelfai_userId';

export function getStoredUserId() {
  try {
    return localStorage.getItem(USER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredUserId(id) {
  try {
    if (id) localStorage.setItem(USER_ID_STORAGE_KEY, id);
    else localStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}
