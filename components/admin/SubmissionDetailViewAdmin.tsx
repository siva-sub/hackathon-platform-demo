
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, SubmissionStatus, ALL_SUBMISSION_STATUSES, Judgement } from '../../types';
import { getSubmissionById, updateSubmissionStatus } from '../../services/hackathonService';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';

const SubmissionDetailViewAdmin: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData } = context;

  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId && activeHackathon) {
      setIsLoading(true);
      const fetchedSubmission = getSubmissionById(submissionId, activeHackathon.id);
      if (fetchedSubmission) {
        setSubmission(fetchedSubmission);
      } else {
        setError('Submission not found in the active hackathon.');
      }
      setIsLoading(false);
    } else if (!activeHackathon) {
        setError('Active hackathon not selected.');
        setIsLoading(false);
    }
  }, [submissionId, activeHackathon]);

  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    if (submission && submissionId && activeHackathon) {
      setIsUpdatingStatus(true);
      try {
        const updatedSubmission = updateSubmissionStatus(activeHackathon.id, submissionId, newStatus);
        if (updatedSubmission) {
          setSubmission(updatedSubmission); 
          await refreshData(); // This will update context.submissions and activeHackathon potentially
        }
      } catch (err) {
        alert(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };
  
  const handleDisqualify = () => {
    if (window.confirm("Are you sure you want to disqualify this submission? This action cannot be undone easily.")) {
        handleStatusChange('disqualified');
    }
  };


  if (isLoading) return <LoadingSpinner message="Loading submission details..." />;
  if (error) return <Card title="Error"><p className="text-red-500">{error}</p><Button onClick={() => navigate('/admin/submissions')}>Back to Submissions</Button></Card>;
  if (!submission || !activeHackathon) return <Card title="Error"><p>Submission or Hackathon data not available.</p><Button onClick={() => navigate('/admin/submissions')}>Back to Submissions</Button></Card>;

  const getQuestionText = (questionId: string) => {
    return activeHackathon.submissionQuestions.find(q => q.id === questionId)?.questionText || 'Unknown Question';
  };

  const getProblemStatementTitle = (psId?: string) => {
    if (!psId || !activeHackathon?.problemStatements) return 'N/A';
    return activeHackathon.problemStatements.find(ps => ps.id === psId)?.title || 'General Submission';
  };
  
  const statusOptions = ALL_SUBMISSION_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }));

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


  const calculateAverageScoreForRound = (roundNumber: number): string => {
    const roundJudgements = submission.judgements.filter(j => j.roundNumber === roundNumber);
    if (roundJudgements.length === 0) return "N/A";
    const totalScore = roundJudgements.reduce((sum, j) => sum + j.totalScore, 0);
    const averageScore = totalScore / roundJudgements.length;
    
    const roundCriteria = activeHackathon.judgingRounds.find(r => r.roundNumber === roundNumber)?.criteria;
    const maxPossibleScore = roundCriteria?.reduce((sum, c) => sum + c.maxScore, 0) || 100;

    return `${averageScore.toFixed(2)} / ${maxPossibleScore}`;
  };

  return (
    <Card title={`Submission: ${submission.projectName}`} actions={<Button onClick={() => navigate('/admin/submissions')}>Back to Submissions</Button>}>
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong className="text-gray-600 dark:text-gray-400">Participant:</strong> {submission.participantInfo.name} ({submission.participantInfo.email})</p>
            {submission.participantInfo.teamName && <p><strong className="text-gray-600 dark:text-gray-400">Team:</strong> {submission.participantInfo.teamName}</p>}
            <p><strong className="text-gray-600 dark:text-gray-400">Problem Statement:</strong> {getProblemStatementTitle(submission.problemStatementId)}</p>
            <p><strong className="text-gray-600 dark:text-gray-400">Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
            <p><strong className="text-gray-600 dark:text-gray-400">Repo URL:</strong> <a href={submission.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{submission.projectRepoUrl}</a></p>
            <p><strong className="text-gray-600 dark:text-gray-400">Demo URL:</strong> <a href={submission.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{submission.projectDemoUrl || 'N/A'}</a></p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Manage Status</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm"><strong className="text-gray-600 dark:text-gray-400">Current Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors[submission.status] || 'bg-gray-200 text-gray-800'}`}>{submission.status.replace(/_/g, ' ').toLocaleUpperCase()}</span>
            </p>
            <Select
              options={statusOptions}
              value={submission.status}
              onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus)}
              containerClassName="mb-0 w-full sm:w-64"
              disabled={isUpdatingStatus}
            />
            <Button variant="danger" onClick={handleDisqualify} isLoading={isUpdatingStatus && submission.status === 'disqualified'} disabled={submission.status === 'disqualified' || isUpdatingStatus}>
                Disqualify Submission
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Submission Answers</h3>
          <ul className="space-y-3">
            {submission.answers.map(ans => (
              <li key={ans.questionId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="font-medium text-gray-600 dark:text-gray-300">{getQuestionText(ans.questionId)}</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{ans.answer || <em className="text-gray-400 dark:text-gray-500">No answer provided</em>}</p>
              </li>
            ))}
          </ul>
        </section>

        {submission.judgements.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Judgements</h3>
            {activeHackathon.judgingRounds.map(round => {
              const roundJudgements = submission.judgements.filter(j => j.roundNumber === round.roundNumber);
              if (roundJudgements.length === 0) return null;

              return (
                <div key={round.roundNumber} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400">Round {round.roundNumber} - Average Score: {calculateAverageScoreForRound(round.roundNumber)}</h4>
                  {roundJudgements.map((judgement, idx) => (
                    <details key={idx} className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <summary className="font-medium cursor-pointer text-gray-700 dark:text-gray-200">
                        Judgement by {judgement.judgeId} - Total Score: {judgement.totalScore}
                      </summary>
                      <div className="mt-2 space-y-2 text-sm">
                        <p><strong className="text-gray-600 dark:text-gray-400">Overall Comment:</strong> {judgement.overallComment}</p>
                        <strong className="block mt-1 text-gray-600 dark:text-gray-400">Criteria Scores:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {judgement.scores.map(s => {
                            const criterion = activeHackathon.judgingRounds
                              .find(r => r.roundNumber === judgement.roundNumber)?.criteria
                              .find(c => c.id === s.criterionId);
                            return (
                              <li key={s.criterionId}>
                                {criterion?.name || 'Unknown Criterion'}: {s.score} / {criterion?.maxScore || 'N/A'}
                                {s.comment && <em className="ml-2 text-gray-500 dark:text-gray-400">- "{s.comment}"</em>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </Card>
  );
};

export default SubmissionDetailViewAdmin;
