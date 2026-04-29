import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import AdminLayouts from '../layouts/AdminLayouts';
import UserLayout from '../layouts/UserLayout';
import AdminPage from '../pages/admin/AdminPage';
import ImportPage from '../pages/admin/ImportPage';
import QrPdfPage from '../pages/admin/QrPdfPage';
import MovementsPage from '../pages/admin/MovementsPage';
import UserDashboardPage from '../pages/user/UserDashboardPage';
import UserScanPage from '../pages/user/UserScanPage';
import UserVehiclesPage from '../pages/user/UserVehiclesPage';
import UserResultPage from '../pages/user/UserResultPage';
import UserRegisterPage from '../pages/user/UserRegisterPage';


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />


      // Rutas protegidas para Administrador
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayouts />
            </ProtectedRoute>
          }
        >

          <Route path="users" element={<AdminPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="qr-pdf" element={<QrPdfPage />} />
          <Route path="movements" element={<MovementsPage />} />
          <Route index element={<Navigate to="users" replace />} />
        </Route>

        //Rutas protegidas para Usuario
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserLayout />
            </ProtectedRoute>
          }
        > 
          <Route index element={<UserDashboardPage />} />
          <Route path="scan" element={<UserScanPage />} />
          <Route path="vehicles" element={<UserVehiclesPage />} />
          <Route path="result" element={<UserResultPage />} />
          <Route path="register" element={<UserRegisterPage/>} />
        </Route>


        //Ruta para manejar páginas no encontradas
        <Route path="*" element={<p style={{ padding: '20px' }}>Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;