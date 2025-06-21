
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Submission, Hackathon, AwardLevel, AwardCategory, AwardDetail } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import Alert from '../ui/Alert';

interface AssignAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  hackathon: Hackathon;
  onAssignAward: (submissionId: string, awardDetail: AwardDetail) => void;
}

const AssignAwardModal: React.FC<AssignAwardModalProps> = ({ 
    isOpen, onClose, submission, hackathon, onAssignAward 
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<AwardLevel | ''>('');
  const [availableLevels, setAvailableLevels] = useState<AwardLevel[]>([]);

  const winnerConfig = hackathon.data.winnerConfiguration;

  useEffect(() => {
    if (winnerConfig && winnerConfig.awardCategories.length > 0) {
        // Pre-select category if submission's problem statement matches a category
        const psCategory = winnerConfig.awardCategories.find(cat => cat.id === submission.problemStatementId);
        if (winnerConfig.scope === 'per_problem_statement' && psCategory) {
            setSelectedCategoryId(psCategory.id);
        } else if (winnerConfig.scope === 'overall' && winnerConfig.awardCategories[0]) {
            setSelectedCategoryId(winnerConfig.awardCategories[0].id);
        } else if (winnerConfig.awardCategories[0]) { // Fallback to first category
             setSelectedCategoryId(winnerConfig.awardCategories[0].id);
        }
    } else {
        setSelectedCategoryId('');
    }
    setSelectedLevel('');
  }, [isOpen, winnerConfig, submission.problemStatementId]);

  useEffect(() => {
    if (selectedCategoryId) {
      const category = winnerConfig.awardCategories.find(cat => cat.id === selectedCategoryId);
      setAvailableLevels(category ? category.allowedLevels : []);
      setSelectedLevel(''); // Reset level when category changes
    } else {
      setAvailableLevels([]);
    }
  }, [selectedCategoryId, winnerConfig]);

  const handleSubmit = () => {
    if (!selectedCategoryId || !selectedLevel) {
      alert("Please select both an award category and a level.");
      return;
    }
    const category = winnerConfig.awardCategories.find(cat => cat.id === selectedCategoryId);
    if (!category) {
        alert("Selected category not found.");
        return;
    }
    onAssignAward(submission.id, { categoryId: selectedCategoryId, categoryName: category.name, level: selectedLevel });
    onClose();
  };

  if (!winnerConfig || winnerConfig.awardCategories.length === 0) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Award to ${submission.projectName}`}>
            <Alert type="warning" message="Winner configuration not set up for this hackathon. Please configure awards in Admin > Award Configuration." />
            <div className="mt-4 flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Award to ${submission.projectName}`} size="md">
      <div className="space-y-4">
        <div>
          <label htmlFor="awardCategory" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Award Category
          </label>
          <select
            id="awardCategory"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
          >
            <option value="" disabled>-- Select Category --</option>
            {winnerConfig.awardCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedCategoryId && (
          <div>
            <label htmlFor="awardLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Award Level for "{winnerConfig.awardCategories.find(c=>c.id === selectedCategoryId)?.name}"
            </label>
            {availableLevels.length > 0 ? (
                <select
                    id="awardLevel"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as AwardLevel)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                >
                    <option value="" disabled>-- Select Level --</option>
                    {availableLevels.map(level => (
                    <option key={level} value={level} className="capitalize">{level.replace('_', ' ')}</option>
                    ))}
                </select>
            ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">No award levels configured for this category.</p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!selectedCategoryId || !selectedLevel || availableLevels.length === 0}
          >
            Assign Award
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignAwardModal;
