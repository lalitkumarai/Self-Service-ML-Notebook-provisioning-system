/**
 * App.jsx — Production-grade router configuration
 *
 * Optimisations:
 *  • All route components are lazy-loaded (code-split per route)
 *  • React.Suspense wraps the route tree with a polished PageLoader fallback
 *  • AnimatePresence (framer-motion) drives page-transition exit animations
 *  • Custom 404 NotFoundScreen catches all unmatched paths
 *  • react-router-dom v6 nested layout pattern preserved
 */
import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './components/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import PageLoader from './components/PageLoader';

/* ── Lazy route imports (one chunk per screen) ───────────────── */
const LandingScreen         = lazy(() => import('./screens/LandingScreen'));
const LoginScreen           = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen        = lazy(() => import('./screens/RegisterScreen'));
const ForgotPasswordScreen  = lazy(() => import('./screens/ForgotPasswordScreen'));
const DashboardScreen       = lazy(() => import('./screens/DashboardScreen'));
const AdminDashboardScreen  = lazy(() => import('./screens/AdminDashboardScreen'));
const NotebookEditorScreen  = lazy(() => import('./screens/NotebookEditorScreen'));
const DatasetScreen         = lazy(() => import('./screens/DatasetScreen'));
const ExperimentScreen      = lazy(() => import('./screens/ExperimentScreen'));
const DemoScreen            = lazy(() => import('./screens/DemoScreen'));
const SettingsScreen        = lazy(() => import('./screens/SettingsScreen'));
const NotFoundScreen        = lazy(() => import('./screens/NotFoundScreen'));

/* ── Layout (also lazy — it's a large component) ────────────── */
const Layout = lazy(() => import('./components/Layout'));

/* ── Animated route tree ─────────────────────────────────────── */
/**
 * AnimatedRoutes must be a child component so it can call useLocation()
 * inside the Router context — AnimatePresence needs the key to change.
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>

        {/* ── Public routes ─────────────────────────────────── */}
        <Route path="/"               element={<LandingScreen />} />
        <Route path="/login"          element={<LoginScreen />} />
        <Route path="/register"       element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

        {/* ── Protected user routes ─────────────────────────── */}
        <Route element={<PrivateRoute />}>
          {/* Standalone (no sidebar Layout) */}
          <Route path="/notebook/:id" element={<NotebookEditorScreen />} />

          {/* With sidebar Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard"   element={<DashboardScreen />} />
            <Route path="/datasets"    element={<DatasetScreen />} />
            <Route path="/experiments" element={<ExperimentScreen />} />
            <Route path="/demo"        element={<DemoScreen />} />
            <Route path="/settings"    element={<SettingsScreen />} />
          </Route>
        </Route>

        {/* ── Protected admin routes ────────────────────────── */}
        <Route element={<PrivateRoute adminOnly={true} />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboardScreen />} />
          </Route>
        </Route>

        {/* ── 404 catch-all ────────────────────────────────── */}
        <Route path="*" element={<NotFoundScreen />} />

      </Routes>
    </AnimatePresence>
  );
}

/* ── Root app ────────────────────────────────────────────────── */
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          {/*
           * Suspense wraps the whole router so any lazy component that
           * hasn't been fetched yet shows the PageLoader fallback.
           */}
          <Suspense fallback={<PageLoader message="Loading page…" />}>
            <AnimatedRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
