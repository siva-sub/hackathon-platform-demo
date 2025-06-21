import React from 'react';
import { Submission, Score, HackathonStage, MatrixCriterion, Hackathon, Team, Question } from '../../types'; 
import { useAppContext } from '../../contexts/AppContext';
import Card from '../ui/Card';
import { formatDate } from '../../utils/helpers';
import { getStatusDisplayName, getStatusColorClass, Icons } from '../../constants'; 
import RichTextViewer from '../ui/RichTextViewer'; // Added import

interface SubmissionDetailViewProps {
  submission: Submission;
  showScores?: boolean; 
}

interface StageScoreDisplayProps {
    scoresData: Submission['stageScores'][0]; 
    stage?: HackathonStage; 
    stageTitle: string;
}

const StageScoreDisplay: React.FC<StageScoreDisplayProps> = ({ scoresData, stage, stageTitle }) => {
    if (!scoresData || !stage) return <p className="text-neutral-500 dark:text-neutral-300">No scores submitted for {stageTitle} yet.</p>;

    const matrix = stage.judgingCriteria;
    const totalPossibleScore = matrix.reduce((sum, crit) => sum + crit.maxScore, 0);
    const totalAchievedScore = scoresData.scores.reduce((sum, scoreItem) => sum + scoreItem.score, 0);

    return (
        <div className="space-y-3 mt-3">
            {scoresData.scores.map(scoreItem => {
                const criterion = matrix.find(c => c.id === scoreItem.criterionId);
                return (
                    <div key={scoreItem.criterionId} className="p-2 border-b dark:border-neutral-700 last:border-b-0">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-neutral-700 dark:text-neutral-100">{criterion ? criterion.name : 'Unknown Criterion'}</span>
                            <span className="font-semibold text-primary-600 dark:text-primary-400">{scoreItem.score} / {criterion ? criterion.maxScore : 'N/A'}</span>
                        </div>
                        {scoreItem.comment && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-300 mt-1 pl-2">
                                <em>Comment:</em> <RichTextViewer htmlContent={scoreItem.comment} />
                            </div>
                        )}
                    </div>
                );
            })}
            {scoresData.generalComment && (
                <div className="mt-3 pt-3 border-t dark:border-neutral-700">
                    <h5 className="font-semibold text-sm dark:text-neutral-100">General Comment for {stageTitle}:</h5>
                    <RichTextViewer htmlContent={scoresData.generalComment} className="text-sm text-neutral-600 dark:text-neutral-200" />
                </div>
            )}
            <div className="mt-3 pt-3 border-t dark:border-neutral-700 text-right">
                 <p className="font-bold text-lg text-primary-700 dark:text-primary-300">Total Score for {stageTitle}: {totalAchievedScore} / {totalPossibleScore}</p>
            </div>
            {scoresData.judgeId && <p className="text-xs text-neutral-400 dark:text-neutral-400 text-right">Judged by: {scoresData.judgeId}</p>}
            <p className="text-xs text-neutral-400 dark:text-neutral-400 text-right">Judged on: {formatDate(scoresData.judgedAt)}</p>
        </div>
    );
};


const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({ submission, showScores = true }) => {
  const { getHackathonById, getTeamById } = useAppContext();
  const hackathon = getHackathonById(submission.hackathonId);
  const team = submission.teamId ? getTeamById(submission.teamId) : null;

  if (!hackathon) {
    return <Card title="Error"><p className="dark:text-red-400">Could not load hackathon details for this submission.</p></Card>;
  }

  const problemStatement = hackathon.data.problemStatements.find(ps => ps.id === submission.problemStatementId);

  return (
    <div className="space-y-6">
      <Card title={`Project: ${submission.projectName}`}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-neutral-700 dark:text-neutral-100">Participant Information</h4>
            <p className="dark:text-neutral-200"><strong>Submitter/Leader:</strong> {submission.participantName} ({submission.participantEmail})</p>
            {team && <p className="dark:text-neutral-200"><strong>Team Name:</strong> {team.name}</p>}
            <p className="dark:text-neutral-200"><strong>Submitted At:</strong> {formatDate(submission.submittedAt)}</p>
             <p className="dark:text-neutral-200"><strong>Problem Statement:</strong> {problemStatement ? problemStatement.title : 'N/A'}</p>
            <p className="dark:text-neutral-200"><strong>Status:</strong> 
                <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(submission.status, submission.award)}`}>
                    {getStatusDisplayName(submission.status, hackathon.data.stages, submission.award)}
                </span>
            </p>
            {submission.award && (
                 <p className="dark:text-neutral-200"><strong>Award:</strong> 
                    <span className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass('award_assigned', submission.award)}`}>
                        {getStatusDisplayName('award_assigned', [], submission.award)}
                    </span>
                </p>
            )}
            {submission.lockedBy && new Date(submission.lockedBy.expiresAt) > new Date() && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
                    <Icons.LockClosed /> <span className="ml-1">Locked for editing by {submission.lockedBy.userEmail} (expires {formatDate(submission.lockedBy.expiresAt)})</span>
                </p>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-300">Hackathon: {hackathon.data.title}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-700 dark:text-neutral-100">Project Links</h4>
            <p className="dark:text-neutral-200"><strong>Repository:</strong> {submission.projectRepoUrl ? <a href={submission.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">{submission.projectRepoUrl}</a> : 'Not provided'}</p>
            <p className="dark:text-neutral-200"><strong>Demo:</strong> {submission.projectDemoUrl ? <a href={submission.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">{submission.projectDemoUrl}</a> : 'Not provided'}</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-700 dark:text-neutral-100">Submission Answers</h4>
            {submission.answers.map(answer => {
              const question = hackathon.data.submissionQuestions.find(q => q.id === answer.questionId) as Question | undefined;
              return (
                <div key={answer.questionId} className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-750 rounded">
                  <p className="font-medium text-sm text-neutral-600 dark:text-neutral-200">{question ? question.text : 'Unknown Question'}</p>
                  {question?.type === 'textarea' ? (
                    <RichTextViewer htmlContent={answer.value || '<p class="italic text-neutral-400 dark:text-neutral-400">No answer provided</p>'} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap dark:text-neutral-100">{answer.value || <span className="italic text-neutral-400 dark:text-neutral-400">No answer provided</span>}</p>
                  )}
                </div>
              );
            })}
             {submission.answers.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300">No answers to general questions were provided.</p>}
          </div>
        </div>
      </Card>

      {showScores && submission.stageScores && submission.stageScores.length > 0 && (
        submission.stageScores.map(stageScoreData => {
            const stageDetails = hackathon.data.stages.find(s => s.id === stageScoreData.stageId);
            const stageTitle = stageDetails ? stageDetails.name : `Stage ${stageScoreData.stageId}`;
            return (
                 <Card key={stageScoreData.stageId} title={`${stageTitle} - Scores & Feedback`}>
                    <StageScoreDisplay scoresData={stageScoreData} stage={stageDetails} stageTitle={stageTitle} />
                </Card>
            );
        })
      )}
      {showScores && (!submission.stageScores || submission.stageScores.length === 0) && (
           <Card title="Scores & Feedback">
              <p className="text-neutral-500 dark:text-neutral-300">No scores or feedback have been submitted for this project yet across any stages.</p>
           </Card>
      )}

      {submission.editHistory && submission.editHistory.length > 0 && (
        <Card title="Submission Edit History">
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-500 dark:text-neutral-300 max-h-48 overflow-y-auto">
                {submission.editHistory.slice().reverse().map(entry => ( // Show newest first
                    <li key={entry.timestamp}>
                        {formatDate(entry.timestamp)} - {entry.action} (by {entry.userEmail})
                    </li>
                ))}
            </ul>
        </Card>
      )}
    </div>
  );
};

export default SubmissionDetailView;