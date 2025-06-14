
import { HackathonEvent, ProjectSubmission, SubmissionQuestion, JudgingRound, JudgingCriterion, Judgement, UserRole, JudgeAssignment, SubmissionStatus, Timeline, LandingPageContent, ProblemStatement, DemoStageType, JUDGING_ROUND_STATUSES } from '../types';
import { DEFAULT_HERO_IMAGE, DEMO_JUDGE_1_EMAIL, DEMO_JUDGE_2_EMAIL, DEMO_PARTICIPANT_1_EMAIL, DEMO_PARTICIPANT_2_EMAIL, DEMO_ADMIN_EMAIL, HACKATHON_ID_ACCEPTING, HACKATHON_ID_CONCLUDED, HACKATHON_ID_JUDGING1, HACKATHON_ID_JUDGING2, HACKATHON_ID_UPCOMING, HACKATHON_ID_WINNERS_ANNOUNCED, HACKATHON_EVENTS_MAP_KEY, PROJECT_SUBMISSIONS_MAP_KEY } from '../constants';

const createId = (): string => Math.random().toString(36).substr(2, 9);

// --- Multi-Hackathon Storage ---
const getHackathonEventsMap = (): Map<string, HackathonEvent> => {
  const data = localStorage.getItem(HACKATHON_EVENTS_MAP_KEY);
  return data ? new Map(JSON.parse(data)) : new Map();
};

const saveHackathonEventsMap = (map: Map<string, HackathonEvent>): void => {
  localStorage.setItem(HACKATHON_EVENTS_MAP_KEY, JSON.stringify(Array.from(map.entries())));
};

const getProjectSubmissionsMap = (): Map<string, ProjectSubmission[]> => {
  const data = localStorage.getItem(PROJECT_SUBMISSIONS_MAP_KEY);
  return data ? new Map(JSON.parse(data)) : new Map();
};

const saveProjectSubmissionsMap = (map: Map<string, ProjectSubmission[]>): void => {
  localStorage.setItem(PROJECT_SUBMISSIONS_MAP_KEY, JSON.stringify(Array.from(map.entries())));
};


// --- Demo Data Generation ---
const createDemoHackathonEvent = (id: string, title: string, stage: DemoStageType, creator: string): HackathonEvent => {
  const now = new Date();
  let timeline: Timeline;
  let acceptingSubmissions = false;
  let currentJudgingRound = 0;
  
  const problemStatement1Id = `${id}-ps1-${createId()}`;
  const problemStatement2Id = `${id}-ps2-${createId()}`;

  const defaultProblemStatements: ProblemStatement[] = [
    { id: problemStatement1Id, title: `Sustainable Living (${title})`, description: 'Build a solution that promotes eco-friendly practices in cities.' },
    { id: problemStatement2Id, title: `Remote Work Future (${title})`, description: 'Develop a tool to enhance collaboration for distributed teams.' },
  ];
  const defaultSubmissionQuestions: SubmissionQuestion[] = [
      { id: `${id}-sq1-${createId()}`, questionText: 'Problem Description', type: 'textarea', isRequired: true },
      { id: `${id}-sq2-${createId()}`, questionText: 'Solution Explained', type: 'textarea', isRequired: true },
      { id: `${id}-sq3-${createId()}`, questionText: 'Technologies Used', type: 'text', isRequired: true },
      { id: `${id}-sq4-${createId()}`, questionText: 'Video Demo URL', type: 'url', isRequired: false },
  ];
  const defaultJudgingRounds: JudgingRound[] = [
      { roundNumber: 1, criteria: [
          { id: `${id}-jc1r1-${createId()}`, name: 'Innovation (R1)', description: 'Novelty of idea.', maxScore: 25 },
          { id: `${id}-jc2r1-${createId()}`, name: 'Feasibility (R1)', description: 'Technical approach.', maxScore: 30 },
      ]},
      { roundNumber: 2, criteria: [
          { id: `${id}-jc1r2-${createId()}`, name: 'Execution (R2)', description: 'Prototype quality.', maxScore: 35 },
          { id: `${id}-jc2r2-${createId()}`, name: 'UX/Design (R2)', description: 'User experience.', maxScore: 30 },
      ]}
  ];
   const defaultJudges: JudgeAssignment[] = [
      { judgeId: DEMO_JUDGE_1_EMAIL, roundNumber: 1 },
      { judgeId: DEMO_JUDGE_2_EMAIL, roundNumber: 2 },
   ];
   const defaultPrizes: string[] = ["🏆 1st: $1000", "🥈 2nd: $500", "🥉 3rd: $250"];


  switch (stage) {
    case 'upcoming':
      timeline = {
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissionDeadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      };
      break;
    case 'acceptingSubmissions':
      acceptingSubmissions = true;
      timeline = {
        startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissionDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
      break;
    case 'judgingRound1':
      currentJudgingRound = 1;
      timeline = {
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissionDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
      break;
    case 'judgingRound2':
      currentJudgingRound = 2;
      timeline = {
        startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(now.getTime() + 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissionDeadline: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      };
      break;
    case 'winnersAnnounced':
    case 'concluded':
      currentJudgingRound = -1; // Indicates judging is complete
      timeline = {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submissionDeadline: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      };
      break;
  }

  return {
    id, title, creatorEmail: creator,
    description: `This is the "${title}" demo hackathon, currently in the '${stage}' stage. Explore its features!`,
    rules: 'Standard demo hackathon rules apply. Be creative and have fun!',
    timeline, acceptingSubmissions, currentJudgingRound,
    problemStatements: defaultProblemStatements,
    submissionQuestions: defaultSubmissionQuestions,
    judgingRounds: defaultJudgingRounds,
    judges: defaultJudges,
    prizes: defaultPrizes,
    landingPageContent: { heroImage: DEFAULT_HERO_IMAGE, aboutText: `About the "${title}" demo event...` }
  };
};

const createDemoSubmissionsForEvent = (event: HackathonEvent): ProjectSubmission[] => {
    const submissions: ProjectSubmission[] = [];
    if (event.problemStatements.length === 0 || event.submissionQuestions.length === 0) return submissions;

    const p1Answers = event.submissionQuestions.map(q => ({questionId: q.id, answer: `P1 Answer for ${q.questionText.substring(0,10)}...`}));
    const p2Answers = event.submissionQuestions.map(q => ({questionId: q.id, answer: `P2 Answer for ${q.questionText.substring(0,10)}...`}));

    const sub1: ProjectSubmission = {
        id: `${event.id}-sub1-${createId()}`, hackathonId: event.id,
        participantInfo: { name: "Demo Participant One", email: DEMO_PARTICIPANT_1_EMAIL, teamName: "Eco Warriors" },
        problemStatementId: event.problemStatements[0]?.id,
        projectName: `GreenCity Nav (${event.title.substring(0,5)})`,
        projectRepoUrl: "https://github.com/example/greencity", projectDemoUrl: "https://youtu.be/dQw4w9WgXcQ",
        answers: p1Answers, status: 'submitted', submittedAt: new Date(Date.now() - 1*24*60*60*1000).toISOString(), judgements: []
    };
    const sub2: ProjectSubmission = {
        id: `${event.id}-sub2-${createId()}`, hackathonId: event.id,
        participantInfo: { name: "Demo Participant Two", email: DEMO_PARTICIPANT_2_EMAIL, teamName: "Remote Innovators" },
        problemStatementId: event.problemStatements[1]?.id,
        projectName: `ConnectSphere (${event.title.substring(0,5)})`,
        projectRepoUrl: "https://github.com/example/connectsphere", projectDemoUrl: "https://youtu.be/VIDEO_ID_HERE",
        answers: p2Answers, status: 'submitted', submittedAt: new Date().toISOString(), judgements: []
    };
    
    // Adjust statuses based on event stage
    if (event.currentJudgingRound === 1 || event.id.includes('judging1')) {
        sub1.status = 'round1_judging';
        sub2.status = 'round1_judging';
    }
    if (event.currentJudgingRound === 2 || event.id.includes('judging2')) {
        sub1.status = 'round2_judging';
        sub2.status = 'selected_for_next_round'; // So P2 can be in R2
    }
    if (event.id.includes('winners')) {
        sub1.status = 'winner';
        sub2.status = 'runner_up';
    }
     if (event.id.includes('concluded') && !event.id.includes('winners')) { // Concluded but no winners set yet
        sub1.status = 'finalist'; 
        sub2.status = 'finalist';
    }


    return [sub1, sub2];
};


export const initializeMockData = (): void => {
  const eventsMap = getHackathonEventsMap();
  const submissionsMap = getProjectSubmissionsMap();

  if (eventsMap.size === 0) { // Only initialize if completely empty
    const demoHackathons: HackathonEvent[] = [
      createDemoHackathonEvent(HACKATHON_ID_UPCOMING, "Future Innovators Meet", 'upcoming', DEMO_ADMIN_EMAIL),
      createDemoHackathonEvent(HACKATHON_ID_ACCEPTING, "CodeSprint Challenge", 'acceptingSubmissions', DEMO_ADMIN_EMAIL),
      createDemoHackathonEvent(HACKATHON_ID_JUDGING1, "AI Frontiers Hack", 'judgingRound1', DEMO_ADMIN_EMAIL),
      createDemoHackathonEvent(HACKATHON_ID_JUDGING2, "Data Dive 2024", 'judgingRound2', DEMO_ADMIN_EMAIL),
      createDemoHackathonEvent(HACKATHON_ID_WINNERS_ANNOUNCED, "Global Impact Hack", 'winnersAnnounced', DEMO_ADMIN_EMAIL),
      createDemoHackathonEvent(HACKATHON_ID_CONCLUDED, "Retro Code Jam", 'concluded', DEMO_ADMIN_EMAIL),
    ];

    demoHackathons.forEach(event => {
      eventsMap.set(event.id, event);
      const demoSubmissions = createDemoSubmissionsForEvent(event);
      submissionsMap.set(event.id, demoSubmissions);
    });

    saveHackathonEventsMap(eventsMap);
    saveProjectSubmissionsMap(submissionsMap);
  }
};
initializeMockData(); // Ensure it runs on module load

// --- Core Hackathon Event Management ---
export const createBlankHackathonEvent = (adminEmail: string, title: string): HackathonEvent => {
  const newId = `hack-${createId()}`;
  return {
    id: newId,
    title: title || `New Hackathon ${newId.substring(0,4)}`,
    creatorEmail: adminEmail,
    description: "Exciting new hackathon event!",
    rules: "1. Be creative!\n2. Submit on time.\n3. Have fun!",
    timeline: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submissionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    landingPageContent: { heroImage: DEFAULT_HERO_IMAGE, aboutText: "More details coming soon." },
    acceptingSubmissions: false,
    currentJudgingRound: 0,
    submissionQuestions: [],
    judgingRounds: [],
    judges: [],
    problemStatements: [],
    prizes: ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"],
  };
};

export const saveNewHackathonEvent = (event: HackathonEvent): HackathonEvent => {
  const eventsMap = getHackathonEventsMap();
  if (eventsMap.has(event.id)) {
    throw new Error(`Hackathon with ID ${event.id} already exists.`);
  }
  eventsMap.set(event.id, event);
  saveHackathonEventsMap(eventsMap);
  // Initialize empty submissions array for the new hackathon
  const submissionsMap = getProjectSubmissionsMap();
  submissionsMap.set(event.id, []);
  saveProjectSubmissionsMap(submissionsMap);
  return event;
};

export const getAllHackathonEvents = (): HackathonEvent[] => {
  const eventsMap = getHackathonEventsMap();
  return Array.from(eventsMap.values());
};

export const getHackathonEventById = (id: string): HackathonEvent | null => {
  const eventsMap = getHackathonEventsMap();
  return eventsMap.get(id) || null;
};

export const updateHackathonEvent = (hackathonId: string, updatedEventData: Partial<HackathonEvent>): HackathonEvent => {
  const eventsMap = getHackathonEventsMap();
  const currentEvent = eventsMap.get(hackathonId);
  if (!currentEvent) throw new Error(`Hackathon with ID ${hackathonId} not found for update.`);
  
  const fullyUpdatedEvent: HackathonEvent = {
    ...currentEvent,
    ...updatedEventData,
    // Ensure nested objects are properly merged if they are part of updatedEventData
    timeline: updatedEventData.timeline ? { ...currentEvent.timeline, ...updatedEventData.timeline } : currentEvent.timeline,
    landingPageContent: updatedEventData.landingPageContent ? { ...currentEvent.landingPageContent, ...updatedEventData.landingPageContent } : currentEvent.landingPageContent,
  };

  eventsMap.set(hackathonId, fullyUpdatedEvent);
  saveHackathonEventsMap(eventsMap);
  return fullyUpdatedEvent;
};

// --- Sub-Entities Management (Problem Statements, Questions, Criteria, Judges) ---
// These functions now operate on a specific hackathon via hackathonId

export const addProblemStatement = (hackathonId: string, statement: Omit<ProblemStatement, 'id'>): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const newStatement: ProblemStatement = { ...statement, id: createId() };
  event.problemStatements.push(newStatement);
  return updateHackathonEvent(hackathonId, event);
};

export const updateProblemStatement = (hackathonId: string, updatedStatement: ProblemStatement): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  event.problemStatements = event.problemStatements.map(ps => ps.id === updatedStatement.id ? updatedStatement : ps);
  return updateHackathonEvent(hackathonId, event);
};

export const deleteProblemStatement = (hackathonId: string, statementId: string): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  event.problemStatements = event.problemStatements.filter(ps => ps.id !== statementId);
  return updateHackathonEvent(hackathonId, event);
};

export const addSubmissionQuestion = (hackathonId: string, question: Omit<SubmissionQuestion, 'id'>): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const newQuestion: SubmissionQuestion = { ...question, id: createId() };
  event.submissionQuestions.push(newQuestion);
  return updateHackathonEvent(hackathonId, event);
};

export const updateSubmissionQuestion = (hackathonId: string, updatedQuestion: SubmissionQuestion): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  event.submissionQuestions = event.submissionQuestions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
  return updateHackathonEvent(hackathonId, event);
};

export const deleteSubmissionQuestion = (hackathonId: string, questionId: string): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  event.submissionQuestions = event.submissionQuestions.filter(q => q.id !== questionId);
  return updateHackathonEvent(hackathonId, event);
};

export const addJudgingCriterion = (hackathonId: string, roundNumber: number, criterion: Omit<JudgingCriterion, 'id'>): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const round = event.judgingRounds.find(r => r.roundNumber === roundNumber);
  if (!round) {
    const newRound: JudgingRound = { roundNumber, criteria: [{...criterion, id: createId()}] };
    event.judgingRounds.push(newRound);
    event.judgingRounds.sort((a,b) => a.roundNumber - b.roundNumber);
  } else {
    round.criteria.push({ ...criterion, id: createId() });
  }
  return updateHackathonEvent(hackathonId, event);
};

export const updateJudgingCriterion = (hackathonId: string, roundNumber: number, updatedCriterion: JudgingCriterion): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const round = event.judgingRounds.find(r => r.roundNumber === roundNumber);
  if (round) {
    round.criteria = round.criteria.map(c => c.id === updatedCriterion.id ? updatedCriterion : c);
  }
  return updateHackathonEvent(hackathonId, event);
};

export const deleteJudgingCriterion = (hackathonId: string, roundNumber: number, criterionId: string): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const round = event.judgingRounds.find(r => r.roundNumber === roundNumber);
  if (round) {
    round.criteria = round.criteria.filter(c => c.id !== criterionId);
  }
  return updateHackathonEvent(hackathonId, event);
};

export const addJudgingRound = (hackathonId: string): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  const nextRoundNumber = event.judgingRounds.length > 0 ? Math.max(...event.judgingRounds.map(r => r.roundNumber)) + 1 : 1;
  event.judgingRounds.push({ roundNumber: nextRoundNumber, criteria: [] });
  event.judgingRounds.sort((a,b) => a.roundNumber - b.roundNumber);
  return updateHackathonEvent(hackathonId, event);
};

export const assignJudgeToRound = (hackathonId: string, judgeId: string, roundNumber: number): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  if (!event.judges.find(j => j.judgeId === judgeId && j.roundNumber === roundNumber)) {
    event.judges.push({ judgeId, roundNumber });
  }
  return updateHackathonEvent(hackathonId, event);
};

export const removeJudgeFromRound = (hackathonId: string, judgeId: string, roundNumber: number): HackathonEvent => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error("Hackathon event not found");
  event.judges = event.judges.filter(j => !(j.judgeId === judgeId && j.roundNumber === roundNumber));
  return updateHackathonEvent(hackathonId, event);
};

// --- Project Submissions Management ---
export const getSubmissionsByHackathonId = (hackathonId: string, filterByStatus?: SubmissionStatus): ProjectSubmission[] => {
  const submissionsMap = getProjectSubmissionsMap();
  let submissions = submissionsMap.get(hackathonId) || [];
  if (filterByStatus) {
    submissions = submissions.filter(s => s.status === filterByStatus);
  }
  return submissions;
};

export const getSubmissionById = (submissionId: string, hackathonId: string): ProjectSubmission | undefined => {
  const submissionsMap = getProjectSubmissionsMap();
  const hackathonSubmissions = submissionsMap.get(hackathonId) || [];
  return hackathonSubmissions.find(s => s.id === submissionId);
};

export const submitProject = (hackathonId: string, submissionData: Omit<ProjectSubmission, 'id' | 'submittedAt' | 'status' | 'judgements' | 'hackathonId'>): ProjectSubmission => {
  const event = getHackathonEventById(hackathonId);
  if (!event) throw new Error(`Hackathon with ID ${hackathonId} not found, cannot submit project.`);

  const submissionsMap = getProjectSubmissionsMap();
  const hackathonSubmissions = submissionsMap.get(hackathonId) || [];

  const newSubmission: ProjectSubmission = {
    ...submissionData,
    id: createId(),
    hackathonId: hackathonId,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    judgements: [],
  };
  hackathonSubmissions.push(newSubmission);
  submissionsMap.set(hackathonId, hackathonSubmissions);
  saveProjectSubmissionsMap(submissionsMap);
  return newSubmission;
};

export const updateSubmissionStatus = (hackathonId: string, submissionId: string, newStatus: SubmissionStatus): ProjectSubmission | undefined => {
  const submissionsMap = getProjectSubmissionsMap();
  const hackathonSubmissions = submissionsMap.get(hackathonId) || [];
  const submissionIndex = hackathonSubmissions.findIndex(s => s.id === submissionId);

  if (submissionIndex > -1) {
    hackathonSubmissions[submissionIndex].status = newStatus;
    submissionsMap.set(hackathonId, hackathonSubmissions);
    saveProjectSubmissionsMap(submissionsMap);
    alert(`Participant notified: Submission "${hackathonSubmissions[submissionIndex].projectName}" status changed to ${newStatus}.`);
    return hackathonSubmissions[submissionIndex];
  }
  return undefined;
};

export const getParticipantSubmissions = (participantEmail: string, hackathonId: string): ProjectSubmission[] => {
  const submissionsMap = getProjectSubmissionsMap();
  const hackathonSubmissions = submissionsMap.get(hackathonId) || [];
  return hackathonSubmissions.filter(s => s.participantInfo.email === participantEmail);
};

// --- Judging Process ---
export const getAssignedSubmissionsForJudge = (judgeId: string, roundNumber: number, hackathonId: string): ProjectSubmission[] => {
  const event = getHackathonEventById(hackathonId);
  if (!event || roundNumber <= 0) return [];

  const isJudgeAssigned = event.judges.some(j => j.judgeId === judgeId && j.roundNumber === roundNumber);
  if (!isJudgeAssigned) return [];

  const submissionsForHackathon = getSubmissionsByHackathonId(hackathonId);
  const targetJudgingStatus = `round${roundNumber}_judging` as SubmissionStatus;
  
  // Submissions eligible for this round's judging
  let eligibleSubmissions = submissionsForHackathon.filter(s => s.status === targetJudgingStatus);

  // If Round 1, also include 'submitted' projects if currentJudgingRound matches
  if (roundNumber === 1 && event.currentJudgingRound === 1) {
    const submittedProjects = submissionsForHackathon.filter(s => s.status === 'submitted');
    eligibleSubmissions = [...new Set([...eligibleSubmissions, ...submittedProjects])]; // Avoid duplicates
  }
  
  return eligibleSubmissions.filter(s => 
    !s.judgements.some(j => j.judgeId === judgeId && j.roundNumber === roundNumber)
  );
};

export const saveJudgement = (hackathonId: string, judgementData: Judgement): ProjectSubmission | undefined => {
  const submissionsMap = getProjectSubmissionsMap();
  const hackathonSubmissions = submissionsMap.get(hackathonId) || [];
  const submissionIndex = hackathonSubmissions.findIndex(s => s.id === judgementData.submissionId);

  if (submissionIndex > -1) {
    const submission = hackathonSubmissions[submissionIndex];
    submission.judgements = submission.judgements.filter(
      j => !(j.judgeId === judgementData.judgeId && j.roundNumber === judgementData.roundNumber)
    );
    submission.judgements.push(judgementData);
    submissionsMap.set(hackathonId, hackathonSubmissions);
    saveProjectSubmissionsMap(submissionsMap);
    return submission;
  }
  return undefined;
};

// --- Stage Management ---
export const transitionSubmissionsToRound = (hackathonId: string, targetRoundNumber: number): HackathonEvent => {
    const event = getHackathonEventById(hackathonId);
    if (!event) throw new Error("Hackathon event not found for transitioning submissions.");

    const submissionsMap = getProjectSubmissionsMap();
    let hackathonSubmissions = submissionsMap.get(hackathonId) || [];
    const newStatusForRound = `round${targetRoundNumber}_judging` as SubmissionStatus;

    if (!JUDGING_ROUND_STATUSES.includes(newStatusForRound)) {
        console.warn(`Status ${newStatusForRound} is not a recognized judging round status.`);
        // return event; // Or throw error
    }

    let changedCount = 0;
    hackathonSubmissions = hackathonSubmissions.map(sub => {
        let shouldTransition = false;
        if (targetRoundNumber === 1 && sub.status === 'submitted') {
            shouldTransition = true;
        } else if (targetRoundNumber > 1 && sub.status === 'selected_for_next_round') {
            shouldTransition = true;
        }
        
        if (shouldTransition) {
            sub.status = newStatusForRound;
            changedCount++;
        }
        return sub;
    });

    submissionsMap.set(hackathonId, hackathonSubmissions);
    saveProjectSubmissionsMap(submissionsMap);
    
    if (changedCount > 0) {
        alert(`${changedCount} submissions transitioned to Round ${targetRoundNumber} judging.`);
    } else {
        alert(`No submissions were eligible for transition to Round ${targetRoundNumber} judging.`);
    }
    // Update the event's currentJudgingRound if it's not already set
    if (event.currentJudgingRound !== targetRoundNumber) {
        event.currentJudgingRound = targetRoundNumber;
        return updateHackathonEvent(hackathonId, { currentJudgingRound: targetRoundNumber });
    }
    return event;
};

export const updateHackathonStageSettings = (hackathonId: string, settings: { acceptingSubmissions?: boolean; currentJudgingRound?: number }): HackathonEvent => {
    const event = getHackathonEventById(hackathonId);
    if (!event) throw new Error("Hackathon event not found for updating stage settings.");
    
    let updated = false;
    if (settings.acceptingSubmissions !== undefined && event.acceptingSubmissions !== settings.acceptingSubmissions) {
        event.acceptingSubmissions = settings.acceptingSubmissions;
        updated = true;
    }
    if (settings.currentJudgingRound !== undefined && event.currentJudgingRound !== settings.currentJudgingRound) {
        event.currentJudgingRound = settings.currentJudgingRound;
        updated = true;
        // If setting currentJudgingRound to 0, it means either prep or post-judging.
        // If opening submissions, currentJudgingRound should typically be 0.
        if (settings.currentJudgingRound === 0 && settings.acceptingSubmissions) {
            event.acceptingSubmissions = true; // Ensure consistency
        }
    }
    if (updated) {
        return updateHackathonEvent(hackathonId, event);
    }
    return event;
};
