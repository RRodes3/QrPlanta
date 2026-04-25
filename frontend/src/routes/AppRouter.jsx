import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import UserPages from '../pages/UserPages';
import ProtectedRoute from './ProtectedRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserPages />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<p style={{ padding: '20px' }}>Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;