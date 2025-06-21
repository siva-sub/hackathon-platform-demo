
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Icons, getStatusDisplayName, getStatusColorClass } from '../constants';
import { formatDate } from '../utils/helpers';
import { AdminUser, JudgeUser, Hackathon, HackathonApprovalStatus, ParticipantHackathonHistoryEntry, JudgeAssignmentDetails, AdminAssignmentDetails } from '../types';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import { sendEmail } from '../services/emailService';


const ManageHackathonAdminsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  hackathon: Hackathon;
  allAdmins: AdminUser[];
  onAssignAdmin: (hackathonId: string, adminEmail: string) => void;
  onRemoveAdmin: (hackathonId: string, adminEmail: string) => void;
}> = ({ isOpen, onClose, hackathon, allAdmins, onAssignAdmin, onRemoveAdmin }) => {
  const [selectedAdminToAssign, setSelectedAdminToAssign] = useState('');

  const availableAdminsToAssign = allAdmins.filter(
    admin => !hackathon.data.adminEmails.map(ae => ae.toLowerCase()).includes(admin.email.toLowerCase()) && admin.email !== 'superadmin@example.com'
  );

  const handleAssign = () => {
    if (selectedAdminToAssign) {
      onAssignAdmin(hackathon.id, selectedAdminToAssign);
      setSelectedAdminToAssign(''); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Admins for: ${hackathon.data.title}`} size="lg">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Assigned Admins:</h4>
          {hackathon.data.adminEmails.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-300">No admins currently assigned.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {hackathon.data.adminEmails.map(email => (
                <li key={email} className="text-sm flex justify-between items-center text-neutral-700 dark:text-neutral-200">
                  {email}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onRemoveAdmin(hackathon.id, email)}
                    leftIcon={<Icons.MinusCircle />}
                    className="ml-2 px-1.5 py-0.5 text-xs"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="pt-4 border-t dark:border-neutral-700">
          <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Assign New Admin:</h4>
          {availableAdminsToAssign.length > 0 ? (
            <div className="flex items-center space-x-2">
              <select
                value={selectedAdminToAssign}
                onChange={(e) => setSelectedAdminToAssign(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100 flex-grow"
              >
                <option value="">-- Select Admin to Assign --</option>
                {availableAdminsToAssign.map(admin => (
                  <option key={admin.id} value={admin.email}>{admin.email}</option>
                ))}
              </select>
              <Button onClick={handleAssign} disabled={!selectedAdminToAssign} variant="secondary" size="sm" leftIcon={<Icons.UserPlus />}>
                Assign
              </Button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-300">All available platform admins are already assigned or no other admins exist (besides SuperAdmin).</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

const DeclineReasonModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    hackathonTitle: string;
}> = ({ isOpen, onClose, onSubmit, hackathonTitle}) => {
    const [reason, setReason] = useState('');
    
    const handleSubmit = () => {
        if(!reason.trim()){
            alert("Please provide a reason for declining.");
            return;
        }
        onSubmit(reason);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Decline Hackathon: ${hackathonTitle}`}>
            <Textarea 
                label="Reason for Decline (required)"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
                required
            />
            <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="danger" onClick={handleSubmit}>Decline Hackathon</Button>
            </div>
        </Modal>
    );
};

const JudgeAssignmentsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  judge: JudgeUser;
  assignments: JudgeAssignmentDetails[];
}> = ({ isOpen, onClose, judge, assignments }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Judge Assignments for: ${judge.email}`} size="lg">
      {assignments.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-300">This judge is not currently assigned to any hackathon stages.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {assignments.map((assignment, index) => (
            <div key={index} className="p-3 bg-neutral-100 dark:bg-neutral-750 rounded-md">
              <p className="font-semibold text-neutral-700 dark:text-neutral-100">Hackathon: {assignment.hackathonTitle}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-200">Stage: {assignment.stageName}</p>
            </div>
          ))}
        </div>
      )}
       <div className="mt-4 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

const AdminAssignmentsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser;
  assignments: AdminAssignmentDetails[];
}> = ({ isOpen, onClose, admin, assignments }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Admin Assignments for: ${admin.email}`} size="lg">
      {assignments.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-300">This admin is not currently managing or creating any hackathons.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {assignments.map((assignment, index) => (
            <div key={index} className="p-3 bg-neutral-100 dark:bg-neutral-750 rounded-md">
              <p className="font-semibold text-neutral-700 dark:text-neutral-100">Hackathon: {assignment.hackathonTitle}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-200">Role: {assignment.role}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-200">Status: 
                <span className={`ml-1 px-1.5 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColorClass(assignment.status)}`}>
                    {getStatusDisplayName(assignment.status, [], null)}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};


const SuperAdminPage: React.FC = () => {
  const { 
    currentUser,
    adminUsers, addAdminUser, removeAdminUser, getAdminAssignments,
    judges, addJudge, removeJudgeUser, getJudgeAssignments,
    hackathons, addHackathon, deleteHackathon, assignAdminToHackathon, removeAdminFromHackathon,
    approveHackathon, declineHackathon, archiveHackathon,
    getParticipantHackathonHistory
  } = useAppContext();
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [judgeError, setJudgeError] = useState('');
  const [judgeSuccess, setJudgeSuccess] = useState('');

  const [newHackathonTitle, setNewHackathonTitle] = useState('');
  const [newHackathonDescription, setNewHackathonDescription] = useState('');
  const [hackathonError, setHackathonError] = useState('');
  const [hackathonSuccess, setHackathonSuccess] = useState('');

  const [lookupEmail, setLookupEmail] = useState('');
  const [participantHistory, setParticipantHistory] = useState<ParticipantHackathonHistoryEntry[]>([]);
  const [lookupError, setLookupError] = useState('');

  const [isManageAdminsModalOpen, setIsManageAdminsModalOpen] = useState(false);
  const [selectedHackathonForAdminManagement, setSelectedHackathonForAdminManagement] = useState<Hackathon | null>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [hackathonToDecline, setHackathonToDecline] = useState<Hackathon | null>(null);
  
  const [isJudgeAssignmentsModalOpen, setIsJudgeAssignmentsModalOpen] = useState(false);
  const [selectedJudgeForAssignments, setSelectedJudgeForAssignments] = useState<JudgeUser | null>(null);
  const [isAdminAssignmentsModalOpen, setIsAdminAssignmentsModalOpen] = useState(false);
  const [selectedAdminForAssignments, setSelectedAdminForAssignments] = useState<AdminUser | null>(null);


  const [filterStatus, setFilterStatus] = useState<HackathonApprovalStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc'>('createdAt_desc');


  const handleOpenManageAdminsModal = (hackathon: Hackathon) => {
    setSelectedHackathonForAdminManagement(hackathon);
    setIsManageAdminsModalOpen(true);
  };

  const handleOpenDeclineModal = (hackathon: Hackathon) => {
    setHackathonToDecline(hackathon);
    setIsDeclineModalOpen(true);
  };
  
  const handleConfirmDecline = (reason: string) => {
    if (hackathonToDecline && currentUser?.email) {
        declineHackathon(hackathonToDecline.id, currentUser.email, reason);
        alert(`Hackathon "${hackathonToDecline.data.title}" declined.`);
    }
    setHackathonToDecline(null);
  };

  const handleApproveHackathon = (hackathonId: string, title: string) => {
    if (currentUser?.email && confirm(`Are you sure you want to approve hackathon "${title}"?`)) {
        approveHackathon(hackathonId, currentUser.email);
        alert(`Hackathon "${title}" approved.`);
    }
  };
  
  const handleArchiveHackathon = (hackathonId: string, title: string) => {
     if (confirm(`Are you sure you want to archive hackathon "${title}"? This will typically close it for submissions.`)) {
        archiveHackathon(hackathonId);
        alert(`Hackathon "${title}" archived.`);
    }
  }

  const handleRemovePlatformAdmin = (email: string) => {
    if (email === 'superadmin@example.com') {
        alert("Cannot remove the primary superadmin.");
        return;
    }
    if (confirm(`Are you sure you want to remove platform admin "${email}"? They will also be unassigned from all hackathons.`)) {
        removeAdminUser(email);
        setAdminSuccess(`Admin ${email} removed from the platform.`);
    }
  };

  const handleViewAdminAssignments = (admin: AdminUser) => {
    setSelectedAdminForAssignments(admin);
    setIsAdminAssignmentsModalOpen(true);
  };

  const handleResendAdminInvite = async (adminEmail: string) => {
     await sendEmail({
        to: adminEmail,
        subject: "Welcome to the Hackathon Platform - Admin Invitation Reminder",
        body: `Hello ${adminEmail},\n\nThis is a reminder of your invitation to be an Administrator on our Hackathon Platform. Please log in or contact support if you have any issues.\n\nBest regards,\nThe Platform Team`
     });
     alert(`Mock invitation reminder sent to admin ${adminEmail}.`);
  };
  
  const handleRemovePlatformJudge = (email: string) => {
     if (confirm(`Are you sure you want to remove platform judge "${email}"? They will also be unassigned from all hackathon stages.`)) {
        removeJudgeUser(email);
        setJudgeSuccess(`Judge ${email} removed from the platform.`);
    }
  };

  const handleViewJudgeAssignments = (judge: JudgeUser) => {
    setSelectedJudgeForAssignments(judge);
    setIsJudgeAssignmentsModalOpen(true);
  };
  
  const handleResendJudgeInvite = async (judgeEmail: string) => {
     await sendEmail({
        to: judgeEmail,
        subject: "Welcome to the Hackathon Platform - Judge Invitation Reminder",
        body: `Hello ${judgeEmail},\n\nThis is a reminder of your invitation to be a judge on our Hackathon Platform. Please log in or contact support if you have any issues.\n\nBest regards,\nThe Platform Team`
     });
     alert(`Mock invitation reminder sent to ${judgeEmail}.`);
  };


  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAdminError('Please enter a valid email address for the admin.');
      return;
    }
    if (adminUsers.find(au => au.email.toLowerCase() === newAdminEmail.toLowerCase())) {
      setAdminError('An admin with this email already exists.');
      return;
    }
    addAdminUser(newAdminEmail);
    setAdminSuccess(`Platform admin ${newAdminEmail} created successfully. You can now assign them to hackathons.`);
    setNewAdminEmail('');
  };

  const handleInviteJudge = (e: React.FormEvent) => {
    e.preventDefault();
    setJudgeError('');
    setJudgeSuccess('');
    if (!newJudgeEmail || !newJudgeEmail.includes('@')) {
      setJudgeError('Please enter a valid email address for the judge.');
      return;
    }
    if (judges.find(j => j.email.toLowerCase() === newJudgeEmail.toLowerCase())) {
      setJudgeError('A judge with this email already exists.');
      return;
    }
    addJudge(newJudgeEmail);
    setJudgeSuccess(`Platform judge ${newJudgeEmail} created successfully. Admins can now assign them to hackathon stages.`);
    setNewJudgeEmail('');
  };

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    setHackathonError('');
    setHackathonSuccess('');
    if (!newHackathonTitle.trim()) {
        setHackathonError('Hackathon title is required.');
        return;
    }
    if (!currentUser || !currentUser.email) {
        setHackathonError('Super Admin user not identified.');
        return;
    }
    const newId = addHackathon({ title: newHackathonTitle, description: newHackathonDescription }, 'superadmin', currentUser.email);
    setHackathonSuccess(`Hackathon "${newHackathonTitle}" created and approved (ID: ${newId}).`);
    setNewHackathonTitle('');
    setNewHackathonDescription('');
  };

  const handleDeleteHackathon = (hackathonId: string, hackathonTitle: string) => {
    if (confirm(`Are you sure you want to delete the hackathon "${hackathonTitle}" and all its submissions? This action cannot be undone.`)) {
        deleteHackathon(hackathonId);
        alert(`Hackathon "${hackathonTitle}" deleted.`);
    }
  };
  
  const handleParticipantLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupEmail || !lookupEmail.includes('@')) {
        setLookupError('Please enter a valid participant email to lookup.');
        setParticipantHistory([]);
        return;
    }
    const history = getParticipantHackathonHistory(lookupEmail);
    setParticipantHistory(history);
    if (history.length === 0) {
        setLookupError(`No activity found for participant: ${lookupEmail}`);
    }
  };

  const filteredAndSortedHackathons = useMemo(() => {
    let items = [...hackathons];
    if (filterStatus !== 'all') {
        items = items.filter(h => h.data.status === filterStatus);
    }
    items.sort((a, b) => {
        switch (sortBy) {
            case 'createdAt_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'title_asc': return a.data.title.localeCompare(b.data.title);
            case 'title_desc': return b.data.title.localeCompare(a.data.title);
            case 'createdAt_desc':
            default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });
    return items;
  }, [hackathons, filterStatus, sortBy]);


  return (
    <div className="space-y-8">
      <Card title="Super Admin Dashboard" className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
        <p className="text-neutral-700 dark:text-neutral-200">
          Welcome, Super Admin! From here you can manage all aspects of the hackathon platform, including user roles, event creation, approvals, and overall system health.
        </p>
      </Card>

      {/* Hackathon Event Management */}
      <Card title="Manage Hackathon Events">
        <form onSubmit={handleCreateHackathon} className="space-y-4 mb-6 p-4 border dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-750">
          <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">Create New Hackathon (Auto-approved)</h3>
          <Input label="Hackathon Title" value={newHackathonTitle} onChange={(e) => setNewHackathonTitle(e.target.value)} placeholder="e.g., AI for Good Challenge 2024" error={hackathonError} containerClassName="mb-0"/>
          <Input label="Short Description (Optional)" value={newHackathonDescription} onChange={(e) => setNewHackathonDescription(e.target.value)} placeholder="A brief overview of the hackathon's theme or purpose." containerClassName="mb-0"/>
          {hackathonSuccess && <Alert type="success" message={hackathonSuccess} onClose={()=>setHackathonSuccess('')}/>}
          <Button type="submit" variant="primary" leftIcon={<Icons.PlusCircle />}>Create Hackathon</Button>
        </form>
        
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Filter by Status:</label>
                <select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value as (HackathonApprovalStatus | 'all'))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="archived">Archived</option>
                </select>
            </div>
            <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Sort By:</label>
                <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
                >
                    <option value="createdAt_desc">Date Created (Newest First)</option>
                    <option value="createdAt_asc">Date Created (Oldest First)</option>
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                 </select>
            </div>
        </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-750">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Admins</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                    {filteredAndSortedHackathons.map(h => (
                        <tr key={h.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{h.data.title}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(h.data.status)}`}>
                                    {getStatusDisplayName(h.data.status, [])}
                                </span>
                                {h.data.status === 'pending_approval' && h.data.createdByAdminEmail && 
                                    <span className="text-xs italic text-neutral-500 dark:text-neutral-300 ml-1">(by {h.data.createdByAdminEmail})</span>}
                                {h.data.status === 'declined' && h.data.declineReason && 
                                    <span className="text-xs italic text-red-500 dark:text-red-300 ml-1" title={h.data.declineReason}>(Reason: {h.data.declineReason.substring(0,20)}...)</span>}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{formatDate(h.createdAt)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                                {h.data.adminEmails.length > 0 ? h.data.adminEmails.join(', ') : 'None'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-wrap gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => handleOpenManageAdminsModal(h)} leftIcon={<Icons.UserGroup />} title="Manage Admins" />
                                    {h.data.status === 'pending_approval' && (
                                        <>
                                            <Button size="sm" variant="primary" onClick={() => handleApproveHackathon(h.id, h.data.title)} leftIcon={<Icons.CheckCircle />} title="Approve" />
                                            <Button size="sm" variant="danger" onClick={() => handleOpenDeclineModal(h)} leftIcon={<Icons.XCircle />} title="Decline" />
                                        </>
                                    )}
                                    {h.data.status === 'approved' && (
                                        <Button size="sm" variant="secondary" onClick={() => handleArchiveHackathon(h.id, h.data.title)} leftIcon={<Icons.ArchiveBoxArrowDown />} title="Archive" />
                                    )}
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteHackathon(h.id, h.data.title)} leftIcon={<Icons.Trash />} title="Delete" />
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredAndSortedHackathons.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-4 dark:text-neutral-300">No hackathons match current filters.</td></tr>
                    )}
                </tbody>
            </table>
         </div>
      </Card>
      
      {selectedHackathonForAdminManagement && (
        <ManageHackathonAdminsModal
          isOpen={isManageAdminsModalOpen}
          onClose={() => setIsManageAdminsModalOpen(false)}
          hackathon={selectedHackathonForAdminManagement}
          allAdmins={adminUsers}
          onAssignAdmin={assignAdminToHackathon}
          onRemoveAdmin={removeAdminFromHackathon}
        />
      )}
      {hackathonToDecline && (
        <DeclineReasonModal 
            isOpen={isDeclineModalOpen}
            onClose={() => setIsDeclineModalOpen(false)}
            onSubmit={handleConfirmDecline}
            hackathonTitle={hackathonToDecline.data.title}
        />
      )}


      {/* Platform User Management */}
      <div className="grid md:grid-cols-2 gap-6">
          <Card title="Manage Platform Administrators">
            <form onSubmit={handleInviteAdmin} className="space-y-3 mb-4 p-3 border dark:border-neutral-600 rounded-md">
                <h4 className="font-medium text-neutral-700 dark:text-neutral-100">Add New Platform Admin</h4>
                <Input label="Admin Email" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} error={adminError} containerClassName="mb-0"/>
                {adminSuccess && <Alert type="success" message={adminSuccess} onClose={()=>setAdminSuccess('')} />}
                <Button type="submit" variant="secondary" leftIcon={<Icons.UserPlus />}>Add Admin</Button>
            </form>
            <h4 className="font-semibold text-md text-neutral-700 dark:text-neutral-100 mb-2">Existing Platform Admins:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
                {adminUsers.filter(au => au.email.toLowerCase() !== 'superadmin@example.com').length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300">No platform admins (besides SuperAdmin) added yet.</p>}
                {adminUsers.filter(au => au.email.toLowerCase() !== 'superadmin@example.com').map(admin => (
                    <div key={admin.id} className="p-2.5 bg-neutral-100 dark:bg-neutral-750 rounded-md flex justify-between items-center">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{admin.email}</p>
                         <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => handleViewAdminAssignments(admin)} leftIcon={<Icons.Eye />} className="text-xs px-1.5 py-0.5" title="View Assignments"/>
                            <Button size="sm" variant="ghost" onClick={() => handleResendAdminInvite(admin.email)} leftIcon={<Icons.PaperAirplane />} className="text-xs px-1.5 py-0.5" title="Resend Invite (Mock)"/>
                            <Button size="sm" variant="danger" onClick={() => handleRemovePlatformAdmin(admin.email)} leftIcon={<Icons.Trash />} className="text-xs px-1.5 py-0.5" title="Remove Platform Admin"/>
                        </div>
                    </div>
                ))}
            </div>
          </Card>

          <Card title="Manage Platform Judges">
            <form onSubmit={handleInviteJudge} className="space-y-3 mb-4 p-3 border dark:border-neutral-600 rounded-md">
                <h4 className="font-medium text-neutral-700 dark:text-neutral-100">Add New Platform Judge</h4>
                <Input label="Judge Email" type="email" value={newJudgeEmail} onChange={(e) => setNewJudgeEmail(e.target.value)} error={judgeError} containerClassName="mb-0"/>
                {judgeSuccess && <Alert type="success" message={judgeSuccess} onClose={()=>setJudgeSuccess('')}/>}
                <Button type="submit" variant="secondary" leftIcon={<Icons.UserPlus />}>Add Judge</Button>
            </form>
            <h4 className="font-semibold text-md text-neutral-700 dark:text-neutral-100 mb-2">Existing Platform Judges:</h4>
             <div className="max-h-60 overflow-y-auto space-y-2">
                {judges.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-300">No platform judges added yet.</p>}
                {judges.map(judge => (
                    <div key={judge.id} className="p-2.5 bg-neutral-100 dark:bg-neutral-750 rounded-md flex justify-between items-center">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{judge.email}</p>
                        <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => handleViewJudgeAssignments(judge)} leftIcon={<Icons.Eye />} className="text-xs px-1.5 py-0.5" title="View Assignments"/>
                            <Button size="sm" variant="ghost" onClick={() => handleResendJudgeInvite(judge.email)} leftIcon={<Icons.PaperAirplane />} className="text-xs px-1.5 py-0.5" title="Resend Invite (Mock)"/>
                            <Button size="sm" variant="danger" onClick={() => handleRemovePlatformJudge(judge.email)} leftIcon={<Icons.Trash />} className="text-xs px-1.5 py-0.5" title="Remove Platform Judge"/>
                        </div>
                    </div>
                ))}
            </div>
          </Card>
      </div>

      {selectedAdminForAssignments && (
        <AdminAssignmentsModal
          isOpen={isAdminAssignmentsModalOpen}
          onClose={() => { setIsAdminAssignmentsModalOpen(false); setSelectedAdminForAssignments(null);}}
          admin={selectedAdminForAssignments}
          assignments={getAdminAssignments(selectedAdminForAssignments.email)}
        />
      )}

      {selectedJudgeForAssignments && (
        <JudgeAssignmentsModal
            isOpen={isJudgeAssignmentsModalOpen}
            onClose={() => { setIsJudgeAssignmentsModalOpen(false); setSelectedJudgeForAssignments(null);}}
            judge={selectedJudgeForAssignments}
            assignments={getJudgeAssignments(selectedJudgeForAssignments.email)}
        />
      )}
      
      <Card title="View Participant Hackathon History">
        <form onSubmit={handleParticipantLookup} className="space-y-3 mb-4">
            <Input label="Participant Email" type="email" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} error={lookupError} placeholder="participant@example.com" containerClassName="mb-0"/>
            <Button type="submit" variant="secondary" leftIcon={<Icons.DocumentMagnifyingGlass />}>Lookup History</Button>
        </form>
        {participantHistory.length > 0 && (
            <div className="overflow-x-auto">
                 <h4 className="font-semibold text-neutral-700 dark:text-neutral-100 mb-2">History for: {lookupEmail}</h4>
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-750">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Hackathon</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Project Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Team (Role)</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Submitted At</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-100 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                        {participantHistory.map(entry => (
                            <tr key={entry.submissionId}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{entry.hackathonTitle}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.submissionProjectName}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{entry.teamName || 'N/A'} ({entry.roleInTeam})</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{formatDate(entry.submittedAt)}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(entry.status.toLowerCase().replace(/\s+/g, '_'))}`}> {/* Heuristic for color class from display name */}
                                        {entry.status}
                                    </span>
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

export default SuperAdminPage;