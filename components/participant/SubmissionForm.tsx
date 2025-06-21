import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Answer, Submission, TeamMember, Hackathon } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import { Icons, getStatusDisplayName, getStatusColorClass, LOCK_DURATION_MS } from '../../constants';
import Modal from '../ui/Modal';
import SubmissionHistoryModal from './SubmissionHistoryModal'; 
import { formatDate } from '../../utils/helpers';

const SubmissionForm: React.FC = () => {
  const { 
    currentUser, hackathons, getCurrentHackathon, getSubmissionById,
    addSubmission, updateSubmission, 
    createTeamForSubmission, inviteTeamMember, getTeamById, getTeamMembersByTeamId,
    removeTeamMember, 
    acquireEditLock, releaseEditLock
  } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { submissionId: routeSubmissionId } = useParams<{ submissionId?: string }>(); 

  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  
  const [participantName, setParticipantName] = useState(currentUser?.email || ''); 
  const [participantEmail, setParticipantEmail] = useState(currentUser?.email || '');
  const [teamNameState, setTeamNameState] = useState('');
  const [isTeamProject, setIsTeamProject] = useState(false); 
  const [projectName, setProjectName] = useState('');
  
  const [selectedHackathonIdForForm, setSelectedHackathonIdForForm] = useState<string>('');
  const [availableHackathonsForForm, setAvailableHackathonsForForm] = useState<Hackathon[]>([]);
  const [currentSelectedHackathonData, setCurrentSelectedHackathonData] = useState<Hackathon | null>(null);

  const [problemStatementId, setProblemStatementId] = useState<string>('');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [teamMembersList, setTeamMembersList] = useState<TeamMember[]>([]);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [lockStatusMessage, setLockStatusMessage] = useState<string | null>(null);
  const lockCheckInterval = React.useRef<number | null>(null);

  const teamForLeaderCheck = existingSubmission?.teamId ? getTeamById(existingSubmission.teamId) : null;
  const isLeader = !!(teamForLeaderCheck && currentUser?.email && teamForLeaderCheck.leaderEmail.toLowerCase() === currentUser.email.toLowerCase());


  const checkLockStatus = useCallback(() => {
    if (!routeSubmissionId) return;
    const currentSub = getSubmissionById(routeSubmissionId);
    if (currentSub) {
      setExistingSubmission(currentSub); 
      if (currentSub.lockedBy) {
        if (new Date(currentSub.lockedBy.expiresAt) < new Date()) {
          setLockStatusMessage(`Editing lock by ${currentSub.lockedBy.userEmail} has expired. You can take over editing.`);
        } else if (currentSub.lockedBy.userEmail.toLowerCase() !== currentUser?.email?.toLowerCase()) {
          setLockStatusMessage(`This submission is currently locked for editing by ${currentSub.lockedBy.userEmail}. Lock expires ${formatDate(currentSub.lockedBy.expiresAt)}.`);
        } else { 
          setLockStatusMessage(`You are currently editing this submission. Your lock expires ${formatDate(currentSub.lockedBy.expiresAt)}.`);
        }
      } else {
        setLockStatusMessage("This submission is not currently locked. Click 'Start Editing' to make changes.");
      }
    } else {
       setLockStatusMessage(null); 
    }
  }, [routeSubmissionId, getSubmissionById, currentUser?.email]);


  useEffect(() => {
    const openAndApprovedHackathons = hackathons.filter(h => h.data.status === 'approved' && h.data.isAcceptingSubmissions && h.data.problemStatements.length > 0);
    setAvailableHackathonsForForm(openAndApprovedHackathons);

    if (routeSubmissionId) {
      const sub = getSubmissionById(routeSubmissionId);
      setExistingSubmission(sub || null);
      if (sub) {
        setSelectedHackathonIdForForm(sub.hackathonId); 
        const hackathonForSubmission = hackathons.find(h => h.id === sub.hackathonId);
        setCurrentSelectedHackathonData(hackathonForSubmission || null);

        setParticipantName(sub.participantName);
        setParticipantEmail(sub.participantEmail);
        setProjectName(sub.projectName);
        setProblemStatementId(sub.problemStatementId);
        setProjectRepoUrl(sub.projectRepoUrl || '');
        setProjectDemoUrl(sub.projectDemoUrl || '');
        const currentAnswers = sub.answers.reduce((acc, ans) => {
          acc[ans.questionId] = ans.value;
          return acc;
        }, {} as Record<string, string>);
        setAnswers(currentAnswers);
        if (sub.teamId) {
            const team = getTeamById(sub.teamId);
            setTeamNameState(team?.name || '');
            setTeamMembersList(getTeamMembersByTeamId(sub.teamId));
            setIsTeamProject(true);
        }
        checkLockStatus(); 
        if (lockCheckInterval.current) clearInterval(lockCheckInterval.current);
        lockCheckInterval.current = window.setInterval(checkLockStatus, 30000); 
      }
    } else { 
      setExistingSubmission(null);
      setParticipantEmail(currentUser?.email || '');
      setParticipantName(currentUser?.email || '');
      setIsTeamProject(false);
      setTeamNameState('');
      setTeamMembersList([]);
      setLockStatusMessage(null); 

      let initialHackathonId = '';
      const stateHackathonId = location.state?.hackathonId;
      const adminSelectedHackathon = getCurrentHackathon();

      if (stateHackathonId && openAndApprovedHackathons.some(h => h.id === stateHackathonId)) {
        initialHackathonId = stateHackathonId;
      } else if (adminSelectedHackathon && openAndApprovedHackathons.some(h => h.id === adminSelectedHackathon.id)) {
        initialHackathonId = adminSelectedHackathon.id;
      } else if (openAndApprovedHackathons.length > 0) {
        initialHackathonId = openAndApprovedHackathons[0].id;
      }
      setSelectedHackathonIdForForm(initialHackathonId);
    }

    return () => {
      if (lockCheckInterval.current) clearInterval(lockCheckInterval.current);
      if (existingSubmission && existingSubmission.lockedBy && existingSubmission.lockedBy.userEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
        if (routeSubmissionId === existingSubmission.id) {
            releaseEditLock(existingSubmission.id, currentUser!.email!);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSubmissionId, currentUser?.email, hackathons, location.state, getCurrentHackathon]);


  useEffect(() => {
    if (!routeSubmissionId && selectedHackathonIdForForm) {
      const selectedHackathon = hackathons.find(h => h.id === selectedHackathonIdForForm);
      setCurrentSelectedHackathonData(selectedHackathon || null);
      if (selectedHackathon && selectedHackathon.data.status === 'approved') { // Ensure it's approved
        setProblemStatementId(selectedHackathon.data.problemStatements[0]?.id || '');
        const initialAnswers = selectedHackathon.data.submissionQuestions.reduce((acc, q) => {
          acc[q.id] = '';
          return acc;
        }, {} as Record<string, string>);
        setAnswers(initialAnswers);
      } else {
        setProblemStatementId('');
        setAnswers({});
        if(selectedHackathon && selectedHackathon.data.status !== 'approved') {
            setFormError(`Hackathon "${selectedHackathon.data.title}" is not currently approved for submissions.`);
            setCurrentSelectedHackathonData(null); // Don't show form for non-approved
        }
      }
    }
  }, [selectedHackathonIdForForm, routeSubmissionId, hackathons]);


  if (!existingSubmission && availableHackathonsForForm.length === 0) {
     return <Card title="Submit Project"><Alert type="warning" message="There are currently no hackathons open for submissions, approved, or with defined problem statements." /></Card>;
  }
  
  if (!currentSelectedHackathonData && !existingSubmission && availableHackathonsForForm.length > 0) {
     return <Card title="Submit Project"><Alert type="warning" message="Please select an approved hackathon to submit to." /></Card>;
  }

  const activeHackathonForForm = existingSubmission ? hackathons.find(h=>h.id === existingSubmission.hackathonId) : currentSelectedHackathonData;

  if (!activeHackathonForForm || activeHackathonForForm.data.status !== 'approved') {
    return <Card title="Submit Project"><Alert type="error" message="Selected hackathon data could not be loaded or is not approved for submissions." /></Card>;
  }
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleStartEditing = async () => {
    if (!existingSubmission || !currentUser?.email) return;
    const success = await acquireEditLock(existingSubmission.id, currentUser.email);
    if (success) {
      checkLockStatus(); 
    } else {
      alert("Failed to acquire edit lock. Another user might have just locked it, or the lock has expired and someone else took it.");
      checkLockStatus(); 
    }
  };
  
  const handleSubmitLogic = async () => {
    setFormError(null);
    if (!currentUser?.email) {
        setFormError("Could not identify current user. Please ensure you are logged in with an email.");
        return false;
    }

    if (!participantName || !participantEmail || !projectName || !problemStatementId || (!existingSubmission && !selectedHackathonIdForForm)) {
      setFormError('Please fill in all required fields: Your Name, Email, Project Name, select a Hackathon and a Problem Statement.');
      return false;
    }
    if (!participantEmail.includes('@')) {
        setFormError('Please enter a valid email address.');
        return false;
    }
    
    if (!activeHackathonForForm || activeHackathonForForm.data.status !== 'approved' || !activeHackathonForForm.data.isAcceptingSubmissions) {
        setFormError("This hackathon is not currently approved or not accepting submissions.");
        return false;
    }

    const submissionAnswers: Answer[] = activeHackathonForForm.data.submissionQuestions.map(q => ({
      questionId: q.id,
      value: answers[q.id] || '',
    }));

    if (existingSubmission) { 
        if (existingSubmission.lockedBy?.userEmail.toLowerCase() !== currentUser.email.toLowerCase() || new Date(existingSubmission.lockedBy.expiresAt) < new Date()) {
            alert("Cannot save. You do not hold the edit lock, or your lock has expired. Please acquire the lock first.");
            checkLockStatus();
            return false;
        }
        updateSubmission(existingSubmission.id, {
            participantName, participantEmail, projectName, problemStatementId, projectRepoUrl, projectDemoUrl, answers: submissionAnswers,
        });
        await releaseEditLock(existingSubmission.id, currentUser.email);
        alert("Submission updated successfully!");
        checkLockStatus(); 
    } else { 
        const submissionDataForAdd: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'stageScores' | 'editHistory' | 'lockedBy' | 'teamId'> = {
            hackathonId: selectedHackathonIdForForm,
            participantName,
            participantEmail: currentUser.email,
            projectName,
            problemStatementId,
            projectRepoUrl,
            projectDemoUrl,
            answers: submissionAnswers,
        };

        const newlyCreatedSubmission = addSubmission(submissionDataForAdd, selectedHackathonIdForForm);

        if (!newlyCreatedSubmission) {
            setFormError('Failed to create submission. Please try again.');
            return false;
        }

        if (isTeamProject && teamNameState.trim()) {
            const newTeam = await createTeamForSubmission(newlyCreatedSubmission.id, selectedHackathonIdForForm, teamNameState, currentUser.email);
            if (!newTeam) {
                setFormError("Submission created, but failed to create the team. You can try editing the submission later to manage the team.");
                navigate(`/participant/submit/${newlyCreatedSubmission.id}`); 
                return false; 
            }
        }
        
        alert(`Submission for "${activeHackathonForForm.data.title}" successful!`);
        navigate('/participant/my-submissions');
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitLogic();
  };
  
  const handleInviteTeamMember = async () => {
    if (!existingSubmission?.teamId || !inviteeEmail.trim() || !currentUser?.email) return;
    const success = await inviteTeamMember(existingSubmission.teamId, inviteeEmail, currentUser.email);
    if (success) {
      alert(`${inviteeEmail} invited successfully!`);
      setTeamMembersList(getTeamMembersByTeamId(existingSubmission.teamId)); 
      setInviteeEmail('');
    }
  };

  const handleRemoveMember = async (memberEmailToRemove: string) => {
    if (!existingSubmission?.teamId || !currentUser?.email || !isLeader) return;
    if (memberEmailToRemove.toLowerCase() === currentUser.email.toLowerCase()) {
      alert("Leader cannot remove themselves.");
      return;
    }
    if (confirm(`Are you sure you want to remove ${memberEmailToRemove} from the team?`)) {
      const success = await removeTeamMember(existingSubmission.teamId, memberEmailToRemove, currentUser.email);
      if (success) {
        alert(`${memberEmailToRemove} removed successfully.`);
        setTeamMembersList(getTeamMembersByTeamId(existingSubmission.teamId)); 
      } else {
        alert(`Failed to remove ${memberEmailToRemove}. They might not be an active member or an error occurred.`);
      }
    }
  };

  const isLockedByCurrentUser = existingSubmission?.lockedBy?.userEmail.toLowerCase() === currentUser?.email?.toLowerCase() && new Date(existingSubmission.lockedBy.expiresAt) > new Date();
  const isLockedByOtherUser = existingSubmission?.lockedBy && existingSubmission.lockedBy.userEmail.toLowerCase() !== currentUser?.email?.toLowerCase() && new Date(existingSubmission.lockedBy.expiresAt) > new Date();
  
  const formFieldsDisabled = existingSubmission ? !isLockedByCurrentUser : (!selectedHackathonIdForForm || !activeHackathonForForm.data.isAcceptingSubmissions || activeHackathonForForm.data.status !== 'approved');
  const teamManagementDisabled = formFieldsDisabled || !isLeader;

  const currentTeam = existingSubmission?.teamId ? getTeamById(existingSubmission.teamId) : null;

  return (
    <Card title={existingSubmission ? `Edit Submission: ${existingSubmission.projectName}` : `Submit Your Project`}>
      {formError && <div className="mb-4"><Alert type="error" message={formError} onClose={() => setFormError(null)} /></div>}
      {lockStatusMessage && <div className="mb-4"><Alert type={isLockedByOtherUser ? "warning" : "info"} message={lockStatusMessage}/></div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {!existingSubmission && (
          <div className="mb-4">
            <label htmlFor="hackathonSelect" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Select Hackathon*</label>
            <select
              id="hackathonSelect"
              value={selectedHackathonIdForForm}
              onChange={(e) => setSelectedHackathonIdForForm(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
              disabled={availableHackathonsForForm.length === 0}
            >
              <option value="" disabled>-- Choose a Hackathon --</option>
              {availableHackathonsForForm.map(h => (
                <option key={h.id} value={h.id}>{h.data.title}</option>
              ))}
            </select>
            {availableHackathonsForForm.length === 0 && <p className="text-xs text-red-500 dark:text-red-400 mt-1">No hackathons currently open for submission, approved, and with problem statements.</p>}
          </div>
        )}

        {activeHackathonForForm && activeHackathonForForm.data.status === 'approved' && (
            <>
                <div>
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Your Information</h3>
                 <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Submitting to: <strong>{activeHackathonForForm.data.title}</strong></p>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <Input label="Your Full Name (Submitter/Leader)*" value={participantName} onChange={e => setParticipantName(e.target.value)} required disabled={formFieldsDisabled} />
                    <Input label="Your Email (Submitter/Leader)*" type="email" value={participantEmail} onChange={e => setParticipantEmail(e.target.value)} required placeholder="e.g. alice@example.com" disabled={formFieldsDisabled || !!existingSubmission} />
                </div>
                </div>

                {!existingSubmission && (
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Is this a team project?</label>
                        <input type="checkbox" checked={isTeamProject} onChange={(e) => setIsTeamProject(e.target.checked)} className="mt-1 h-4 w-4" disabled={formFieldsDisabled}/>
                        {isTeamProject && (
                        <>
                            <Input label="Team Name*" value={teamNameState} onChange={e => setTeamNameState(e.target.value)} required={isTeamProject} placeholder="e.g., The Innovators" containerClassName="mt-2" disabled={formFieldsDisabled}/>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Note: Team members can be invited *after* this initial submission is saved. 
                                You can then edit this submission from 'My Submissions' to manage your team.
                            </p>
                        </>
                        )}
                    </div>
                )}

                {existingSubmission && existingSubmission.teamId && (
                     <Card title={`Team Management for "${existingSubmission.projectName}" (Team: ${teamNameState || currentTeam?.name || 'N/A'})`} className="my-4">
                        <h4 className="font-semibold text-neutral-700 dark:text-neutral-100 mb-2">Members:</h4>
                        {teamMembersList.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm dark:text-neutral-200 space-y-1">
                                {teamMembersList.map(member => (
                                    <li key={member.id} className="flex justify-between items-center">
                                        <span>
                                            {member.participantEmail} ({member.status})
                                            {member.participantEmail.toLowerCase() === currentTeam?.leaderEmail.toLowerCase() && <span className="ml-1 text-xs bg-yellow-200 dark:bg-yellow-700 px-1 rounded">Leader</span>}
                                        </span>
                                        {isLeader && member.status === 'accepted' && member.participantEmail.toLowerCase() !== currentUser?.email?.toLowerCase() && (
                                            <Button 
                                            onClick={() => handleRemoveMember(member.participantEmail)} 
                                            size="sm" 
                                            variant="danger" 
                                            leftIcon={<Icons.Trash />} 
                                            className="ml-2"
                                            disabled={teamManagementDisabled}
                                            >
                                            Remove
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm dark:text-neutral-300">No members yet (besides leader).</p>}

                        {(!isLeader && currentTeam) && <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Note: Only the team leader ({currentTeam.leaderEmail}) can invite or remove members.</p>}
                        
                        <div className="mt-4 pt-3 border-t dark:border-neutral-700">
                            <Input 
                                label="Invite Member Email" 
                                type="email" 
                                value={inviteeEmail} 
                                onChange={e => setInviteeEmail(e.target.value)} 
                                placeholder="newmember@example.com" 
                                containerClassName="mb-1"
                                disabled={teamManagementDisabled}
                            />
                            <Button 
                                onClick={handleInviteTeamMember} 
                                size="sm" 
                                variant="secondary" 
                                leftIcon={<Icons.UserPlus />}
                                disabled={teamManagementDisabled || !inviteeEmail.trim()}
                            >
                                Invite to Team
                            </Button>
                        </div>
                    </Card>
                )}


                <div>
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Project Details</h3>
                <Input label="Project Name*" value={projectName} onChange={e => setProjectName(e.target.value)} required className="mt-2" disabled={formFieldsDisabled} />
                <div className="my-4">
                    <label htmlFor="problemStatementId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Problem Statement*</label>
                    <select
                        id="problemStatementId"
                        value={problemStatementId}
                        onChange={(e) => setProblemStatementId(e.target.value)}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                        disabled={formFieldsDisabled || activeHackathonForForm.data.problemStatements.length === 0}
                    >
                        <option value="" disabled>-- Select a Problem Statement --</option>
                        {activeHackathonForForm.data.problemStatements.map(ps => (
                            <option key={ps.id} value={ps.id}>{ps.title}</option>
                        ))}
                    </select>
                    {activeHackathonForForm.data.problemStatements.length === 0 && <p className="text-xs text-red-500 dark:text-red-400 mt-1">No problem statements available for this hackathon.</p>}
                </div>
                <Input label="Project Repository URL" type="url" value={projectRepoUrl} onChange={e => setProjectRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" disabled={formFieldsDisabled}/>
                <Input label="Project Demo URL" type="url" value={projectDemoUrl} onChange={e => setProjectDemoUrl(e.target.value)} placeholder="https://myprojectdemo.com" disabled={formFieldsDisabled}/>
                </div>

                <div>
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Project Questions</h3>
                {activeHackathonForForm.data.submissionQuestions.map((q) => (
                    <div key={q.id} className="mt-4">
                    {q.type === 'textarea' ? (
                        <Textarea label={q.text} value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} required disabled={formFieldsDisabled} />
                    ) : q.type === 'url' ? (
                        <Input label={q.text} type="url" value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} placeholder="https://example.com" required disabled={formFieldsDisabled}/>
                    ) : (
                        <Input label={q.text} value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} required disabled={formFieldsDisabled}/>
                    )}
                    </div>
                ))}
                {activeHackathonForForm.data.submissionQuestions.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-2">No specific questions for this submission.</p>}
                </div>
                
                <div className="pt-4 border-t dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-grow">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">
                            {existingSubmission ? "Ensure your changes are saved." : "By submitting, you agree to the hackathon rules. Ensure all information is accurate."}
                        </p>
                        
                        {!existingSubmission && (
                            <Button type="submit" variant="primary" size="lg" disabled={formFieldsDisabled || !selectedHackathonIdForForm || !activeHackathonForForm.data.isAcceptingSubmissions}>Submit Project</Button>
                        )}

                        {existingSubmission && !isLockedByCurrentUser && !isLockedByOtherUser && (
                            <Button type="button" onClick={handleStartEditing} variant="secondary" leftIcon={<Icons.LockOpen />} disabled={!activeHackathonForForm.data.isAcceptingSubmissions}>Start Editing (Lock)</Button>
                        )}
                        {existingSubmission && isLockedByCurrentUser && (
                            <Button type="submit" variant="primary" size="lg" leftIcon={<Icons.LockClosed />} disabled={!activeHackathonForForm.data.isAcceptingSubmissions}>Save Changes & Release Lock</Button>
                        )}
                        {existingSubmission && !isLockedByCurrentUser && !isLockedByOtherUser && existingSubmission.lockedBy && new Date(existingSubmission.lockedBy.expiresAt) < new Date() && (
                             <Button type="button" onClick={handleStartEditing} variant="secondary" leftIcon={<Icons.LockOpen />} disabled={!activeHackathonForForm.data.isAcceptingSubmissions}>Take Over Editing (Lock)</Button>
                        )}
                         {existingSubmission && isLockedByOtherUser && (
                            <Button type="button" variant="primary" size="lg" disabled={true} leftIcon={<Icons.LockClosed />}>Locked by Other User</Button>
                        )}
                         {!activeHackathonForForm.data.isAcceptingSubmissions && <Alert type="warning" message="Submissions are currently closed for this hackathon." />}
                    </div>
                    {existingSubmission && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsHistoryModalOpen(true)} leftIcon={<Icons.Clock />}>View Edit History</Button>
                    )}
                </div>
            </>
        )}
      </form>
      {existingSubmission && (
        <SubmissionHistoryModal 
            isOpen={isHistoryModalOpen} 
            onClose={() => setIsHistoryModalOpen(false)} 
            history={existingSubmission.editHistory || []} 
        />
      )}
    </Card>
  );
};

export default SubmissionForm;