import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/organisms/Layout/index.jsx';
import ProtectedRoute from './components/molecules/ProtectedRoute/index.jsx';
import AuthPage from './pages/AuthPage/index.jsx';
import HomePage from './pages/HomePage/index.jsx';
import WatchPage from './pages/WatchPage/index.jsx';
import ProfilePage from './pages/ProfilePage/index.jsx';

export default function App() {
  return <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/watch/:id" element={<WatchPage />} />
      <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}