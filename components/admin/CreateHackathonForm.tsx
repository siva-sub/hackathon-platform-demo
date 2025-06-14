
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { createBlankHackathonEvent, saveNewHackathonEvent } from '../../services/hackathonService';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const CreateHackathonForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <div>Loading context...</div>;
  const { currentUserEmail, setActiveHackathonId, refreshData } = context;

  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Hackathon title is required.");
      return;
    }
    if (!currentUserEmail) {
      setError("Admin user email not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newEvent = createBlankHackathonEvent(currentUserEmail, title);
      const savedEvent = saveNewHackathonEvent(newEvent);
      await refreshData(); // Ensure allHackathons list is updated in context
      setActiveHackathonId(savedEvent.id); // Set this new hackathon as active
      alert(`Hackathon "${savedEvent.title}" created successfully! You can now set it up.`);
      navigate('/admin/event-setup'); // Navigate to full setup form
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      console.error("Create Hackathon Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Create New Hackathon">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded-md">{error}</p>}
        
        <Input
          name="title"
          label="Hackathon Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., InnovateFest 2024"
          required
        />
        <Input
            name="adminEmail"
            label="Administrator Email"
            value={currentUserEmail || ''}
            disabled // Pre-filled and not editable
        />

        <div className="flex justify-between items-center pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} size="lg">
            Create Hackathon
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateHackathonForm;
