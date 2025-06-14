
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, Judgement, JudgementScore, JudgingCriterion } from '../../types';
import { getSubmissionById, saveJudgement } from '../../services/hackathonService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import LoadingSpinner from '../common/LoadingSpinner';

const SubmissionEvaluationForm: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); 
  const context = useContext(AppContext);

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData, currentUserEmail, allHackathons, setActiveHackathonId } = context;

  const judgeId = currentUserEmail;

  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [scores, setScores] = useState<JudgementScore[]>([]);
  const [overallComment, setOverallComment] = useState('');
  const [currentRoundCriteria, setCurrentRoundCriteria] = useState<JudgingCriterion[]>([]);
  const [evaluationRound, setEvaluationRound] = useState<number>(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId && activeHackathon && judgeId) {
      setIsLoading(true);
      setError(null);
      const fetchedSubmission = getSubmissionById(submissionId, activeHackathon.id);
      
      if (fetchedSubmission) {
        setSubmission(fetchedSubmission);

        const roundNumFromState = (location.state as { roundNumber?: number })?.roundNumber;
        const roundForEvaluation = roundNumFromState || activeHackathon.currentJudgingRound;
        setEvaluationRound(roundForEvaluation);

        if (roundForEvaluation > 0) {
            const roundDetails = activeHackathon.judgingRounds.find(r => r.roundNumber === roundForEvaluation);
            if (roundDetails) {
              setCurrentRoundCriteria(roundDetails.criteria);
              const initialScores = roundDetails.criteria.map(c => ({ criterionId: c.id, score: 0, comment: '' }));
              
              const existingJudgement = fetchedSubmission.judgements.find(
                j => j.judgeId === judgeId && j.roundNumber === roundForEvaluation
              );

              if(existingJudgement) {
                setScores(existingJudgement.scores);
                setOverallComment(existingJudgement.overallComment);
                // setError("You have already judged this submission for this round. You can edit your previous judgement by re-submitting.");
                 // Don't set error here, let user edit. Message can be shown if needed based on `existingJudgement`
              } else {
                 setScores(initialScores);
                 setOverallComment(''); // Clear previous overall comment for new judgement
              }

            } else {
              setError(`Judging criteria for Round ${roundForEvaluation} not found in hackathon "${activeHackathon.title}".`);
              setCurrentRoundCriteria([]);
            }
        } else {
            setError("No active judging round specified for evaluation in this hackathon.");
            setCurrentRoundCriteria([]);
        }

      } else {
        setError(`Submission with ID ${submissionId} not found in hackathon "${activeHackathon.title}".`);
      }
      setIsLoading(false);
    } else if (!activeHackathon) {
        setError("Active hackathon not selected.");
        setIsLoading(false);
    } else if (!judgeId) {
        setError("Judge identification not found. Please log in as a judge persona.");
        setIsLoading(false);
    }
  }, [submissionId, activeHackathon, judgeId, location.state]);

  useEffect(() => {
    const currentTotal = scores.reduce((sum, s) => sum + (s.score || 0), 0);
    setTotalScore(currentTotal);
  }, [scores]);

  const handleScoreChange = (criterionId: string, scoreValue: string, maxScore: number) => {
    const score = parseInt(scoreValue, 10);
    // Allow empty input for easier editing, treat as 0 for calculation, but don't force 0 in field
    const newScore = isNaN(score) ? 0 : Math.max(0, Math.min(score, maxScore)); 
    
    setScores(prevScores =>
      prevScores.map(s => s.criterionId === criterionId ? { ...s, score: newScore } : s)
    );
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setScores(prevScores =>
      prevScores.map(s => s.criterionId === criterionId ? { ...s, comment } : s)
    );
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !activeHackathon || evaluationRound <= 0 || !judgeId) {
      alert("Cannot submit evaluation: missing data, judge ID, or judging not active for a specific round.");
      return;
    }
    
    for (const scoreItem of scores) {
      const criterion = currentRoundCriteria.find(c => c.id === scoreItem.criterionId);
      if (criterion && (scoreItem.score < 0 || scoreItem.score > criterion.maxScore)) {
        alert(`Score for "${criterion.name}" must be between 0 and ${criterion.maxScore}.`);
        return;
      }
    }
    if (!overallComment.trim()) {
        alert("Overall comment is required.");
        return;
    }

    setIsSubmitting(true);
    
    const judgement: Judgement = {
      submissionId: submission.id,
      judgeId: judgeId,
      roundNumber: evaluationRound,
      scores: scores,
      overallComment: overallComment,
      totalScore: totalScore,
      judgedAt: new Date().toISOString(),
    };

    try {
      saveJudgement(activeHackathon.id, judgement);
      await refreshData(); 
      alert('Evaluation submitted successfully!');
      navigate('/judge');
    } catch (err) {
      const submitErrorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(prevError => {
          const newErrMessage = `Submit Error: ${submitErrorMessage}`;
          return prevError && !prevError.includes("Submit Error:") ? `${prevError}\n${newErrMessage}` : newErrMessage;
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getQuestionText = (questionId: string) => {
    return activeHackathon?.submissionQuestions.find(q => q.id === questionId)?.questionText || 'Unknown Question';
  };
  
  const getProblemStatementTitle = (psId?: string) => {
    if (!psId || !activeHackathon?.problemStatements) return 'N/A';
    return activeHackathon.problemStatements.find(ps => ps.id === psId)?.title || 'General Submission';
  };

  if (!activeHackathon) {
     if (allHackathons.length > 0) {
        return (
            <Card title="Evaluate Submission">
                <p>Please select an active hackathon from the public page to evaluate submissions.</p>
                <Button onClick={() => { setActiveHackathonId(null); navigate('/hackathon-details');}} className="mt-4">
                    View Available Hackathons
                </Button>
            </Card>
        );
    }
    return <Card title="Evaluate Submission"><p>No hackathons are currently active or available.</p></Card>;
  }

  if (isLoading) return <LoadingSpinner message="Loading submission for evaluation..." />;
  if (error && !submission) return <Card title="Error"><p className="text-red-500">{error}</p><Button onClick={() => navigate('/judge')}>Back to Dashboard</Button></Card>;
  if (!submission || !judgeId || (currentRoundCriteria.length === 0 && evaluationRound > 0) ) {
    return <Card title="Error"><p>Required data for evaluation is missing (submission, judge ID, or criteria for round {evaluationRound} of "{activeHackathon.title}").</p><Button onClick={() => navigate('/judge')}>Back to Dashboard</Button></Card>;
  }


  return (
    <Card title={`Evaluating: ${submission.projectName} (Round ${evaluationRound}) for "${activeHackathon.title}"`} actions={<Button onClick={() => navigate('/judge')}>Back to Dashboard</Button>}>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Problem Statement: {getProblemStatementTitle(submission.problemStatementId)}</p>
      {error && <p className={`p-3 rounded-md mb-4 ${error.includes("Submit Error:") ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800" : "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-800"}`}>{error}</p>}
      
      <form onSubmit={handleSubmitEvaluation}>
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Left Column: Submission Details */}
          <div className="md:w-2/5 lg:w-1/3 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            <section>
              <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 sticky top-0 bg-gray-50 dark:bg-gray-700 p-2 -m-2 z-10">Project Overview</h3>
              <div className="p-2 space-y-2 text-sm">
                <p><strong className="text-gray-600 dark:text-gray-400">Participant:</strong> {submission.participantInfo.name} ({submission.participantInfo.email})</p>
                <p><strong className="text-gray-600 dark:text-gray-400">Repo:</strong> <a href={submission.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{submission.projectRepoUrl}</a></p>
                {submission.projectDemoUrl && <p><strong className="text-gray-600 dark:text-gray-400">Demo:</strong> <a href={submission.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{submission.projectDemoUrl}</a></p>}
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 sticky top-0 bg-gray-50 dark:bg-gray-700 p-2 -m-2 z-10">Submission Answers</h3>
               {activeHackathon.submissionQuestions.length === 0 ? (<p className="p-2 text-sm text-gray-500">No submission questions for this hackathon.</p>) :
              (<ul className="space-y-3 p-2">
                {submission.answers.map(ans => (
                  <li key={ans.questionId}>
                    <p className="font-medium text-gray-600 dark:text-gray-300">{getQuestionText(ans.questionId)}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">{ans.answer || <em className="text-gray-400 dark:text-gray-500">No answer provided</em>}</p>
                  </li>
                ))}
              </ul>)}
            </section>
          </div>

          {/* Right Column: Scoring */}
          <div className="md:w-3/5 lg:w-2/3 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] p-2">
            <section>
              <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 sticky top-0 bg-white dark:bg-gray-800 p-2 -m-2 z-10">Scoring Criteria - Round {evaluationRound}</h3>
              {currentRoundCriteria.length === 0 && <p className="text-yellow-600 dark:text-yellow-400 p-2">No scoring criteria found for this round. Evaluation cannot proceed.</p>}
              <div className="space-y-6">
                {currentRoundCriteria.map(criterion => {
                  const scoreItem = scores.find(s => s.criterionId === criterion.id);
                  return (
                    <div key={criterion.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">{criterion.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{criterion.description}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                        <Input
                          id={`score-${criterion.id}`}
                          type="number"
                          label={`Score (Max ${criterion.maxScore})`}
                          value={scoreItem?.score === 0 ? '0' : (scoreItem?.score?.toString() || '')} // Show '0' if it is 0
                          onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.maxScore)}
                          min="0"
                          max={criterion.maxScore.toString()}
                          required
                          containerClassName="mb-0 flex-grow sm:max-w-xs"
                          className="text-center"
                        />
                        <Textarea
                          id={`comment-${criterion.id}`}
                          label="Specific Comment (Optional)"
                          value={scoreItem?.comment || ''}
                          onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                          rows={2}
                          containerClassName="mb-0 flex-grow"
                          placeholder="Feedback for this criterion..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Textarea
                label="Overall Comment*"
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={4}
                required
                placeholder="Provide your overall feedback for this submission..."
              />
              <div className="mt-4 text-2xl font-bold text-right text-gray-800 dark:text-gray-100">
                Total Score: <span className="text-primary-600 dark:text-primary-400">{totalScore}</span> / {currentRoundCriteria.reduce((sum, c) => sum + c.maxScore, 0)}
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSubmitting} size="lg" disabled={currentRoundCriteria.length === 0}>
                Submit Evaluation
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default SubmissionEvaluationForm;
