
// No longer importing from @google/genai
import { MOCK_AI_RESPONSES } from '../constants'; // Assuming MOCK_AI_RESPONSES is correctly defined here

// API_KEY and GoogleGenAI client initialization are removed.

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  // The prompt argument is the actual prompt string from AIAssistanceTopic.prompt
  // We need to find if this prompt string is a key in MOCK_AI_RESPONSES
  // The keys in MOCK_AI_RESPONSES are constructed like:
  // [AI_ASSISTANCE_TOPICS.find(t => t.id === 'judging_criteria')?.prompt || 'judging_criteria_prompt']
  // This means the prompt itself is the key.

  if (MOCK_AI_RESPONSES[prompt]) {
    return Promise.resolve(MOCK_AI_RESPONSES[prompt]);
  } else {
    console.warn(`Mock AI response not found for prompt: "${prompt.substring(0, 50)}..."`);
    // Fallback or more specific message if a systemInstruction was provided
    if (systemInstruction) {
        return Promise.resolve(`Mock AI Service: Received prompt for topic (system instruction: ${systemInstruction.substring(0,30)}...), but no specific mock response is configured. This is a generic mock reply.`);
    }
    return Promise.resolve("Mock AI Service: No specific mock response configured for this topic. This is a generic mock reply.");
  }
};

export const generateJson = async <T,>(prompt: string, systemInstruction?: string): Promise<T | string> => {
  // For simplicity, always return a stringified version of a generic mock JSON object.
  // In a real scenario, you might want to parse it to T if the structure is known and fixed.
  const mockJsonResponse = {
    mockData: true,
    message: "This is a mock JSON response from the AI service.",
    originalPrompt: prompt.substring(0, 100) + "...", // Include part of the prompt for context
    systemInstructionProvided: !!systemInstruction,
  };
  
  // Return as string to avoid parsing errors if T is complex or unknown here
  return Promise.resolve(JSON.stringify(mockJsonResponse));
};
