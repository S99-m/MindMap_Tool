import { Routes, Route, Navigate } from 'react-router-dom'
import { MindMapProvider } from './context/MindMapContext'
import Dashboard from './pages/Dashboard'
import MapEditor from './pages/MapEditor'

export default function App() {
  return (
    <MindMapProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map/:mapId" element={<MapEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MindMapProvider>
  )
}
