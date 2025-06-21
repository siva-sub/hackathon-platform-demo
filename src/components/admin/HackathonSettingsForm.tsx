import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { HackathonData } from '../../types'; 
import Input from '../ui/Input';
import RichTextEditor from '../ui/RichTextEditor'; // Changed import
import Button from '../ui/Button';
import Card from '../ui/Card';
import Alert from '../ui/Alert';

const HackathonSettingsForm: React.FC = () => {
  const { getCurrentHackathon, updateCurrentHackathonData, updateCurrentPublicPageContent, setCurrentStageForCurrentHackathon } = useAppContext();
  
  const currentHackathon = getCurrentHackathon();

  const [formData, setFormData] = useState<Pick<HackathonData, 'title' | 'description' | 'rules' | 'timeline' | 'isAcceptingSubmissions' | 'currentStageId'>>({
    title: '', description: '', rules: '', timeline: '', isAcceptingSubmissions: false, currentStageId: null
  });
  const [publicPageData, setPublicPageData] = useState<HackathonData['publicPageContent']>({
    heroTitle: '', heroSubtitle: '', aboutSection: '', imageUrl: ''
  });

  useEffect(() => {
    if (currentHackathon) {
      setFormData({
          title: currentHackathon.data.title,
          description: currentHackathon.data.description,
          rules: currentHackathon.data.rules,
          timeline: currentHackathon.data.timeline,
          isAcceptingSubmissions: currentHackathon.data.isAcceptingSubmissions,
          currentStageId: currentHackathon.data.currentStageId,
      });
      setPublicPageData(currentHackathon.data.publicPageContent);
    }
  }, [currentHackathon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
  
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: target.value }));
    }
  };
  
  const handleRichTextChange = (name: 'description' | 'rules' | 'timeline', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublicPageRichTextChange = (name: 'aboutSection', value: string) => {
    setPublicPageData(prev => ({ ...prev, [name]: value }));
  };

  const handlePublicPageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPublicPageData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHackathon) {
        alert("No hackathon selected to update.");
        return;
    }
    updateCurrentHackathonData({
        title: formData.title,
        description: formData.description,
        rules: formData.rules,
        timeline: formData.timeline,
        isAcceptingSubmissions: formData.isAcceptingSubmissions,
        currentStageId: formData.currentStageId,
    });
    updateCurrentPublicPageContent(publicPageData);
    if(formData.currentStageId){ 
        setCurrentStageForCurrentHackathon(formData.currentStageId);
    } else {
        setCurrentStageForCurrentHackathon(null); // Explicitly set to null if cleared
    }
    alert(`Hackathon "${formData.title}" settings updated!`);
  };

  if (!currentHackathon) {
    return (
      <Card title="Hackathon General Settings">
        <Alert type="info" message="No hackathon selected. Please choose a hackathon from the dropdown in the Admin dashboard."/>
      </Card>
    );
  }

  return (
    <Card title={`General Settings for "${currentHackathon.data.title}"`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Hackathon Title" name="title" value={formData.title} onChange={handleChange} />
        
        <RichTextEditor 
          label="Description"
          value={formData.description} 
          onChange={(html) => handleRichTextChange('description', html)}
          placeholder="AI can help draft an engaging description highlighting unique aspects and attracting participants."
        />
        <RichTextEditor 
          label="Rules"
          value={formData.rules} 
          onChange={(html) => handleRichTextChange('rules', html)}
          placeholder="AI can help generate a comprehensive and fair rule set, considering common hackathon pitfalls and ethical considerations."
        />
        <RichTextEditor 
          label="Timeline"
          value={formData.timeline} 
          onChange={(html) => handleRichTextChange('timeline', html)}
          placeholder={"Kick-off: [Date]\nSubmission Deadline: [Date]\nJudging Period: [Start Date] - [End Date]\nWinners Announcement: [Date]\n\nAI can assist in planning a realistic timeline."}
        />
        
        <div className="mt-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Accepting Submissions</label>
            <input 
                type="checkbox" 
                name="isAcceptingSubmissions" 
                checked={formData.isAcceptingSubmissions} 
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-primary-500 dark:bg-neutral-700"
            />
        </div>

        <div>
            <label htmlFor="currentStageId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Current Active Stage</label>
            <select
                id="currentStageId"
                name="currentStageId"
                value={formData.currentStageId || ''}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 sm:text-sm rounded-md bg-white dark:bg-neutral-700 dark:text-neutral-100"
            >
                <option value="">-- No Active Stage --</option>
                {currentHackathon.data.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name} (Order: {stage.order})</option>
                ))}
            </select>
            {currentHackathon.data.stages.length === 0 && <p className="text-xs text-neutral-500 dark:text-neutral-300 mt-1">No stages defined yet. Add stages in the 'Hackathon Stages' section.</p>}
        </div>

        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 pt-4 border-t dark:border-neutral-700 mt-6">Public Page Customization</h3>
        <Input label="Public Page - Hero Title" name="heroTitle" value={publicPageData.heroTitle} onChange={handlePublicPageInputChange} />
        <Input label="Public Page - Hero Subtitle" name="heroSubtitle" value={publicPageData.heroSubtitle} onChange={handlePublicPageInputChange} />
        
        <RichTextEditor 
          label="Public Page - About Section"
          value={publicPageData.aboutSection} 
          onChange={(html) => handlePublicPageRichTextChange('aboutSection', html)}
          placeholder="AI can help you write compelling copy for this section to engage potential participants."
        />
        <Input label="Public Page - Image URL" name="imageUrl" value={publicPageData.imageUrl} onChange={handlePublicPageInputChange} placeholder="e.g., https://picsum.photos/1200/400" />

        <div className="flex justify-end">
          <Button type="submit" variant="primary">Save Settings</Button>
        </div>
      </form>
    </Card>
  );
};

export default HackathonSettingsForm;