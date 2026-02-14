import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './store/useTheme'
import SplashPage from './pages/SplashPage'
import HomePage from './pages/HomePage'
import PetPage from './pages/PetPage'
import WeightPage from './pages/WeightPage'
import DiagnosisPage from './pages/DiagnosisPage'
import DietPage from './pages/DietPage'


export default function App() {
  useTheme()

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/pet/:id" element={<PetPage />} />
        <Route path="/pet/:id/weight" element={<WeightPage />} />
        <Route path="/pet/:id/diagnosis" element={<DiagnosisPage />} />
        <Route path="/pet/:id/diet" element={<DietPage />} />
      </Routes>
    </HashRouter>
  )
}