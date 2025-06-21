import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Icons } from '../../constants';
import Alert from '../ui/Alert';

// This component is intended for when a participant is logged in and views
// the hackathon they are primarily interacting with (e.g. the one selected by admin).
// For a fully public, non-logged-in view, see PublicHackathonDetailPage.tsx

const HackathonPublicPage: React.FC = () => {
  const { getCurrentHackathon } = useAppContext();
  const currentHackathon = getCurrentHackathon();
  const [effectiveBgUrl, setEffectiveBgUrl] = useState('');

  useEffect(() => {
    if (currentHackathon) {
        const { id } = currentHackathon; // Correctly get id from currentHackathon
        const { publicPageContent, title } = currentHackathon.data; // Get data properties
        const customUrl = publicPageContent.imageUrl;
        const picsumUrl = `https://picsum.photos/1200/400.png?random=${id}`; // Use the correct id
        const placeholdCoUrl = `https://placehold.co/1200x400/ffcc00/000000?text=${encodeURIComponent(publicPageContent.heroTitle || title)}`;

        let initialAttemptUrl = customUrl || picsumUrl;
        const imgTester = new Image();

        imgTester.onload = () => {
            setEffectiveBgUrl(initialAttemptUrl);
        };
        imgTester.onerror = () => {
            if (initialAttemptUrl === customUrl && customUrl) {
                initialAttemptUrl = picsumUrl;
                imgTester.src = initialAttemptUrl;
            } else if (initialAttemptUrl === picsumUrl) {
                initialAttemptUrl = placeholdCoUrl;
                imgTester.src = initialAttemptUrl;
            } else {
                setEffectiveBgUrl(''); // Fallback if all fail
            }
        };
        imgTester.src = initialAttemptUrl;

        return () => {
            imgTester.onload = null;
            imgTester.onerror = null;
        };
    }
  }, [currentHackathon]);

  if (!currentHackathon) {
    return (
        <Card title="Hackathon Event">
            <Alert type="info" message="No hackathon is currently active or selected. Please check back later or an Admin can select one." />
        </Card>
    );
  }

  const { title, description, rules, timeline, publicPageContent, problemStatements, isAcceptingSubmissions, stages, currentStageId } = currentHackathon.data;
  const activeStage = stages.find(s => s.id === currentStageId);
  
  const headerStyle = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))${effectiveBgUrl ? `, url(${effectiveBgUrl})` : ''}`,
    backgroundColor: !effectiveBgUrl ? '#333' : undefined,
  };

  return (
    <div className="space-y-8">
      <header 
        className="bg-cover bg-center rounded-xl shadow-2xl py-16 px-4 sm:py-20 sm:px-6 md:py-24 md:px-8 text-center text-white relative overflow-hidden" 
        style={headerStyle}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">{publicPageContent.heroTitle || title}</h1>
        <p className="text-md sm:text-lg md:text-xl mb-6 drop-shadow-md">{publicPageContent.heroSubtitle || description}</p>
        {activeStage && (
            <p className="text-sm sm:text-md md:text-lg font-semibold bg-primary-500 bg-opacity-80 p-2 rounded-md inline-block mb-4">
                Current Stage: {activeStage.name}
            </p>
        )}
        {isAcceptingSubmissions ? (
          <Button size="lg" variant="primary" className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700">
            <Link to="/participant/submit">Submit Your Project Now!</Link>
          </Button>
        ) : (
          <p className="text-md sm:text-lg bg-red-500 bg-opacity-75 p-3 rounded-md inline-block">Submissions are currently closed.</p>
        )}
      </header>

      <Card title="About This Hackathon">
        <div className="prose dark:prose-invert max-w-none">
          <p className="dark:text-neutral-200">{publicPageContent.aboutSection || "Detailed information about the hackathon will be available here."}</p>
        </div>
      </Card>

      {problemStatements && problemStatements.length > 0 && (
        <Card title="Problem Statements" className="bg-neutral-50 dark:bg-neutral-850">
          <p className="mb-4 text-neutral-600 dark:text-neutral-200">Choose one or more problem statements to tackle:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemStatements.map(ps => (
              <Card key={ps.id} title={ps.title} className="bg-white dark:bg-neutral-800 shadow-md hover:shadow-lg transition-shadow">
                <p className="text-neutral-700 dark:text-neutral-200 whitespace-pre-line">{ps.description}</p>
              </Card>
            ))}
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Timeline" className="bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 dark:text-neutral-100">{timeline}</pre>
          </div>
        </Card>
        <Card title="Rules & Guidelines" className="bg-secondary-50 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700">
          <div className="prose prose-sm dark:prose-invert max-w-none">
             <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 dark:text-neutral-100">{rules}</pre>
          </div>
        </Card>
      </div>

      <Card title="Ready to Participate?">
        {isAcceptingSubmissions ? (
          <div className="text-center">
            <p className="mb-4 dark:text-neutral-200">Select a problem statement and head to the submission page!</p>
            <Button size="lg" variant="primary" className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700">
              <Link to="/participant/submit" className="flex items-center">
                <Icons.PaperAirplane /> <span className="ml-2">Go to Submission Form</span>
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-center text-lg dark:text-neutral-200">Submissions are closed. Thank you for your interest!</p>
        )}
      </Card>
    </div>
  );
};

export default HackathonPublicPage;