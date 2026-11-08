import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import FarmProfile from './pages/FarmProfile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CropRecommendation from './pages/CropRecommendation.jsx'
import CropComparison from './pages/CropComparison.jsx'
import CropPlan from './pages/CropPlan.jsx'
import Alerts from './pages/Alerts.jsx'
import Assistant from './pages/Assistant.jsx'
import Summary from './pages/Summary.jsx'
import Irrigation from './pages/Irrigation.jsx'
import Disease from './pages/Disease.jsx'
import Market from './pages/Market.jsx'
import Harvesting from './pages/Harvesting.jsx'
import Schemes from './pages/Schemes.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farm-profile" element={<FarmProfile />} />
        <Route path="/recommend" element={<CropRecommendation />} />
        <Route path="/compare" element={<CropComparison />} />
        <Route path="/plan" element={<CropPlan />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/irrigation" element={<Irrigation />} />
        <Route path="/disease" element={<Disease />} />
        <Route path="/market" element={<Market />} />
        <Route path="/harvesting" element={<Harvesting />} />
        <Route path="/schemes" element={<Schemes />} />
      </Route>
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
