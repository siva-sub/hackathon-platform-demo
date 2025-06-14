
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { ProjectSubmission, SubmissionAnswer } from '../../types';
import { submitProject } from '../../services/hackathonService';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

interface FormData {
  participantName: string;
  participantEmail: string; 
  teamName?: string;
  projectName: string;
  problemStatementId?: string;
  projectRepoUrl: string;
  projectDemoUrl?: string;
  answers: SubmissionAnswer[];
}

const ProjectSubmissionForm: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  const { activeHackathon, refreshData, currentUserRole, currentUserEmail, allHackathons, setActiveHackathonId } = context;

  const [formData, setFormData] = useState<FormData>({
    participantName: '',
    participantEmail: currentUserEmail || '', 
    teamName: '',
    projectName: '',
    problemStatementId: '',
    projectRepoUrl: '',
    projectDemoUrl: '',
    answers: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeHackathon) {
      setFormData(prev => ({
        ...prev,
        participantEmail: currentUserEmail || '', 
        answers: activeHackathon.submissionQuestions.map(q => ({ questionId: q.id, answer: '' })),
        problemStatementId: activeHackathon.problemStatements && activeHackathon.problemStatements.length > 0 ? activeHackathon.problemStatements[0].id : ''
      }));
    } else {
        // Clear form if no active hackathon
         setFormData({
            participantName: '', participantEmail: currentUserEmail || '', teamName: '',
            projectName: '', problemStatementId: '', projectRepoUrl: '', projectDemoUrl: '', answers: []
        });
    }
  }, [activeHackathon, currentUserEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map(ans => ans.questionId === questionId ? { ...ans, answer } : ans)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHackathon) {
      setError("No active hackathon selected for submission.");
      return;
    }
    if (!activeHackathon.acceptingSubmissions) {
      setError("Submissions are currently closed for this hackathon.");
      return;
    }
    if (!currentUserEmail) {
      setError("Participant email not found. Please re-select your persona.");
      return;
    }

    if (!formData.projectName.trim() || !formData.participantName.trim() || !formData.projectRepoUrl.trim()) {
      setError("Project Name, Your Name, and Repository URL are required.");
      return;
    }
    if (activeHackathon.problemStatements && activeHackathon.problemStatements.length > 0 && !formData.problemStatementId) {
        setError("Please select a Problem Statement.");
        return;
    }
     for (const q of activeHackathon.submissionQuestions) {
      if (q.isRequired) {
        const answerObj = formData.answers.find(a => a.questionId === q.id);
        if (!answerObj || !answerObj.answer.trim()) {
          setError(`Answer for "${q.questionText}" is required.`);
          return;
        }
      }
    }

    setError(null);
    setIsLoading(true);

    const submissionData: Omit<ProjectSubmission, 'id' | 'submittedAt' | 'status' | 'judgements' | 'hackathonId'> = {
      participantInfo: {
        name: formData.participantName,
        email: currentUserEmail, 
        teamName: formData.teamName,
      },
      projectName: formData.projectName,
      problemStatementId: formData.problemStatementId,
      projectRepoUrl: formData.projectRepoUrl,
      projectDemoUrl: formData.projectDemoUrl || '',
      answers: formData.answers,
    };

    try {
      submitProject(activeHackathon.id, submissionData);
      await refreshData(); 
      alert('Project submitted successfully!');
      navigate('/participant/my-submissions');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during submission.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUserRole !== 'participant') {
    return <Card title="Access Denied"><p>Only participants can submit projects.</p><Button onClick={() => navigate('/')}>Go to Role Selection</Button></Card>;
  }

  if (!activeHackathon) {
     if (allHackathons.length > 0) {
        return (
            <Card title="Submit Project">
                <p>Please select an active hackathon from the public page to submit a project.</p>
                <Button onClick={() => { setActiveHackathonId(null); navigate('/hackathon-details');}} className="mt-4">
                    View Available Hackathons
                </Button>
            </Card>
        );
    }
    return <Card title="Submit Project"><p>No hackathons are currently active or available for submission.</p></Card>;
  }


  if (!activeHackathon.acceptingSubmissions) {
    return (
        <Card title="Submissions Closed" actions={<Button onClick={() => navigate('/participant')}>Back to Dashboard</Button>}>
            <p className="text-yellow-600 dark:text-yellow-400">Submissions are currently closed for "{activeHackathon.title}".</p>
        </Card>
    );
  }
  
  const problemStatementOptions = activeHackathon.problemStatements.map(ps => ({ value: ps.id, label: ps.title }));

  return (
    <Card title={`Submit Project for: ${activeHackathon.title}`} actions={<Button onClick={() => navigate('/participant')}>Back to Dashboard</Button>}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded-md">{error}</p>}

        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Your Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                <Input name="participantName" label="Full Name*" value={formData.participantName} onChange={handleChange} required />
                <Input name="participantEmail" label="Email Address*" type="email" value={formData.participantEmail} onChange={handleChange} required disabled/>
                <Input name="teamName" label="Team Name (Optional)" value={formData.teamName || ''} onChange={handleChange} />
            </div>
        </fieldset>

        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Project Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                <Input name="projectName" label="Project Name*" value={formData.projectName} onChange={handleChange} required />
                {problemStatementOptions.length > 0 && (
                    <Select
                        name="problemStatementId"
                        label="Problem Statement*"
                        options={problemStatementOptions}
                        value={formData.problemStatementId || ''}
                        onChange={handleChange}
                        required
                        placeholder="Select a problem statement"
                    />
                )}
                <Input name="projectRepoUrl" label="Repository URL (e.g., GitHub, GitLab)*" type="url" value={formData.projectRepoUrl} onChange={handleChange} required placeholder="https://github.com/user/project" containerClassName={problemStatementOptions.length > 0 ? "md:col-span-2" : ""}/>
                <Input name="projectDemoUrl" label="Demo URL (e.g., YouTube, Vercel) (Optional)" type="url" value={formData.projectDemoUrl || ''} onChange={handleChange} placeholder="https://your-demo-link.com" containerClassName={problemStatementOptions.length > 0 ? "md:col-span-2" : ""}/>
            </div>
        </fieldset>
        
        <fieldset className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700 dark:text-gray-300">Project Questions</legend>
             {activeHackathon.submissionQuestions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No specific questions for this hackathon submission.</p>
            ) : (
                <div className="space-y-4 mt-2">
                    {activeHackathon.submissionQuestions.map(q => {
                    const answerObj = formData.answers.find(ans => ans.questionId === q.id);
                    const value = answerObj ? answerObj.answer : '';
                    const commonProps = {
                        key: q.id,
                        id: q.id,
                        label: `${q.questionText}${q.isRequired ? '*' : ' (Optional)'}`,
                        value: value,
                        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleAnswerChange(q.id, e.target.value),
                        required: q.isRequired,
                        placeholder: q.type === 'url' ? 'https://example.com' : 'Your answer here...'
                    };
                    if (q.type === 'textarea') return <Textarea {...commonProps} rows={5} />;
                    if (q.type === 'url') return <Input {...commonProps} type="url" />;
                    return <Input {...commonProps} type="text" />;
                    })}
                </div>
            )}
        </fieldset>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isLoading} size="lg" disabled={!activeHackathon.acceptingSubmissions}>
            Submit Project
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProjectSubmissionForm;
