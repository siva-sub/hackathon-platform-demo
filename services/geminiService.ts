
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Keep import for type consistency
import { GEMINI_TEXT_MODEL } from '../constants'; // May not be used by mocks, but keep for structure
import { GroundingChunk, Question, ProblemStatement, MatrixCriterion } from "../types";

// Mock API_KEY setup - not actually used for calls, but fulfills the constructor requirement.
const FAKE_API_KEY = "MOCK_API_KEY_DO_NOT_USE_FOR_REAL_CALLS";
const ai = new GoogleGenAI({ apiKey: FAKE_API_KEY });


interface GeminiResponse {
    text: string;
    groundingChunks?: GroundingChunk[];
}

const mockTechFeatures = ["blockchain integration", "AI-powered analytics", "a serverless architecture", "a novel UI/UX pattern", "WebAssembly optimization", "a federated learning model"];
const mockStrengths = ["clear problem definition", "innovative use of technology", "strong potential for impact", "well-thought-out user experience", "detailed technical plan", "strong market differentiation"];
const mockSuggestions = ["further refining the user onboarding", "exploring additional data sources", "conducting more user testing", "strengthening the business model", "considering accessibility standards more deeply", "improving performance on low-end devices"];

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const mockTipsDB: { [key: string]: string[] } = {
  "effective management for": [
    "Mock Tip: Clearly define roles and responsibilities for your organizing team. Utilize a RACI chart for complex tasks.",
    "Mock Tip: Establish a realistic budget early and track expenses diligently using a shared spreadsheet or budgeting tool.",
    "Mock Tip: Create a multi-channel communication plan (email, Discord, social media) for participants, judges, mentors, and sponsors.",
    "Mock Tip: Develop a detailed project plan with milestones, deadlines, and owners for all pre-event, event, and post-event activities.",
    "Mock Tip: Conduct regular check-in meetings with the organizing team to monitor progress and address roadblocks proactively."
  ],
  "configuring engaging hackathon event settings": [
    "Mock Tip: Define a clear, inspiring theme and specific goals that resonate with your target audience.",
    "Mock Tip: Offer diverse, well-scoped problem statements that balance challenge with achievability within the event timeframe.",
    "Mock Tip: Ensure a transparent, fair, and clearly communicated judging process. Publish criteria and scoring rubrics in advance.",
    "Mock Tip: Plan for engaging side activities like workshops, mentor sessions, or fun mini-challenges to maintain energy levels.",
    "Mock Tip: Carefully consider the submission requirements. Keep them concise enough not to overburden participants but detailed enough for proper evaluation."
  ],
  "optimizing Open Graph tags for social media sharing": [
    "Mock Tip: Use a compelling and concise title (og:title, ~50-60 chars) that accurately reflects the event and grabs attention.",
    "Mock Tip: Write an engaging description (og:description, ~150-160 chars) summarizing the hackathon's value and call to action.",
    "Mock Tip: Include a high-quality, relevant image (og:image, ideally 1200x630px) to make shares visually appealing. Test how it appears on major platforms.",
    "Mock Tip: Ensure the og:url points to the canonical public page for the hackathon to consolidate link equity.",
    "Mock Tip: Use 'og:type = website' for general hackathon pages. If you have specific articles or blog posts about it, use 'article'."
  ],
  "designing impactful hackathon problem statements": [
    "Mock Tip: Focus on real-world relevance; problems with tangible impact potential are more motivating.",
    "Mock Tip: Provide sufficient context and (if applicable) sample datasets, but allow ample room for creative freedom.",
    "Mock Tip: Clearly define the scope, constraints, and expected deliverables for each problem statement to avoid ambiguity.",
    "Mock Tip: Frame problem statements as open-ended challenges rather than prescriptive tasks to encourage innovation.",
    "Mock Tip: Consider including 'stretch goals' or optional advanced components for ambitious teams."
  ],
  "creating a fair and effective multi-stage judging process": [
    "Mock Tip: Define clear, objective, and weighted judging criteria for each stage, communicated upfront to all participants. Ensure criteria align with stage goals.",
    "Mock Tip: Recruit a diverse panel of qualified judges with relevant expertise for each specific stage. Provide them with clear guidelines and training.",
    "Mock Tip: Implement a system for consistent scoring (e.g., rubrics, scoring sheets) and calibration among judges if possible.",
    "Mock Tip: Provide constructive, actionable feedback to participants after each stage, even if they don't advance.",
    "Mock Tip: Establish clear rules for tie-breaking and ensure judges declare any conflicts of interest."
  ],
  "writing clear general submission questions": [
    "Mock Tip: Ask open-ended questions that encourage detailed responses, revealing project depth and team thinking.",
    "Mock Tip: Ensure questions are directly relevant to evaluating the project against hackathon goals and judging criteria.",
    "Mock Tip: Avoid jargon and make questions easy to understand for all participants, regardless of background.",
    "Mock Tip: Group questions logically (e.g., problem, solution, impact, tech stack).",
    "Mock Tip: Limit the number of questions to avoid overwhelming participants; focus on quality over quantity."
  ],
  "managing submissions and participant communication": [
    "Mock Tip: Use a centralized platform for submissions with clear deadlines and formats. Send reminders before deadlines.",
    "Mock Tip: Establish dedicated communication channels (e.g., Discord server, FAQ page, email support) for Q&A and technical help.",
    "Mock Tip: Provide timely updates on deadlines, stage progression, judging results, and any event changes.",
    "Mock Tip: Prepare templates for common announcements and responses to ensure consistency and speed.",
    "Mock Tip: Offer office hours with mentors or organizers for participants to ask questions and get guidance."
  ],
  "developing hackathon themes": [
    "Mock Tip: Research current technology trends (AI, Web3, Sustainability) to identify relevant and exciting theme areas.",
    "Mock Tip: Consider partnering with industry sponsors to align themes with their areas of expertise or current challenges.",
    "Mock Tip: Brainstorm themes that allow for a wide range of project types and skill sets to maximize inclusivity.",
    "Mock Tip: Ensure your chosen theme is broad enough for creativity but specific enough to provide focus.",
    "Mock Tip: Test potential themes with your target audience to gauge interest and clarity."
  ],
  "default": [
    "Mock Tip: This is a default AI-generated tip. For more specific advice, please refine your query.",
    "Mock Tip: Effective planning involves breaking down complex goals into smaller, actionable steps with clear owners.",
    "Mock Tip: Continuous improvement is key. Regularly solicit feedback and iterate on your processes.",
    "Mock Tip: Ensure all stakeholders are aligned on the objectives and expected outcomes before starting a new initiative.",
    "Mock Tip: Leverage data and analytics to inform your decisions and measure the success of your efforts."
  ]
};

const getMockTips = (prompt: string): string => {
  let tipsKey = "default";
  const lowerPrompt = prompt.toLowerCase();

  const promptMap: { [key: string]: string } = {
    "effective management for": "effective management for",
    "configuring engaging hackathon event settings": "configuring engaging hackathon event settings",
    "optimizing open graph tags": "optimizing Open Graph tags for social media sharing",
    "designing impactful hackathon problem statements": "designing impactful hackathon problem statements",
    "creating a fair and effective multi-stage judging process": "creating a fair and effective multi-stage judging process",
    "writing clear general submission questions": "writing clear general submission questions",
    "managing submissions and participant communication": "managing submissions and participant communication",
    "hackathon themes": "developing hackathon themes",
    "theme ideas": "developing hackathon themes"
  };

  for (const keyword in promptMap) {
    if (lowerPrompt.includes(keyword)) {
      tipsKey = promptMap[keyword];
      break;
    }
  }

  const selectedTips = mockTipsDB[tipsKey] || mockTipsDB["default"];
  return selectedTips.map((tip, index) => `${index + 1}. ${tip}`).join('\n');
};

const getMockAiSummary = (prompt: string): string => {
    const projectNameMatch = prompt.match(/Project Name: (.*?)\n/);
    const problemStatementMatch = prompt.match(/Problem Statement: (.*?)\n/);
    const stageMatch = prompt.match(/current judging stage: (.*?)\./);

    const projectName = projectNameMatch ? projectNameMatch[1] : "The project";
    const problemStatement = problemStatementMatch ? problemStatementMatch[1] : "the selected challenge";
    const stageName = stageMatch ? stageMatch[1] : "this stage";

    return `(Mock AI Summary for Stage: ${stageName}) 
The submission, "${projectName}", aims to address ${problemStatement}. 
It demonstrates ${pickRandom(mockStrengths)} through its use of ${pickRandom(mockTechFeatures)} and ${pickRandom(mockTechFeatures)}.
The core concept is communicated effectively, highlighting its ${pickRandom(mockStrengths)}.
For future development, the team could benefit from ${pickRandom(mockSuggestions)} and perhaps ${pickRandom(mockSuggestions)}.
Overall, this submission presents a promising foundation for ${stageName}, with notable potential if key areas are further developed. The technical feasibility seems adequate for an MVP.`;
};


export const getBasicCompletion = async (prompt: string): Promise<string | null> => {
  console.log("MOCK getBasicCompletion called with prompt:", prompt.substring(0,100) + "...");
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500)); 

  if (prompt.toLowerCase().includes("summarize the following hackathon submission")) {
    return getMockAiSummary(prompt);
  } else {
    return getMockTips(prompt);
  }
};

export const getJsonCompletion = async <T,>(prompt: string): Promise<T | null> => {
  console.log("MOCK getJsonCompletion called with prompt:", prompt.substring(0,100) + "...");
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("hackathon theme ideas") || lowerPrompt.includes("generate themes")) {
    return {
        themes: [
            { id: "ai_for_social_good", name: "AI for Social Good", description: "Develop AI-powered solutions to address pressing social or environmental challenges.", examples: ["Healthcare accessibility", "Climate change mitigation", "Educational tools for underserved communities"] },
            { id: "future_of_web", name: "The Future Web", description: "Innovate tools and platforms leveraging Web3, decentralized technologies, or advanced UI/UX.", examples: ["Decentralized identity systems", "Hyper-performant PWAs", "AI-driven personalization in web experiences"] },
            { id: "sustainable_cities", name: "Sustainable Cities", description: "Create projects promoting eco-friendly urban living, smart resource management, and resilient infrastructure.", examples: ["Smart traffic management", "Waste reduction platforms", "Urban farming tech"] },
            { id: "creative_ai", name: "Creative AI", description: "Explore the intersection of artificial intelligence and art, music, writing, or design.", examples: ["AI-generated art tools", "Interactive storytelling with AI characters", "Music composition aids"] }
        ],
        message: "Mock JSON response: Here are some theme ideas tailored to your request."
    } as unknown as T;
  } else if (lowerPrompt.includes("submission questions") || lowerPrompt.includes("generate questions")) {
    const mockQuestions: Question[] = [
        { id: 'mq1', text: "What is the core problem your project solves, and who is the target audience?", type: 'textarea'},
        { id: 'mq2', text: "Describe your solution's key features and technical architecture.", type: 'textarea'},
        { id: 'mq3', text: "How does your project demonstrate innovation or a unique approach?", type: 'textarea'},
        { id: 'mq4', text: "What is your project's potential impact and how would you measure it?", type: 'text'},
        { id: 'mq5', text: "Provide a link to your project's code repository (e.g., GitHub).", type: 'url'}
    ];
    return { questions: mockQuestions, message: "Mock JSON: Suggested submission questions." } as unknown as T;
  } else if (lowerPrompt.includes("problem statements") || lowerPrompt.includes("generate problem statements for theme")) {
    const themeMatch = lowerPrompt.match(/for theme: (.*?)(?:\n|$)/);
    const theme = themeMatch ? themeMatch[1] : "a general technology area";
    const mockProblemStatements: ProblemStatement[] = [
        {id: 'mps1', title: `Innovative Solution for ${theme} - Challenge A`, description: `Develop a novel approach to tackle aspect X within ${theme}, focusing on user impact and scalability. Consider using Y technology.`},
        {id: 'mps2', title: `Data-driven Insights for ${theme} - Challenge B`, description: `Leverage data analytics or machine learning to uncover new insights or efficiencies related to ${theme}. Address problem Z for target users.`},
        {id: 'mps3', title: `Improving Accessibility in ${theme} - Challenge C`, description: `Create a tool or platform that enhances accessibility or inclusivity for users interacting with ${theme}-related services or products.`},
    ];
    return { problemStatements: mockProblemStatements, message: `Mock JSON: Problem statement ideas for ${theme}.` } as unknown as T;
  } else if (lowerPrompt.includes("judging criteria") || lowerPrompt.includes("generate criteria for stage")) {
    const stageMatch = lowerPrompt.match(/for stage: (.*?)(?:\n|$)/);
    const stageName = stageMatch ? stageMatch[1] : "a hackathon stage";
    const mockCriteria: MatrixCriterion[] = [
        {id: 'mc1', name: `Innovation & Originality (${stageName})`, description: `Novelty of the idea and creative application of technology specific to ${stageName}.`, maxScore: 30},
        {id: 'mc2', name: `Technical Execution (${stageName})`, description: `Quality of implementation, functionality, and technical soundness demonstrated for ${stageName}.`, maxScore: 35},
        {id: 'mc3', name: `Impact & Potential (${stageName})`, description: `Significance of the problem addressed and the solution's potential impact, relevant to ${stageName}.`, maxScore: 25},
        {id: 'mc4', name: `Presentation & Clarity (${stageName})`, description: `Effectiveness of the presentation/demo in conveying the project's value for ${stageName}.`, maxScore: 10},
    ];
    return { judgingCriteria: mockCriteria, message: `Mock JSON: Judging criteria ideas for ${stageName}.` } as unknown as T;
  }


  return {
    mockResponse: true,
    status: "success",
    message: "This is a generic mock JSON response. Try asking for specific items like 'hackathon theme ideas', 'submission questions', 'problem statements for theme: AI for Education', or 'judging criteria for stage: MVP'.",
    promptReceived: prompt.substring(0, 150) + "...",
    data: {
        fieldA: "mockTextValue",
        fieldB: Math.floor(Math.random() * 1000),
        isMocked: true,
        options: ["option1", "option2", "option3"],
        nestedObject: {
            property1: `Timestamp: ${new Date().toISOString()}`,
            property2: null
        }
    }
  } as unknown as T;
};

export const getCompletionWithGrounding = async (prompt: string): Promise<GeminiResponse | null> => {
  console.log("MOCK getCompletionWithGrounding called with prompt:", prompt.substring(0,100) + "...");
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  const queryFocus = prompt.length > 20 ? prompt.substring(0, Math.min(prompt.length, 50)).replace(/[^\w\s]/gi, '').trim() : "the topic";
  const sanitizedQueryFocus = queryFocus.toLowerCase().replace(/\s+/g, '-');

  return {
    text: `(Mock Grounded Response) Based on simulated web searches related to "${queryFocus}", it appears that [mock fact A derived from ${queryFocus}] is a key consideration. Furthermore, [mock trend B concerning ${queryFocus}] is rapidly evolving. These points are corroborated by the following mock sources, which provide further context.`,
    groundingChunks: [
      { web: { uri: `https://mock-site.example.com/${sanitizedQueryFocus}/article-alpha`, title: `Understanding ${queryFocus}: An In-depth Mock Article` } },
      { web: { uri: `https://mock-research.example.org/studies/${sanitizedQueryFocus}-trends`, title: `Mock Research Paper on ${queryFocus} Trends` } },
      { retrievedContext: { uri: `internal-doc://mock-kb/${sanitizedQueryFocus}-best-practices`, title: `Internal Mock Best Practices for ${queryFocus}` } },
      { web: { uri: `https://mock-news.example.com/latest/${sanitizedQueryFocus}-updates`, title: `Latest Mock News Updates on ${queryFocus}` } }
    ].slice(0, Math.floor(Math.random() * 2) + 2) // Return 2-3 mock chunks
  };
};


export const getCompletionStream = async (prompt: string): Promise<AsyncIterable<GenerateContentResponse> | null> => {
    console.log("MOCK getCompletionStream called with prompt:", prompt.substring(0,100) + "...");
    
    async function* mockStream(): AsyncIterable<GenerateContentResponse> {
        let baseText = `This is a more comprehensive, mock streamed response for your query about "${prompt.substring(0, Math.min(prompt.length, 40))}...". 
It will arrive in several dynamically sized chunks, simulating how a real-time generative AI might behave. 
We are processing your request and formulating a detailed answer. 
Please wait as the information is being generated and streamed to you. 
This process involves several steps to ensure accuracy and relevance. 
Thank you for your patience. The next part will elaborate further on potential solutions or considerations related to your query. 
For instance, if you asked about hackathon themes, we might suggest exploring areas like AI ethics, decentralized finance, or sustainable technologies. Each of these has rich potential.
If your query was about judging, we'd emphasize fairness, clarity of criteria, and constructive feedback.
The key is to tailor the response to the specific context provided in the prompt, which this mock system attempts to simulate by echoing parts of your query.
This concludes the mock streamed response.`;

        if (prompt.toLowerCase().includes("summarize") && prompt.toLowerCase().includes("submission")) {
            baseText = getMockAiSummary(prompt) + "\n\n(This summary was streamed chunk by chunk for demonstration.)";
        } else if (prompt.toLowerCase().includes("tips for") || prompt.toLowerCase().includes("best practice")) {
            baseText = getMockTips(prompt) + "\n\n(These tips were streamed to demonstrate chunking.)";
        }

        const words = baseText.split(/(\s+)/); // Split by spaces, keeping spaces
        let buffer = "";
        for (let i = 0; i < words.length; i++) {
            buffer += words[i];
            if (buffer.length > (Math.random() * 30 + 20) || i === words.length -1 ) { // Chunk size between 20-50 chars
                 await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 100)); 
                 yield { text: buffer } as GenerateContentResponse;
                 buffer = "";
            }
        }
        if (buffer) { // send any remaining part
             await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 100));
            yield { text: buffer } as GenerateContentResponse;
        }
    }
    return Promise.resolve(mockStream());
};
