import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Icons } from '../constants';
import { Hackathon } from '../types';

const PublicHackathonCard: React.FC<{ hackathon: Hackathon }> = ({ hackathon }) => {
    const navigate = useNavigate();
    const picsumUrl = `https://picsum.photos/400/200.png?random=${hackathon.id}`;
    const placeholdCoUrl = `https://placehold.co/400x200/ffcc00/000000?text=${encodeURIComponent(hackathon.data.title)}`;
    
    const [currentImageSrc, setCurrentImageSrc] = useState(hackathon.data.publicPageContent.imageUrl || picsumUrl);

    useEffect(() => {
        setCurrentImageSrc(hackathon.data.publicPageContent.imageUrl || picsumUrl);
    }, [hackathon.id, hackathon.data.publicPageContent.imageUrl, picsumUrl]);

    const handleError = () => {
        if (currentImageSrc === hackathon.data.publicPageContent.imageUrl) {
            setCurrentImageSrc(picsumUrl);
        } else if (currentImageSrc === picsumUrl) {
            setCurrentImageSrc(placeholdCoUrl);
        }
    };

    return (
        <Card 
            key={hackathon.id} 
            title={hackathon.data.title} 
            className="flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
        >
          <div>
            <img 
                src={currentImageSrc} 
                alt={hackathon.data.title} 
                className="w-full h-48 object-cover rounded-t-md mb-4"
                onError={handleError}
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-200 mb-3 line-clamp-3 px-1">{hackathon.data.description}</p>
            <div className="px-1 text-xs text-neutral-500 dark:text-neutral-300 mb-1">
                Status: {hackathon.data.isAcceptingSubmissions ? 
                    <span className="text-green-600 dark:text-green-400 font-semibold">Accepting Submissions</span> : 
                    <span className="text-red-600 dark:text-red-400 font-semibold">Submissions Closed</span>}
            </div>
            <div className="px-1 text-xs text-neutral-500 dark:text-neutral-300">
                Current Stage: {hackathon.data.stages.find(s => s.id === hackathon.data.currentStageId)?.name || "Not Yet Active / Concluded"}
            </div>
          </div>
          <Button 
            variant="primary" 
            size="md" 
            className="mt-auto w-full" 
            onClick={() => navigate(`/public-events/${hackathon.id}`)}
            leftIcon={<Icons.Eye />}
          >
            View Details
          </Button>
        </Card>
    );
};


const PublicHackathonListPage: React.FC = () => {
  const { hackathons } = useAppContext();
  const approvedHackathons = hackathons.filter(h => h.data.status === 'approved');

  if (approvedHackathons.length === 0) {
    return (
        <Card title="Public Hackathon Events">
            <div className="text-center py-12">
                <Icons.ClipboardDocumentList />
                <h2 className="mt-4 text-2xl font-semibold text-neutral-700 dark:text-neutral-100">No Hackathons Available</h2>
                <p className="mt-2 text-neutral-500 dark:text-neutral-300">There are currently no public hackathon events listed. Please check back soon!</p>
            </div>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card title="Public Hackathon Events" className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900">
        <p className="text-lg text-neutral-700 dark:text-neutral-200 mb-6">
          Explore our ongoing and upcoming hackathons! Click on an event to learn more about its theme, problem statements, timeline, and how to participate.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedHackathons.map((hackathon) => (
            <PublicHackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PublicHackathonListPage;