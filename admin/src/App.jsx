import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Gallery from './pages/Gallery';
import FeedbackAdmin from './pages/FeedbackAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected admin routes */}
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Gallery />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeedbackAdmin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/gallery" replace />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/gallery" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
