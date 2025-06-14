
import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { generateText } from '../../services/geminiService';
import { AI_ASSISTANCE_TOPICS } from '../../constants';
import type { AIAssistanceTopic } from '../../types'; // Changed: Import type from types.ts
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const AIAssistanceAdmin: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) return <LoadingSpinner message="Loading context..." />;
  
  const [selectedTopicId, setSelectedTopicId] = useState<string>(AI_ASSISTANCE_TOPICS[0]?.id || '');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTips = async () => {
    const topic: AIAssistanceTopic | undefined = AI_ASSISTANCE_TOPICS.find(t => t.id === selectedTopicId);
    if (!topic) {
      setError("Please select a valid topic.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse('');

    try {
      const response = await generateText(topic.prompt, "You are a helpful assistant for hackathon organizers.");
      setAiResponse(response);
    } catch (err) {
      console.error("AI Assistance Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching AI tips.";
      setError(errorMessage);
      setAiResponse(`Failed to load tips: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const topicOptions = AI_ASSISTANCE_TOPICS.map(topic => ({ value: topic.id, label: topic.title }));

  return (
    <Card title="AI-Powered Hackathon Management Tips" actions={<Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>}>
      <div className="space-y-6">
        <div>
          <Select
            label="Choose a topic for AI assistance:"
            options={topicOptions}
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
          />
        </div>
        
        <Button onClick={handleFetchTips} isLoading={isLoading} disabled={!selectedTopicId || isLoading} variant="primary" size="lg">
          {isLoading ? 'Getting Tips...' : 'Get AI Tips'}
        </Button>

        {error && (
          <div className="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {aiResponse && (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">AI Generated Tips:</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-sans">{aiResponse}</pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIAssistanceAdmin;
