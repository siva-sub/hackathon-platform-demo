
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, UserRole } from './contexts/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import ParticipantDashboard from './components/participant/ParticipantDashboard';
import JudgeDashboard from './components/judge/JudgeDashboard';
import PublicHackathonPage from './components/participant/PublicHackathonPage';
import ProjectSubmissionForm from './components/participant/ProjectSubmissionForm';
import MySubmissionsList from './components/participant/MySubmissionsList';
import EventSetupForm from './components/admin/EventSetupForm';
import SubmissionQuestionsForm from './components/admin/SubmissionQuestionsForm';
import JudgingCriteriaForm from './components/admin/JudgingCriteriaForm';
import SubmissionsTable from './components/admin/SubmissionsTable';
import SubmissionDetailViewAdmin from './components/admin/SubmissionDetailViewAdmin';
import AIAssistanceAdmin from './components/admin/AIAssistanceAdmin';
import AssignJudgesForm from './components/admin/AssignJudgesForm';
import SubmissionEvaluationForm from './components/judge/SubmissionEvaluationForm';
import RoleSelection from './components/common/RoleSelection';
import ProblemStatementsForm from './components/admin/ProblemStatementsForm';
import CreateHackathonForm from './components/admin/CreateHackathonForm'; // New Import

const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div className="flex items-center justify-center min-h-screen">Loading application context...</div>;
  }
  // Use activeHackathon and allHackathons
  const { currentUserRole, activeHackathon, allHackathons, isLoading } = context;

  // Initial global loading screen: if isLoading is true AND allHackathons array is empty.
  // This means data hasn't been fetched for the first time yet.
  if (isLoading && allHackathons.length === 0) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg text-center">
                 <svg className="animate-spin h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-2xl font-semibold mb-2 text-primary-600 dark:text-primary-400">Loading Hackathon Data...</h2>
                <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch event details.</p>
            </div>
        </div>
     );
  }
  
  if (!currentUserRole) {
    return <RoleSelection />;
  }
  
  // If a role IS selected, but no activeHackathon is set (and it's not the public page which can handle this),
  // it might indicate the user needs to select a hackathon or one needs to be created.
  // For Admin role, they might be redirected to select/create.
  // For Participant/Judge, if no active hackathon context, they can't do much.
  // Public role viewing /hackathon-details can function even if activeHackathon is initially null (it has a selector).
  if (!activeHackathon && currentUserRole !== UserRole.Public && window.location.pathname !== '/admin/create-hackathon') {
      // Admins might need to select or create a hackathon
      if (currentUserRole === UserRole.Admin) {
        // Redirect to dashboard where they can select or create
         return <Navigate to="/admin" replace />;
      }
      // Other roles (Participant or Judge) without an active hackathon context
      return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                <div className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-primary-600 dark:text-primary-400">No Active Hackathon</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        An active hackathon context is required for this role. Please ensure one is selected or available.
                    </p>
                    {/* Participant/Judge roles don't navigate to /admin from here */}
                </div>
            </main>
            <Footer />
        </div>
      );
  }


  const getDefaultPathForRole = (role: UserRole | null): string => {
    if (!role) return "/"; 
    switch (role) {
      case UserRole.Admin: return "/admin";
      case UserRole.Participant: return "/participant";
      case UserRole.Judge: return "/judge";
      case UserRole.Public: return "/hackathon-details"; 
      default: return "/";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to={getDefaultPathForRole(currentUserRole)} />} />
          
          <Route path="/hackathon-details" element={<PublicHackathonPage />} />
          <Route path="/admin/create-hackathon" element={<CreateHackathonForm />} />


          {currentUserRole === UserRole.Admin && activeHackathon && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/event-setup" element={<EventSetupForm />} />
              <Route path="/admin/problem-statements" element={<ProblemStatementsForm />} />
              <Route path="/admin/submission-questions" element={<SubmissionQuestionsForm />} />
              <Route path="/admin/judging-criteria" element={<JudgingCriteriaForm />} />
              <Route path="/admin/assign-judges" element={<AssignJudgesForm />} />
              <Route path="/admin/submissions" element={<SubmissionsTable />} />
              <Route path="/admin/submissions/:submissionId" element={<SubmissionDetailViewAdmin />} />
              <Route path="/admin/ai-assistance" element={<AIAssistanceAdmin />} />
            </>
          )}

          {currentUserRole === UserRole.Participant && activeHackathon && (
            <>
              <Route path="/participant" element={<ParticipantDashboard />} />
              <Route path="/participant/submit-project" element={<ProjectSubmissionForm />} />
              <Route path="/participant/my-submissions" element={<MySubmissionsList />} />
            </>
          )}

          {currentUserRole === UserRole.Judge && activeHackathon && (
            <>
              <Route path="/judge" element={<JudgeDashboard />} />
              <Route path="/judge/evaluate/:submissionId" element={<SubmissionEvaluationForm />} />
            </>
          )}
          
           <Route path="*" element={<Navigate to={getDefaultPathForRole(currentUserRole)} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
