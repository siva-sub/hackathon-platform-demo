
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Icons, getStatusDisplayName, getStatusColorClass } from '../../constants'; 
import { formatDate } from '../../utils/helpers';
import Alert from '../ui/Alert';

const JudgeDashboard: React.FC = () => {
  const { getSubmissionsByHackathonId, getCurrentHackathon, currentUser } = useAppContext();
  const navigate = useNavigate();
  const currentHackathon = getCurrentHackathon();
  const judgeEmailLower = currentUser?.email?.toLowerCase();

  if (!currentHackathon) {
    return (
        <Card title="Hackathon Judging Dashboard">
            <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown above to view submissions for judging." />
        </Card>
    );
  }

  const currentActiveStageId = currentHackathon.data.currentStageId;
  const currentStage = currentHackathon.data.stages.find(s => s.id === currentActiveStageId);
  const submissionsForHackathon = getSubmissionsByHackathonId(currentHackathon.id);

  let submissionsToJudge = [];
  let isJudgeAssignedToActiveStage = false;

  if (currentStage && judgeEmailLower) {
    isJudgeAssignedToActiveStage = currentStage.assignedJudgeEmails.map(sje => sje.toLowerCase()).includes(judgeEmailLower);
    if (isJudgeAssignedToActiveStage) {
        submissionsToJudge = submissionsForHackathon.filter(s => 
            s.status === `s_${currentActiveStageId}_pending_review` || s.status === `s_${currentActiveStageId}_judging`
        );
    }
  }


  const handleJudgeSubmission = (submissionId: string) => {
    navigate(`/judge/submission/${submissionId}`);
  };

  return (
    <div className="space-y-6">
      <Card title={`Judging Dashboard for "${currentHackathon.data.title}" - ${currentStage ? currentStage.name : "No Active Stage"}`}>
        <p className="text-neutral-600 dark:text-neutral-200">
          Welcome, Judge {currentUser?.email}! Below are submissions awaiting your review for the current active stage: 
          <strong> {currentStage ? currentStage.name : "N/A"}</strong>.
          Please review each submission carefully based on this stage's criteria.
        </p>
      </Card>

      {!currentStage ? (
         <Card>
            <div className="text-center py-8">
                <Icons.Cog />
                <p className="mt-4 text-xl font-semibold text-neutral-700 dark:text-neutral-100">No Active Judging Stage for "{currentHackathon.data.title}"</p>
                <p className="text-neutral-500 dark:text-neutral-300">The administrator has not set an active judging stage for this hackathon. Please check back later.</p>
            </div>
        </Card>
      ) : !isJudgeAssignedToActiveStage ? (
        <Card>
            <div className="text-center py-8">
                 <Icons.UserCircle />
                <p className="mt-4 text-xl font-semibold text-neutral-700 dark:text-neutral-100">Not Assigned to Current Stage</p>
                <p className="text-neutral-500 dark:text-neutral-300">You are not currently assigned to judge "{currentStage.name}" for "{currentHackathon.data.title}". Please check with the hackathon administrator or select another hackathon if available.</p>
            </div>
        </Card>
      ) : submissionsToJudge.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Icons.ClipboardDocumentList />
            <p className="mt-4 text-xl font-semibold text-neutral-700 dark:text-neutral-100">No Submissions Awaiting Your Review for {currentStage.name}</p>
            <p className="text-neutral-500 dark:text-neutral-300">There are currently no submissions assigned for judging in this stage under your assignment, or all have been judged.</p>
          </div>
        </Card>
      ) : (
        <Card title={`Submissions for ${currentStage.name} Judging`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-750">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Problem Statement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Submitted At</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {submissionsToJudge.map((submission) => (
                  <tr key={submission.id}>
                    <td 
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 cursor-pointer" 
                        onClick={() => handleJudgeSubmission(submission.id)}
                        title={`Judge ${submission.projectName}`}
                    >
                        {submission.projectName}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                        {currentHackathon.data.problemStatements.find(ps => ps.id === submission.problemStatementId)?.title || 'N/A'}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{formatDate(submission.submittedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(submission.status)}`}>
                            {getStatusDisplayName(submission.status, currentHackathon.data.stages)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button onClick={() => handleJudgeSubmission(submission.id)} variant="primary" size="sm" leftIcon={<Icons.AcademicCap />}>
                        Judge Submission
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {currentStage && (
       <Card title={`Judging Criteria for ${currentStage.name}`}>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-700 dark:text-neutral-200">
          {currentStage.judgingCriteria.map(criterion => (
            <li key={criterion.id}>
              <strong className="dark:text-neutral-100">{criterion.name}</strong> (Max: {criterion.maxScore} points): {criterion.description}
            </li>
          ))}
           {currentStage.judgingCriteria.length === 0 && <li>No specific criteria defined for this stage. Use general assessment.</li>}
        </ul>
      </Card>
      )}
    </div>
  );
};

export default JudgeDashboard;