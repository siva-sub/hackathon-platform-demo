
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Submission, HackathonStage } from '../../types';
import Alert from '../ui/Alert';

interface RevertStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  stages: HackathonStage[]; // All stages for the hackathon
  onRevertStage: (submissionId: string, targetStageId: string) => void;
}

const RevertStageModal: React.FC<RevertStageModalProps> = ({ 
    isOpen, onClose, submission, stages, onRevertStage 
}) => {
  const [targetStageId, setTargetStageId] = useState<string>('');

  // Determine current stage order
  const currentSubmissionStage = stages.find(s => submission.status.includes(`s_${s.id}_`));
  const currentStageOrder = currentSubmissionStage ? currentSubmissionStage.order : Infinity;

  // Filter for stages that are strictly before the current stage
  const availablePreviousStages = stages
    .filter(stage => stage.order < currentStageOrder)
    .sort((a, b) => a.order - b.order); // Sort by order

  useEffect(() => {
    if (isOpen && availablePreviousStages.length > 0) {
      setTargetStageId(availablePreviousStages[0].id); // Default to the first available previous stage
    } else {
      setTargetStageId('');
    }
  }, [isOpen, availablePreviousStages]);

  const handleSubmit = () => {
    if (!targetStageId) {
      alert("Please select a stage to revert to.");
      return;
    }
    if (window.confirm(`Are you sure you want to revert "${submission.projectName}" to stage "${stages.find(s=>s.id === targetStageId)?.name || targetStageId}"? Scores for this stage and any subsequent stages will be reset.`)) {
        onRevertStage(submission.id, targetStageId);
        onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Revert Stage for ${submission.projectName}`} size="md">
      <div className="space-y-4">
        {availablePreviousStages.length === 0 ? (
          <Alert type="info" message="No previous stages available to revert to for this submission. It might be in the first stage or an initial status." />
        ) : (
          <div>
            <label htmlFor="targetStage" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Select Stage to Revert To:
            </label>
            <select
              id="targetStage"
              value={targetStageId}
              onChange={(e) => setTargetStageId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="" disabled>-- Select Previous Stage --</option>
              {availablePreviousStages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name} (Order: {stage.order})
                </option>
              ))}
            </select>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Warning: Reverting will reset scores for the selected stage and any stages that came after it. The submission's status will be set to 'Pending Review' for the chosen stage.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="danger" 
            onClick={handleSubmit} 
            disabled={availablePreviousStages.length === 0 || !targetStageId}
          >
            Revert to Selected Stage
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RevertStageModal;
