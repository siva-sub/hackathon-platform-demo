
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Icons } from '../constants';
import Alert from '../components/ui/Alert';
import NotFoundPage from './NotFoundPage'; 
import { EventSchema } from '../types';

const setSchemaOrgMarkup = (schemaData: EventSchema | undefined) => {
  const SCRIPT_ID = 'event-schema-markup';
  let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (schemaData) {
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = SCRIPT_ID;
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  } else {
    if (scriptTag) {
      scriptTag.remove();
    }
  }
};


const PublicHackathonDetailPage: React.FC = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const { getHackathonById, currentUser } = useAppContext();
  const navigate = useNavigate();
  
  const hackathon = getHackathonById(hackathonId ?? null);
  const [effectiveBgUrl, setEffectiveBgUrl] = useState('');

  useEffect(() => {
    if (hackathon?.data.status === 'approved') {
      // OG Tags
      if (hackathon.data.ogConfig) {
        const { ogTitle, ogDescription, ogImage, ogType, ogUrl } = hackathon.data.ogConfig;
        
        const effectiveOgTitle = ogTitle || hackathon.data.title;
        const effectiveOgDescription = ogDescription || hackathon.data.description.substring(0, 160) + "...";
        const effectiveOgUrl = ogUrl || window.location.href; 
        const effectiveOgType = ogType || 'website';

        const setMetaTag = (property: string, content: string | undefined) => {
          if (!content) return; 
          let element = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement | null;
          if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
          }
          element.setAttribute('content', content);
        };
        
        setMetaTag('og:title', effectiveOgTitle);
        setMetaTag('og:description', effectiveOgDescription);
        if (ogImage) setMetaTag('og:image', ogImage);
        setMetaTag('og:type', effectiveOgType);
        setMetaTag('og:url', effectiveOgUrl);

        setMetaTag('twitter:card', 'summary_large_image'); 
        setMetaTag('twitter:title', effectiveOgTitle);
        setMetaTag('twitter:description', effectiveOgDescription);
        if (ogImage) setMetaTag('twitter:image', ogImage);
      }

      // Schema.org Markup
      setSchemaOrgMarkup(hackathon.data.schemaConfig);


      // Background Image
      const customUrl = hackathon.data.publicPageContent.imageUrl;
      const picsumUrl = `https://picsum.photos/1200/400.png?random=${hackathon.id}`;
      const placeholdCoUrl = `https://placehold.co/1200x400/ffcc00/000000?text=${encodeURIComponent(hackathon.data.publicPageContent.heroTitle || hackathon.data.title)}`;

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
              setEffectiveBgUrl(''); 
          }
      };
      imgTester.src = initialAttemptUrl;

      return () => {
          imgTester.onload = null;
          imgTester.onerror = null;
          // Clean up schema script tag when component unmounts
          const scriptTag = document.getElementById('event-schema-markup');
          if (scriptTag) scriptTag.remove();
      };
    } else {
        // If hackathon is not approved or not found, remove schema tag as well
        const scriptTag = document.getElementById('event-schema-markup');
        if (scriptTag) scriptTag.remove();
    }
  }, [hackathon]);


  if (!hackathon || hackathon.data.status !== 'approved') {
    return <NotFoundPage />; 
  }

  const { title, description, rules, timeline, publicPageContent, problemStatements, isAcceptingSubmissions, stages, currentStageId, questions } = hackathon.data;
  const activeStage = stages.find(s => s.id === currentStageId);

  const handleSubmitToThisHackathon = () => {
    navigate('/participant/submit', { state: { hackathonId: hackathon.id } });
  };
  
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
        <div className="flex flex-wrap justify-center items-center gap-3">
            {isAcceptingSubmissions ? (
            currentUser?.role === 'participant' ? (
                <Button 
                size="lg" 
                variant="primary" 
                className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700"
                onClick={handleSubmitToThisHackathon}
                leftIcon={<Icons.PaperAirplane />}
                >
                Submit to this Hackathon
                </Button>
            ) : (
                <Button size="lg" variant="primary" className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700">
                    <Link to="/participant">Join or Log In to Submit!</Link> 
                </Button>
            )
            ) : (
            <p className="text-md sm:text-lg bg-red-600 bg-opacity-80 p-3 rounded-md inline-block">Submissions are currently closed.</p>
            )}
             <Button 
                size="lg" 
                variant="ghost" 
                className="text-white border-white hover:bg-white hover:text-primary-700 dark:border-neutral-300 dark:hover:bg-neutral-200 dark:hover:text-primary-700"
                onClick={() => navigate(`/public-events/${hackathon.id}/qanda`)}
                leftIcon={<Icons.LightBulb />}
            >
                View Q&amp;A ({questions?.length || 0})
            </Button>
        </div>
      </header>

      <Card title="About This Hackathon">
        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-100">
          <p>{publicPageContent.aboutSection || "Detailed information about the hackathon, its goals, and what makes it unique will be presented here. AI can help craft compelling narratives to attract the right talent and clearly communicate the event's value proposition."}</p>
        </div>
      </Card>

      {problemStatements && problemStatements.length > 0 && (
        <Card title="Problem Statements" className="bg-neutral-50 dark:bg-neutral-850">
          <p className="mb-4 text-neutral-600 dark:text-neutral-200">Participants can choose one or more of the following challenges to address:</p>
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
        <Card title="Hackathon Timeline" className="bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 dark:text-neutral-100">{timeline || "Detailed timeline will be announced soon. AI can help plan optimal durations for each phase."}</pre>
          </div>
           {stages.length > 0 && (
            <div className="mt-4">
                <h4 className="font-semibold text-neutral-700 dark:text-neutral-100">Event Stages:</h4>
                <ol className="list-decimal list-inside text-sm text-neutral-600 dark:text-neutral-200 space-y-1 mt-1">
                    {stages.sort((a,b) => a.order - b.order).map(s => (
                        <li key={s.id} className={s.id === currentStageId ? 'font-bold text-primary-600 dark:text-primary-400' : ''}>
                            {s.name} {s.id === currentStageId && <span className="text-xs bg-primary-100 dark:bg-primary-700 p-1 rounded">(Active Stage)</span>}
                        </li>
                    ))}
                </ol>
            </div>
           )}
        </Card>
        <Card title="Rules & Guidelines" className="bg-secondary-50 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700">
          <div className="prose prose-sm dark:prose-invert max-w-none">
             <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 dark:text-neutral-100">{rules || "Official rules and guidelines will be posted here. AI can help generate fair and comprehensive rules."}</pre>
          </div>
        </Card>
      </div>

      <Card title="Interested in Participating?">
        {isAcceptingSubmissions ? (
          <div className="text-center">
             {currentUser?.role === 'participant' ? (
                <Button 
                    size="lg" 
                    variant="primary" 
                    className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700"
                    onClick={handleSubmitToThisHackathon}
                    leftIcon={<Icons.PaperAirplane />}
                >
                    Submit to this Hackathon
                </Button>
             ) : (
                <Button size="lg" variant="primary" className="bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700">
                    <Link to="/participant" className="flex items-center">
                        <Icons.UserPlus /> <span className="ml-2">Register / Log In to Submit</span>
                    </Link>
                </Button>
             )}
          </div>
        ) : (
          <p className="text-center text-lg dark:text-neutral-200">Submissions are currently closed for this event. Check the timeline for future phases or explore other hackathons!</p>
        )}
      </Card>
    </div>
  );
};

export default PublicHackathonDetailPage;
