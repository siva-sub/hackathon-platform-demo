
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ProblemStatement } from '../../types';
import { addProblemStatement, updateProblemStatement, deleteProblemStatement } from '../../services/hackathonService';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const ProblemStatementsForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData } = context;

  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStatement, setCurrentStatement] = useState<Partial<ProblemStatement>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeHackathon) {
      setProblemStatements(activeHackathon.problemStatements || []);
    } else {
      setProblemStatements([]);
    }
  }, [activeHackathon]);

  const openModalForNew = () => {
    setCurrentStatement({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (statement: ProblemStatement) => {
    setCurrentStatement({ ...statement });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStatement({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentStatement(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveStatement = async () => {
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (!currentStatement.title || !currentStatement.description) {
      alert("Title and description are required for a problem statement.");
      return;
    }
    setIsLoading(true);
    try {
      if (currentStatement.id) { // Editing existing
        updateProblemStatement(activeHackathon.id, currentStatement as ProblemStatement);
      } else { // Adding new
        addProblemStatement(activeHackathon.id, {
          title: currentStatement.title,
          description: currentStatement.description,
        });
      }
      await refreshData(); // This will update activeHackathon from context
      closeModal();
    } catch (error) {
      console.error("Error saving problem statement:", error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStatement = async (statementId: string) => {
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this problem statement? This could affect existing submissions linked to it.")) {
      setIsLoading(true);
      try {
        deleteProblemStatement(activeHackathon.id, statementId);
        await refreshData();
      } catch (error) {
        console.error("Error deleting problem statement:", error);
        alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  if (!activeHackathon) {
    return (
        <Card title="Manage Problem Statements" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
            <p className="text-center text-gray-600 dark:text-gray-300">
                No active hackathon selected. Please select one from the dashboard.
            </p>
        </Card>
    );
  }

  return (
    <Card title={`Problem Statements for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <div className="mb-6 flex justify-end">
        <Button onClick={openModalForNew} variant="primary" isLoading={isLoading && isModalOpen && !currentStatement.id}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add New Statement
        </Button>
      </div>

      {problemStatements.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No problem statements defined yet for this hackathon.</p>
      ) : (
        <ul className="space-y-4">
          {problemStatements.map((ps) => (
            <li key={ps.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{ps.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{ps.description}</p>
                </div>
                <div className="space-x-2 flex-shrink-0 ml-4">
                  <Button onClick={() => openModalForEdit(ps)} variant="secondary" size="sm">Edit</Button>
                  <Button onClick={() => handleDeleteStatement(ps.id)} variant="danger" size="sm" isLoading={isLoading && currentStatement.id === ps.id && !isModalOpen}>Delete</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentStatement.id ? 'Edit Problem Statement' : 'Add New Problem Statement'}>
        <div className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={currentStatement.title || ''}
            onChange={handleInputChange}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={currentStatement.description || ''}
            onChange={handleInputChange}
            required
            rows={5}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveStatement} isLoading={isLoading && isModalOpen}>Save Statement</Button>
        </div>
      </Modal>
    </Card>
  );
};

export default ProblemStatementsForm;
