
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input'; 
import { Icons } from '../../constants';
import { formatDate } from '../../utils/helpers';
import Alert from '../ui/Alert';

const ParticipantTeamsPage: React.FC = () => {
  const { 
    currentUser, 
    getTeamsForParticipant, 
    getTeamMembersByTeamId,
    getTeamById, 
    getInvitationsForParticipant,
    respondToTeamInvitation,
    getHackathonById,
    getSubmissionById,
    inviteTeamMember, 
    removeTeamMember,
    leaveTeam // New context function
  } = useAppContext();

  const [inviteeEmails, setInviteeEmails] = useState<Record<string, string>>({}); // { [teamId]: email }

  if (!currentUser || !currentUser.email) {
    return <Card title="My Teams & Invitations"><Alert type="error" message="Could not identify participant. Please log in again with your email."/></Card>;
  }

  const myTeams = getTeamsForParticipant(currentUser.email);
  const myInvitations = getInvitationsForParticipant(currentUser.email);

  const handleRespondToInvitation = async (invitationId: string, status: 'accepted' | 'declined') => {
    if (!currentUser?.email) return;
    const success = await respondToTeamInvitation(invitationId, status, currentUser.email);
    if (success) {
      alert(`Invitation ${status === 'accepted' ? 'accepted' : 'declined'} successfully!`);
    } else {
      alert(`Failed to respond to invitation. Please try again.`);
    }
  };

  const handleInviteChange = (teamId: string, email: string) => {
    setInviteeEmails(prev => ({ ...prev, [teamId]: email }));
  };

  const handleInviteSubmit = async (teamId: string) => {
    if (!currentUser?.email) return;
    const emailToInvite = inviteeEmails[teamId];
    if (!emailToInvite || !emailToInvite.includes('@')) {
      alert("Please enter a valid email address to invite.");
      return;
    }
    const success = await inviteTeamMember(teamId, emailToInvite, currentUser.email);
    if (success) {
      alert(`${emailToInvite} invited successfully!`);
      setInviteeEmails(prev => ({ ...prev, [teamId]: '' })); // Clear input
    } else {
      // Alert typically handled by inviteTeamMember in context for existing invites/members
    }
  };

  const handleRemoveMemberByLeader = async (teamId: string, memberEmailToRemove: string) => {
    if (!currentUser?.email) return;
    if (confirm(`Are you sure you want to remove ${memberEmailToRemove} from this team?`)) {
      const success = await removeTeamMember(teamId, memberEmailToRemove, currentUser.email);
      if (success) {
        alert(`${memberEmailToRemove} removed successfully.`);
      } else {
        // Alert handled by removeTeamMember in context
      }
    }
  };

  const handleLeaveTeamByMember = async (teamId: string) => {
    if (!currentUser?.email) return;
    const team = getTeamById(teamId);
    if (confirm(`Are you sure you want to leave team "${team?.name || 'this team'}"?`)) {
        const success = await leaveTeam(teamId, currentUser.email);
        if (success) {
            alert(`You have successfully left team "${team?.name || 'this team'}".`);
        } else {
            // Alert will be handled by context if leader tries to leave, etc.
        }
    }
  };


  return (
    <div className="space-y-6">
      <Card title="My Teams">
        {myTeams.length === 0 ? (
          <p className="dark:text-neutral-300">You are not currently part of any teams.</p>
        ) : (
          myTeams.map(team => {
            const members = getTeamMembersByTeamId(team.id).filter(m => m.status === 'accepted' || m.status === 'invited'); // Show accepted and invited for context
            const hackathon = getHackathonById(team.hackathonId);
            const submission = getSubmissionById(team.submissionId);
            const isLeader = currentUser.email?.toLowerCase() === team.leaderEmail.toLowerCase();

            return (
              <Card key={team.id} title={`Team: ${team.name}`} className="mb-4 bg-neutral-50 dark:bg-neutral-750">
                <p className="text-sm dark:text-neutral-200"><strong>Hackathon:</strong> {hackathon?.data.title || 'N/A'}</p>
                <p className="text-sm dark:text-neutral-200"><strong>Project:</strong> {submission?.projectName || 'N/A'}</p>
                <p className="text-sm dark:text-neutral-200"><strong>Leader:</strong> {team.leaderEmail}</p>
                
                <h5 className="font-semibold mt-3 dark:text-neutral-100">Members:</h5>
                {members.filter(m => m.status === 'accepted').length > 0 ? (
                  <ul className="list-disc pl-5 text-xs dark:text-neutral-200 space-y-1">
                    {members.filter(m => m.status === 'accepted').map(member => (
                      <li key={member.id} className="flex justify-between items-center">
                        <span>
                            {member.participantEmail} 
                            {member.participantEmail.toLowerCase() === team.leaderEmail.toLowerCase() && <span className="ml-1 text-xs bg-yellow-200 dark:bg-yellow-700 px-1 rounded">Leader</span>}
                        </span>
                        {isLeader && member.participantEmail.toLowerCase() !== team.leaderEmail.toLowerCase() && (
                          <Button 
                            onClick={() => handleRemoveMemberByLeader(team.id, member.participantEmail)}
                            variant="danger" 
                            size="sm" 
                            className="px-1.5 py-0.5 text-xs"
                            leftIcon={<Icons.MinusCircle />}
                          >
                            Remove
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs dark:text-neutral-300">No other accepted members yet.</p>}

                {!isLeader && members.some(m => m.participantEmail.toLowerCase() === currentUser.email?.toLowerCase() && m.status === 'accepted') && (
                     <Button 
                        onClick={() => handleLeaveTeamByMember(team.id)}
                        variant="danger" 
                        size="sm" 
                        className="mt-3"
                        leftIcon={<Icons.MinusCircle />}
                      >
                        Leave Team
                      </Button>
                )}

                {isLeader && (
                  <div className="mt-4 pt-3 border-t dark:border-neutral-600">
                    <h5 className="font-semibold text-sm dark:text-neutral-100 mb-1">Invite New Member to "{team.name}"</h5>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="email"
                        placeholder="new.member@example.com"
                        value={inviteeEmails[team.id] || ''}
                        onChange={(e) => handleInviteChange(team.id, e.target.value)}
                        containerClassName="flex-grow mb-0"
                        className="text-sm py-1.5"
                      />
                      <Button 
                        onClick={() => handleInviteSubmit(team.id)} 
                        size="sm" 
                        variant="secondary" 
                        leftIcon={<Icons.UserPlus />}
                        disabled={!inviteeEmails[team.id]?.includes('@')}
                      >
                        Invite
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </Card>

      <Card title="Pending Team Invitations">
        {myInvitations.length === 0 ? (
          <p className="dark:text-neutral-300">You have no pending team invitations.</p>
        ) : (
          myInvitations.map(invite => {
            const team = getTeamById(invite.teamId);
            const hackathon = team ? getHackathonById(team.hackathonId) : null;
            const submission = team ? getSubmissionById(team.submissionId) : null;
            return (
              <div key={invite.id} className="p-3 border dark:border-neutral-600 rounded-md mb-3 bg-neutral-100 dark:bg-neutral-750">
                <p className="dark:text-neutral-100">You have been invited to join team "<strong>{team?.name || 'Unknown Team'}</strong>" 
                   for project "<strong>{submission?.projectName || 'Unknown Project'}</strong>" 
                   in hackathon "<strong>{hackathon?.data.title || 'Unknown Hackathon'}</strong>".
                </p>
                <p className="text-xs dark:text-neutral-200">Invited by: {team?.leaderEmail || 'Unknown'} on {formatDate(invite.invitedAt)}</p>
                <div className="mt-2 space-x-2">
                  <Button onClick={() => handleRespondToInvitation(invite.id, 'accepted')} size="sm" variant="primary" leftIcon={<Icons.CheckCircle />}>Accept</Button>
                  <Button onClick={() => handleRespondToInvitation(invite.id, 'declined')} size="sm" variant="danger" leftIcon={<Icons.XCircle />}>Decline</Button>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
};

export default ParticipantTeamsPage;