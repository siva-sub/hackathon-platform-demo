
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const ParticipantDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, setActiveHackathonId, allHackathons } = context; // Use activeHackathon

  if (!activeHackathon) {
    // If no active hackathon, prompt to select one if others are available
    if (allHackathons.length > 0) {
        return (
            <Card title="Participant Dashboard">
                <p>Please select a hackathon to participate in.</p>
                <Button onClick={() => { setActiveHackathonId(null); navigate('/hackathon-details');}} className="mt-4">
                    View Available Hackathons
                </Button>
            </Card>
        );
    }
    return <Card title="Participant Dashboard"><p>No hackathons are currently active or available. Please check back later.</p></Card>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Participant Dashboard</h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">Welcome to the <span className="font-semibold text-primary-600 dark:text-primary-400">{activeHackathon.title}</span>!</p>
            </div>
            {activeHackathon.acceptingSubmissions && (
                 <Link to="/participant/submit-project" className="mt-4 md:mt-0">
                    <Button variant="primary" size="lg">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Submit New Project
                    </Button>
                </Link>
            )}
        </div>
        {!activeHackathon.acceptingSubmissions && (
            <p className="mt-4 text-md text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-700 p-3 rounded-md">
                Submissions are currently closed for this hackathon.
            </p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/hackathon-details" className="block hover:no-underline">
          <Card className="hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-400 border-2 border-transparent transition-all duration-200 h-full flex flex-col">
              <div className="flex items-center mb-3">
                <InfoIcon className="w-10 h-10 text-primary-600 dark:text-primary-400 mr-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">View Event Details</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">Access all hackathon information, rules, and timeline for <span className="font-medium">{activeHackathon.title}</span>.</p>
               <div className="mt-4 text-right">
                <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">View Details &rarr;</span>
              </div>
          </Card>
        </Link>

        <Link to="/participant/my-submissions" className="block hover:no-underline">
          <Card className="hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-400 border-2 border-transparent transition-all duration-200 h-full flex flex-col">
            <div className="flex items-center mb-3">
                <ListIcon className="w-10 h-10 text-primary-600 dark:text-primary-400 mr-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Submissions</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">Track the status of your projects submitted to <span className="font-medium">{activeHackathon.title}</span>.</p>
             <div className="mt-4 text-right">
                <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">View My Submissions &rarr;</span>
              </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// Placeholder Icons
const InfoIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const ListIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a3.001 3.001 0 00-3.75 0M3.75 12h.007v.008H3.75V12zm.375 0a3.001 3.001 0 00-3.75 0M3.75 17.25h.007v.008H3.75v-.008zm.375 0a3.001 3.001 0 00-3.75 0" /></svg>;
const PlusIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;


export default ParticipantDashboard;
