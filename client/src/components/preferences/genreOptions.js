/** Surface tone per card (matches design variety). */
export const GENRE_OPTIONS = [
  { id: 'fiction', label: 'Fiction', icon: 'auto_stories', surface: 'low' },
  { id: 'sci-fi', label: 'Sci-Fi', icon: 'rocket_launch', surface: 'container' },
  { id: 'biography', label: 'Biography', icon: 'person_outline', surface: 'high' },
  { id: 'classics', label: 'Classics', icon: 'history_edu', surface: 'container' },
  { id: 'mystery', label: 'Mystery', icon: 'fingerprint', surface: 'low' },
  { id: 'philosophy', label: 'Philosophy', icon: 'psychology', surface: 'highest' },
]

export const SURFACE_CLASS = {
  low: 'bg-surface-container-low',
  container: 'bg-surface-container',
  high: 'bg-surface-container-high',
  highest: 'bg-surface-container-highest',
}
