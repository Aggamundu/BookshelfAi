/** Session flags for the linear onboarding UI (no auth). */
export const SHELF_PHOTO_KEY = 'bookshelfai_shelfPhotoReady'
export const PREFS_COMPLETE_KEY = 'bookshelfai_prefsComplete'

export function hasShelfPhotoSession() {
  return sessionStorage.getItem(SHELF_PHOTO_KEY) === '1'
}

export function hasPrefsCompleteSession() {
  return sessionStorage.getItem(PREFS_COMPLETE_KEY) === '1'
}

export function setPrefsCompleteSession() {
  sessionStorage.setItem(PREFS_COMPLETE_KEY, '1')
}
