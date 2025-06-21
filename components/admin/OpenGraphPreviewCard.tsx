import React from 'react';
import { OpenGraphConfig } from '../../types';
import Card from '../ui/Card';
import { Icons } from '../../constants';

interface OpenGraphPreviewCardProps {
  ogConfig: OpenGraphConfig;
  hackathonTitle?: string; // Optional, to use as fallback if ogTitle is empty
}

const OpenGraphPreviewCard: React.FC<OpenGraphPreviewCardProps> = ({ ogConfig, hackathonTitle }) => {
  const {
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl
  } = ogConfig;

  const displayTitle = ogTitle || hackathonTitle || "Your Hackathon Title";
  const displayDescription = ogDescription || "A brief description of your amazing hackathon event will appear here when shared.";
  
  let displayDomain = "yoursite.com"; // Default domain
  if (ogUrl) {
    try {
      const parsedUrl = new URL(ogUrl);
      displayDomain = parsedUrl.hostname.replace(/^www\./, ''); // Remove www. for cleaner display
    } catch (e) {
      // ogUrl was not a valid URL, keep the default domain or try to parse window.location
      try {
        const currentUrl = new URL(window.location.href);
        displayDomain = currentUrl.hostname.replace(/^www\./, '');
      } catch (e2) {
        // Fallback if window.location.href is also problematic (e.g. in SSR or test envs)
        console.warn("Could not parse ogUrl or window.location.href for preview domain.");
      }
    }
  }
  
  return (
    <Card title="Social Share Preview (Approximate)">
      <p className="text-sm text-neutral-600 dark:text-neutral-200 mb-4">
        This is how your hackathon page might look when shared on platforms like X, Facebook, or LinkedIn. Actual appearance may vary.
      </p>
      <div className="w-full max-w-sm mx-auto border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden shadow-lg bg-neutral-50 dark:bg-neutral-700">
        <div className="w-full h-48 bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center overflow-hidden">
            {ogImage ? (
            <img 
                src={ogImage} 
                alt="Open Graph Preview" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentNode as HTMLElement;
                    if (parent) {
                        const placeholder = parent.querySelector('.image-placeholder');
                        if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                    }
                }}
            />
            ) : null}
            {/* Placeholder is always in DOM, controlled by CSS or img error handler */}
            <div className={`image-placeholder w-full h-full items-center justify-center text-neutral-400 dark:text-neutral-500 ${ogImage ? 'hidden' : 'flex'}`}>
                <Icons.GlobeAlt /> 
                <span className="ml-2 text-xs">No Image (1200x630px rec.)</span>
            </div>
        </div>
        <div className="p-3">
          <p className="text-xs uppercase text-neutral-500 dark:text-neutral-400 mb-0.5 break-all truncate" title={displayDomain}>{displayDomain}</p>
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1 truncate leading-tight" title={displayTitle}>
            {displayTitle}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-snug" title={displayDescription}>
            {displayDescription}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default OpenGraphPreviewCard;
