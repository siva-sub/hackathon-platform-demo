
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, SubmissionStatus } from '../../types';
import { getParticipantSubmissions } from '../../services/hackathonService';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const MySubmissionsList: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, currentUserRole, currentUserEmail, allHackathons, setActiveHackathonId } = context;

  const [mySubmissions, setMySubmissions] = useState<ProjectSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  useEffect(() => {
    if (currentUserEmail && activeHackathon) {
      setIsLoadingSubmissions(true);
      // Service function `getParticipantSubmissions` now takes hackathonId
      const subs = getParticipantSubmissions(currentUserEmail, activeHackathon.id);
      setMySubmissions(subs);
      setIsLoadingSubmissions(false);
    } else {
      setMySubmissions([]);
      setIsLoadingSubmissions(false);
    }
  }, [activeHackathon, currentUserEmail]);

  if (currentUserRole !== 'participant') {
    return <Card title="Access Denied"><p>This page is for participants only.</p><Button onClick={() => navigate('/')}>Go to Role Selection</Button></Card>;
  }

  if (!activeHackathon) {
     if (allHackathons.length > 0) {
        return (
            <Card title="My Submissions">
                <p>Please select an active hackathon from the public page to view your submissions.</p>
                <Button onClick={() => { setActiveHackathonId(null); navigate('/hackathon-details');}} className="mt-4">
                    View Available Hackathons
                </Button>
            </Card>
        );
    }
    return <Card title="My Submissions"><p>No hackathons are currently active or available.</p></Card>;
  }
  
  if (isLoadingSubmissions) return <LoadingSpinner message="Loading your submissions..." />;
  
  const statusColors: Record<SubmissionStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
    round1_judging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    round2_judging: 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-200',
    round3_judging: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-200',
    round4_judging: 'bg-lime-100 text-lime-800 dark:bg-lime-700 dark:text-lime-200',
    round5_judging: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200',
    disqualified: 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-200',
    selected_for_next_round: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200',
    finalist: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200',
    runner_up: 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-200',
    second_runner_up: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-200',
    winner: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
  };

  const getProblemStatementTitle = (psId?: string) => {
    if (!psId || !activeHackathon?.problemStatements) return 'N/A';
    return activeHackathon.problemStatements.find(ps => ps.id === psId)?.title || 'Unknown Problem';
  };

  return (
    <Card title={`My Submissions for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/participant')}>Back to Dashboard</Button>}>
      {mySubmissions.length === 0 ? (
        <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No submissions yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't submitted any projects for "{activeHackathon.title}".</p>
            {activeHackathon?.acceptingSubmissions && (
                <div className="mt-6">
                <Button onClick={() => navigate('/participant/submit-project')} variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Submit a Project
                </Button>
                </div>
            )}
        </div>
      ) : (
        <ul className="space-y-4">
          {mySubmissions.map(sub => (
            <li key={sub.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400">{sub.projectName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Problem Statement: {getProblemStatementTitle(sub.problemStatementId)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                </div>
                <span className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-semibold rounded-full ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                  {sub.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <p><strong className="text-gray-600 dark:text-gray-300">Repo:</strong> <a href={sub.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-600 hover:underline">{sub.projectRepoUrl}</a></p>
                {sub.projectDemoUrl && <p><strong className="text-gray-600 dark:text-gray-300">Demo:</strong> <a href={sub.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="text-secondary-600 hover:underline">{sub.projectDemoUrl}</a></p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default MySubmissionsList;
