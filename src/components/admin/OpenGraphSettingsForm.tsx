import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { OpenGraphConfig } from '../../types';
import Input from '../ui/Input';
import RichTextEditor from '../ui/RichTextEditor'; // Changed import
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';
import OpenGraphPreviewCard from './OpenGraphPreviewCard'; 
import { Icons } from '../../constants';

const OpenGraphSettingsForm: React.FC = () => {
  const { getCurrentHackathon, updateCurrentOgConfig } = useAppContext();
  const currentHackathon = getCurrentHackathon();

  const [ogData, setOgData] = useState<OpenGraphConfig>({
    ogTitle: '',
    ogDescription: '', // Will store HTML
    ogImage: '',
    ogType: 'website',
    ogUrl: '',
  });

  useEffect(() => {
    if (currentHackathon?.data) {
      const ogCfg = currentHackathon.data.ogConfig;
      const hackathonData = currentHackathon.data;
      
      let baseAppUrl = window.location.href.split('#')[0];
      if (baseAppUrl.endsWith('index.html')) {
          baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
      }
      if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
        baseAppUrl = baseAppUrl.slice(0, -1);
      }
      const derivedOgUrl = currentHackathon.id ? `${baseAppUrl}#/public-events/${currentHackathon.id}` : '';

      setOgData({
        ogTitle: ogCfg?.ogTitle || hackathonData.title || '',
        ogDescription: ogCfg?.ogDescription || (hackathonData.description ? hackathonData.description.substring(0, 160) + "..." : ''),
        ogImage: ogCfg?.ogImage || hackathonData.publicPageContent?.imageUrl || '',
        ogType: ogCfg?.ogType || 'website',
        ogUrl: derivedOgUrl, // Always use the derived URL
      });
    } else {
      // Reset if no current hackathon
      setOgData({ ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website', ogUrl: '' });
    }
  }, [currentHackathon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Removed Textarea from type
    const { name, value } = e.target;
    setOgData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (html: string) => {
    setOgData(prev => ({ ...prev, ogDescription: html }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHackathon) {
      alert("No hackathon selected to update.");
      return;
    }
    // The ogData state already contains the derived ogUrl
    updateCurrentOgConfig(ogData);
    alert(`Open Graph settings for "${currentHackathon.data.title}" updated!`);
  };

  if (!currentHackathon) {
    return (
      <Card title="Open Graph & Social Sharing Settings">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard." />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <Card title={`Social Sharing / SEO for "${currentHackathon.data.title}"`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-200">
            Configure how this hackathon page appears when shared on social media platforms like X (Twitter), Facebook, LinkedIn, etc. These settings populate Open Graph (OG) meta tags.
          </p>
          <div>
            <Input
                label="OG Title (Social Share Title)"
                name="ogTitle"
                value={ogData.ogTitle}
                onChange={handleChange}
                placeholder="Compelling title for social shares"
                maxLength={70}
                helperText="Aim for 50-60 characters for best display. This is the main headline users will see."
            />
          </div>
          <div>
            <RichTextEditor
                label="OG Description (Social Share Description)"
                value={ogData.ogDescription}
                onChange={handleDescriptionChange}
                placeholder="Concise and engaging description (max ~160 chars plain text equivalent)"
                helperText="Summarize your event engagingly. Around 150-160 plain text characters is ideal. Rich text may be truncated or simplified by social platforms."
            />
          </div>
          <div>
            <Input
                label="OG Image URL (Social Share Image)"
                name="ogImage"
                type="url"
                value={ogData.ogImage}
                onChange={handleChange}
                placeholder="https://example.com/your-hackathon-image.jpg"
                helperText="Recommended 1200x630px. Ensure it's publicly accessible. If empty, will try to use the public page image."
            />
          </div>
           <div>
            <Input
                label="OG Type"
                name="ogType"
                value={ogData.ogType}
                onChange={handleChange}
                placeholder="e.g., website, article"
                helperText='Usually "website" for the main event page. Other types include "article", "event", etc.'
            />
           </div>
           <div>
            <label htmlFor="ogUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">OG URL (Canonical URL)</label>
            <div className="mt-1">
                <Input
                    id="ogUrl"
                    name="ogUrl"
                    type="url"
                    value={ogData.ogUrl} // Displays the derived URL from state
                    readOnly 
                    className="flex-grow"
                    containerClassName="mb-0 flex-grow"
                    helperText="The definitive link to this page. This is auto-populated and uses hash-based routing."
                />
            </div>
           </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">Save Social Sharing Settings</Button>
          </div>
        </form>
      </Card>
      
      <div className="lg:sticky lg:top-24 self-start">
        <OpenGraphPreviewCard ogConfig={ogData} hackathonTitle={currentHackathon.data.title} />
      </div>
    </div>
  );
};

export default OpenGraphSettingsForm;