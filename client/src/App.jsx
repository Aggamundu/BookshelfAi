import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import PreferencesPage from './pages/PreferencesPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import RecommendationsPage from './pages/RecommendationsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/preferences" element={<PreferencesPage />} />
      <Route path="/library" element={<PlaceholderPage title="Library" />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
