
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { SubmissionStatus, ProjectSubmission, HackathonEvent, UserRole } from '../../types';

const PublicHackathonPage: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  // activeHackathon is the one selected for viewing.
  // allHackathons is for the selector UI if no active one is set.
  const { activeHackathon, submissions, isLoading, currentUserRole, allHackathons, setActiveHackathonId } = context;

  const showcasedStatuses: SubmissionStatus[] = ['winner', 'runner_up', 'second_runner_up', 'finalist'];

  const showcasedSubmissions = useMemo(() => {
    if (!submissions || !activeHackathon) return []; // submissions are already filtered for activeHackathon
    return submissions 
      .filter(sub => showcasedStatuses.includes(sub.status))
      .sort((a, b) => { 
        return showcasedStatuses.indexOf(a.status) - showcasedStatuses.indexOf(b.status);
      });
  }, [submissions, activeHackathon]);

  const getCurrentHackathonStage = (
    event: HackathonEvent | null,
    winningProjects: ProjectSubmission[] // Pass submissions that are already filtered for winner/finalist for THIS event
  ): string => {
    if (!event) return "Details Unavailable";

    const now = new Date();
    const endDate = new Date(event.timeline.endDate);

    if (winningProjects.some(s => s.status === 'winner')) {
      return "Winners Announced!";
    }
     if (event.currentJudgingRound === -1) { // Explicitly completed
      return "Hackathon Concluded - Results Pending or Finalized";
    }
    if (event.acceptingSubmissions) {
      return "Accepting Submissions";
    }
    if (event.currentJudgingRound > 0) {
      return `Judging Round ${event.currentJudgingRound} in Progress`;
    }
    if (!event.acceptingSubmissions && event.currentJudgingRound === 0) {
        if (now > endDate) return "Hackathon Concluded"; // General concluded if past end date
        return "Submissions Closed - Judging Begins Soon";
    }
    if (now > endDate) {
        return "Hackathon Concluded";
    }
    return "Upcoming"; 
  };
  
  const statusDisplayNames: Record<SubmissionStatus, string> = {
    submitted: 'Submitted',
    round1_judging: 'Round 1 Judging',
    round2_judging: 'Round 2 Judging',
    round3_judging: 'Round 3 Judging',
    round4_judging: 'Round 4 Judging',
    round5_judging: 'Round 5 Judging',
    rejected: 'Rejected',
    disqualified: 'Disqualified',
    selected_for_next_round: 'Selected for Next Round',
    finalist: 'Finalist',
    runner_up: 'Runner Up',
    second_runner_up: 'Second Runner Up',
    winner: 'Winner',
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // If no activeHackathon is selected, show the selector view
  if (!activeHackathon) {
    if (isLoading && allHackathons.length === 0) { // Still initially loading all hackathons
        return <LoadingSpinner message="Loading available hackathons..." />;
    }
    return (
      <div className="space-y-8">
        <Card title="Explore Our Hackathons">
          {allHackathons.length === 0 ? (
            <p>No hackathons available to display currently.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHackathons.map(event => (
                <Card key={event.id} className="hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Status: {getCurrentHackathonStage(event, getSubmissionsByHackathonId(event.id, 'winner'))} 
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                  <Button onClick={() => setActiveHackathonId(event.id)} variant="primary" className="w-full">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Display details for the activeHackathon
  const { title, description, rules, timeline, landingPageContent, acceptingSubmissions, problemStatements, prizes } = activeHackathon;
  const currentStage = getCurrentHackathonStage(activeHackathon, showcasedSubmissions);


  return (
    <div className="space-y-8">
      <Card className="!p-0 overflow-hidden"> 
        <div className="relative">
          <img 
            src={landingPageContent.heroImage || 'https://picsum.photos/1200/400?grayscale'} 
            alt={`${title} Hero Image`} 
            className="w-full h-64 md:h-96 object-cover" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">{title}</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl drop-shadow-md">{description}</p>
            <div className="mt-6 px-4 py-2 bg-primary-600 text-white text-lg font-semibold rounded-lg shadow-md">
                Current Stage: {currentStage}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="About This Hackathon">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{landingPageContent.aboutText}</p>
          </Card>

          {prizes && prizes.length > 0 && (
            <Card title="🏆 Prizes">
              <ul className="space-y-3">
                {prizes.map((prize, index) => (
                  <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">{prize.split(':')[0]}:</span> {prize.split(':').slice(1).join(':').trim()}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {problemStatements && problemStatements.length > 0 && (
            <Card title="🎯 Problem Statements">
              <ul className="space-y-4">
                {problemStatements.map(ps => (
                  <li key={ps.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                    <h4 className="text-lg font-semibold text-primary-700 dark:text-primary-300">{ps.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{ps.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="📜 Rules & Guidelines">
            <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{rules}</pre>
          </Card>
        </div>

        <div className="space-y-8 lg:sticky lg:top-24 self-start"> 
          <Card title="🗓️ Event Timeline">
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Starts:</strong> {new Date(timeline.startDate).toLocaleDateString()}</li>
              <li><strong>Ends:</strong> {new Date(timeline.endDate).toLocaleDateString()}</li>
              <li><strong>Submission Deadline:</strong> {new Date(timeline.submissionDeadline).toLocaleString()}</li>
            </ul>
          </Card>
          
          {currentUserRole === UserRole.Participant && acceptingSubmissions && (
            <Card title="Ready to Innovate?">
                 <p className="text-gray-700 dark:text-gray-300 mb-4">Submissions are now open! Click below to submit your project.</p>
                <Link to="/participant/submit-project">
                    <Button variant="primary" size="lg" className="w-full">
                        Submit Your Project
                    </Button>
                </Link>
            </Card>
          )}
           {currentUserRole === UserRole.Participant && !acceptingSubmissions && (
            <Card title="Submissions Closed">
                 <p className="text-yellow-700 dark:text-yellow-300">Submissions are currently closed for this hackathon.</p>
            </Card>
          )}
           <Button 
            onClick={() => {
                if (currentUserRole === UserRole.Public || !currentUserRole) {
                    setActiveHackathonId(null); // Go back to selector
                } else {
                    navigate(`/${currentUserRole}`); // Go to role dashboard
                }
            }} 
            variant="secondary" 
            className="w-full mt-4">
                {currentUserRole && currentUserRole !== UserRole.Public ? 'Back to My Dashboard' : 'View All Hackathons'}
            </Button>
        </div>
      </div>

      {showcasedSubmissions.length > 0 && (
        <Card title="🏅 Winners & Showcase" className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcasedSubmissions.map(sub => {
              const embedUrl = getYoutubeEmbedUrl(sub.projectDemoUrl);
              return (
                <Card key={sub.id} className="flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden transition-all hover:shadow-2xl">
                  {embedUrl ? (
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe 
                        src={embedUrl}
                        title={`${sub.projectName} Demo`}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full object-cover"
                      ></iframe>
                    </div>
                  ) : (
                     sub.projectDemoUrl && <img src={`https://picsum.photos/seed/${sub.id}/400/225`} alt="Project placeholder" className="w-full h-48 object-cover"/>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-1">{sub.projectName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">By: {sub.participantInfo.name} {sub.participantInfo.teamName ? `(${sub.participantInfo.teamName})` : ''}</p>
                    <p className="text-md font-bold text-secondary-600 dark:text-secondary-400 mb-3">{statusDisplayNames[sub.status] || sub.status}</p>
                    
                    <div className="mt-auto space-y-2"> 
                      {sub.projectDemoUrl ? (
                        <a href={sub.projectDemoUrl} target="_blank" rel="noopener noreferrer" className="block">
                          <Button variant="secondary" className="w-full">
                            {embedUrl ? "Watch Demo on YouTube" : "View Project Demo"}
                          </Button>
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">No demo link provided.</p>
                      )}
                      {sub.projectRepoUrl && 
                        <a href={sub.projectRepoUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="ghost" className="w-full">
                            View Repository
                        </Button>
                        </a>
                      }
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper function (if not already in a shared utility)
// This is a simplified version; in a real app, this might be fetched or live
const getSubmissionsByHackathonId = (hackathonId: string, statusFilter?: SubmissionStatus): ProjectSubmission[] => {
    const submissionsMapData = localStorage.getItem('projectSubmissionsMap');
    if (!submissionsMapData) return [];
    const submissionsMap = new Map<string, ProjectSubmission[]>(JSON.parse(submissionsMapData));
    const allSubs = submissionsMap.get(hackathonId) || [];
    if(statusFilter){
        return allSubs.filter(s => s.status === statusFilter);
    }
    return allSubs;
};


export default PublicHackathonPage;
