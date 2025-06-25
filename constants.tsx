import React from 'react';
import { HackathonData, HackathonStage, HackathonApprovalStatus, WinnerConfiguration, AwardLevel, Award, EventSchema } 
from './types';

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes for edit lock

const defaultOgConfig = {
  ogTitle: "", // Will be populated by hackathon title by default
  ogDescription: "", // Will be populated by hackathon description by default
  ogImage: "https://via.placeholder.com/1200x630.png?text=Hackathon+OG+Image", // Generic placeholder
  ogType: "website",
  ogUrl: "", // Admin should fill this or it can be derived
};

const defaultWinnerConfiguration: WinnerConfiguration = {
    scope: 'overall',
    awardCategories: [
        { 
            id: 'overall', 
            name: 'Overall Event', 
            allowedLevels: ['winner', 'runner_up', 'second_runner_up'] 
        }
    ]
};

export const defaultEventSchemaConfig: EventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: '', // Will be populated by hackathon title
  description: '', // Will be populated by hackathon description
  startDate: '', // Needs to be set manually or from timeline
  endDate: '', // Needs to be set manually or from timeline
  eventStatus: 'EventScheduled',
  eventAttendanceMode: 'OnlineEventAttendanceMode', // Default to Online
  location: {
    '@type': 'VirtualLocation',
    name: 'Online'
  },
  image: '', // Can be populated by ogImage or publicPageContent.imageUrl
  organizer: {
    '@type': 'Organization',
    name: 'Hackathon Platform Organizer', // Generic default
    url: '' // Optional: URL of the organizing body
  },
  url: '' // Will be populated by public page URL
};


export const DefaultHackathonData: Partial<HackathonData> = {
  title: "AI For Good Challenge - 3 Stage Demo",
  description: "A 3-stage hackathon event. AI can help draft an engaging description that highlights unique aspects and attracts participants. Consider asking AI to generate 3-5 theme ideas based on current tech trends, or even draft welcome email templates for participants.",
  rules: "1. Eligibility: Open to all innovators. \n2. Team Size: 1-5 members. \n3. Submission: Must address a chosen problem statement. \n4. Code of Conduct: Be respectful and collaborative. \n\nAI can help generate a comprehensive and fair rule set, including clauses on IP ownership, use of AI tools in projects, and dispute resolution, considering common hackathon pitfalls and ethical considerations. AI can also help draft communication templates for rule violations or suggest methods for secure code sharing for teams.",
  timeline: "Kick-off: [Date, e.g., Oct 1, 2024]\nSubmission Deadline Stage 1: [Date, e.g., Oct 10, 2024]\nJudging Period Stage 1: [Start Date] - [End Date]\nSubmission Deadline Stage 2: [Date, e.g., Oct 20, 2024]\nJudging Period Stage 2: [Start Date] - [End Date]\nSubmission Deadline Stage 3: [Date, e.g., Oct 30, 2024]\nJudging Period Stage 3: [Start Date] - [End Date]\nWinners Announcement: [Date, e.g., Nov 5, 2024]\n\nAI can assist in planning a realistic timeline, suggesting optimal durations for each phase based on event complexity and expected number of participants. Ask AI to draft a sample schedule with buffer times and milestone communication points, including time for team formation and collaboration.",
  publicPageContent: {
    heroTitle: "AI For Good: Innovate. Build. Impact.",
    heroSubtitle: "Join our premiere 3-stage hackathon and turn your brilliant AI ideas into reality.",
    aboutSection: "This hackathon is designed to challenge your creativity and technical skills in leveraging AI for positive social impact. AI can help you write compelling copy for this section to engage potential participants, perhaps by highlighting past success stories or key mentor profiles. Ask AI to summarize the key benefits of participating. Check out our Q&A section for common queries!",
    imageUrl: "https://via.placeholder.com/1200x400.png?text=AI+For+Good+Challenge"
  },
  submissionQuestions: [
    { id: 'q1_default_problem', text: "What is the core problem your project addresses, and what is its significance in the 'AI for Good' context?", type: 'textarea' as const },
    { id: 'q2_default_solution', text: "Describe your proposed AI-driven solution, its key features, and its technical architecture. How does it use AI innovatively?", type: 'textarea' as const },
    { id: 'q3_default_impact', text: "Who is your target user/beneficiary, and how will your solution create measurable positive impact?", type: 'text' as const },
    { id: 'q4_default_innovation', text: "What makes your solution innovative or unique compared to existing alternatives in the 'AI for Good' space?", type: 'textarea' as const },
  ],
  problemStatements: [
    { id: 'ps1_default_sustain', title: "AI-Powered Environmental Sustainability", description: "Develop an AI-driven solution to tackle a key environmental challenge. Examples: optimizing energy consumption, reducing waste, promoting biodiversity, predicting climate-related events, or developing new sustainable materials. AI can help brainstorm diverse and impactful problem statements within this theme, generate sub-themes, or even draft example project ideas. Consider how teams might collaborate on complex data sets for this." },
    { id: 'ps2_default_learn', title: "AI for Inclusive & Personalized Learning", description: "Create a tool or platform that leverages AI to provide adaptive, accessible, and personalized educational experiences for K-12, higher education, or professional development, with a focus on inclusivity for diverse learners. AI can assist in refining the scope and impact of such statements, suggest niche areas like 'AI for neurodiverse learners', or propose methods for measuring learning outcomes. How can your solution support collaborative learning?" }
  ],
  stages: [
    { 
      id: 'stage1_default_ideation', name: "Stage 1: Ideation & Proposal", order: 1, description: "Submit a detailed proposal outlining your AI-driven idea, its feasibility, potential impact, and target audience. Focus on the 'why' and 'what'. AI can help define clear objectives and deliverables for this initial stage, or suggest templates for a strong proposal.",
      judgingCriteria: [
        { id: 's1c1_default_innovation', name: "Problem-Solution Fit & Innovation", description: "Clarity of problem, novelty of the AI approach, and differentiation from existing solutions in the 'AI for Good' context. (AI can help generate varied criteria descriptions and scoring rubrics, or suggest benchmarks for innovation)", maxScore: 30 },
        { id: 's1c2_default_impact', name: "Potential Social Impact & Significance", description: "Clarity of the problem statement addressed and the potential positive, measurable impact of the AI solution on the target beneficiaries or domain.", maxScore: 30 },
        { id: 's1c3_default_feasibility', name: "Technical Feasibility & Initial Plan", description: "Apparent practicality of the proposed AI solution, clarity of the initial technical execution plan (data, model type), and identification of potential challenges/biases.", maxScore: 25 },
        { id: 's1c4_default_proposal_clarity', name: "Clarity & Persuasiveness of Proposal", description: "Overall clarity, conciseness, and persuasiveness of the written proposal and its arguments.", maxScore: 15 },
      ],
      assignedJudgeEmails: [] 
    },
    { 
      id: 'stage2_default_prototype', name: "Stage 2: MVP & Technical Demo", order: 2, description: "Develop and submit a working Minimum Viable Product (MVP) of your AI solution along with a short presentation video (max 5 mins) demonstrating its core functionality and technical implementation. AI can provide guidance on what constitutes a 'good' MVP for this stage, or tips for an effective technical pitch video. Consider asking AI to list key elements to cover in the demo.",
      judgingCriteria: [
        { id: 's2c1_default_tech_execution', name: "Technical Execution & AI Implementation", description: "Quality of the MVP, effective implementation of core AI features, and overall functionality demonstrated. How well is the AI component working?", maxScore: 35 },
        { id: 's2c2_default_ux_design', name: "User Experience (UX) & Design of MVP", description: "Design, usability, intuitiveness, and overall user experience of the prototype. (AI can suggest UX heuristics or accessibility checks to consider)", maxScore: 25 },
        { id: 's2c3_default_progress_completion', name: "Progress & MVP Completeness", description: "How well the MVP achieves the goals set out in the initial proposal and demonstrates significant progress. Does it solve a core part of the problem?", maxScore: 20 },
        { id: 's2c4_default_demo_clarity', name: "Presentation & Demo Clarity", description: "Effectiveness of the video presentation in conveying the project's value, AI functionality, and future potential. Was the demo clear and compelling?", maxScore: 20 },
      ],
      assignedJudgeEmails: []
    },
    {
      id: 'stage3_default_final', name: "Stage 3: Final Review & Pitch", order: 3, description: "Refine your MVP based on feedback (if any). Prepare a comprehensive final presentation (live or recorded, max 10 mins) covering the problem, solution, AI technology, impact, business/sustainability model (if applicable), and future roadmap. AI can help structure this final pitch or generate Q&A practice questions, especially around team dynamics and contributions.",
      judgingCriteria: [
        { id: 's3c1_default_solution_robustness', name: "Solution Robustness & Polish", description: "Overall quality, polish, and robustness of the final AI solution. How complete and usable is it?", maxScore: 30 },
        { id: 's3c2_default_impact_scalability', name: "Realized Impact & Scalability Potential", description: "Demonstrated impact (or strong potential for it) and clear vision for scaling the solution to reach a wider audience or create greater good.", maxScore: 30 },
        { id: 's3c3_default_business_sustainability', name: "Sustainability / Business Model (if applicable)", description: "If relevant, the viability of the project's sustainability plan or business model to ensure long-term impact.", maxScore: 20 },
        { id: 's3c4_default_final_pitch_qa', name: "Final Pitch Quality & Q&A", description: "Clarity, persuasiveness, and professionalism of the final presentation and ability to answer questions effectively.", maxScore: 20 },
      ],
      assignedJudgeEmails: []
    }
  ],
  currentStageId: null, 
  isAcceptingSubmissions: false,
  ogConfig: { ...defaultOgConfig, ogTitle: "AI For Good Challenge", ogDescription: "Join us for an exciting 3-stage hackathon focusing on AI solutions for social impact!", ogImage: "https://via.placeholder.com/1200x630.png?text=AI+For+Good+OG" },
  schemaConfig: { 
    ...defaultEventSchemaConfig, 
    name: "AI For Good Challenge - 3 Stage Demo",
    description: "A 3-stage hackathon event. AI can help draft an engaging description...",
    image: "https://via.placeholder.com/1200x400.png?text=AI+For+Good+Challenge" // Example using public page image
  },
  questions: [],
  adminEmails: [],
  status: 'approved', 
  approvedBySuperAdminEmail: 'superadmin@example.com',
  approvedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  winnerConfiguration: { ...defaultWinnerConfiguration }
};

export const DefaultHackathonData2: HackathonData = {
  ...DefaultHackathonData,
  timeline: "Kick-off: [Date]\nSubmission Deadline: [Date]\nWinners Announcement: [Date]",
  visibility: 'public',
  requiresApproval: false,
  tags: ['web', 'innovation', 'future'],
  difficulty: 'intermediate',
  estimatedDuration: '2 weeks',
  legalDocuments: [],
  title: "Future Web Innovators Hackathon",
  description: "Shape the next generation of web technologies. This event focuses on decentralized apps, advanced UI/UX, and performance optimization. AI can help tailor this description to target specific developer communities, perhaps by suggesting keywords or highlighting relevant new W3C standards. AI could also generate challenge ideas for 'WebAssembly for creative coding'. Encourage team formation for diverse skill sets.",
  rules: "1. Focus on Web 3.0, WebAssembly, Progressive Web Apps, or novel UI/UX paradigms. \n2. Open source submissions are encouraged. \n3. Teams of 1-4. \n\nAI can help draft rules specific to technology constraints or open-source licensing, or suggest fair ways to handle pre-existing code. Also consider AI for drafting team agreement templates.",
  publicPageContent: {
    heroTitle: "Build the Web of Tomorrow, Today!",
    heroSubtitle: "Decentralize, optimize, and create groundbreaking web experiences.",
    aboutSection: "Shape the next generation of web technologies. This event focuses on decentralized apps, advanced UI/UX, and performance optimization.",
    imageUrl: "https://via.placeholder.com/1200x400.png?text=Future+Web+Innovators"
  },
  submissionQuestions: [
      { id: 'q1_web_problem', text: "Which specific aspect of the 'Future Web' (e.g., decentralization, performance, UX, accessibility) does your project address?", type: 'textarea' as const },
      { id: 'q2_web_solution', text: "Describe your solution's architecture and the key web technologies utilized. Why are these technologies the right choice?", type: 'textarea' as const },
      { id: 'q3_web_innovation', text: "How does your project push the boundaries of current web capabilities or user experiences? What's novel about it?", type: 'textarea' as const },
  ],
  problemStatements: [
    { id: 'ps1_web_decentral', title: "Decentralized Identity & Social Solution", description: "Design a user-friendly decentralized identity management system for the web, perhaps integrated into a novel social application, focusing on privacy, data ownership, and interoperability. AI can assist in researching existing DIDs (Decentralized Identifiers), proposing novel approaches for key management or data verification, or brainstorming decentralized social interaction features." },
    { id: 'ps2_web_performant', title: "Hyper-Performant & Accessible E-commerce UX", description: "Reimagine an e-commerce platform with a focus on instant load times (e.g., Core Web Vitals), predictive pre-fetching, seamless offline interactions using modern PWA techniques, and exemplary accessibility (WCAG AA). AI can suggest performance benchmarks, innovative UX patterns for product discovery or checkout flows, or automated accessibility testing strategies." },
    { id: 'ps3_web_creative', title: "WebAssembly for Creative & Interactive Experiences", description: "Leverage WebAssembly to build a highly performant, creative, and interactive web application. This could be a game, a data visualization tool, an audio/video editor, or an artistic experience. AI could suggest innovative uses of WASM for specific domains or help optimize computationally intensive tasks." }
  ],
   stages: [ 
    { 
      id: 's1_web_concept', name: "Stage 1: Concept Pitch & Design", order: 1, description: "Pitch your innovative web concept. Focus on the problem, solution, target audience, and provide initial UI/UX mockups or wireframes. AI can help refine your value proposition or generate user personas.",
      judgingCriteria: [
        { id: 's1c1_web_clarity', name: "Concept Clarity & Problem Definition", description: "Clear articulation of the problem and how the proposed web solution addresses it effectively for the target user.", maxScore: 30 },
        { id: 's1c2_web_innovation', name: "Innovation & Web Advancement", description: "Originality and forward-thinking nature of the concept in the context of specified 'Future Web' technologies.", maxScore: 30 },
        { id: 's1c3_web_design_ux', name: "Initial UX/UI Vision & Feasibility", description: "Quality and thoughtfulness of initial design mockups/wireframes and user flow considerations. Is the design appropriate for the web?", maxScore: 25 },
        { id: 's1c4_web_tech_choice', name: "Technology Choice Rationale", description: "Justification for the chosen web technologies and their suitability for implementing the core concept.", maxScore: 15 },
      ],
      assignedJudgeEmails: []
    },
    { 
      id: 's2_web_mvp', name: "Stage 2: Minimum Viable Product (MVP)", order: 2, description: "Deliver a functional MVP demonstrating core features, deployed and accessible via a URL. The MVP should be testable and showcase the innovative web aspects. AI could help generate a checklist for MVP features based on the proposal.",
      judgingCriteria: [
        { id: 's2c1_web_tech_impl', name: "Technical Implementation & Functionality", description: "Functionality, stability, and technical soundness of the deployed MVP. Does it work as described for core features?", maxScore: 35 },
        { id: 's2c2_web_feat_comp', name: "Core Feature Completeness & Innovation Showcase", description: "Successful implementation of core proposed features, especially those highlighting 'Future Web' innovation.", maxScore: 30 },
        { id: 's2c3_web_ux_polish', name: "UX/UI Polish, Performance & Accessibility", description: "User experience, responsiveness, performance of the MVP, and adherence to basic web accessibility.", maxScore: 20 },
        { id: 's2c4_web_code_quality', name: "Code Quality & Deployment (if repo provided)", description: "Code organization, readability, use of web best practices, and ease of deployment/access.", maxScore: 15 },
      ],
      assignedJudgeEmails: []
    }
  ],
  currentStageId: null,
  isAcceptingSubmissions: true, 
  ogConfig: { ...defaultOgConfig, ogTitle: "Future Web Innovators Hackathon", ogDescription: "Join us to build the next generation of the web!", ogImage: "https://via.placeholder.com/1200x630.png?text=Future+Web+OG" },
  schemaConfig: { 
    ...defaultEventSchemaConfig, 
    name: "Future Web Innovators Hackathon",
    description: "Shape the next generation of web technologies...",
    image: "https://via.placeholder.com/1200x400.png?text=Future+Web+Innovators"
  },
  questions: [],
  adminEmails: [],
  status: 'approved', 
  approvedBySuperAdminEmail: 'superadmin@example.com',
  approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  winnerConfiguration: {
    scope: 'per_problem_statement',
    awardCategories: [ // These would typically be populated dynamically based on actual problem statements
        { id: 'ps1_web_decentral', name: 'Decentralized Identity & Social Solution', allowedLevels: ['winner', 'runner_up'] },
        { id: 'ps2_web_performant', name: 'Hyper-Performant & Accessible E-commerce UX', allowedLevels: ['winner'] },
        { id: 'ps3_web_creative', name: 'WebAssembly for Creative & Interactive Experiences', allowedLevels: ['winner', 'runner_up', 'second_runner_up'] }
    ]
  }
};

export const DefaultHackathonData3: HackathonData = {
  ...DefaultHackathonData,
  timeline: "Kick-off: [Date]\nSubmission Deadline: [Date]\nWinners Announcement: [Date]",
  visibility: 'public',
  requiresApproval: false,
  tags: ['sustainability', 'environment', 'green-tech'],
  difficulty: 'advanced',
  estimatedDuration: '3 weeks',
  legalDocuments: [],
  title: "Sustainable Tech Challenge 2024",
  description: "Develop technology solutions that promote environmental sustainability and address climate change. Focus areas: renewable energy, circular economy, smart agriculture, conservation, sustainable transportation. AI can help generate specific sub-challenges within these focus areas, or identify datasets relevant to these problems. AI could also draft a 'Code of Ethics' for sustainable tech development or help teams find relevant open-source sustainability APIs.",
  rules: "1. Projects must have a clear positive environmental impact, with quantifiable metrics if possible. \n2. Solutions can be software, hardware, or a combination. \n3. Data-driven approaches and open-source contributions are encouraged. \n\nAI can help define metrics for measuring environmental impact for judging or suggest frameworks for life-cycle assessment of solutions.",
  publicPageContent: {
    heroTitle: "Code Green: Innovate for Sustainability!",
    heroSubtitle: "Use your tech skills to build a more sustainable future for all. Tackle real-world environmental issues.",
    aboutSection: "Develop technology solutions that promote environmental sustainability and address climate change. Focus areas: renewable energy, circular economy, smart agriculture, conservation, sustainable transportation.",
    imageUrl: "https://via.placeholder.com/1200x400.png?text=Sustainable+Tech+Challenge",
  },
  submissionQuestions: [
    { id: 'q1_sus_problem', text: "Which specific environmental problem does your project target and why is it critical?", type: 'textarea' as const },
    { id: 'q2_sus_solution', text: "Explain your technological solution. How does it work, and what is its potential for measurable environmental impact (e.g., CO2 reduction, waste diverted)?", type: 'textarea' as const },
    { id: 'q3_sus_scalability', text: "How could your solution be scaled for wider adoption and impact? What are the key challenges to scalability?", type: 'textarea' as const },
  ],
  problemStatements: [
    { id: 'ps1_sus_energy', title: "AI for Renewable Energy Optimization & Grid Management", description: "Create a system to optimize the generation, distribution, storage, or consumption of renewable energy (solar, wind, etc.) using smart algorithms, IoT, or AI. Focus on improving efficiency, reducing costs, or enhancing grid stability. AI could analyze weather patterns for predictive generation, or optimize battery storage charging/discharging cycles." },
    { id: 'ps2_sus_waste', title: "Tech-Driven Circular Economy Platform", description: "Develop a platform or tool that facilitates waste reduction, material reuse, or enhanced recycling processes, connecting stakeholders in a circular economy model (e.g., businesses with waste streams to those who can use them as resources, or consumers with repair services). AI could match waste producers with recyclers, or optimize logistics for waste collection." },
    { id: 'ps3_sus_agri', title: "Precision & Regenerative Agriculture Solutions", description: "Design a solution using sensors, drones, AI, or other technologies to improve farming practices, promote soil health, reduce water/pesticide/fertilizer use, and enhance crop yields sustainably. AI could analyze satellite imagery for crop health, predict pest outbreaks, or recommend regenerative farming techniques." },
  ],
  stages: [ 
    { 
      id: 's1_sus_proposal', name: "Stage 1: Project Proposal & Impact Analysis", order: 1, description: "Submit a comprehensive proposal detailing your solution, its technological approach, and a thorough analysis of its potential environmental impact, including any data sources or metrics. AI can help research existing solutions to ensure novelty or identify key impact indicators.",
      judgingCriteria: [
        { id: 's1c1_sus_impact', name: "Potential Environmental Impact & Measurability", description: "Significance and clarity of the positive environmental impact. Is the impact quantifiable and substantial?", maxScore: 35 },
        { id: 's1c2_sus_innovation', name: "Innovation & Technical Feasibility", description: "Novelty of the technological approach and its practicality for addressing the chosen sustainability problem.", maxScore: 30 },
        { id: 's1c3_sus_clarity', name: "Proposal Clarity, Research & Problem Understanding", description: "Clarity of the proposal, depth of research into the problem and existing solutions, and understanding of the specific environmental context.", maxScore: 25 },
        { id: 's1c4_sus_team', name: "Team & Plan (Optional Bonus)", description: "Brief overview of team skills and initial plan (if applicable, for tie-breaking or bonus).", maxScore: 10 },
      ],
      assignedJudgeEmails: []
    },
    { 
      id: 's2_sus_demoday', name: "Stage 2: Solution Demo & Pitch", order: 2, description: "Present a working demo, prototype, or well-simulated concept of your solution and pitch its value proposition, impact, and scalability to judges. AI can help create an engaging pitch deck structure or practice Q&A responses.",
      judgingCriteria: [
        { id: 's2c1_sus_solution_eff', name: "Solution Effectiveness & Demo Quality", description: "How well the demo showcases the solution's core functionality and its effectiveness in solving the problem. Is the demo compelling?", maxScore: 35 },
        { id: 's2c2_sus_scalability_plan', name: "Scalability & Long-Term Viability", description: "Potential for widespread adoption and a sustainable model for its implementation or continued development. How can this grow?", maxScore: 30 },
        { id: 's2c3_sus_pitch_quality', name: "Pitch Clarity, Persuasiveness & Storytelling", description: "Quality of the presentation, ability to clearly convey the project's value and impact, and engaging storytelling.", maxScore: 25 },
        { id: 's2c4_sus_tech_depth', name: "Technical Depth & Innovation (Demo)", description: "Demonstrated technical understanding and innovative application of technology in the prototype/demo.", maxScore: 10 },
      ],
      assignedJudgeEmails: []
    }
  ],
  currentStageId: null,
  isAcceptingSubmissions: false,
  ogConfig: { ...defaultOgConfig, ogTitle: "Sustainable Tech Challenge", ogDescription: "Innovate for a greener future!", ogImage: "https://via.placeholder.com/1200x630.png?text=Sustainable+Tech+OG" },
  schemaConfig: { 
    ...defaultEventSchemaConfig, 
    name: "Sustainable Tech Challenge 2024",
    description: "Develop technology solutions that promote environmental sustainability...",
    image: "https://via.placeholder.com/1200x400.png?text=Sustainable+Tech+Challenge"
  },
  questions: [],
  adminEmails: [],
  status: 'approved', 
  approvedBySuperAdminEmail: 'superadmin@example.com',
  approvedAt: new Date().toISOString(),
  winnerConfiguration: { ...defaultWinnerConfiguration }
};


// Heroicons (https://heroicons.com/) - MIT License
export const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>,
  Cog: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.036-7.026A7.5 7.5 0 0112 4.5v1.5m0 12.5v1.5a7.5 7.5 0 01-7.5-7.5H3.75m11.25 0h1.5a7.5 7.5 0 01-7.5 7.5v-1.5m0-12.5V3.75A7.5 7.5 0 0112 19.5V18m0-15V3.75m0 11.25v1.5m0 0a7.5 7.5 0 01-7.5-7.5M12 21a7.5 7.5 0 017.5-7.5M12 3v1.5m0 15V18" /></svg>,
  UserGroup: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.068M12 15c-.217 0-.428-.02-.636-.056M12 15H9.75m2.25 0c.414 0 .82-.017 1.218-.051M12 15c-2.26 0-4.533-.328-6.198-.926M12 15c-1.353 0-2.652-.132-3.885-.378M12 15A2.25 2.25 0 0014.25 12.75H9.75A2.25 2.25 0 0012 15m0-9.75a3 3 0 110 6 3 3 0 010-6zm0 0a3.003 3.003 0 00-2.924 2.118M11.25 12.75A2.25 2.25 0 019 15m6.75-5.25A2.25 2.25 0 0118 10.5m-3.75 0c.057.01.114.018.17.026M12 3C6.477 3 2 7.477 2 13s4.477 10 10 10c.849 0 1.673-.105 2.463-.303" /></svg>,
  ClipboardDocumentList: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.172AA48.354 48.354 0 0012 3.75c-2.115 0-4.198.137-6.224.402A2.25 2.25 0 003.75 6.108V18.75c0 1.243 1.007 2.25 2.25 2.25H9.75M12 21H3.75z" /></svg>,
  Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9.75H11.25A3.375 3.375 0 007.5 13.5v4.5m9 0zM12 21.75a.75.75 0 00.75-.75V18a.75.75 0 00-.75-.75h0a.75.75 0 00-.75.75v3a.75.75 0 00.75.75zM12 6.75A2.25 2.25 0 1012 2.25a2.25 2.25 0 000 4.5z" /></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  LightBulb: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.5 7.5 0 01-4.5 0m4.5 0v.75A.75.75 0 0112 21h-.008a.75.75 0 01-.75-.75V18m0 0H9.75m2.25 0H12m2.25 0H12m2.25 0H12M9.75 18H12m2.25 0H12M9.75 18H12M3.375 18h17.25c.621 0 1.125-.504 1.125-1.125V11.25c0-1.28-.788-2.451-1.973-2.965l.003-.01c.118-.063.229-.133.336-.211a4.502 4.502 0 002.288-4.143 4.502 4.502 0 00-4.5-4.5A4.502 4.502 0 0012 1.5a4.502 4.502 0 00-4.5 4.5c0 1.71.93 3.229 2.288 4.143.107.078.218.148.336.211l.003.01c-1.185.514-1.973 1.685-1.973 2.965v5.625c0 .621.504 1.125 1.125 1.125z" /></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>,
  GlobeAlt: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 3c2.485 0 4.5 4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" /></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L5.816 19.673a2.25 2.25 0 002.244 2.077H15.92a2.25 2.25 0 002.244-2.077L14.772 5.79m14.456 0L14.772 5.79M5.23 5.79L5.23 5.79z" /></svg>,
  PlusCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  AcademicCap: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>,
  PuzzlePiece: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75h3.75V3H15A2.25 2.25 0 0012.75 5.25v2.25H9.75V9A2.25 2.25 0 007.5 11.25v2.25H5.25A2.25 2.25 0 003 15.75v3.75h3.75A2.25 2.25 0 009 17.25V15h2.25V12.75A2.25 2.25 0 0013.5 10.5h2.25V8.25A2.25 2.25 0 0013.5 6H12V3.75A2.25 2.25 0 009.75 1.5h-3A2.25 2.25 0 004.5 3.75v3A2.25 2.25 0 006.75 9h2.25v2.25A2.25 2.25 0 0011.25 13.5h2.25V15A2.25 2.25 0 0015.75 17.25h3A2.25 2.25 0 0021 15v-2.25A2.25 2.25 0 0018.75 10.5H16.5V8.25A2.25 2.25 0 0014.25 6z" /></svg>,
  ListBullet: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
  PaperAirplane: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
  LockOpen: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M10.5 10.5v2.25m6-2.25v2.25m-6-2.25H18v11.25H6V10.5h4.5zM12 15.75h.008v.008H12v-.008z" /></svg>,
  LockClosed: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  UserCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  MinusCircle: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  UserPlus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>,
  BuildingLibrary: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  DocumentMagnifyingGlass: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  ArchiveBoxArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  ArrowUturnLeft: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
  Award: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9.75H11.25A3.375 3.375 0 007.5 13.5v4.5M12 14.25L9 12.75m3 1.5l3-1.5m-3 1.5V9.75M12 12.75L9 11.25m3 1.5l3-1.5m-3 1.5V7.5" /></svg>, // Simplified award icon
  X: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
  CodeBracketSquare: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
};


export const getStatusDisplayName = (status: string, stages: HackathonStage[], award?: Award | null): string => {
  if (!status) return "Unknown Status";

  const toTitleCase = (str: string) => 
    str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  if (status === 'award_assigned' && award) {
    const levelName = toTitleCase(award.level.replace('_', ' '));
    return `${levelName} - ${award.categoryName}`;
  }
  
  const parts = status.split('_');
  if (parts[0] === 's' && parts.length >= 3) { // Stage-specific status e.g. s_stageId_pending_review
    const stageId = parts[1];
    const statusKeywords = parts.slice(2).join('_'); 
    
    const stage = stages.find(s => s.id === stageId);
    const stageName = stage ? stage.name : `Stage ID ${stageId}`;
    
    if (statusKeywords === 'rejected') {
        return `Rejected (${stageName})`;
    }
    return `${toTitleCase(statusKeywords)} (${stageName})`;
  }
  
  switch (status) {
    case 'winner_announced': // Could be simple overall winner, or fallback if award object not populated
      return 'Winner Announced';
    case 'finalist_awaiting_award_decision':
      return 'Finalist - Awaiting Award Decision';
    case 'submitted_pending_stage_assignment':
        return 'Submitted - Pending Stage Assignment';
    case 'eliminated':
        return 'Eliminated (Admin)';
    case 'pending_approval':
        return 'Pending Approval';
    case 'approved':
        return 'Approved';
    case 'declined':
        return 'Declined (SuperAdmin)';
    case 'archived':
        return 'Archived';
    default:
      return toTitleCase(status);
  }
};

export const getStatusColorClass = (status: string, award?: Award | null): string => {
  if (!status) return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100'; 
  
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes('rejected') || lowerStatus.includes('eliminated') || lowerStatus === 'declined') {
    return 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-100';
  }
  if (lowerStatus === 'award_assigned' || lowerStatus.includes('winner') || lowerStatus === 'approved') {
    if (award?.level === 'winner') return 'bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 border border-yellow-500'; // Gold-ish
    if (award?.level === 'runner_up') return 'bg-neutral-300 text-neutral-800 dark:bg-neutral-500 dark:text-neutral-100 border border-neutral-400'; // Silver-ish
    if (award?.level === 'second_runner_up') return 'bg-orange-300 text-orange-800 dark:bg-orange-600 dark:text-orange-100 border border-orange-400'; // Bronze-ish
    return 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100'; // General success
  }
  if (lowerStatus.includes('pending_review') || lowerStatus.includes('judging') || lowerStatus.includes('awaiting_award_decision') || lowerStatus.includes('pending_stage_assignment') || lowerStatus === 'pending_approval') {
    return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100'; 
  }
  if (lowerStatus.includes('finalist')) { // For finalist_awaiting_award_decision
     return 'bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100';
  }
   if (lowerStatus === 'archived') {
     return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100';
  }
  
  return 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100'; 
};
