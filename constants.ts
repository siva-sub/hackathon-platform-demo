
import { AIAssistanceTopic, ALL_SUBMISSION_STATUSES as ALL_STATUSES_ARRAY } from './types'; // Import the array directly

export const APP_NAME = "Hackathon Platform";
export const DEFAULT_HERO_IMAGE = "https://picsum.photos/1200/400";

// Define a new constant by spreading the imported array
export const ALL_SUBMISSION_STATUSES = [...ALL_STATUSES_ARRAY];


export const HACKATHON_EVENTS_MAP_KEY = 'hackathonEventsMap';
export const PROJECT_SUBMISSIONS_MAP_KEY = 'projectSubmissionsMap';


export const AI_ASSISTANCE_TOPICS: AIAssistanceTopic[] = [
  {
    id: 'judging_criteria',
    title: 'Tips for Designing Judging Criteria',
    prompt: 'Provide actionable best practices for designing clear, fair, and effective judging criteria for a software development hackathon. Focus on aspects like objectivity, relevance to hackathon goals, and clarity for judges.'
  },
  {
    id: 'landing_page',
    title: 'Tips for Creating Engaging Public Pages',
    prompt: 'Suggest key elements and content strategies for creating an engaging public landing page for a hackathon. What information is crucial, and how can it be presented to attract participants?'
  },
  {
    id: 'submission_questions',
    title: 'Tips for Writing Effective Submission Questions',
    prompt: 'What are some best practices for writing submission questions for a hackathon? The questions should help judges understand the project and evaluate it effectively. Provide examples for different types of information needed (e.g., problem, solution, tech stack).'
  },
  {
    id: 'participant_engagement',
    title: 'Tips for Increasing Participant Engagement',
    prompt: 'Provide strategies and tips for hackathon organizers to increase participant engagement before, during, and after the event.'
  },
];

export const DEMO_JUDGE_1_EMAIL = "judge1@example.com";
export const DEMO_JUDGE_2_EMAIL = "judge2@example.com";
export const DEMO_PARTICIPANT_1_EMAIL = "participant1@example.com";
export const DEMO_PARTICIPANT_2_EMAIL = "participant2@example.com";
export const DEMO_ADMIN_EMAIL = "admin@example.com";
export const DEMO_PUBLIC_USER_EMAIL = "public@example.com";

export const MOCK_JUDGE_EMAILS = [
  DEMO_JUDGE_1_EMAIL,
  DEMO_JUDGE_2_EMAIL,
  "judge3@example.com",
  "judge4@example.com",
];

// IDs for Demo Hackathons
export const HACKATHON_ID_UPCOMING = 'demo-hackathon-upcoming';
export const HACKATHON_ID_ACCEPTING = 'demo-hackathon-accepting';
export const HACKATHON_ID_JUDGING1 = 'demo-hackathon-judging1';
export const HACKATHON_ID_JUDGING2 = 'demo-hackathon-judging2';
export const HACKATHON_ID_WINNERS_ANNOUNCED = 'demo-hackathon-winners';
export const HACKATHON_ID_CONCLUDED = 'demo-hackathon-concluded';

export const MOCK_AI_RESPONSES: Record<string, string> = {
  [AI_ASSISTANCE_TOPICS.find(t => t.id === 'judging_criteria')?.prompt || 'judging_criteria_prompt']: `
Mock AI Response: Best Practices for Judging Criteria
----------------------------------------------------
1.  **Clarity & Specificity:** Criteria should be unambiguous. Instead of "Good Design," use "User Interface (UI) intuitiveness and visual appeal."
2.  **Relevance:** Align criteria with the hackathon's theme and goals. If it's an AI hackathon, "Innovative Use of AI" should be a key criterion.
3.  **Measurability:** While some aspects are subjective, try to make them as measurable as possible. Provide rubrics or examples.
4.  **Weighting:** Assign different weights to criteria based on importance. Technical execution might be weighted more than presentation in some hackathons.
5.  **Simplicity:** Avoid too many criteria. 4-6 well-defined criteria are usually sufficient per round.
6.  **Judge Training:** Ensure judges understand each criterion and how to apply scoring consistently.
    Example: For 'Innovation', consider: Is the idea new? Does it solve a problem in a unique way? Is it a significant improvement over existing solutions?
  `,
  [AI_ASSISTANCE_TOPICS.find(t => t.id === 'landing_page')?.prompt || 'landing_page_prompt']: `
Mock AI Response: Tips for Engaging Public Pages
-----------------------------------------------
1.  **Compelling Hero Section:** Eye-catching visuals, clear hackathon title, and a concise value proposition.
2.  **Key Information Upfront:** Dates, location (if any), theme, and a clear Call to Action (CTA) like "Register Now!".
3.  **Detailed "About" Section:** Explain the mission, goals, and what makes this hackathon unique.
4.  **Rules & Eligibility:** Clearly outline who can participate and the core rules.
5.  **Prizes & Sponsors:** Showcase what participants can win and acknowledge supporters.
6.  **Schedule/Timeline:** Provide a clear timeline of events.
7.  **Problem Statements/Themes:** Detail the challenges participants will tackle.
8.  **FAQ Section:** Address common questions proactively.
9.  **Mobile Responsiveness:** Ensure the page looks great on all devices.
10. **Past Event Showcase (if applicable):** Photos, winning projects to build credibility.
  `,
  [AI_ASSISTANCE_TOPICS.find(t => t.id === 'submission_questions')?.prompt || 'submission_questions_prompt']: `
Mock AI Response: Writing Effective Submission Questions
------------------------------------------------------
1.  **Purpose-Driven:** Each question should aim to extract specific information needed for evaluation.
2.  **Clarity:** Use simple language. Avoid jargon unless it's standard for the target audience.
3.  **Open-Ended (but focused):** Encourage detailed answers, e.g., "Describe the technical challenges you faced and how you overcame them."
4.  **Cover Key Areas:**
    *   **Problem:** "What specific problem does your project address?"
    *   **Solution:** "How does your project solve this problem? Explain its core functionality."
    *   **Innovation:** "What is unique or innovative about your approach?"
    *   **Tech Stack:** "What key technologies, frameworks, and APIs did you use?"
    *   **Feasibility/Impact:** "What is the potential impact of your project? How could it be developed further?"
    *   **Demo Link:** Crucial for judges.
5.  **Indicate Required vs. Optional:** Use sparingly, but mark truly essential questions.
6.  **Logical Flow:** Order questions in a way that tells a story about the project.
  `,
   [AI_ASSISTANCE_TOPICS.find(t => t.id === 'participant_engagement')?.prompt || 'participant_engagement_prompt']: `
Mock AI Response: Increasing Participant Engagement
--------------------------------------------------
**Before the Hackathon:**
1.  **Clear Communication:** Regular updates via email, social media. Build hype with speaker announcements, theme reveals.
2.  **Workshops/Webinars:** Offer pre-event sessions on relevant technologies or ideation.
3.  **Team Formation Support:** Create channels (Discord, Slack) or events for individuals to find teams.
4.  **Engaging Content:** Share articles, tips, or success stories related to the hackathon theme.

**During the Hackathon:**
1.  **Kick-off Event:** Make it energetic and informative.
2.  **Mentorship:** Provide access to experienced mentors. Schedule check-ins.
3.  **Mini-Challenges/Side Events:** Fun, short activities with small prizes to keep energy up (e.g., best meme, best 60-sec pitch).
4.  **Active Communication Channels:** Use Discord/Slack for announcements, Q&A, and fostering community.
5.  **Food & Fun:** If in-person, good food and break activities are key. For virtual, consider online games or virtual social rooms.
6.  **Regular Check-ins:** Organizers or mentors can briefly check on teams' progress and morale.

**After the Hackathon:**
1.  **Prompt Feedback:** Share judging feedback with participants if possible.
2.  **Showcase Winners & Projects:** Publicly highlight successful projects on your website/social media.
3.  **Community Building:** Create an alumni group or newsletter to keep participants connected for future events or opportunities.
4.  **Surveys:** Gather feedback to improve future hackathons.
5.  **Share Resources:** If applicable, share slides from talks, or links to further learning.
  `,
};
