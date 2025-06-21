
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import JudgeDashboard from './JudgeDashboard'; // Assuming JudgeDashboard is the main view
import JudgingInterface from './JudgingInterface';
import { useAppContext } from '../../contexts/AppContext';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import { getStatusDisplayName } from '../../constants';

const JudgingInterfaceWrapper: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { getSubmissionById, getHackathonById, currentUser } = useAppContext();

    if (!submissionId) {
        return <Navigate to="/judge" replace state={{ error: "Submission ID is missing." }} />;
    }

    const submission = getSubmissionById(submissionId);
    if (!submission) {
        return <Navigate to="/judge" replace state={{ error: `Submission with ID "${submissionId}" not found.` }} />;
    }

    const hackathon = getHackathonById(submission.hackathonId);
    if (!hackathon) {
        return <Navigate to="/judge" replace state={{ error: `Hackathon data for submission "${submission.projectName}" could not be loaded.`}} />;
    }
    
    // Determine the stage ID from the submission's status
    const statusParts = submission.status.split('_');
    let stageIdFromStatus: string | undefined = undefined;
    let submissionStatusKeyword: string | undefined = undefined;

    if (statusParts.length >= 3 && statusParts[0] === 's') {
        stageIdFromStatus = statusParts[1];
        submissionStatusKeyword = statusParts.slice(2).join('_');
    }

    if (!stageIdFromStatus) {
        return (
            <Card title="Cannot Judge Submission">
                <Alert type="warning" message={`Submission "${submission.projectName}" is not in a standard stage-specific judging state (current status: ${getStatusDisplayName(submission.status, hackathon.data.stages)}). It might have already been processed or is in a different workflow step.`} />
            </Card>
        );
    }
    
    // Check if the submission status is 'pending_review' or 'judging' for this stage
    if (submissionStatusKeyword !== 'pending_review' && submissionStatusKeyword !== 'judging') {
         return (
            <Card title="Cannot Judge Submission">
                <Alert type="info" message={`Submission "${submission.projectName}" is not currently awaiting review for stage "${hackathon.data.stages.find(s=>s.id === stageIdFromStatus)?.name || stageIdFromStatus}". Its current status is: ${getStatusDisplayName(submission.status, hackathon.data.stages)}.`} />
            </Card>
        );
    }


    const stage = hackathon.data.stages.find(s => s.id === stageIdFromStatus);
    if (!stage) {
         return <Navigate to="/judge" replace state={{ error: `Stage data for ID "${stageIdFromStatus}" (from submission status) not found in hackathon "${hackathon.data.title}".`}} />;
    }
    
    if (!currentUser?.email || !stage.assignedJudgeEmails.map(sje => sje.toLowerCase()).includes(currentUser.email.toLowerCase())) {
        return (
             <Card title="Access Denied">
                <Alert type="error"  message={`You (${currentUser?.email || 'current user'}) are not assigned to judge stage "${stage.name}" for submission "${submission.projectName}" in hackathon "${hackathon.data.title}".`} />
            </Card>
        );
    }
    
    // If all checks pass, render the judging interface
    return <JudgingInterface submissionId={submissionId} hackathonId={hackathon.id} />;
};

export default JudgingInterfaceWrapper;
