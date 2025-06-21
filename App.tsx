
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './contexts/AppContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ParticipantPage from './pages/ParticipantPage';
import JudgePage from './pages/JudgePage';
import SuperAdminPage from './pages/SuperAdminPage'; 
import NotFoundPage from './pages/NotFoundPage';
import PublicHackathonListPage from './pages/PublicHackathonListPage'; 
import PublicHackathonDetailPage from './pages/PublicHackathonDetailPage'; 
import PublicHackathonQAPage from './pages/PublicHackathonQAPage'; // New Import

const App: React.FC = () => {
  const { currentUser } = useAppContext();
  const role = currentUser?.role;

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/public-events" element={<PublicHackathonListPage />} />
            <Route path="/public-events/:hackathonId" element={<PublicHackathonDetailPage />} />
            <Route path="/public-events/:hackathonId/qanda" element={<PublicHackathonQAPage />} /> {/* New Route */}

            <Route path="/superadmin/*" element={
              role === 'superadmin' ? <SuperAdminPage /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/*" element={
              role === 'admin' ? <AdminPage /> : <Navigate to="/" replace />
            } />
            <Route path="/participant/*" element={
              role === 'participant' ? <ParticipantPage /> : <Navigate to="/" replace />
            } />
            <Route path="/judge/*" element={
              role === 'judge' ? <JudgePage /> : <Navigate to="/" replace />
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
