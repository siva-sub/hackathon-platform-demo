import React, { useState, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
// import { getBasicCompletion } from '../../services/geminiService'; // No longer needed for mock
import { Icons } from '../../constants';

interface BestPracticeCardProps {
  topic: string; 
  promptPrefix?: string; // Kept for prop consistency, but not used in mock logic
}

const mockTipsDB: { [key: string]: string[] } = {
  "configuring engaging hackathon event settings": [
    "Clearly define your hackathon's theme and goals to attract the right participants.",
    "Offer diverse and challenging problem statements that allow for creativity.",
    "Ensure a transparent, fair, and well-communicated judging process with clear criteria."
  ],
  "optimizing Open Graph tags for social media sharing": [
    "Use a compelling and concise title (og:title, ~60-70 chars) that grabs attention.",
    "Write an engaging description (og:description, ~150-160 chars) summarizing the event.",
    "Include a high-quality image (og:image, 1200x630px) relevant to your hackathon."
  ],
  "designing impactful hackathon problem statements": [
    "Focus on real-world relevance and problems that have a tangible potential for impact.",
    "Provide sufficient context and data (if applicable), but allow for creative freedom in solutions.",
    "Clearly define the scope, constraints, and expected deliverables for each problem statement."
  ],
  "creating a fair and effective multi-stage judging process": [
    "Define clear, objective, and weighted judging criteria for each stage, communicated upfront.",
    "Recruit a diverse panel of qualified judges with relevant expertise for each stage.",
    "Implement a system for consistent scoring and provide constructive feedback to participants."
  ],
  "writing clear general submission questions": [
    "Ask open-ended questions that encourage detailed and thoughtful responses.",
    "Ensure questions are directly relevant to evaluating the project against hackathon goals.",
    "Avoid jargon and make questions easy to understand for all participants."
  ],
  "managing submissions and participant communication": [
    "Use a centralized platform for submissions and status tracking.",
    "Establish clear communication channels for announcements, Q&A, and support.",
    "Provide timely updates and feedback to participants throughout the event."
  ],
  "implementing Schema.org for events": [
    "Use 'Event' schema type for your hackathon page.",
    "Ensure 'name', 'description', 'startDate', and 'endDate' are accurately filled.",
    "Provide 'location' (Physical or Virtual) and 'organizer' details for better context.",
    "Include a relevant 'image' and the canonical 'url' of the event page.",
    "Validate your schema markup using Google's Rich Results Test or Schema.org validator."
  ],
  "default": [ 
    "Define clear objectives for this section to maximize effectiveness.",
    "Communicate expectations clearly to all stakeholders involved.",
    "Regularly review progress and iterate based on feedback and results obtained."
  ]
};


const BestPracticeCard: React.FC<BestPracticeCardProps> = ({ topic }) => {
  const [tips, setTips] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Kept for future, but mock shouldn't error

  const fetchTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    let tipsKey = "default";
    // Attempt to find a direct match for the topic first
    if (mockTipsDB[topic]) {
      tipsKey = topic;
    } else {
      // Handle the dynamic topic from AdminDashboard: "effective management for \"{Hackathon Title}\""
      if (topic.startsWith("effective management for")) {
        // For this dynamic topic, use a general set of management tips.
        tipsKey = "configuring engaging hackathon event settings"; 
      } else if (topic.startsWith("implementing Schema.org")) {
        tipsKey = "implementing Schema.org for events";
      }
      // Add more sophisticated matching logic here if needed for other dynamic topics
    }
  
    const selectedTips = mockTipsDB[tipsKey] || mockTipsDB["default"];
    // Format as a numbered list string for display
    setTips(selectedTips.map((tip, index) => `${index + 1}. ${tip}`).join('\n'));
    setIsLoading(false);
  }, [topic]);

  return (
    <Card title="AI-Powered Best Practices" className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700">
      <div className="space-y-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-200">Get AI-driven advice on: <strong className="font-medium">{topic}</strong>.</p>
        <Button onClick={fetchTips} isLoading={isLoading} disabled={isLoading} variant="secondary" size="sm" leftIcon={<Icons.LightBulb />}>
          {tips ? 'Refresh Mock Tips' : 'Get Mock AI Tips'}
        </Button>
        {isLoading && <p className="text-sm text-neutral-500 dark:text-neutral-300">Fetching mock tips...</p>}
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {tips && !error && (
          <div className="mt-4 p-3 bg-white dark:bg-neutral-800 rounded-md shadow prose prose-sm dark:prose-invert max-w-none">
            <h5 className="font-semibold text-neutral-800 dark:text-neutral-100">Mock AI Tips for {topic}:</h5>
            {/* Displaying the string directly as it's pre-formatted with newlines */}
            <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700 dark:text-neutral-200 bg-transparent p-0">{tips}</pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BestPracticeCard;
