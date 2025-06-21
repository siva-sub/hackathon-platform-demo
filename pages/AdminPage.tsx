import React, {useState} from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import HackathonSettingsForm from '../components/admin/HackathonSettingsForm';
import SubmissionQuestionsForm from '../components/admin/SubmissionQuestionsForm';
import ProblemStatementsForm from '../components/admin/ProblemStatementsForm'; 
import HackathonStagesForm from '../components/admin/HackathonStagesForm'; 
import ParticipantManagementTable from '../components/admin/ParticipantManagementTable';
import BestPracticeCard from '../components/admin/BestPracticeCard';
import { Icons, getStatusDisplayName, getStatusColorClass } from '../constants';
import Card from '../components/ui/Card';
import { useAppContext } from '../contexts/AppContext';
import Alert from '../components/ui/Alert';
import OpenGraphSettingsForm from '../components/admin/OpenGraphSettingsForm';
import SchemaSettingsForm from '../components/admin/SchemaSettingsForm';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import WinnerConfigurationForm from '../components/admin/WinnerConfigurationForm'; 
import AdminQAManagement from '../components/admin/AdminQAManagement'; // New Import

const AdminCreateHackathonForm: React.FC = () => {
    const { addHackathon, currentUser } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!title.trim()) {
            setError("Hackathon title is required.");
            return;
        }
        if (!currentUser || currentUser.role !== 'admin' || !currentUser.email) {
            setError("Current user is not authorized or email is missing.");
            return;
        }
        try {
            const newId = addHackathon({ title, description }, currentUser.role, currentUser.email);
            setSuccess(`Hackathon "${title}" created successfully (ID: ${newId}) and is pending Super Admin approval.`);
            setTitle('');
            setDescription('');
        } catch (err) {
            setError("Failed to create hackathon. Please try again.");
            console.error(err);
        }
    };

    return (
        <Card title="Create New Hackathon (Admin)">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Hackathons created here will require Super Admin approval before becoming public and operational.
                </p>
                <Input 
                    label="Hackathon Title*" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    placeholder="e.g., My Awesome Challenge"
                />
                <Input 
                    label="Brief Description (Optional)" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="A short overview of your event's theme."
                />
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
                <Button type="submit" variant="primary" leftIcon={<Icons.PlusCircle />}>Create & Submit for Approval</Button>
            </form>
        </Card>
    );
};


const AdminDashboard: React.FC = () => {
    const { getCurrentHackathon, getSubmissionsByHackathonId } = useAppContext();
    const currentHackathon = getCurrentHackathon();

    if (!currentHackathon) {
        return (
             <Card title="Admin Dashboard">
                <Alert type="info" message="No hackathon selected or available for you to manage. Please select one from the dropdown if available, or a Super Admin can assign you to one." />
                 <div className="mt-4">
                     <AdminCreateHackathonForm />
                 </div>
            </Card>
        );
    }
    const submissionsForCurrent = getSubmissionsByHackathonId(currentHackathon.id);
    const currentStage = currentHackathon.data.stages.find(s => s.id === currentHackathon.data.currentStageId);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Hackathon Status Overview">
                    <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-2">{currentHackathon.data.title}</h3>
                    <p className="dark:text-neutral-200"><strong>Overall Status:</strong> 
                        <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(currentHackathon.data.status)}`}>
                            {getStatusDisplayName(currentHackathon.data.status, [], null)} 
                        </span>
                        {currentHackathon.data.status === 'declined' && currentHackathon.data.declineReason && 
                            <span className="text-xs italic text-red-500 dark:text-red-300 ml-1">(Reason: {currentHackathon.data.declineReason})</span>
                        }
                    </p>
                    <p className="dark:text-neutral-200"><strong>Total Submissions:</strong> {submissionsForCurrent.length}</p>
                    <p className="dark:text-neutral-200"><strong>Problem Statements:</strong> {currentHackathon.data.problemStatements.length}</p>
                    <p className="dark:text-neutral-200"><strong>Defined Stages:</strong> {currentHackathon.data.stages.length}</p>
                    <p className="dark:text-neutral-200"><strong>Accepting Submissions:</strong> {currentHackathon.data.isAcceptingSubmissions ? 'Yes' : 'No'}</p>
                    <p className="dark:text-neutral-200"><strong>Current Active Stage:</strong> {currentStage ? currentStage.name : 'Not Set'}</p>
                    <ul className="list-disc pl-5 mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                        <li>Configure event details, problem statements, and dynamic stages for <strong>{currentHackathon.data.title}</strong>.</li>
                        <li>Define submission questions and stage-specific judging criteria.</li>
                        <li>Monitor submissions and manage participant progression.</li>
                    </ul>
                </Card>
                <BestPracticeCard topic={`effective management for "${currentHackathon.data.title}"`} promptPrefix="Provide 3 key tips for"/>
            </div>
            <AdminCreateHackathonForm />
        </div>
    );
};

const AdminPage: React.FC = () => {
  const location = useLocation();
  const { hackathons, currentHackathonId, selectHackathon, getCurrentHackathon, currentUser } = useAppContext();
  
  const managedHackathons = React.useMemo(() => {
    if (currentUser?.role === 'superadmin') { 
        return hackathons;
    }
    if (currentUser?.role === 'admin' && currentUser.email) {
        const adminEmailLower = currentUser.email.toLowerCase();
        return hackathons.filter(h => 
            h.data.adminEmails.map(ae => ae.toLowerCase()).includes(adminEmailLower) ||
            (h.data.createdByAdminEmail?.toLowerCase() === adminEmailLower && (h.data.status === 'pending_approval' || h.data.status === 'declined'))
        );
    }
    return [];
  }, [hackathons, currentUser]);

  const currentHackathon = getCurrentHackathon(); 

  React.useEffect(() => {
    if (currentUser?.role === 'admin' && currentHackathonId) {
      const canManageCurrent = managedHackathons.some(h => h.id === currentHackathonId);
      if (!canManageCurrent) {
        selectHackathon(managedHackathons.length > 0 ? managedHackathons[0].id : null);
      }
    }
  }, [currentHackathonId, managedHackathons, currentUser, selectHackathon]);


  const handleHackathonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectHackathon(e.target.value);
  };

  const navLinks = [
    { path: `/admin`, label: 'Dashboard & Create', icon: <Icons.Home /> },
    { path: `/admin/settings`, label: 'Event Settings', icon: <Icons.Cog /> },
    { path: `/admin/social-sharing`, label: 'Social Sharing (OG)', icon: <Icons.Share /> },
    { path: `/admin/schema-settings`, label: 'Schema Markup (SEO)', icon: <Icons.CodeBracketSquare /> },
    { path: `/admin/problem-statements`, label: 'Problem Statements', icon: <Icons.PuzzlePiece /> },
    { path: `/admin/stages`, label: 'Hackathon Stages', icon: <Icons.ListBullet /> },
    { path: `/admin/questions`, label: 'Submission Questions', icon: <Icons.ClipboardDocumentList /> },
    { path: `/admin/qanda`, label: 'Participant Q&A', icon: <Icons.LightBulb /> }, // New Link
    { path: `/admin/award-config`, label: 'Award Configuration', icon: <Icons.Trophy /> },
    { path: `/admin/submissions`, label: 'Manage Submissions', icon: <Icons.UserGroup /> },
  ];
  
  return (
    <div className="space-y-6">
        <Card title="Admin Control Center">
            <div className="max-w-md">
                <label htmlFor="hackathonSelectorAdmin" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                    Manage Selected Hackathon:
                </label>
                <select
                    id="hackathonSelectorAdmin"
                    value={currentHackathonId || ''}
                    onChange={handleHackathonSelect}
                    className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                    disabled={managedHackathons.length === 0}
                >
                    <option value="" disabled>-- Select a Hackathon --</option>
                    {managedHackathons.map(h => (
                        <option key={h.id} value={h.id}>
                            {h.data.title} ({getStatusDisplayName(h.data.status, [], null)})
                        </option>
                    ))}
                </select>
                {managedHackathons.length === 0 && (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && 
                    <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-2">
                        {currentUser?.role === 'admin' ? "No hackathons assigned or created by you. You can create one below." : "No hackathons created yet. Go to Super Admin panel or create one here."}
                    </p>
                }
            </div>
        </Card>

        {currentHackathonId && currentHackathon && managedHackathons.some(h => h.id === currentHackathonId) ? (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md self-start flex-shrink-0">
                    <h2 className="text-xl font-semibold mb-1 text-primary-700 dark:text-primary-400">Manage: {currentHackathon.data.title}</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-300 mb-3 border-b pb-2 dark:border-neutral-700">Status: 
                         <span className={`ml-1 px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColorClass(currentHackathon.data.status)}`}>
                            {getStatusDisplayName(currentHackathon.data.status, [], null)} 
                        </span>
                    </p>
                    <nav className="space-y-1 sm:space-y-2">
                    {navLinks.map(link => (
                        <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                            ${location.pathname === link.path || (location.pathname.startsWith(link.path + "/") && link.path !== '/admin')
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-primary-100' 
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-100'
                            }`}
                        >
                        {link.icon}
                        <span>{link.label}</span>
                        </Link>
                    ))}
                    </nav>
                </aside>
                <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent content from overflowing flex parent */}
                    <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="settings" element={
                        <div className="space-y-6">
                            <HackathonSettingsForm />
                            <BestPracticeCard topic="configuring engaging hackathon event settings"/>
                        </div>
                    } />
                    <Route path="social-sharing" element={ 
                        <div className="space-y-6">
                            <OpenGraphSettingsForm />
                            <BestPracticeCard topic="optimizing Open Graph tags for social media sharing"/>
                        </div>
                    } />
                     <Route path="schema-settings" element={ 
                        <div className="space-y-6">
                            <SchemaSettingsForm />
                            <BestPracticeCard topic="implementing Schema.org for events"/>
                        </div>
                    } />
                    <Route path="problem-statements" element={
                        <div className="space-y-6">
                            <ProblemStatementsForm />
                            <BestPracticeCard topic="designing impactful hackathon problem statements"/>
                        </div>
                    } />
                    <Route path="stages" element={
                        <div className="space-y-6">
                            <HackathonStagesForm />
                            <BestPracticeCard topic="creating a fair and effective multi-stage judging process"/>
                        </div>
                    } />
                    <Route path="questions" element={
                        <div className="space-y-6">
                            <SubmissionQuestionsForm />
                            <BestPracticeCard topic="writing clear general submission questions"/>
                        </div>
                    } />
                     <Route path="qanda" element={<AdminQAManagement />} /> {/* New Route */}
                     <Route path="award-config" element={
                        <div className="space-y-6">
                            <WinnerConfigurationForm />
                             <BestPracticeCard topic="defining clear award structures and recognition"/>
                        </div>
                    } />
                    <Route path="submissions" element={
                        <div className="space-y-6">
                            <ParticipantManagementTable />
                            <BestPracticeCard topic="managing submissions and participant communication"/>
                        </div>
                    } />
                    </Routes>
                </div>
            </div>
        ) : (
            (currentUser?.role === 'admin' && managedHackathons.length > 0 && !currentHackathonId) ?
            <Alert type="info" message="Please select a hackathon from the dropdown to start managing."/>
            : (currentUser?.role === 'admin' && managedHackathons.length === 0) ?
            <AdminDashboard /> 
            : null
        )}
         {currentUser?.role === 'superadmin' && !currentHackathonId && managedHackathons.length > 0 && 
            <Alert type="info" message="Please select a hackathon from the dropdown to start managing."/>
         }
    </div>
  );
};

export default AdminPage;