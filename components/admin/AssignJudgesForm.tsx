
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { JudgeAssignment } from '../../types';
import { assignJudgeToRound, removeJudgeFromRound } from '../../services/hackathonService';
import { MOCK_JUDGE_EMAILS } from '../../constants';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const AssignJudgesForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData } = context;

  const [judgeId, setJudgeId] = useState('');
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedJudges, setAssignedJudges] = useState<JudgeAssignment[]>([]);

  useEffect(() => {
    if (activeHackathon) {
      setAssignedJudges(activeHackathon.judges || []);
      if (activeHackathon.judgingRounds.length > 0) {
        // Set default selectedRound to the first available round if current selection is invalid or not set
        const firstRoundNumber = activeHackathon.judgingRounds[0].roundNumber;
        if (!activeHackathon.judgingRounds.find(r => r.roundNumber === selectedRound)) {
          setSelectedRound(firstRoundNumber);
        }
      } else {
        setSelectedRound(1); // Default if no rounds
      }
    } else {
        setAssignedJudges([]);
    }
  }, [activeHackathon, selectedRound]);

  const handleAssignJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (!judgeId || !selectedRound) {
      alert("Please enter a Judge ID/Email and select a round.");
      return;
    }
    setIsLoading(true);
    try {
      assignJudgeToRound(activeHackathon.id, judgeId, selectedRound);
      await refreshData();
      setJudgeId(''); // Clear input
      alert(`Judge ${judgeId} assigned to Round ${selectedRound}.`);
    } catch (error) {
      console.error("Error assigning judge:", error);
      alert(`Error assigning judge: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveJudge = async (jId: string, rNumber: number) => {
    if (!activeHackathon) {
        alert("No active hackathon selected.");
        return;
    }
    if (window.confirm(`Are you sure you want to remove judge ${jId} from Round ${rNumber}?`)) {
      setIsLoading(true);
      try {
        removeJudgeFromRound(activeHackathon.id, jId, rNumber);
        await refreshData();
        alert(`Judge ${jId} removed from Round ${rNumber}.`);
      } catch (error) {
        console.error("Error removing judge:", error);
        alert(`Error removing judge: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!activeHackathon) {
    return (
        <Card title="Assign Judges to Rounds" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
            <p className="text-center text-gray-600 dark:text-gray-300">
                No active hackathon selected. Please select one from the dashboard.
            </p>
        </Card>
    );
  }

  const roundOptions = activeHackathon.judgingRounds.map(r => ({ value: r.roundNumber.toString(), label: `Round ${r.roundNumber}` }));
  const judgeEmailOptions = MOCK_JUDGE_EMAILS.map(email => ({ value: email, label: email }));

  return (
    <Card title={`Assign Judges for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <form onSubmit={handleAssignJudge} className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Assign New Judge</h3>
        <Select
          label="Select Judge (Email)"
          options={[{value: "", label: "Select or type judge email"}, ...judgeEmailOptions]}
          value={judgeId}
          onChange={(e) => setJudgeId(e.target.value)}
          required
        />
        {roundOptions.length > 0 ? (
           <Select
            label="Select Judging Round"
            options={roundOptions}
            value={selectedRound.toString()}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            required
          />
        ) : (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">No judging rounds available. Please create judging rounds first in 'Judging Criteria & Rounds'.</p>
        )}
       
        <Button type="submit" isLoading={isLoading} disabled={roundOptions.length === 0}>Assign Judge</Button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Current Judge Assignments</h3>
        {assignedJudges.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No judges assigned yet for this hackathon.</p>
        ) : (
          <ul className="space-y-3">
            {activeHackathon.judgingRounds.sort((a,b) => a.roundNumber - b.roundNumber).map(round => {
              const judgesInRound = assignedJudges.filter(j => j.roundNumber === round.roundNumber);
              if (judgesInRound.length === 0) return (
                <li key={`empty-round-${round.roundNumber}`} className="p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                   <h4 className="font-medium text-lg text-primary-600 dark:text-primary-400">Round {round.roundNumber}</h4>
                   <p className="text-sm text-gray-500 dark:text-gray-400">No judges assigned to this round.</p>
                </li>
              );
              return (
                <li key={round.roundNumber} className="p-4 border border-gray-200 dark:border-gray-600 rounded-md">
                   <h4 className="font-medium text-lg text-primary-600 dark:text-primary-400">Round {round.roundNumber}</h4>
                   <ul className="list-disc list-inside ml-4 mt-2">
                    {judgesInRound.map((assignment) => (
                        <li key={`${assignment.judgeId}-${assignment.roundNumber}`} className="flex justify-between items-center py-1">
                        <span className="text-gray-700 dark:text-gray-200">{assignment.judgeId}</span>
                        <Button
                            onClick={() => handleRemoveJudge(assignment.judgeId, assignment.roundNumber)}
                            variant="danger"
                            size="sm"
                            isLoading={isLoading}
                        >
                            Remove
                        </Button>
                        </li>
                    ))}
                   </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default AssignJudgesForm;
