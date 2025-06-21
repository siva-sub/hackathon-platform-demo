
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Question } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Icons } from '../../constants';
import Alert from '../ui/Alert';

const SubmissionQuestionsForm: React.FC = () => {
  const { 
    getCurrentHackathon, 
    addQuestionToCurrentHackathon, 
    updateQuestionInCurrentHackathon, 
    deleteQuestionInCurrentHackathon 
  } = useAppContext();

  const currentHackathon = getCurrentHackathon();
  
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'textarea' | 'url'>('text');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    addQuestionToCurrentHackathon({ text: newQuestionText, type: newQuestionType });
    setNewQuestionText('');
    setNewQuestionType('text');
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    updateQuestionInCurrentHackathon(editingQuestion);
    setEditingQuestion(null);
  };

  if (!currentHackathon) {
    return (
      <Card title="Submission Questions">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard to manage its submission questions."/>
      </Card>
    );
  }

  return (
    <Card title={`Submission Questions for "${currentHackathon.data.title}"`}>
      <div className="space-y-4">
        {currentHackathon.data.submissionQuestions.map((q) => (
          <div key={q.id} className="p-3 border dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-750 flex justify-between items-center">
            {editingQuestion?.id === q.id ? (
              <div className="flex-grow space-y-2">
                <Input 
                  value={editingQuestion.text} 
                  onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="w-full"
                  containerClassName="mb-0"
                />
                <select 
                  value={editingQuestion.type} 
                  onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value as Question['type']})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="url">URL (e.g., for project link)</option>
                </select>
                <div className="flex space-x-2 mt-2">
                    <Button onClick={handleUpdateQuestion} size="sm" variant="primary">Save</Button>
                    <Button onClick={() => setEditingQuestion(null)} size="sm" variant="ghost">Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium dark:text-neutral-100">{q.text}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-200">Type: {q.type}</p>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => setEditingQuestion(q)} size="sm" variant="ghost" leftIcon={<Icons.Pencil />} />
                  <Button onClick={() => {if(confirm('Are you sure?')) deleteQuestionInCurrentHackathon(q.id)}} size="sm" variant="danger" leftIcon={<Icons.Trash />} />
                </div>
              </>
            )}
          </div>
        ))}
         {currentHackathon.data.submissionQuestions.length === 0 && <p className="text-neutral-500 dark:text-neutral-300">No submission questions defined yet for this hackathon.</p>}
      </div>

      <div className="mt-6 pt-6 border-t dark:border-neutral-700">
        <h4 className="text-md font-semibold mb-2 dark:text-neutral-100">Add New Question</h4>
        <Input
          label="Question Text"
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          placeholder="e.g., What problem does your project solve?"
        />
        <div>
            <label htmlFor="questionType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Question Type</label>
            <select
                id="questionType"
                value={newQuestionType}
                onChange={(e) => setNewQuestionType(e.target.value as Question['type'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md mb-4 bg-white dark:bg-neutral-700 dark:text-neutral-100"
            >
                <option value="text">Text Input</option>
                <option value="textarea">Text Area</option>
                <option value="url">URL (e.g., for project link)</option>
            </select>
        </div>
        <Button onClick={handleAddQuestion} variant="secondary" leftIcon={<Icons.PlusCircle />}>Add Question</Button>
      </div>
    </Card>
  );
};

export default SubmissionQuestionsForm;
