
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';

const AdminDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return null;
  const { activeHackathon, allHackathons, setActiveHackathonId, currentUserEmail } = context;

  const sections = [
    { title: 'Event Setup & Stages', description: 'Define details, timeline, rules, and manage hackathon stages.', link: '/admin/event-setup', icon: SetupIcon },
    { title: 'Problem Statements', description: 'Manage hackathon problem statements or themes.', link: '/admin/problem-statements', icon: ProblemStatementIcon },
    { title: 'Submission Questions', description: 'Manage questions for project submissions.', link: '/admin/submission-questions', icon: QuestionsIcon },
    { title: 'Judging Criteria & Rounds', description: 'Define judging matrix and configure rounds.', link: '/admin/judging-criteria', icon: CriteriaIcon },
    { title: 'Assign Judges', description: 'Assign judges to specific judging rounds.', link: '/admin/assign-judges', icon: AssignJudgeIcon },
    { title: 'View Submissions', description: 'Oversee and manage all project submissions.', link: '/admin/submissions', icon: SubmissionsIcon },
    { title: 'AI Assistance', description: 'Get AI-powered tips for hackathon management.', link: '/admin/ai-assistance', icon: AIIcon },
  ];

  const hackathonOptions = allHackathons.map(h => ({ value: h.id, label: h.title }));

  const handleHackathonSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (newId) {
        setActiveHackathonId(newId);
    } else {
        setActiveHackathonId(null); // No hackathon selected
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Administrator Dashboard</h1>
                {activeHackathon ? (
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Managing: <span className="font-semibold text-primary-600 dark:text-primary-400">{activeHackathon.title}</span></p>
                ) : (
                    <p className="mt-2 text-lg text-yellow-600 dark:text-yellow-400">No active hackathon selected. Please select one or create a new one.</p>
                )}
            </div>
            <Button onClick={() => navigate('/admin/create-hackathon')} variant="primary" size="md" className="sm:ml-auto">
                <PlusIcon className="w-5 h-5 mr-2"/> Create New Hackathon
            </Button>
        </div>
         {allHackathons.length > 0 && (
            <div className="mt-6">
                <Select
                    label="Switch Active Hackathon:"
                    options={[{value: "", label: "Select a Hackathon"}, ...hackathonOptions]}
                    value={activeHackathon?.id || ""}
                    onChange={handleHackathonSwitch}
                    containerClassName="max-w-md"
                />
            </div>
        )}
      </Card>

      {!activeHackathon && allHackathons.length > 0 && (
          <Card>
              <p className="text-center text-gray-600 dark:text-gray-300">Please select a hackathon from the dropdown above to manage its details.</p>
          </Card>
      )}

      {activeHackathon && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(section => (
            <Link to={section.link} key={section.title} className="block hover:no-underline">
                <Card className="hover:shadow-xl hover:border-primary-500 dark:hover:border-primary-400 border-2 border-transparent transition-all duration-200 h-full flex flex-col">
                <div className="flex items-center mb-4">
                    <section.icon className="w-10 h-10 text-primary-600 dark:text-primary-400 mr-4" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{section.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">{section.description}</p>
                <div className="mt-4 text-right">
                    <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Go to {section.title} &rarr;</span>
                </div>
                </Card>
            </Link>
            ))}
        </div>
      )}
    </div>
  );
};

// Icons
const PlusIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const SetupIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const ProblemStatementIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 12M17 13.75L18.25 15M15.75 12L17 10.25m-7.5 7.5h7.5m-7.5 0V5.625M9 5.625h2.25M12.75 15h2.25" /></svg>;
const QuestionsIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a3.001 3.001 0 00-3.75 0M3.75 12h.007v.008H3.75V12zm.375 0a3.001 3.001 0 00-3.75 0M3.75 17.25h.007v.008H3.75v-.008zm.375 0a3.001 3.001 0 00-3.75 0" /></svg>;
const CriteriaIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12M3.75 3h-1.5m1.5 0h16.5M3.75 12h16.5m-16.5 0V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v5.25m-18 0A2.25 2.25 0 005.25 12h13.5A2.25 2.25 0 0021 9.75M7.5 15h9M7.5 12h9m-9 3h9M3.75 21h16.5" /></svg>;
const SubmissionsIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const AIIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.611 3.75 12.375 3.75S21 7.444 21 12zM12 9.75v2.625m0 0v2.625m0-2.625h.008v.008H12v-.008zm0 0H9.75m2.25 0H14.25" /></svg>;
const AssignJudgeIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72m.941 3.196a9.094 9.094 0 003.742.479m0 0L12 19.5m1.52.473a5.986 5.986 0 001.738-1.063M13.5 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default AdminDashboard;
