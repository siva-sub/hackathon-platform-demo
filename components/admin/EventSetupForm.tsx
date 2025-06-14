
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { updateHackathonEvent, transitionSubmissionsToRound, updateHackathonStageSettings } from '../../services/hackathonService';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import Card from '../common/Card';
import ToggleSwitch from '../common/ToggleSwitch';
import { HackathonEvent, Timeline, LandingPageContent } from '../../types';
import { DEFAULT_HERO_IMAGE } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import Select from '../common/Select'; // For selecting round to start
import LoadingSpinner from '../common/LoadingSpinner';

const EventSetupForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  
  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, setActiveHackathonId, refreshData } = context;

  const [formData, setFormData] = useState<Partial<HackathonEvent>>({});
  const [selectedRoundToStart, setSelectedRoundToStart] = useState<number>(1);
  const [isStageActionLoading, setIsStageActionLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeHackathon) {
      setFormData({
        title: activeHackathon.title,
        description: activeHackathon.description,
        rules: activeHackathon.rules,
        timeline: activeHackathon.timeline,
        landingPageContent: activeHackathon.landingPageContent,
        acceptingSubmissions: activeHackathon.acceptingSubmissions,
        currentJudgingRound: activeHackathon.currentJudgingRound,
        prizes: activeHackathon.prizes, // Make sure prizes are part of the form
      });
      // Set default for round selection if rounds exist
      if (activeHackathon.judgingRounds.length > 0) {
        setSelectedRoundToStart(activeHackathon.judgingRounds[0].roundNumber);
      }
    } else {
      setFormData({}); // Clear form if no active hackathon
    }
  }, [activeHackathon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePrizeChange = (index: number, value: string) => {
    setFormData(prev => {
        const newPrizes = [...(prev.prizes || [])];
        newPrizes[index] = value;
        return {...prev, prizes: newPrizes};
    });
  };

  const addPrizeField = () => {
    setFormData(prev => ({...prev, prizes: [...(prev.prizes || []), '']}));
  };

  const removePrizeField = (index: number) => {
    setFormData(prev => ({...prev, prizes: (prev.prizes || []).filter((_, i) => i !== index)}));
  };


  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      timeline: { ...(prev.timeline as Timeline), [name]: value }
    }));
  };
  
  const handleLandingPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      landingPageContent: { ...(prev.landingPageContent as LandingPageContent), [name]: value }
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!activeHackathon) {
        setError("No active hackathon selected to update.");
        return;
    }
    setIsFormLoading(true);
    try {
      const updatedEvent = updateHackathonEvent(activeHackathon.id, formData);
      // setActiveHackathon(updatedEvent); // Context will update via refreshData
      await refreshData(); 
      setActiveHackathonId(updatedEvent.id); // Ensure the updated one is active
      alert('Hackathon event details updated successfully!');
      // navigate('/admin'); // Or stay on page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleStageAction = async (action: 'openSubmissions' | 'closeSubmissions' | 'startJudgingRound' | 'concludeJudging') => {
    if (!activeHackathon) return;
    setIsStageActionLoading(true);
    setError(null);
    try {
      let updatedEvent: HackathonEvent | null = null;
      if (action === 'openSubmissions') {
        updatedEvent = updateHackathonStageSettings(activeHackathon.id, { acceptingSubmissions: true, currentJudgingRound: 0 });
      } else if (action === 'closeSubmissions') {
        updatedEvent = updateHackathonStageSettings(activeHackathon.id, { acceptingSubmissions: false });
      } else if (action === 'startJudgingRound') {
        if (selectedRoundToStart <= 0) {
          alert("Please select a valid round number to start.");
          setIsStageActionLoading(false);
          return;
        }
        // First, set the current judging round
        await updateHackathonStageSettings(activeHackathon.id, { currentJudgingRound: selectedRoundToStart, acceptingSubmissions: false });
        // Then, transition submissions
        updatedEvent = transitionSubmissionsToRound(activeHackathon.id, selectedRoundToStart);
      } else if (action === 'concludeJudging') {
        updatedEvent = updateHackathonStageSettings(activeHackathon.id, { currentJudgingRound: -1 }); // -1 indicates judging complete
      }
      
      if (updatedEvent) {
        // setActiveHackathon(updatedEvent); // Context will update via refreshData
        await refreshData();
        setActiveHackathonId(updatedEvent.id);
        alert(`Hackathon stage updated: ${action.replace(/([A-Z])/g, ' $1')}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage.');
    } finally {
      setIsStageActionLoading(false);
    }
  };
  
  if (!activeHackathon) {
    return (
        <Card title="Event Setup & Stages">
            <p className="text-center text-gray-600 dark:text-gray-300">
                No hackathon is currently active. Please select one from the <Link to="/admin" className="text-primary-600 hover:underline dark:text-primary-400 dark:hover:underline">Admin Dashboard</Link> or create a new one.
            </p>
        </Card>
    );
  }
  
  const availableRoundsOptions = activeHackathon.judgingRounds.map(r => ({value: r.roundNumber.toString(), label: `Round ${r.roundNumber}`}));

  return (
    <div className="space-y-8">
      <Card title="Manage Hackathon Stages" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Current Status:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Accepting Submissions: <span className={`font-bold ${activeHackathon.acceptingSubmissions ? 'text-green-600' : 'text-red-600'}`}>{activeHackathon.acceptingSubmissions ? 'YES' : 'NO'}</span></p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Current Judging Round: <span className="font-bold text-primary-600">{activeHackathon.currentJudgingRound > 0 ? `Round ${activeHackathon.currentJudgingRound}` : (activeHackathon.currentJudgingRound === -1 ? 'Completed' : 'Not Started')}</span></p>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button onClick={() => handleStageAction('openSubmissions')} disabled={activeHackathon.acceptingSubmissions || isStageActionLoading} isLoading={isStageActionLoading} variant="secondary">Open Submissions</Button>
          <Button onClick={() => handleStageAction('closeSubmissions')} disabled={!activeHackathon.acceptingSubmissions || isStageActionLoading} isLoading={isStageActionLoading} variant="secondary">Close Submissions</Button>
          
          <div className="flex items-end gap-2">
            <Select 
              options={availableRoundsOptions.length > 0 ? availableRoundsOptions : [{value: "", label: "No Rounds Configured"}]}
              value={selectedRoundToStart.toString()}
              onChange={(e) => setSelectedRoundToStart(Number(e.target.value))}
              label="Select Round"
              disabled={availableRoundsOptions.length === 0 || activeHackathon.acceptingSubmissions || isStageActionLoading || activeHackathon.currentJudgingRound === -1}
              containerClassName="flex-grow mb-0"
            />
            <Button 
              onClick={() => handleStageAction('startJudgingRound')} 
              disabled={availableRoundsOptions.length === 0 || activeHackathon.acceptingSubmissions || isStageActionLoading || activeHackathon.currentJudgingRound === -1 || selectedRoundToStart <= 0} 
              isLoading={isStageActionLoading} 
              className="h-[42px]"
            >Start Round</Button>
          </div>
          <Button onClick={() => handleStageAction('concludeJudging')} disabled={activeHackathon.currentJudgingRound <= 0 || isStageActionLoading} isLoading={isStageActionLoading} variant="danger">Conclude All Judging</Button>
        </div>
         {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded-md">{error}</p>}
      </Card>

      <Card title="Edit Hackathon Details">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input name="title" label="Hackathon Title" value={formData.title || ''} onChange={handleChange} required />
          <Textarea name="description" label="Description" value={formData.description || ''} onChange={handleChange} required rows={5} />
          <Textarea name="rules" label="Rules" value={formData.rules || ''} onChange={handleChange} rows={5} />

          <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Timeline</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <Input name="startDate" label="Start Date" type="date" value={formData.timeline?.startDate || ''} onChange={handleTimelineChange} required />
              <Input name="endDate" label="End Date" type="date" value={formData.timeline?.endDate || ''} onChange={handleTimelineChange} required />
              <Input name="submissionDeadline" label="Submission Deadline" type="datetime-local" value={formData.timeline?.submissionDeadline || ''} onChange={handleTimelineChange} required />
            </div>
          </fieldset>

          <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Prizes</legend>
            <div className="space-y-2 mt-2">
                {(formData.prizes || []).map((prize, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input 
                            value={prize} 
                            onChange={(e) => handlePrizeChange(index, e.target.value)} 
                            placeholder={`Prize ${index + 1}`}
                            containerClassName="flex-grow mb-0"
                        />
                        <Button type="button" onClick={() => removePrizeField(index)} variant="danger" size="sm" aria-label="Remove prize">X</Button>
                    </div>
                ))}
            </div>
            <Button type="button" onClick={addPrizeField} variant="ghost" className="mt-2">Add Prize</Button>
          </fieldset>


          <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Landing Page Content</legend>
            <div className="mt-2 space-y-4">
              <Input name="heroImage" label="Hero Image URL" value={formData.landingPageContent?.heroImage || ''} onChange={handleLandingPageChange} placeholder={DEFAULT_HERO_IMAGE}/>
              <Textarea name="aboutText" label="About Information" value={formData.landingPageContent?.aboutText || ''} onChange={handleLandingPageChange} rows={5} />
            </div>
          </fieldset>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={isFormLoading} size="lg">
              Save Detail Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EventSetupForm;
