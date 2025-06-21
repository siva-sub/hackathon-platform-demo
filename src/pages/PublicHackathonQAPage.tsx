import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor'; // Changed import
import Alert from '../components/ui/Alert';
import { Icons } from '../constants';
import { formatDate } from '../utils/helpers';
import NotFoundPage from './NotFoundPage';
import { HackathonQuestion } from '../types';
import RichTextViewer from '../components/ui/RichTextViewer';

const PublicHackathonQAPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const { getHackathonById, currentUser, addQuestionForHackathon, getSubmissionsForParticipant } = useAppContext();
  
  const hackathon = getHackathonById(hackathonId ?? null);
  const [newQuestion, setNewQuestion] = useState(''); // Will store HTML
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [canAskQuestion, setCanAskQuestion] = useState(false);

  useEffect(() => {
    if (hackathon && currentUser?.role === 'participant' && currentUser.email) {
      const participantSubmissions = getSubmissionsForParticipant(currentUser.email);
      const hasSubmittedToThisHackathon = participantSubmissions.some(sub => sub.hackathonId === hackathon.id);
      setCanAskQuestion(hasSubmittedToThisHackathon);
    } else {
      setCanAskQuestion(false);
    }
  }, [hackathon, currentUser, getSubmissionsForParticipant]);


  if (!hackathon || hackathon.data.status !== 'approved') {
    return <NotFoundPage />;
  }

  const sortedQuestions = [...(hackathon.data.questions || [])].sort((a, b) => {
    if (a.answeredAt && !b.answeredAt) return -1;
    if (!a.answeredAt && b.answeredAt) return 1;
    return new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime();
  });

  const handleAskQuestion = () => {
    // Basic check for empty HTML: Quill might produce '<p><br></p>' for empty input
    if (!newQuestion.trim() || newQuestion === '<p><br></p>') {
      setFormMessage({ type: 'error', text: 'Question cannot be empty.' });
      return;
    }
    if (!currentUser || !currentUser.email || !currentUser.role || currentUser.role !== 'participant') {
      setFormMessage({ type: 'error', text: 'You must be logged in as a participant to ask a question.' });
      return;
    }
    if (!canAskQuestion) {
      setFormMessage({ type: 'error', text: 'You need to have a submission in this hackathon to ask a question.' });
      return;
    }

    addQuestionForHackathon(hackathon.id, newQuestion, currentUser.email, currentUser.email); // Using email as name for now
    setNewQuestion('');
    setFormMessage({ type: 'success', text: 'Your question has been submitted and will be reviewed by an admin.' });
  };

  return (
    <div className="space-y-6">
      <Card title={`Q&A for: ${hackathon.data.title}`}>
        <Alert 
            type="info" 
            title="Public Q&A Forum" 
            className="mb-6"
            message={
                <>
                    <p>
                        All questions asked here and their corresponding answers from administrators will be publicly visible to all participants.
                    </p>
                    <p className="mt-1">
                        This policy ensures fairness and that everyone has access to the same information regarding the hackathon.
                    </p>
                </>
            }
        />

        {currentUser?.role === 'participant' && canAskQuestion && (
          <Card title="Ask a New Question" className="mb-6 bg-primary-50 dark:bg-primary-900">
            <RichTextEditor
              label="Your Question:"
              value={newQuestion}
              onChange={(html) => setNewQuestion(html)}
              placeholder="Type your question here..."
            />
            {formMessage && (
              <Alert 
                type={formMessage.type} 
                message={formMessage.text} 
                onClose={() => setFormMessage(null)} 
                className="mt-2"
              />
            )}
            <Button 
                onClick={handleAskQuestion} 
                className="mt-3" 
                variant="primary" 
                leftIcon={<Icons.PaperAirplane />}
                disabled={!newQuestion.trim() || newQuestion === '<p><br></p>'}
            >
              Submit Question
            </Button>
          </Card>
        )}
         {currentUser?.role === 'participant' && !canAskQuestion && (
           <Alert type="info" className="mb-6" message="To ask a question, you first need to submit a project to this hackathon." />
        )}
         {!currentUser && (
            <Alert type="info" className="mb-6" message="Please log in as a participant and submit to this hackathon to ask a question." />
         )}


        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Asked Questions</h2>
        {sortedQuestions.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-300">No questions have been asked yet for this hackathon.</p>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((q: HackathonQuestion) => (
              <Card key={q.id} className="shadow-sm">
                <div className="p-4">
                  <div className="font-semibold text-neutral-700 dark:text-neutral-100 mb-1">
                    <RichTextViewer htmlContent={q.questionText} />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Asked by: {q.askedByParticipantName} ({q.askedByParticipantEmail ? `email hidden for privacy` : 'Anonymous'}) on {formatDate(q.askedAt)}
                  </p>
                  
                  {q.answerText ? (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Admin Answer:</p>
                      <RichTextViewer htmlContent={q.answerText} className="text-neutral-600 dark:text-neutral-200" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Answered by: {q.answeredByAdminEmail} on {formatDate(q.answeredAt!)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Awaiting answer from admin.</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
         <div className="mt-8 text-center">
            <Link to={`/public-events/${hackathon.id}`}>
                <Button variant="ghost" leftIcon={<Icons.ArrowUturnLeft />}>
                    Back to Hackathon Details
                </Button>
            </Link>
        </div>
      </Card>
    </div>
  );
};

export default PublicHackathonQAPage;