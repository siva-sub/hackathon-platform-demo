import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Submission, SubmissionStatus, HackathonStage, Team, TeamMember, Score, AwardDetail } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatDate } from '../../utils/helpers';
import { Icons, getStatusDisplayName, getStatusColorClass } from '../../constants';
import Modal from '../ui/Modal';
import SubmissionDetailView from '../shared/SubmissionDetailView';
import Alert from '../ui/Alert';
import AssignAwardModal from './AssignAwardModal';
import RevertStageModal from './RevertStageModal';

const getSubmissionScoreSummary = (
    submission: Submission,
    stages: HackathonStage[]
): { text: string | JSX.Element; stageName: string | null; stageOrder: number } => {
    if (!submission.stageScores || submission.stageScores.length === 0) {
        return { text: <span className="text-neutral-500 dark:text-neutral-400">N/A</span>, stageName: null, stageOrder: -1 };
    }

    let relevantScoreData: Submission['stageScores'][0] | undefined = undefined;
    let stageNameFromStatus: string | null = null;
    let stageOrder = -1;

    const statusParts = submission.status.split('_');
    if (statusParts.length >= 2 && statusParts[0] === 's') {
        const stageIdFromStatus = statusParts[1];
        relevantScoreData = submission.stageScores.find(ss => ss.stageId === stageIdFromStatus);
        const stageFromStatus = stages.find(s => s.id === stageIdFromStatus);
        if (stageFromStatus) {
            stageNameFromStatus = stageFromStatus.name;
            stageOrder = stageFromStatus.order;
        }
    }

    if (!relevantScoreData && submission.stageScores.length > 0) {
        const sortedScores = [...submission.stageScores].sort((a, b) => {
            const stageA = stages.find(s => s.id === a.stageId);
            const stageB = stages.find(s => s.id === b.stageId);
            const orderComparison = (stageB?.order || 0) - (stageA?.order || 0);
            if (orderComparison !== 0) return orderComparison;
            return new Date(b.judgedAt || 0).getTime() - new Date(a.judgedAt || 0).getTime();
        });
        relevantScoreData = sortedScores[0];
        
        const latestScoredStageDetails = stages.find(s => s.id === relevantScoreData!.stageId);
        if (latestScoredStageDetails) {
            stageNameFromStatus = latestScoredStageDetails.name;
            stageOrder = latestScoredStageDetails.order;
        }
    }

    if (relevantScoreData) {
        const stageForScore = stages.find(s => s.id === relevantScoreData!.stageId);
        if (stageForScore && stageForScore.judgingCriteria.length > 0) {
            const totalAchieved = relevantScoreData.scores.reduce((sum, scoreItem) => sum + (scoreItem.score || 0), 0);
            const totalPossible = stageForScore.judgingCriteria.reduce((sum, crit) => sum + (crit.maxScore || 0), 0);
            return { text: `${totalAchieved}/${totalPossible}`, stageName: stageForScore.name, stageOrder: stageForScore.order };
        } else if (stageForScore) {
             return { text: <span className="text-neutral-500 dark:text-neutral-400">Criteria Missing</span>, stageName: stageForScore.name, stageOrder: stageForScore.order };
        }
    }
    return { text: <span className="text-neutral-500 dark:text-neutral-400">N/A</span>, stageName: stageNameFromStatus, stageOrder };
};


const ParticipantManagementTable: React.FC = () => {
  const {
    getSubmissionsByHackathonId,
    getCurrentHackathon,
    advanceSubmissionStatus,
    getTeamById,
    getTeamMembersByTeamId,
    currentUser,
    assignAwardToSubmission,
    recindAwardFromSubmission,
    revertSubmissionStage
  } = useAppContext();
  
  const currentHackathon = getCurrentHackathon();
  const submissionsForCurrentHackathon = currentHackathon ? getSubmissionsByHackathonId(currentHackathon.id) : [];

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignAwardModalOpen, setIsAssignAwardModalOpen] = useState(false);
  const [isRevertStageModalOpen, setIsRevertStageModalOpen] = useState(false);
  const [submissionForAction, setSubmissionForAction] = useState<Submission | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');


  const openDetailModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    if (submission.teamId) {
        const team = getTeamById(submission.teamId);
        setSelectedTeam(team || null);
        setSelectedTeamMembers(team ? getTeamMembersByTeamId(team.id) : []);
    } else {
        setSelectedTeam(null);
        setSelectedTeamMembers([]);
    }
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedSubmission(null);
    setSelectedTeam(null);
    setSelectedTeamMembers([]);
    setIsDetailModalOpen(false);
  };
  
  const handleOpenAssignAwardModal = (submission: Submission) => {
    setSubmissionForAction(submission);
    setIsAssignAwardModalOpen(true);
  };

  const handleAssignAward = (subId: string, awardDetail: AwardDetail) => {
    if (!currentUser?.email) return;
    assignAwardToSubmission(subId, awardDetail, currentUser.email);
    alert(`Award "${awardDetail.level} - ${awardDetail.categoryName}" assigned to submission.`);
  };

  const handleRecindAward = (submission: Submission) => {
    if (!currentUser?.email) return;
    if (window.confirm(`Are you sure you want to recind the award from "${submission.projectName}"?`)) {
        recindAwardFromSubmission(submission.id, currentUser.email);
        alert(`Award recinded from "${submission.projectName}".`);
    }
  };

  const handleOpenRevertStageModal = (submission: Submission) => {
    setSubmissionForAction(submission);
    setIsRevertStageModalOpen(true);
  };

  const handleRevertStage = (subId: string, targetStageId: string) => {
    if (!currentUser?.email) return;
    revertSubmissionStage(subId, targetStageId, currentUser.email);
    const targetStageName = currentHackathon?.data.stages.find(s => s.id === targetStageId)?.name;
    alert(`Submission reverted to stage: ${targetStageName || targetStageId}.`);
  };
  
  const getStageFromStatus = (status: SubmissionStatus, stages: HackathonStage[]): HackathonStage | undefined => {
    const parts = status.split('_');
    if (parts.length >= 2 && parts[0] === 's') {
        return stages.find(s => s.id === parts[1]);
    }
    return undefined;
  };

 const handleAdminAction = (submission: Submission, action: 'assign_initial' | 'confirm_elimination') => {
    if (!currentHackathon || currentHackathon.data.status !== 'approved' || !currentUser?.email) {
        alert("Action disabled: Hackathon not approved or admin not identified.");
        return;
    }
    const currentStages = currentHackathon.data.stages.sort((a, b) => a.order - b.order);
    let newStatus = submission.status;
    let alertMessage = '';

    if (action === 'assign_initial' && submission.status === 'submitted_pending_stage_assignment') {
        if (currentStages.length > 0) {
            const firstStage = currentStages[0];
            newStatus = `s_${firstStage.id}_pending_review`;
            alertMessage = `Submission "${submission.projectName}" assigned to stage: ${firstStage.name}.`;
        } else {
            alert("No stages defined to assign the submission to.");
            return;
        }
    } else if (action === 'confirm_elimination' && submission.status.endsWith('_rejected')) {
        newStatus = 'eliminated';
        alertMessage = `Submission "${submission.projectName}" marked as Eliminated.`;
    } else {
        alert("Invalid action or submission status for this operation.");
        return;
    }

    if (newStatus !== submission.status) {
        advanceSubmissionStatus(submission.id, newStatus, currentUser.email);
        alert(alertMessage);
    }
  };
  
  if (!currentHackathon) {
    return (
      <Card title="Manage Submissions & Participant Progress">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard."/>
      </Card>
    );
  }

  const filteredSubmissions = submissionsForCurrentHackathon.filter(s => {
    const stageFromStatus = getStageFromStatus(s.status, currentHackathon.data.stages);
    const stageMatch = filterStage === 'all' || (stageFromStatus && stageFromStatus.id === filterStage) || (filterStage === 'none' && !stageFromStatus && s.status !== 'submitted_pending_stage_assignment');
    
    let statusKeywordMatch = false;
    if (filterStatus === 'all') {
        statusKeywordMatch = true;
    } else if (filterStatus === 'submitted_pending_stage_assignment') {
        statusKeywordMatch = s.status === 'submitted_pending_stage_assignment';
    } else {
        const parts = s.status.split('_');
        if (parts[0] === 's' && parts.length >=3) {
            statusKeywordMatch = parts.slice(2).join('_') === filterStatus;
        } else {
            statusKeywordMatch = s.status === filterStatus;
        }
    }
    return stageMatch && statusKeywordMatch;
  });
  
  const uniqueStatusKeywordsAndGlobalStatuses: string[] = useMemo(() => {
    const keywords = new Set<string>();
    submissionsForCurrentHackathon.forEach(s => {
        if (s.status === 'submitted_pending_stage_assignment') {
            keywords.add('submitted_pending_stage_assignment');
        } else {
            const parts = s.status.split('_');
            if (parts[0] === 's' && parts.length >=3) {
                keywords.add(parts.slice(2).join('_'));
            } else {
                keywords.add(s.status);
            }
        }
    });
    return Array.from(keywords).sort();
  }, [submissionsForCurrentHackathon]);


  if (!submissionsForCurrentHackathon.length) {
    return <Card title={`Manage Submissions for "${currentHackathon.data.title}"`}><p className="dark:text-neutral-200 p-4">No submissions yet for this hackathon.</p></Card>;
  }

  return (
    <Card title={`Manage Submissions & Progress for "${currentHackathon.data.title}"`}>
      {currentHackathon.data.status !== 'approved' && (
          <Alert type="warning" title="Hackathon Not Approved" message={`This hackathon is currently "${getStatusDisplayName(currentHackathon.data.status, [], null)}". Actions on submissions are disabled until it is approved by a Super Admin.`} />
      )}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
        <div>
            <label htmlFor="stageFilter" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Filter by Stage:</label>
            <select
            id="stageFilter"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="p-2 border rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:ring-primary-500 dark:focus:ring-primary-400 w-full text-sm"
            >
            <option value="all">All Stages</option>
            {currentHackathon.data.stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
            <option value="none">No Specific Stage (e.g. Winner, Finalist, Awarded)</option>
            </select>
        </div>
        <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Filter by Status Keyword:</label>
            <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:ring-primary-500 dark:focus:ring-primary-400 w-full text-sm"
            >
            <option value="all">All Statuses</option>
            {uniqueStatusKeywordsAndGlobalStatuses.map(statusKey => (
                <option key={statusKey} value={statusKey}>{getStatusDisplayName(statusKey, [], null)}</option>
            ))}
            </select>
        </div>
      </div>
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[70vh]">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-100 dark:bg-neutral-750 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Project Name</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Submitter/Leader</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Award</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Score</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Submitted At</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider align-middle">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredSubmissions.map((submission, index) => {
              const scoreSummary = getSubmissionScoreSummary(submission, currentHackathon.data.stages);
              
              let actionButtons = [];
              if (currentHackathon.data.status === 'approved') {
                if (submission.status === 'submitted_pending_stage_assignment' && currentHackathon.data.stages.length > 0) {
                    actionButtons.push(<Button key="assign" size="sm" variant="primary" onClick={() => handleAdminAction(submission, 'assign_initial')} leftIcon={<Icons.PaperAirplane />} className="w-full sm:w-auto justify-center">Assign Initial Stage</Button>);
                }
                if (submission.status === 'finalist_awaiting_award_decision' || submission.status === 'award_assigned') {
                     actionButtons.push(<Button key="assignAward" size="sm" variant={submission.award ? "secondary" : "success"} onClick={() => handleOpenAssignAwardModal(submission)} leftIcon={<Icons.Trophy />} className="w-full sm:w-auto justify-center">{submission.award ? "Change Award" : "Assign Award"}</Button>);
                }
                 if (submission.award) {
                    actionButtons.push(<Button key="recindAward" size="sm" variant="danger" onClick={() => handleRecindAward(submission)} leftIcon={<Icons.XCircle />} className="w-full sm:w-auto justify-center">Recind Award</Button>);
                }
                if (submission.status.endsWith('_rejected')) {
                    actionButtons.push(<Button key="elim" size="sm" variant="danger" onClick={() => handleAdminAction(submission, 'confirm_elimination')} leftIcon={<Icons.XCircle />} className="w-full sm:w-auto justify-center">Confirm Elimination</Button>);
                }
                const canRevert = !['submitted_pending_stage_assignment', 'eliminated', 'award_assigned'].includes(submission.status) ||
                                (submission.status === 'award_assigned' && submission.award);
                if (canRevert && getStageFromStatus(submission.status, currentHackathon.data.stages) ) {
                     actionButtons.push(<Button key="revert" size="sm" variant="ghost" onClick={() => handleOpenRevertStageModal(submission)} leftIcon={<Icons.ArrowUturnLeft />} className="w-full sm:w-auto justify-center">Revert Stage</Button>);
                }
              }
              
              return (
              <tr key={submission.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900'} hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors duration-150`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-neutral-100 align-middle">{submission.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300 align-middle">{submission.participantName} ({submission.participantEmail})</td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  {submission.award ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass('award_assigned', submission.award)}`}>
                        {getStatusDisplayName('award_assigned', [], submission.award)}
                    </span>
                  ) : (<span className="text-xs text-neutral-500 dark:text-neutral-400">N/A</span>)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300 align-middle">
                    {scoreSummary.text}
                    {scoreSummary.stageName && <span className="text-xs block text-neutral-400 dark:text-neutral-500 mt-0.5">({scoreSummary.stageName})</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(submission.status, submission.award)}`}>
                    {getStatusDisplayName(submission.status, currentHackathon.data.stages, submission.award)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300 align-middle">{formatDate(submission.submittedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-middle">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openDetailModal(submission)} leftIcon={<Icons.Eye />} className="w-full sm:w-auto justify-center">View</Button>
                    {actionButtons}
                  </div>
                </td>
              </tr>
            )})}
             {filteredSubmissions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-neutral-500 dark:text-neutral-300">No submissions match current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedSubmission && (
        <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} title={`Submission: ${selectedSubmission.projectName}`} size="xl">
          <SubmissionDetailView submission={selectedSubmission} />
        </Modal>
      )}
      {submissionForAction && isAssignAwardModalOpen && currentHackathon && (
        <AssignAwardModal
            isOpen={isAssignAwardModalOpen}
            onClose={() => { setIsAssignAwardModalOpen(false); setSubmissionForAction(null); }}
            submission={submissionForAction}
            hackathon={currentHackathon}
            onAssignAward={handleAssignAward}
        />
      )}
      {submissionForAction && isRevertStageModalOpen && currentHackathon && (
        <RevertStageModal
            isOpen={isRevertStageModalOpen}
            onClose={() => { setIsRevertStageModalOpen(false); setSubmissionForAction(null); }}
            submission={submissionForAction}
            stages={currentHackathon.data.stages}
            onRevertStage={handleRevertStage}
        />
      )}
    </Card>
  );
};

export default ParticipantManagementTable;
