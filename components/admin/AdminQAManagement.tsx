
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Alert from '../ui/Alert';
import { Icons } from '../../constants';
import { formatDate } from '../../utils/helpers';
import { HackathonQuestion } from '../../types';

const AdminQAManagement: React.FC = () => {
  const { getCurrentHackathon, answerHackathonQuestion, currentUser } = useAppContext();
  const currentHackathon = getCurrentHackathon();

  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string, questionId?: string } | null>(null);

  useEffect(() => {
    // Pre-fill answerTexts for editing if an answer already exists
    if (currentHackathon && currentHackathon.data.questions) {
      const initialTexts: Record<string, string> = {};
      currentHackathon.data.questions.forEach(q => {
        if (q.answerText) {
          initialTexts[q.id] = q.answerText;
        }
      });
      // We don't want to overwrite user's current input if they are typing a new answer
      // So, only set this if not actively editing or if the editing field is empty
      setAnswerTexts(prev => ({...initialTexts, ...prev}));
    }
  }, [currentHackathon, editingAnswerId]);


  if (!currentHackathon) {
    return (
      <Card title="Participant Q&A Management">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard." />
      </Card>
    );
  }
  
  const hackathonQuestions = currentHackathon.data.questions || [];
  const sortedQuestions = [...hackathonQuestions].sort((a, b) => {
    if (!a.answerText && b.answerText) return -1;
    if (a.answerText && !b.answerText) return 1;
    return new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime();
  });

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswerTexts(prev => ({ ...prev, [questionId]: text }));
  };

  const handleEditAnswer = (question: HackathonQuestion) => {
    setEditingAnswerId(question.id);
    // Ensure the textarea is populated with the existing answer when starting to edit
    setAnswerTexts(prev => ({ ...prev, [question.id]: question.answerText || '' }));
    setFormMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setFormMessage(null); 
    // Optionally, revert answerTexts[editingAnswerId] to original if needed, but typically not necessary
    // as the original is still in `question.answerText`.
  };

  const handleSubmitAnswer = (questionId: string, isEditing: boolean = false) => {
    if (!currentUser?.email) {
      setFormMessage({ type: 'error', text: 'Admin user not identified.', questionId });
      return;
    }
    const answerText = answerTexts[questionId];
    if (!answerText || !answerText.trim()) {
      setFormMessage({ type: 'error', text: 'Answer cannot be empty.', questionId });
      return;
    }

    answerHackathonQuestion(currentHackathon.id, questionId, answerText, currentUser.email);
    setFormMessage({ type: 'success', text: `Answer ${isEditing ? 'updated' : 'submitted'} successfully!`, questionId });
    
    if (isEditing) {
      setEditingAnswerId(null); // Exit edit mode
    } else {
      // For new answers, clear the input field only if it wasn't an edit
       setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  return (
    <Card title={`Participant Q&A for "${currentHackathon.data.title}"`}>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
        Review questions submitted by participants and provide answers. All questions and answers will be publicly visible on the hackathon's Q&amp;A page.
      </p>

      {sortedQuestions.length === 0 ? (
        <Alert type="info" message="No questions have been submitted by participants for this hackathon yet." />
      ) : (
        <div className="space-y-6">
          {sortedQuestions.map((q: HackathonQuestion) => (
            <Card key={q.id} className="bg-neutral-50 dark:bg-neutral-750 shadow-md">
              <div className="p-4">
                <p className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 mb-1">{q.questionText}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-300">
                  Asked by: {q.askedByParticipantName} ({q.askedByParticipantEmail || 'N/A'})
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-300">
                  On: {formatDate(q.askedAt)}
                </p>

                {editingAnswerId === q.id ? (
                  // Editing Mode
                  <div className="mt-4">
                    <Textarea
                      label="Edit Your Answer:"
                      value={answerTexts[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Type your official answer here..."
                      rows={4}
                      aria-label={`Edit answer for question: ${q.questionText}`}
                    />
                    {formMessage && formMessage.questionId === q.id && (
                        <Alert 
                            type={formMessage.type} 
                            message={formMessage.text} 
                            onClose={() => setFormMessage(null)} 
                            className="mt-2 text-xs"
                        />
                    )}
                    <div className="mt-2 space-x-2">
                        <Button
                        onClick={() => handleSubmitAnswer(q.id, true)}
                        variant="primary"
                        size="sm"
                        leftIcon={<Icons.CheckCircle />}
                        disabled={!answerTexts[q.id]?.trim()}
                        >
                        Save Changes
                        </Button>
                        <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                        >
                        Cancel
                        </Button>
                    </div>
                  </div>
                ) : q.answerText ? (
                  // Display Existing Answer
                  <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                    <h5 className="font-semibold text-md text-primary-700 dark:text-primary-400 mb-1">Your Answer:</h5>
                    <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-line">{q.answerText}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">
                      Answered by: {q.answeredByAdminEmail} on {formatDate(q.answeredAt!)}
                    </p>
                    <Button
                      onClick={() => handleEditAnswer(q)}
                      className="mt-2"
                      variant="secondary"
                      size="sm"
                      leftIcon={<Icons.Pencil />}
                    >
                      Edit Answer
                    </Button>
                  </div>
                ) : (
                  // New Answer Form
                  <div className="mt-4">
                    <Textarea
                      label="Provide Your Answer:"
                      value={answerTexts[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Type your official answer here..."
                      rows={3}
                      aria-label={`Answer for question: ${q.questionText}`}
                    />
                    {formMessage && formMessage.questionId === q.id && (
                        <Alert 
                            type={formMessage.type} 
                            message={formMessage.text} 
                            onClose={() => setFormMessage(null)} 
                            className="mt-2 text-xs"
                        />
                    )}
                    <Button
                      onClick={() => handleSubmitAnswer(q.id)}
                      className="mt-2"
                      variant="primary"
                      size="sm"
                      leftIcon={<Icons.PaperAirplane />}
                      disabled={!answerTexts[q.id]?.trim()}
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AdminQAManagement;
