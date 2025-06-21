import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import SubmissionForm from '../components/participant/SubmissionForm';
import { Icons, getStatusDisplayName, getStatusColorClass } from '../constants'; 
import { useAppContext } from '../contexts/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDate } from '../../utils/helpers';
import SubmissionDetailView from '../components/shared/SubmissionDetailView'; 
import Modal from '../ui/Modal'; 
import Alert from '../ui/Alert';
import ParticipantTeamsPage from '../components/participant/ParticipantTeamsPage'; 
import { Hackathon } from '../../types';

const HackathonCardWithFallbackImage: React.FC<{ hackathon: Hackathon }> = ({ hackathon }) => {
    const navigate = useNavigate();
    const picsumUrl = `https://picsum.photos/400/200.png?random=${hackathon.id}`;
    const placeholdCoUrl = `https://placehold.co/400x200/ffcc00/000000?text=${encodeURIComponent(hackathon.data.title)}`;

    const [currentImageSrc, setCurrentImageSrc] = useState(hackathon.data.publicPageContent.imageUrl || picsumUrl);

    useEffect(() => {
        // Reset image src if hackathon prop changes (important if card is reused in a list)
        setCurrentImageSrc(hackathon.data.publicPageContent.imageUrl || picsumUrl);
    }, [hackathon.id, hackathon.data.publicPageContent.imageUrl, picsumUrl]);

    const handleError = () => {
        if (currentImageSrc === hackathon.data.publicPageContent.imageUrl) { // custom URL failed
            setCurrentImageSrc(picsumUrl);
        } else if (currentImageSrc === picsumUrl) { // picsum failed (either as initial or fallback)
            setCurrentImageSrc(placeholdCoUrl);
        }
        // If currentImageSrc is already placeholdCoUrl, subsequent errors will not change state, preventing loops.
    };

    return (
        <Card 
            key={hackathon.id} 
            title={hackathon.data.title}
            className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/public-events/${hackathon.id}`)}
        >
            <img 
                src={currentImageSrc} 
                alt={hackathon.data.title} 
                className="w-full h-40 object-cover rounded-t-md mb-3"
                onError={handleError}
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3 line-clamp-3">{hackathon.data.description}</p>
             <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Status: {hackathon.data.isAcceptingSubmissions ? 
                    <span className="text-green-600 dark:text-green-400 font-semibold">Accepting Submissions</span> : 
                    <span className="text-red-600 dark:text-red-400 font-semibold">Submissions Closed</span>}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Current Stage: {hackathon.data.stages.find(s => s.id === hackathon.data.currentStageId)?.name || "Not Active"}
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={(e) => { e.stopPropagation(); navigate(`/public-events/${hackathon.id}`);}}>
                View Details & Problem Statements
            </Button>
        </Card>
    );
};


const ParticipantHackathonList: React.FC = () => {
    const { hackathons, getCurrentHackathon, currentUser } = useAppContext();
    const currentAdminSelectedHackathon = getCurrentHackathon();

    if (hackathons.length === 0) {
        return (
            <Card title="Hackathons">
                <Alert type="info" message="No hackathons are currently available. Please check back later!" />
            </Card>
        );
    }
    return (
        <div className="space-y-6">
            <Card title="Available Hackathons" className="bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900 dark:to-primary-900">
                 <p className="text-neutral-600 dark:text-neutral-200 mb-6">
                    Welcome, {currentUser?.email || "innovator"}! Explore the hackathons below. Click on an event to view its details, problem statements, and timeline. 
                    When you're ready, you can submit your project via the "Submit New Project" link in the menu.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    {hackathons.map(hackathon => (
                        <HackathonCardWithFallbackImage key={hackathon.id} hackathon={hackathon} />
                    ))}
                </div>
            </Card>
             {currentAdminSelectedHackathon && (
                <Alert type="info" title="Note on Submitting:" message={`The "Submit New Project" form will allow you to select any open hackathon. It may default to "${currentAdminSelectedHackathon.data.title}" if that is currently active for submissions.`} />
            )}
        </div>
    );
};


const MySubmissions: React.FC = () => {
    const { getSubmissionsForParticipant, getHackathonById, getTeamById, currentUser, deleteTeamSubmission } = useAppContext(); 
    const navigate = useNavigate();
    
    if (!currentUser?.email) {
        return <Card title="My Submissions"><Alert type="error" message="Could not identify participant. Please log in again."/></Card>;
    }
    const mySubmissions = getSubmissionsForParticipant(currentUser.email);
    
    const [selectedSubmission, setSelectedSubmission] = React.useState<(typeof mySubmissions[0]) | null>(null);

    const handleDelete = async (submissionId: string, projectName: string) => {
        if (!currentUser?.email) return;
        if (window.confirm(`Are you sure you want to delete the submission "${projectName}" and its associated team? This action cannot be undone.`)) {
            const success = await deleteTeamSubmission(submissionId, currentUser.email);
            if (success) {
                alert(`Submission "${projectName}" and associated team deleted successfully.`);
                // The list will re-render as context state changes
            } else {
                alert(`Failed to delete submission "${projectName}". You might not be the team leader or an error occurred.`);
            }
        }
    };


    if (mySubmissions.length === 0) {
        return (
            <Card title="My Submissions">
                <p className="dark:text-neutral-200">
                    You ({currentUser.email}) haven't made any submissions yet or are not part of any teams with submissions. <Link to="/participant/submit" className="text-primary-600 dark:text-primary-400 hover:underline">Submit a new project now!</Link>
                </p>
            </Card>
        );
    }

    return (
        <Card title={`My Submissions (as ${currentUser.email})`}>
            <div className="space-y-4">
            {mySubmissions.map(sub => {
                const hackathon = getHackathonById(sub.hackathonId);
                const problemStatement = hackathon?.data.problemStatements.find(ps => ps.id === sub.problemStatementId);
                const team = sub.teamId ? getTeamById(sub.teamId) : null;
                const canEdit = !sub.lockedBy || sub.lockedBy.userEmail.trim().toLowerCase() === currentUser.email!.trim().toLowerCase() || new Date(sub.lockedBy.expiresAt) < new Date();
                const isTeamLeader = team && currentUser.email && team.leaderEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase();

                return (
                    <div key={sub.id} className="p-4 border dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-750 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400">{sub.projectName}</h3>
                                {team && <p className="text-xs text-neutral-500 dark:text-neutral-200">Team: {team.name}</p>}
                                <p className="text-sm text-neutral-600 dark:text-neutral-200 font-medium">
                                    For Hackathon: {hackathon ? hackathon.data.title : "Unknown Hackathon"}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-200">
                                    Problem: {problemStatement?.title || 'N/A'}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-200">Submitted: {formatDate(sub.submittedAt)}</p>
                                <p className="text-sm dark:text-neutral-100">Status: 
                                    <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(sub.status)}`}>
                                        {hackathon ? getStatusDisplayName(sub.status, hackathon.data.stages) : "N/A"}
                                    </span>
                                </p>
                                {sub.lockedBy && new Date(sub.lockedBy.expiresAt) > new Date() && sub.lockedBy.userEmail.trim().toLowerCase() !== currentUser.email!.trim().toLowerCase() && (
                                    <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                                        <Icons.LockClosed /> Locked by {sub.lockedBy.userEmail} until {formatDate(sub.lockedBy.expiresAt)}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2 items-end flex-shrink-0 ml-2">
                                <Button 
                                    onClick={() => setSelectedSubmission(sub)} 
                                    variant='ghost'
                                    size='sm'
                                    aria-label={`View details for ${sub.projectName}`}
                                    leftIcon={<Icons.Eye />}
                                >
                                    View Details
                                </Button>
                                <Button 
                                    onClick={() => navigate(`/participant/submit/${sub.id}`)}
                                    variant='secondary'
                                    size='sm'
                                    leftIcon={sub.lockedBy && sub.lockedBy.userEmail.trim().toLowerCase() === currentUser.email!.trim().toLowerCase() && new Date(sub.lockedBy.expiresAt) > new Date() ? <Icons.LockOpen/> : <Icons.Pencil />}
                                    aria-label={`Edit ${sub.projectName}`}
                                    disabled={!canEdit && sub.lockedBy?.userEmail.trim().toLowerCase() !== currentUser.email!.trim().toLowerCase()}
                                    title={!canEdit && sub.lockedBy?.userEmail.trim().toLowerCase() !== currentUser.email!.trim().toLowerCase() ? `Locked by ${sub.lockedBy?.userEmail}` : `Edit ${sub.projectName}`}
                                >
                                    {sub.lockedBy && sub.lockedBy.userEmail.trim().toLowerCase() === currentUser.email!.trim().toLowerCase() && new Date(sub.lockedBy.expiresAt) > new Date() ? "Continue Editing" : "Edit Submission"}
                                </Button>
                                {isTeamLeader && (
                                    <Button
                                        onClick={() => handleDelete(sub.id, sub.projectName)}
                                        variant='danger'
                                        size='sm'
                                        leftIcon={<Icons.Trash />}
                                        aria-label={`Delete submission ${sub.projectName}`}
                                    >
                                        Delete Submission
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
             {selectedSubmission && (
                <Modal isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} title={`Details: ${selectedSubmission.projectName}`} size="xl">
                    <SubmissionDetailView submission={selectedSubmission} showScores={true} />
                </Modal>
            )}
        </Card>
    );
};


const ParticipantPage: React.FC = () => {
  const location = useLocation();
   const { hackathons, currentUser } = useAppContext();

   const anyHackathonOpenForSubmission = hackathons.some(h => h.data.isAcceptingSubmissions && h.data.problemStatements.length > 0);

  const navLinks = [
    { path: '/participant', label: 'Hackathons List', icon: <Icons.BuildingLibrary /> },
    { path: '/participant/my-submissions', label: 'My Submissions', icon: <Icons.ClipboardDocumentList /> },
    { path: '/participant/teams', label: 'My Teams & Invites', icon: <Icons.Users /> },
    { 
      path: '/participant/submit', 
      label: 'Submit New Project', 
      icon: <Icons.PaperAirplane />, 
      disabled: !anyHackathonOpenForSubmission,
      disabledReason: "(No hackathons open or with problems)"
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-72 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md self-start">
        <h2 className="text-xl font-semibold mb-1 text-secondary-700 dark:text-secondary-400">Participant Hub</h2>
        {currentUser?.email && <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 border-b pb-2 dark:border-neutral-700">Logged in as: {currentUser.email}</p>}
        <nav className="space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${link.disabled ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60' : 
                  (location.pathname === link.path || location.pathname.startsWith(link.path + '/') && link.path !== '/participant' 
                    ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-100' 
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-neutral-100')
                }`}
              onClick={(e) => { if (link.disabled) e.preventDefault(); }}
              aria-disabled={link.disabled}
              tabIndex={link.disabled ? -1 : 0}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.disabled && <span className="text-xs text-red-500 dark:text-red-400 ml-auto truncate" title={link.disabledReason}>{link.disabledReason}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <Routes>
          <Route index element={<ParticipantHackathonList />} />
          <Route path="submit" element={<SubmissionForm />} />
          <Route path="submit/:submissionId" element={<SubmissionForm />} /> {/* Route for editing */}
          <Route path="my-submissions" element={<MySubmissions />} />
          <Route path="teams" element={<ParticipantTeamsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default ParticipantPage;
