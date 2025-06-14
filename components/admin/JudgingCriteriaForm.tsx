
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { JudgingCriterion, JudgingRound } from '../../types';
import { addJudgingCriterion, updateJudgingCriterion, deleteJudgingCriterion, addJudgingRound } from '../../services/hackathonService';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const JudgingCriteriaForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData } = context;

  const [judgingRounds, setJudgingRounds] = useState<JudgingRound[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCriterion, setCurrentCriterion] = useState<Partial<JudgingCriterion> & { roundNumber?: number }>({});
  const [editingRoundNumber, setEditingRoundNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For modal save/delete operations
  const [isRoundLoading, setIsRoundLoading] = useState(false); // For adding a new round

  useEffect(() => {
    if (activeHackathon) {
      setJudgingRounds((activeHackathon.judgingRounds || []).sort((a,b) => a.roundNumber - b.roundNumber));
    } else {
      setJudgingRounds([]);
    }
  }, [activeHackathon]);

  const openModalForNew = (roundNumber: number) => {
    setCurrentCriterion({ name: '', description: '', maxScore: 10, roundNumber });
    setEditingRoundNumber(roundNumber);
    setIsModalOpen(true);
  };

  const openModalForEdit = (criterion: JudgingCriterion, roundNumber: number) => {
    setCurrentCriterion({ ...criterion, roundNumber });
    setEditingRoundNumber(roundNumber);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCriterion({});
    setEditingRoundNumber(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const val = name === 'maxScore' ? parseInt(value, 10) || 0 : value;
    setCurrentCriterion(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveCriterion = async () => {
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (!currentCriterion.name || !currentCriterion.description || typeof currentCriterion.maxScore !== 'number' || currentCriterion.maxScore <= 0 || editingRoundNumber === null) {
      alert("All fields are required and max score must be positive.");
      return;
    }
    setIsLoading(true);
    try {
      if (currentCriterion.id) { // Editing existing
        updateJudgingCriterion(activeHackathon.id, editingRoundNumber, currentCriterion as JudgingCriterion);
      } else { // Adding new
        addJudgingCriterion(activeHackathon.id, editingRoundNumber, {
          name: currentCriterion.name,
          description: currentCriterion.description,
          maxScore: currentCriterion.maxScore,
        });
      }
      await refreshData();
      closeModal();
    } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCriterion = async (roundNumber: number, criterionId: string) => {
     if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this criterion?")) {
      setIsLoading(true); // Indicate loading for this specific delete action
      setCurrentCriterion({id: criterionId}); // Track for isLoading UI
      try {
        deleteJudgingCriterion(activeHackathon.id, roundNumber, criterionId);
        await refreshData();
      } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
        setCurrentCriterion({});
      }
    }
  };

  const handleAddRound = async () => {
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    setIsRoundLoading(true);
    try {
        addJudgingRound(activeHackathon.id);
        await refreshData();
    } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsRoundLoading(false);
    }
  };
  
  if (!activeHackathon) {
    return (
        <Card title="Manage Judging Criteria & Rounds" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
            <p className="text-center text-gray-600 dark:text-gray-300">
                No active hackathon selected. Please select one from the dashboard.
            </p>
        </Card>
    );
  }

  return (
    <Card title={`Judging Criteria & Rounds for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <div className="mb-6 flex justify-end">
        <Button onClick={handleAddRound} variant="primary" isLoading={isRoundLoading}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Add New Judging Round
        </Button>
      </div>

      {judgingRounds.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No judging rounds defined yet for this hackathon. Click "Add New Judging Round" to start.</p>
      ) : (
        <div className="space-y-8">
          {judgingRounds.map((round) => (
            <div key={round.roundNumber} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-primary-700 dark:text-primary-300">Round {round.roundNumber}</h3>
                <Button onClick={() => openModalForNew(round.roundNumber)} variant="secondary" size="sm">
                   Add Criterion to Round {round.roundNumber}
                </Button>
              </div>
              {round.criteria.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No criteria defined for this round.</p>
              ) : (
                <ul className="space-y-3">
                  {round.criteria.map((criterion) => (
                    <li key={criterion.id} className="p-3 bg-white dark:bg-gray-600 rounded shadow flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">{criterion.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Max: {criterion.maxScore} pts)</span></h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{criterion.description}</p>
                      </div>
                      <div className="space-x-2 flex-shrink-0 ml-4">
                        <Button onClick={() => openModalForEdit(criterion, round.roundNumber)} variant="ghost" size="sm">Edit</Button>
                        <Button onClick={() => handleDeleteCriterion(round.roundNumber, criterion.id)} variant="danger" size="sm" isLoading={isLoading && currentCriterion.id === criterion.id && !isModalOpen}>Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentCriterion.id ? `Edit Criterion for Round ${editingRoundNumber}` : `Add Criterion to Round ${editingRoundNumber}`}>
        <div className="space-y-4">
          <Input
            label="Criterion Name"
            name="name"
            value={currentCriterion.name || ''}
            onChange={handleInputChange}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={currentCriterion.description || ''}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Maximum Score"
            name="maxScore"
            type="number"
            value={currentCriterion.maxScore?.toString() || ''}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveCriterion} isLoading={isLoading && isModalOpen}>Save Criterion</Button>
        </div>
      </Modal>
    </Card>
  );
};

export default JudgingCriteriaForm;
