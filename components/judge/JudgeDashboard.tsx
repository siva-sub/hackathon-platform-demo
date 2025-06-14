
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, JudgingCriterion } from '../../types';
import { getAssignedSubmissionsForJudge } from '../../services/hackathonService';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const JudgeDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, currentUserRole, currentUserEmail, allHackathons, setActiveHackathonId } = context;

  const judgeId = currentUserEmail; 

  const [assignedSubmissions, setAssignedSubmissions] = useState<ProjectSubmission[]>([]);
  const [currentRoundCriteria, setCurrentRoundCriteria] = useState<JudgingCriterion[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [currentActiveRoundForJudge, setCurrentActiveRoundForJudge] = useState<number>(0);

  useEffect(() => {
    if (activeHackathon && judgeId) {
      setIsLoadingSubmissions(true);
      
      const judgeIsAssignedToCurrentHackathonRound = activeHackathon.judges.some(
        j => j.judgeId === judgeId && j.roundNumber === activeHackathon.currentJudgingRound
      );
      
      let roundToEvaluate = 0;
      if (activeHackathon.currentJudgingRound > 0 && judgeIsAssignedToCurrentHackathonRound) {
        roundToEvaluate = activeHackathon.currentJudgingRound;
      }
      // If not assigned to the global current round, a judge might still have specific assignments
      // For this demo, we'll primarily focus on the global currentJudgingRound.
      // A more complex system might show all rounds a judge is part of.
      
      setCurrentActiveRoundForJudge(roundToEvaluate);

      if (roundToEvaluate > 0) {
        const subs = getAssignedSubmissionsForJudge(judgeId, roundToEvaluate, activeHackathon.id);
         // Filter out already judged for this view
        const unjudgedSubs = subs.filter(s => 
          !s.judgements.some(j => j.judgeId === judgeId && j.roundNumber === roundToEvaluate)
        );
        setAssignedSubmissions(unjudgedSubs);

        const roundDetails = activeHackathon.judgingRounds.find(r => r.roundNumber === roundToEvaluate);
        setCurrentRoundCriteria(roundDetails ? roundDetails.criteria : []);
      } else {
        setAssignedSubmissions([]);
        setCurrentRoundCriteria([]);
      }
      setIsLoadingSubmissions(false);
    } else {
      setAssignedSubmissions([]);
      setCurrentRoundCriteria([]);
      setIsLoadingSubmissions(false);
    }
  }, [activeHackathon, judgeId]);

  if (currentUserRole !== 'judge' || !judgeId) {
     return <Card title="Access Denied"><p>This page is for judges only. Please select a judge persona.</p><Button onClick={() => navigate('/')}>Go to Persona Selection</Button></Card>;
  }
  
  if (!activeHackathon) {
     if (allHackathons.length > 0) {
        return (
            <Card title="Judge Dashboard">
                <p>Please select an active hackathon from the public page to view your judging assignments.</p>
                <Button onClick={() => { setActiveHackathonId(null); navigate('/hackathon-details');}} className="mt-4">
                    View Available Hackathons
                </Button>
            </Card>
        );
    }
    return <Card title="Judge Dashboard"><p>No hackathons are currently active or available.</p></Card>;
  }

  if (isLoadingSubmissions) return <LoadingSpinner message="Loading assigned submissions..." />;
  
  if (currentActiveRoundForJudge === 0) {
     return (
      <Card title={`Judge Dashboard for ${activeHackathon.title}`}>
        <p className="text-gray-600 dark:text-gray-300">
          You are currently not assigned to an active judging round for this hackathon, 
          or judging has not started for your assigned round.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Current Hackathon Judging Round: {activeHackathon.currentJudgingRound > 0 ? `Round ${activeHackathon.currentJudgingRound}` : (activeHackathon.currentJudgingRound === -1 ? "Completed" : "Not Started")}.
        </p>
         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your Judge ID: {judgeId}</p>
      </Card>
    );
  }


  return (
    <div className="space-y-8">
      <Card>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Judge Dashboard</h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">
          You are judging for: <span className="font-semibold text-primary-600 dark:text-primary-400">{activeHackathon.title}</span> - Round {currentActiveRoundForJudge}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your Judge ID: {judgeId}</p>
      </Card>

      {currentRoundCriteria.length > 0 && (
        <Card title={`Judging Criteria - Round ${currentActiveRoundForJudge}`}>
          <ul className="space-y-2">
            {currentRoundCriteria.map(criterion => (
              <li key={criterion.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">{criterion.name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Max: {criterion.maxScore} pts)</span></h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">{criterion.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Submissions to Evaluate">
        {assignedSubmissions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No unjudged submissions currently assigned to you for Round {currentActiveRoundForJudge}.
          </p>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 px-6">Project Name</th>
                  <th scope="col" className="py-3 px-6">Participant Name</th>
                  <th scope="col" className="py-3 px-6">Submitted At</th>
                  <th scope="col" className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedSubmissions.map((sub) => (
                  <tr key={sub.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sub.projectName}</td>
                    <td className="py-4 px-6">{sub.participantInfo.name}</td>
                    <td className="py-4 px-6">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <Link to={`/judge/evaluate/${sub.id}`} state={{ roundNumber: currentActiveRoundForJudge }} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">
                        Evaluate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default JudgeDashboard;
