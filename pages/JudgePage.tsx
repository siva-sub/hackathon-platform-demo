import React from 'react';
import { Routes, Route, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import JudgeDashboard from '../components/judge/JudgeDashboard';
import JudgingInterfaceWrapper from '../components/judge/JudgingInterfaceWrapper'; // Changed import
import { Icons } from '../constants';
import Card from '../components/ui/Card';
import { useAppContext } from '../contexts/AppContext';
import Alert from '../components/ui/Alert';

const JudgePage: React.FC = () => {
  const location = useLocation();
  const { hackathons, currentHackathonId, selectHackathon, getCurrentHackathon, currentUser } = useAppContext();
  
  // Filter hackathons to only those where the current judge is assigned to at least one stage
  const judgeEmailLower = currentUser?.email?.toLowerCase();
  const availableHackathonsForJudge = React.useMemo(() => {
    if (!judgeEmailLower) return [];
    return hackathons.filter(h => 
        h.data.status === 'approved' && // Only show approved hackathons
        h.data.stages.some(stage => 
            stage.assignedJudgeEmails.map(sje => sje.toLowerCase()).includes(judgeEmailLower)
        )
    );
  }, [hackathons, judgeEmailLower]);

  const currentHackathon = getCurrentHackathon();

  // Effect to ensure currentHackathonId is one the judge can work on
  React.useEffect(() => {
    if (judgeEmailLower && currentHackathonId) {
        const canJudgeCurrent = availableHackathonsForJudge.some(h => h.id === currentHackathonId);
        if(!canJudgeCurrent && availableHackathonsForJudge.length > 0) {
            selectHackathon(availableHackathonsForJudge[0].id);
        } else if (!canJudgeCurrent && availableHackathonsForJudge.length === 0) {
            selectHackathon(null); // No hackathons for this judge
        }
    } else if (judgeEmailLower && !currentHackathonId && availableHackathonsForJudge.length > 0) {
        selectHackathon(availableHackathonsForJudge[0].id);
    }
  }, [currentHackathonId, availableHackathonsForJudge, judgeEmailLower, selectHackathon]);


  const handleHackathonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectHackathon(e.target.value);
  };

  const navLinks = [
    { path: '/judge', label: 'Judging Dashboard', icon: <Icons.Home /> },
  ];
  
  return (
     <div className="space-y-6">
        <Card title="Select Hackathon to Judge">
            <div className="max-w-md">
                <label htmlFor="hackathonSelectorJudge" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                    Judging For:
                </label>
                <select
                    id="hackathonSelectorJudge"
                    value={currentHackathonId || ''}
                    onChange={handleHackathonSelect}
                    className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                    disabled={availableHackathonsForJudge.length === 0}
                >
                    <option value="" disabled>-- Select a Hackathon --</option>
                    {availableHackathonsForJudge.map(h => (
                        <option key={h.id} value={h.id}>{h.data.title}</option>
                    ))}
                </select>
                {availableHackathonsForJudge.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-2">No hackathons or stages assigned to you for judging.</p>}
            </div>
        </Card>

        {currentHackathonId && currentHackathon && availableHackathonsForJudge.some(h=>h.id === currentHackathonId) ? (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md self-start flex-shrink-0">
                    <h2 className="text-xl font-semibold mb-1 text-purple-700 dark:text-purple-400">Judge Menu</h2>
                     <p className="text-xs text-neutral-500 dark:text-neutral-300 mb-3 border-b pb-2 dark:border-neutral-700">For: {currentHackathon.data.title}</p>
                    <nav className="space-y-1 sm:space-y-2">
                    {navLinks.map(link => (
                        <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                            ${location.pathname === link.path 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100' 
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-100'
                            }`}
                        >
                        {link.icon}
                        <span>{link.label}</span>
                        </Link>
                    ))}
                    </nav>
                </aside>
                <div className="flex-1 min-w-0"> {/* Added min-w-0 */}
                    <Routes>
                    <Route index element={<JudgeDashboard />} />
                    <Route path="submission/:submissionId" element={<JudgingInterfaceWrapper />} />
                    </Routes>
                </div>
            </div>
        ) : (
             currentHackathonId && currentHackathon && !availableHackathonsForJudge.some(h=>h.id === currentHackathonId) ?
             <Alert type="warning" message={`You are not assigned to judge any stages in "${currentHackathon.data.title}". Please select another hackathon if available.`} /> :
             (!currentHackathonId && availableHackathonsForJudge.length > 0 && <Alert type="info" message="Please select a hackathon from the dropdown to start judging."/>)
        )}
    </div>
  );
};

export default JudgePage;