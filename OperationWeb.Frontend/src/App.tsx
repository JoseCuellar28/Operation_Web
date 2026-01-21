import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedLayout from './layout/ProtectedLayout';
import MainLayout from './layout/MainLayout';

// Pages
import PersonalPage from './pages/operations/PersonalPage';
import { ProjectsView } from './pages/ProjectsView';
import AttendanceView from './pages/AttendanceView';
import { GPSLiveView } from './pages/GPSLiveView';

// Placeholder components for routes
const Dashboard = () => <div className="p-4 bg-white rounded shadow">Dashboard Content Placeholder</div>;
const NotFound = () => <div className="p-4 text-red-500">404 Not Found</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Operations Routes */}
              {/* Operations Routes - Placeholder for future Allocation logic */}
              {/* <Route path="/operaciones/personal" element={<PersonalPage />} /> */}
              {/* <Route path="/operaciones/proyectos" element={<ProjectsView />} /> */}

              {/* Seguimiento Routes (Phase 4 Active) */}
              <Route path="/seguimiento/asistencia" element={<AttendanceView />} />
              <Route path="/seguimiento/rastreo" element={<GPSLiveView />} />

              <Route path="/config/colaboradores" element={<PersonalPage />} />
              <Route path="/config/proyectos" element={<ProjectsView />} />
              <Route path="/config/*" element={<div>Config Content Placeholder (Vehículos/Materiales en construcción)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
