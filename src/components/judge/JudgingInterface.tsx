import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Submission, Score, MatrixCriterion, HackathonStage, Hackathon } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import RichTextEditor from '../ui/RichTextEditor'; // Changed import
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import SubmissionDetailView from '../shared/SubmissionDetailView';
import { getBasicCompletion } from '../../services/geminiService';
import { Icons } from '../../constants';
import RichTextViewer from '../ui/RichTextViewer';

interface JudgingInterfaceProps {
  submissionId: string;
  hackathonId: string; 
}

const JudgingInterface: React.FC<JudgingInterfaceProps> = ({ submissionId, hackathonId }) => {
  const { getHackathonById, getSubmissionById, scoreSubmissionAndMakeDecision, currentUser } = useAppContext();
  const navigate = useNavigate();
  const judgeEmail = currentUser?.email || "judge_mock@example.com"; 

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [currentStageForJudging, setCurrentStageForJudging] = useState<HackathonStage | null>(null);
  const [judgingMatrix, setJudgingMatrix] = useState<MatrixCriterion[]>([]);
  const [currentScores, setCurrentScores] = useState<Score[]>([]);
  const [generalComment, setGeneralComment] = useState(''); // HTML content
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const currentHackathonData = getHackathonById(hackathonId);
    if (!currentHackathonData) {
        setError("Hackathon context not found.");
        setIsLoading(false);
        return;
    }
    setHackathon(currentHackathonData);

    const sub = getSubmissionById(submissionId);
    if (sub) {
      setSubmission(sub);
      const statusParts = sub.status.split('_');
      let stageIdFromStatus: string | undefined;
      if (statusParts.length >=3 && statusParts[0] === 's') {
        stageIdFromStatus = statusParts[1];
      }
      
      const stageToJudge = currentHackathonData.data.stages.find(s => s.id === stageIdFromStatus);

      if (stageToJudge) {
        setCurrentStageForJudging(stageToJudge);
        setJudgingMatrix(stageToJudge.judgingCriteria);
        
        const existingStageScoreData = sub.stageScores.find(ss => ss.stageId === stageToJudge.id);
        const initialScores = stageToJudge.judgingCriteria.map(criterion => {
          const existingScore = existingStageScoreData?.scores.find(s_ => s_.criterionId === criterion.id);
          return {
            criterionId: criterion.id,
            score: existingScore ? existingScore.score : 0,
            comment: existingScore ? existingScore.comment : '', // Comment is HTML
          };
        });
        setCurrentScores(initialScores);
        setGeneralComment(existingStageScoreData?.generalComment || ''); // General comment is HTML
      } else {
        setError("Could not determine the stage for judging this submission or stage has no criteria.");
        setJudgingMatrix([]); 
      }
    } else {
      setError("Submission not found.");
    }
    setIsLoading(false);
  }, [submissionId, hackathonId, getSubmissionById, getHackathonById]);

  const handleScoreChange = (criterionId: string, scoreValue: string) => {
    const newScore = parseInt(scoreValue);
    const criterion = judgingMatrix.find(c => c.id === criterionId);
    if (!criterion) return;
    const clampedScore = isNaN(newScore) ? 0 : Math.max(0, Math.min(newScore, criterion.maxScore));
    setCurrentScores(prevScores =>
      prevScores.map(s =>
        s.criterionId === criterionId ? { ...s, score: clampedScore } : s
      )
    );
  };
  
  const handleScoreCommentChange = (criterionId: string, htmlComment: string) => {
     setCurrentScores(prevScores =>
      prevScores.map(s =>
        s.criterionId === criterionId ? { ...s, comment: htmlComment } : s
      )
    );
  };

  const handleSubmitDecision = async (decision: 'approve' | 'reject') => {
    if (!submission || !currentStageForJudging || !hackathon) {
        setError("Cannot submit: Missing submission, hackathon or stage information.");
        return;
    }
    const allScoresValid = currentScores.every(s => typeof s.score === 'number' && !isNaN(s.score) && s.score >=0);
    if(!allScoresValid) {
        alert("Please ensure all criteria have a valid, non-negative score.");
        return;
    }
    setIsSubmitting(true);
    try {
        // Ensure generalComment is not empty HTML before submitting
        const finalGeneralComment = (generalComment.trim() === '<p><br></p>' || !generalComment.trim()) ? '' : generalComment;
        scoreSubmissionAndMakeDecision(submission.id, currentStageForJudging.id, currentScores, finalGeneralComment, judgeEmail, decision); 
        alert(`Scores and decision (${decision}) for "${currentStageForJudging.name}" submitted successfully by ${judgeEmail}!`);
        navigate('/judge');
    } catch (e: any) {
        setError(`Failed to submit decision: ${e.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const generateAiSummary = useCallback(async () => {
    if (!submission || !hackathon || !currentStageForJudging) return;
    setIsAiSummaryLoading(true);
    setAiSummary(null);
    
    const problemStatement = hackathon.data.problemStatements.find(ps => ps.id === submission.problemStatementId)?.title || "N/A";
    // For AI summary, strip HTML from answers or provide plain text if available
    // This example assumes answers are rich text, so we'd ideally pass plain text or strip HTML
    const projectInfo = `
      Project Name: ${submission.projectName}
      Problem Statement: ${problemStatement}
      Participant: ${submission.participantName}
      Answers:
      ${submission.answers.map(a => {
        const question = hackathon.data.submissionQuestions.find(q => q.id === a.questionId);
        // Simplistic HTML stripping for prompt. A library might be better for complex HTML.
        const plainTextAnswer = a.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return `${question ? question.text : 'Unknown Question'}: ${plainTextAnswer}`;
      }).join('\n')}
    `.trim();

    const prompt = `Summarize the following hackathon submission based on the provided details for its current judging stage: "${currentStageForJudging.name}". Focus on innovation, technical feasibility, and clarity relevant to this stage. Provide a concise summary of no more than 150 words. \n\nSubmission Details:\n${projectInfo}`;
    
    const summary = await getBasicCompletion(prompt);
    if (summary && !(summary.toLowerCase().startsWith("error") || summary.toLowerCase().includes("api key not configured"))) {
      setAiSummary(summary);
    } else {
      setAiSummary(summary || "Failed to generate AI summary. Ensure API key is configured or check logs.");
    }
    setIsAiSummaryLoading(false);
  }, [submission, hackathon, currentStageForJudging]);


  if (isLoading) return <Card title="Loading Submission..."><p className="dark:text-neutral-200">Loading...</p></Card>;
  if (error) return <Card title="Error"><Alert type="error" message={error} /></Card>;
  if (!submission || !currentStageForJudging || !hackathon) return <Card title="Error"><Alert type="error" message="Submission, hackathon, or judging stage data could not be loaded." /></Card>;

  const totalPossibleScore = judgingMatrix.reduce((sum, crit) => sum + crit.maxScore, 0);
  const currentTotalScore = currentScores.reduce((sum, scoreItem) => sum + (isNaN(scoreItem.score) ? 0 : scoreItem.score), 0);
  
  const currentStageOrder = currentStageForJudging.order;
  const isLastStage = !hackathon.data.stages.some(s => s.order > currentStageOrder);
  const approveButtonText = isLastStage ? "Recommend as Finalist" : "Approve for Next Stage";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6"> {/* This column will stack first on smaller screens */}
        <SubmissionDetailView submission={submission} />
        
        <Card title={`AI Summary for ${currentStageForJudging.name} (Optional)`}>
            <Button onClick={generateAiSummary} isLoading={isAiSummaryLoading} disabled={isAiSummaryLoading || isSubmitting} leftIcon={<Icons.LightBulb />} className="mb-2 w-full sm:w-auto">
                Generate AI Summary
            </Button>
            {isAiSummaryLoading && <p className="text-sm text-neutral-500 dark:text-neutral-300">Generating summary...</p>}
            {aiSummary && (
                <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-750 rounded-md">
                   <RichTextViewer htmlContent={aiSummary} className="whitespace-pre-line" />
                </div>
            )}
        </Card>
      </div>

      <div className="lg:col-span-1"> {/* This column will stack second */}
        <Card title={`Judging Panel - ${currentStageForJudging.name}`}>
          {judgingMatrix.length === 0 ? (
            <Alert type="info" message={`No judging criteria defined for stage: ${currentStageForJudging.name}. Contact administrator.`} />
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6"> {/* Removed default submit */}
                {judgingMatrix.map(criterion => {
                const scoreItem = currentScores.find(s => s.criterionId === criterion.id);
                return (
                    <div key={criterion.id} className="p-4 border dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-750">
                    <label htmlFor={`score-${criterion.id}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-100">
                        {criterion.name} (Max: {criterion.maxScore})
                    </label>
                    <RichTextViewer htmlContent={criterion.description} className="text-xs text-neutral-500 dark:text-neutral-200 mb-1" />
                    <Input
                        id={`score-${criterion.id}`}
                        type="number"
                        min="0"
                        max={criterion.maxScore}
                        value={scoreItem?.score ?? ''} 
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        className="w-24 mt-1"
                        required
                        disabled={isSubmitting}
                    />
                    <RichTextEditor
                        label="Specific comments for this criterion (Optional):"
                        value={scoreItem?.comment ?? ''}
                        onChange={(html) => handleScoreCommentChange(criterion.id, html)}
                        placeholder="Enter your comments here..."
                        disabled={isSubmitting}
                        containerClassName="mt-2"
                    />
                    </div>
                );
                })}
                
                <div className="mt-4 p-4 border dark:border-neutral-700 rounded-md bg-neutral-100 dark:bg-neutral-700">
                    <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">Total Score for {currentStageForJudging.name}: {currentTotalScore} / {totalPossibleScore}</h4>
                </div>

                <RichTextEditor
                  label={`General Comments for ${currentStageForJudging.name}`}
                  value={generalComment}
                  onChange={(html) => setGeneralComment(html)}
                  disabled={isSubmitting}
                  placeholder="Provide overall feedback for the submission at this stage."
                />
                <div className="space-y-3 mt-4">
                    <Button 
                        onClick={() => handleSubmitDecision('approve')} 
                        variant="success" 
                        size="lg" 
                        className="w-full"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        leftIcon={<Icons.CheckCircle />}
                    >
                        {approveButtonText}
                    </Button>
                    <Button 
                        onClick={() => handleSubmitDecision('reject')} 
                        variant="danger" 
                        size="lg" 
                        className="w-full"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        leftIcon={<Icons.XCircle />}
                    >
                        Reject from this Stage
                    </Button>
                </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default JudgingInterface;