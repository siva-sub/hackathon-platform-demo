
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { SubmissionQuestion } from '../../types';
import { addSubmissionQuestion, updateSubmissionQuestion, deleteSubmissionQuestion } from '../../services/hackathonService';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import ToggleSwitch from '../common/ToggleSwitch';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const SubmissionQuestionsForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData } = context;

  const [questions, setQuestions] = useState<SubmissionQuestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<SubmissionQuestion> & { index?: number }>({});
  const [isLoading, setIsLoading] = useState(false); // For modal save/delete operations

  useEffect(() => {
    if (activeHackathon) {
      setQuestions(activeHackathon.submissionQuestions || []);
    } else {
      setQuestions([]);
    }
  }, [activeHackathon]);

  const openModalForNew = () => {
    setCurrentQuestion({ questionText: '', type: 'text', isRequired: true });
    setIsModalOpen(true);
  };

  const openModalForEdit = (question: SubmissionQuestion, index: number) => {
    setCurrentQuestion({ ...question, index });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentQuestion({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setCurrentQuestion(prev => ({ ...prev, isRequired: checked }));
  };

  const handleSaveQuestion = async () => {
    if (!activeHackathon) {
      alert("No active hackathon selected.");
      return;
    }
    if (!currentQuestion.questionText || !currentQuestion.type) {
      alert("Question text and type are required.");
      return;
    }
    setIsLoading(true);
    try {
      if (currentQuestion.id) { // Editing existing question
        updateSubmissionQuestion(activeHackathon.id, currentQuestion as SubmissionQuestion);
      } else { // Adding new question
        addSubmissionQuestion(activeHackathon.id, {
          questionText: currentQuestion.questionText,
          type: currentQuestion.type as SubmissionQuestion['type'],
          isRequired: currentQuestion.isRequired || false,
        });
      }
      await refreshData();
      closeModal();
    } catch (error) {
      console.error("Error saving question:", error);
      alert(`Error saving question: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!activeHackathon) {
      alert("No active hackathon selected.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this question?")) {
      setIsLoading(true); // Indicate loading for this specific delete action outside modal
      setCurrentQuestion({ id: questionId }); // Track which item is being deleted for isLoading visual feedback
      try {
        deleteSubmissionQuestion(activeHackathon.id, questionId);
        await refreshData();
      } catch (error) {
        console.error("Error deleting question:", error);
        alert(`Error deleting question: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
        setCurrentQuestion({}); // Reset currentQuestion after delete
      }
    }
  };
  
  if (!activeHackathon) {
    return (
        <Card title="Manage Submission Questions" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
            <p className="text-center text-gray-600 dark:text-gray-300">
                No active hackathon selected. Please select one from the dashboard.
            </p>
        </Card>
    );
  }

  const QuestionTypeIcon: React.FC<{type: SubmissionQuestion['type']}> = ({type}) => {
    if (type === 'text') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;
    if (type === 'textarea') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>;
    if (type === 'url') return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>;
    return null;
  }

  return (
    <Card title={`Submission Questions for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <div className="mb-6 flex justify-end">
        <Button onClick={openModalForNew} variant="primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No submission questions defined yet for this hackathon.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li key={q.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  <QuestionTypeIcon type={q.type} />
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{q.questionText}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-7 ${q.isRequired ? 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200' : 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200'}`}>
                  {q.isRequired ? 'Required' : 'Optional'}
                </span>
                <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                  Type: {q.type}
                </span>
              </div>
              <div className="space-x-2">
                <Button onClick={() => openModalForEdit(q, index)} variant="secondary" size="sm">Edit</Button>
                <Button onClick={() => handleDeleteQuestion(q.id)} variant="danger" size="sm" isLoading={isLoading && currentQuestion.id === q.id && !isModalOpen}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentQuestion.id ? 'Edit Question' : 'Add New Question'}>
        <div className="space-y-4">
          <Textarea
            label="Question Text"
            name="questionText"
            value={currentQuestion.questionText || ''}
            onChange={handleInputChange}
            required
          />
          <Select
            label="Question Type"
            name="type"
            value={currentQuestion.type || 'text'}
            onChange={handleInputChange}
            options={[
              { value: 'text', label: 'Text Input' },
              { value: 'textarea', label: 'Text Area' },
              { value: 'url', label: 'URL Input' },
            ]}
            required
          />
          <ToggleSwitch
            label="Is this question required?"
            checked={currentQuestion.isRequired || false}
            onChange={handleToggleChange}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveQuestion} isLoading={isLoading && isModalOpen}>Save Question</Button>
        </div>
      </Modal>
    </Card>
  );
};

export default SubmissionQuestionsForm;
