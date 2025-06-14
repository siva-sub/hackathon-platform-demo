
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext, UserRole } from '../../contexts/AppContext';
import { APP_NAME, DEMO_ADMIN_EMAIL, DEMO_JUDGE_1_EMAIL, DEMO_JUDGE_2_EMAIL, DEMO_PARTICIPANT_1_EMAIL, DEMO_PARTICIPANT_2_EMAIL, DEMO_PUBLIC_USER_EMAIL } from '../../constants';
import ToggleSwitch from './ToggleSwitch';

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return null; 

  const { currentUserRole, setCurrentUserRole, isDarkMode, toggleDarkMode, currentUserEmail, setCurrentUserEmail } = context;

  const demoPersonas = [
    { name: 'Admin', role: UserRole.Admin, email: DEMO_ADMIN_EMAIL },
    { name: 'Judge 1 (R1)', role: UserRole.Judge, email: DEMO_JUDGE_1_EMAIL },
    { name: 'Judge 2 (R2)', role: UserRole.Judge, email: DEMO_JUDGE_2_EMAIL },
    { name: 'Participant 1', role: UserRole.Participant, email: DEMO_PARTICIPANT_1_EMAIL },
    { name: 'Participant 2', role: UserRole.Participant, email: DEMO_PARTICIPANT_2_EMAIL },
    { name: 'Public Visitor', role: UserRole.Public, email: DEMO_PUBLIC_USER_EMAIL },
  ];

  const handlePersonaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (selectedValue === 'logout') {
      setCurrentUserRole(null);
      setCurrentUserEmail(null);
      navigate('/'); 
    } else {
      const selectedPersona = demoPersonas.find(p => p.email === selectedValue);
      if (selectedPersona) {
        setCurrentUserRole(selectedPersona.role);
        setCurrentUserEmail(selectedPersona.email);
        if (selectedPersona.role === UserRole.Public) {
            navigate('/hackathon-details');
        } else {
            navigate(`/${selectedPersona.role}`);
        }
      }
    }
  };

  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
  
  const getHomePath = () => {
    if (!currentUserRole) return "/";
    if (currentUserRole === UserRole.Public) return "/hackathon-details";
    return `/${currentUserRole}`;
  }


  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <Link to={getHomePath()} className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {APP_NAME}
        </Link>
        {currentUserEmail && <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Logged in as: {currentUserEmail} ({currentUserRole})</span>}
        <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          {currentUserRole && (
            <nav className="space-x-2 sm:space-x-4">
              {currentUserRole === UserRole.Admin && (
                <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm sm:text-base">Dashboard</Link>
              )}
              {(currentUserRole === UserRole.Participant || currentUserRole === UserRole.Public ) && (
                <Link to="/hackathon-details" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm sm:text-base">Event Info</Link>
              )}
              {currentUserRole === UserRole.Participant && (
                <Link to="/participant" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm sm:text-base">My Dashboard</Link>
              )}
              {currentUserRole === UserRole.Judge && (
                <Link to="/judge" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm sm:text-base">Dashboard</Link>
              )}
            </nav>
          )}
           <select
            value={currentUserEmail || 'logout'}
            onChange={handlePersonaChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            aria-label="Select Persona"
          >
            {!currentUserEmail && <option value="logout" disabled>Switch Persona</option>}
            {demoPersonas.map(persona => (
              <option key={persona.email} value={persona.email}>{persona.name}</option>
            ))}
            {currentUserEmail && <option value="logout">Logout (Back to Persona Selection)</option>}
          </select>
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;