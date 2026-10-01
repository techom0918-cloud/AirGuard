import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNavigation } from './components/layout/MobileNavigation';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { TechnologyPage } from './pages/public/TechnologyPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Authenticated App Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { AlertsPage } from './pages/app/AlertsPage';
import { HistoryPage } from './pages/app/HistoryPage';
import { AnalyticsPage } from './pages/app/AnalyticsPage';
import { MapPage } from './pages/app/MapPage';
import { InsightsPage } from './pages/app/InsightsPage';
import { DevicePage } from './pages/app/DevicePage';
import { DoctorSharePage } from './pages/app/DoctorSharePage';
import { MedicationPage } from './pages/app/MedicationPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';

import { EnvironmentSnapshot, DeviceStatus } from './types';
import { environmentService } from './services/environmentService';
import { deviceService } from './services/deviceService';
import { backendTelemetryService } from './services/backendTelemetryService';
import { X } from 'lucide-react';

const AppLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot | null>(null);
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Start real-time backend telemetry polling
    backendTelemetryService.start();

    const unsubEnv = environmentService.subscribeToSnapshot((snap) => {
      setSnapshot(snap);
    });

    const unsubDevice = deviceService.subscribeToDeviceStatus((dev) => {
      setDevice(dev);
    });

    return () => {
      unsubEnv();
      unsubDevice();
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await environmentService.getLatestSnapshot();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const getHeaderInfo = (pathname: string) => {
    if (pathname.includes('/alerts')) {
      return {
        title: 'Environmental & Device Alerts',
        subtitle: 'Tiered predictive warnings and hardware connection state notices',
      };
    }
    if (pathname.includes('/history')) {
      return {
        title: 'Event History',
        subtitle: 'Audit log of environmental warnings and smart inhaler actuations',
      };
    }
    if (pathname.includes('/analytics')) {
      return {
        title: 'Environmental Analytics',
        subtitle: 'Exposure metrics, particulate distribution & co-factor correlation',
      };
    }
    if (pathname.includes('/map')) {
      return {
        title: 'Environmental Trigger Map',
        subtitle: 'Geospatial observations of elevated environmental conditions',
      };
    }
    if (pathname.includes('/insights')) {
      return {
        title: 'AI Environmental Insights',
        subtitle: 'Recognizing patterns and micro-trends across recent exposure',
      };
    }
    if (pathname.includes('/device')) {
      return {
        title: 'ESP32 Device & Sensor Diagnostics',
        subtitle: 'Sharp GP2Y1010AU0F, Sensirion SGP40, SHT31, and MDI sleeve status',
      };
    }
    if (pathname.includes('/doctor-share')) {
      return {
        title: 'Doctor Environmental Report',
        subtitle: 'Structured clinical summary of ambient triggers and inhalation doses',
      };
    }
    if (pathname.includes('/medication')) {
      return {
        title: 'AI Real-Time Dosage Predictor',
        subtitle: 'Continuous environmental risk & patient biometric dosage calculations',
      };
    }
    if (pathname.includes('/profile')) {
      return {
        title: 'User Profile & Identity',
        subtitle: 'Account details and linked emergency guardian contact',
      };
    }
    if (pathname.includes('/settings')) {
      return {
        title: 'Platform & Hardware Preferences',
        subtitle: 'Notification rules, LED brightness, buzzer acoustic tone, and privacy',
      };
    }
    return {
      title: 'Environmental Dashboard',
      subtitle: 'Real-time proactive trigger monitoring & sensor telemetry',
    };
  };

  const headerInfo = getHeaderInfo(location.pathname);
  const currentRisk = snapshot ? snapshot.riskLevel : 'low';
  const lastUpdated = snapshot ? snapshot.lastUpdated : 'Just now';

  return (
    <div className="min-h-screen bg-[#F4FAF8] flex flex-col md:flex-row text-slate-800">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen">
        <Sidebar
          currentRiskLevel={currentRisk}
          batteryLevel={device?.batteryLevel}
          isDeviceConnected={device?.connected}
        />
      </div>

      {/* Mobile Slide-over Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full relative flex flex-col justify-between">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          <Sidebar
            currentRiskLevel={currentRisk}
            batteryLevel={device?.batteryLevel}
            isDeviceConnected={device?.connected}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          riskLevel={currentRisk}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Direct entry redirect to Login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated Application Routes with AppLayoutShell */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppLayoutShell>
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="alerts" element={<AlertsPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="insights" element={<InsightsPage />} />
                    <Route path="device" element={<DevicePage />} />
                    <Route path="doctor-share" element={<DoctorSharePage />} />
                    <Route path="medication" element={<MedicationPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AppLayoutShell>
              </ProtectedRoute>
            }
          />

          {/* Direct aliases for top-level app paths (e.g. /dashboard -> /app/dashboard) */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/alerts" element={<Navigate to="/app/alerts" replace />} />
          <Route path="/history" element={<Navigate to="/app/history" replace />} />
          <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
          <Route path="/map" element={<Navigate to="/app/map" replace />} />
          <Route path="/insights" element={<Navigate to="/app/insights" replace />} />
          <Route path="/device" element={<Navigate to="/app/device" replace />} />
          <Route path="/doctor-share" element={<Navigate to="/app/doctor-share" replace />} />
          <Route path="/medication" element={<Navigate to="/app/medication" replace />} />
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
