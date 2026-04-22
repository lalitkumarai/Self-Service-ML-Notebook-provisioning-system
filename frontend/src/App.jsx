import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import LandingScreen from './screens/LandingScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import NotebookEditorScreen from './screens/NotebookEditorScreen';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './components/AuthProvider';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/notebook/:id" element={<NotebookEditorScreen />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardScreen />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<PrivateRoute adminOnly={true} />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboardScreen />} />
              </Route>
            </Route>

          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
