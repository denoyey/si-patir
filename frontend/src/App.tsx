import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BackToTop } from './components/BackToTop';
import { LenisScrollEngine } from './services/scroll/LenisScrollEngine';

function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const engine = LenisScrollEngine.getInstance();
    engine.init();

    if (hash) {
      const timer = setTimeout(() => {
        engine.scrollTo(hash, { offset: -75, duration: 1.2 });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
      engine.scrollTo(0, { immediate: true });
    }
  }, [pathname, hash]);

  return null;
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTopOnNavigate />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
