
import React, { createContext, useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useDarkMode from '../hooks/useDarkMode';
import { HackathonEvent, ProjectSubmission, UserRole } from '../types';
import { getAllHackathonEvents, getSubmissionsByHackathonId, initializeMockData, getHackathonEventById } from '../services/hackathonService'; // Updated imports

export { UserRole }; 

interface AppContextType {
  currentUserRole: UserRole | null;
  setCurrentUserRole: (role: UserRole | null) => void;
  currentUserEmail: string | null; 
  setCurrentUserEmail: (email: string | null) => void; 
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  activeHackathon: HackathonEvent | null; // Renamed from hackathon
  setActiveHackathonId: (id: string | null) => void; // New: to set the active hackathon
  allHackathons: HackathonEvent[]; // New: to store all loaded hackathons

  submissions: ProjectSubmission[]; // Submissions for the active hackathon
  // setSubmissions is removed as it's managed internally by activeHackathonId change

  refreshData: () => Promise<void>; // Make refreshData async
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserRole, setCurrentUserRoleState] = useLocalStorage<UserRole | null>('currentUserRole', null);
  const [currentUserEmail, setCurrentUserEmailState] = useLocalStorage<string | null>('currentUserEmail', null);
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  
  const [activeHackathonId, setActiveHackathonIdState] = useLocalStorage<string | null>('activeHackathonId', null);
  const [allHackathons, setAllHackathons] = useState<HackathonEvent[]>([]);
  const [activeHackathon, setActiveHackathon] = useState<HackathonEvent | null>(null);
  
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setCurrentUserRole = (role: UserRole | null) => {
    setCurrentUserRoleState(role);
    if (!role) { 
      setCurrentUserEmailState(null);
      // Potentially clear activeHackathonId if role change implies context switch
      // setActiveHackathonIdState(null); 
    }
  };

  const setCurrentUserEmail = (email: string | null) => { 
    setCurrentUserEmailState(email);
  };

  const setActiveHackathonId = (id: string | null) => {
    setActiveHackathonIdState(id);
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    initializeMockData(); // Ensures demo data is there if needed
    
    const events = getAllHackathonEvents();
    setAllHackathons(events);

    if (activeHackathonId) {
      const currentActive = events.find(h => h.id === activeHackathonId) || null;
      setActiveHackathon(currentActive);
      if (currentActive) {
        const subs = getSubmissionsByHackathonId(activeHackathonId);
        setSubmissions(subs);
      } else {
        // Active ID exists but no matching hackathon, clear submissions
        setSubmissions([]);
         // setActiveHackathonIdState(null); // Optionally reset if ID is invalid
      }
    } else {
      // No activeHackathonId, so no specific hackathon is active.
      // Set a default active hackathon if needed (e.g., first from the list) or leave null
      // For now, leave null, UI should handle selection
      setActiveHackathon(null);
      setSubmissions([]);
    }
    
    setIsLoading(false);
  }, [activeHackathonId]); // Add activeHackathonId as dependency

  useEffect(() => {
    refreshData();
  }, [refreshData]); // refreshData itself depends on activeHackathonId

  // Effect to update activeHackathon and its submissions when activeHackathonId changes or allHackathons list updates
  useEffect(() => {
    if (activeHackathonId && allHackathons.length > 0) {
      const currentActive = allHackathons.find(h => h.id === activeHackathonId) || null;
      setActiveHackathon(currentActive);
      if (currentActive) {
        setSubmissions(getSubmissionsByHackathonId(activeHackathonId));
      } else {
        setSubmissions([]);
      }
    } else if (!activeHackathonId) { // If ID is cleared, clear active hackathon and submissions
        setActiveHackathon(null);
        setSubmissions([]);
    }
  }, [activeHackathonId, allHackathons]);


  if (isLoading && allHackathons.length === 0 && !activeHackathon) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Initializing Platform...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Setting up the hackathon environment.</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentUserRole,
      setCurrentUserRole,
      currentUserEmail, 
      setCurrentUserEmail, 
      isDarkMode,
      toggleDarkMode,
      
      activeHackathon,
      setActiveHackathonId,
      allHackathons,

      submissions, // Submissions for the active hackathon

      refreshData,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};
