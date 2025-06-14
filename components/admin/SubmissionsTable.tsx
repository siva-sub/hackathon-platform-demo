
import React, { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, SubmissionStatus, ALL_SUBMISSION_STATUSES } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import Select from '../common/Select'; 
import LoadingSpinner from '../common/LoadingSpinner';

const SubmissionsTable: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { submissions, activeHackathon, isLoading: appContextIsLoading } = context; // Use activeHackathon

  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | ''>('');

  const filteredSubmissions = useMemo(() => {
    // Submissions in context are already for the activeHackathon
    if (!filterStatus) return submissions;
    return submissions.filter(sub => sub.status === filterStatus);
  }, [submissions, filterStatus]);

  if (appContextIsLoading && !activeHackathon) { // Check if activeHackathon is also loaded
    return <Card title="Submissions Overview"><LoadingSpinner message="Loading submissions..." /></Card>;
  }
  
  if (!activeHackathon) {
     return (
        <Card title="Submissions Overview" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
            <p className="text-center text-gray-600 dark:text-gray-300">
                No active hackathon selected. Please select one from the dashboard.
            </p>
        </Card>
    );
  }

  const statusColors: Record<SubmissionStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
    round1_judging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    round2_judging: 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-200',
    round3_judging: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-200',
    round4_judging: 'bg-lime-100 text-lime-800 dark:bg-lime-700 dark:text-lime-200',
    round5_judging: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200',
    disqualified: 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-200',
    selected_for_next_round: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200',
    finalist: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-200',
    runner_up: 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-200',
    second_runner_up: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700 dark:text-cyan-200',
    winner: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
  };
  
  const statusOptions = [{ value: '', label: 'All Statuses' }, ...ALL_SUBMISSION_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))];

  const getProblemStatementTitle = (psId?: string) => {
    if (!psId || !activeHackathon?.problemStatements) return 'N/A';
    return activeHackathon.problemStatements.find(ps => ps.id === psId)?.title || 'Unknown';
  };

  return (
    <Card title={`Submissions for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <div className="mb-4">
        <Select
            label="Filter by Status:"
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SubmissionStatus | '')}
            containerClassName="max-w-xs"
        />
      </div>
      {appContextIsLoading ? <LoadingSpinner message="Refreshing submissions..."/> : 
      (filteredSubmissions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
          {filterStatus ? `No submissions with status "${filterStatus}".` : "No submissions found for this hackathon."}
        </p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Project Name</th>
                <th scope="col" className="py-3 px-6">Problem Statement</th>
                <th scope="col" className="py-3 px-6">Participant Name</th>
                <th scope="col" className="py-3 px-6">Email</th>
                <th scope="col" className="py-3 px-6">Submitted At</th>
                <th scope="col" className="py-3 px-6">Status</th>
                <th scope="col" className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sub.projectName}</td>
                  <td className="py-4 px-6">{getProblemStatementTitle(sub.problemStatementId)}</td>
                  <td className="py-4 px-6">{sub.participantInfo.name}</td>
                  <td className="py-4 px-6">{sub.participantInfo.email}</td>
                  <td className="py-4 px-6">{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[sub.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                      {sub.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Link to={`/admin/submissions/${sub.id}`} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </Card>
  );
};

export default SubmissionsTable;
