
import React from 'react';
import Modal from '../ui/Modal';
import { EditHistoryEntry } from '../../types';
import { formatDate } from '../../utils/helpers';

interface SubmissionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: EditHistoryEntry[];
}

const SubmissionHistoryModal: React.FC<SubmissionHistoryModalProps> = ({ isOpen, onClose, history }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submission Edit History" size="lg">
      {history.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-300">No edit history recorded for this submission yet.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-3">
          {history.slice().reverse().map((entry, index) => ( // Show newest first
            <div key={index} className="p-3 bg-neutral-100 dark:bg-neutral-750 rounded-md text-sm">
              <p className="font-semibold text-neutral-700 dark:text-neutral-100">{entry.action}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-200">
                By: {entry.userEmail} on {formatDate(entry.timestamp)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default SubmissionHistoryModal;
