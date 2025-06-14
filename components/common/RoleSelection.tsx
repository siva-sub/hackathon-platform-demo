
import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext, UserRole } from '../../contexts/AppContext';
import Button from './Button';
import Card from './Card';
import { DEMO_ADMIN_EMAIL, DEMO_JUDGE_1_EMAIL, DEMO_JUDGE_2_EMAIL, DEMO_PARTICIPANT_1_EMAIL, DEMO_PARTICIPANT_2_EMAIL, DEMO_PUBLIC_USER_EMAIL, HACKATHON_ID_ACCEPTING, HACKATHON_EVENTS_MAP_KEY, PROJECT_SUBMISSIONS_MAP_KEY } from '../../constants';

const RoleSelection: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    return <div>Loading context...</div>;
  }

  const { setCurrentUserRole, setCurrentUserEmail, isDarkMode, refreshData, setActiveHackathonId, allHackathons } = context;

  const handlePersonaSelect = (role: UserRole, email: string) => {
    setCurrentUserRole(role);
    setCurrentUserEmail(email);

    if (role === UserRole.Public) {
        // For public visitor, we don't set a specific active hackathon here.
        // They will see the selector on the PublicHackathonPage.
        setActiveHackathonId(null); 
        navigate('/hackathon-details');
    } else if (role === UserRole.Admin) {
        // For admin, set the first available hackathon as active, or null if none.
        // They can switch or create from their dashboard.
        setActiveHackathonId(allHackathons.length > 0 ? allHackathons[0].id : null);
        navigate('/admin');
    } else {
        // For Judge/Participant, set a relevant demo hackathon (e.g., one accepting submissions)
        // This could be made more sophisticated if they were tied to specific events.
        const defaultActiveDemo = allHackathons.find(h => h.id === HACKATHON_ID_ACCEPTING) || (allHackathons.length > 0 ? allHackathons[0] : null);
        setActiveHackathonId(defaultActiveDemo ? defaultActiveDemo.id : null);
        navigate(`/${role}`);
    }
  };

  const personas = [
    { role: UserRole.Admin, name: 'Administrator', email: DEMO_ADMIN_EMAIL, description: 'Manage event, problem statements, rounds, and submissions.', icon: AdminIcon },
    { role: UserRole.Judge, name: 'Judge 1 (Round 1)', email: DEMO_JUDGE_1_EMAIL, description: 'Evaluate submissions for Round 1.', icon: JudgeIcon },
    { role: UserRole.Judge, name: 'Judge 2 (Round 2)', email: DEMO_JUDGE_2_EMAIL, description: 'Evaluate submissions for Round 2.', icon: JudgeIcon },
    { role: UserRole.Participant, name: 'Participant 1', email: DEMO_PARTICIPANT_1_EMAIL, description: 'Submit projects and track progress.', icon: ParticipantIcon },
    { role: UserRole.Participant, name: 'Participant 2', email: DEMO_PARTICIPANT_2_EMAIL, description: 'Submit projects and track progress.', icon: ParticipantIcon },
    { role: UserRole.Public, name: 'Public Visitor', email: DEMO_PUBLIC_USER_EMAIL, description: 'View public hackathon details, prizes, timeline, and winners.', icon: PublicUserIcon },
  ];

  const handleResetDemo = async () => {
    setCurrentUserRole(null);
    setCurrentUserEmail(null);
    setActiveHackathonId(null); // Clear active hackathon
    localStorage.removeItem(HACKATHON_EVENTS_MAP_KEY); 
    localStorage.removeItem(PROJECT_SUBMISSIONS_MAP_KEY);
    localStorage.removeItem('currentUserRole');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('activeHackathonId'); // Clear stored active ID
    await refreshData(); // This will call initializeMockData from service
    navigate('/'); 
  };


  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">Hackathon Platform Demo</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">Select a persona to explore or view event details.</p>
      </div>

      <div className="mb-8">
        <Link to="/hackathon-details" onClick={() => setActiveHackathonId(null)}>
          <Button variant="secondary" size="lg" className="px-8 py-3">
            <InfoIcon className="w-5 h-5 mr-2" />
            View All Hackathon Demos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {personas.map(({ role, name, email, description, icon: IconComponent }) => (
          <Card key={email} className="hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
            <div className="flex flex-col items-center text-center p-4">
              <div className="mb-4 text-primary-500 dark:text-primary-400"><IconComponent className="w-16 h-16" /></div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm h-16">{description}</p>
              <Button onClick={() => handlePersonaSelect(role, email)} variant="primary" size="lg" className="w-full">
                {role === UserRole.Public ? 'Explore as Visitor' : `Login as ${name}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
       <Button 
          variant="ghost" 
          onClick={handleResetDemo}
           className="mt-12 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
        >
          Reset Demo & Re-initialize Data
        </Button>
    </div>
  );
};

// Icons 
const AdminIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const ParticipantIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const JudgeIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5M3.75 12h16.5m-16.5 0V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v5.25m0 0V21M16.5 21h.008v.008H16.5V21zm-3.75 0h.008v.008H12.75V21zm-3.75 0h.008v.008H9V21zm-3.75 0h.008v.008H5.25V21z" /></svg>;
const InfoIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const PublicUserIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default RoleSelection;
