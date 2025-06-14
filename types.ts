
export enum UserRole {
  Admin = 'admin',
  Participant = 'participant',
  Judge = 'judge',
  Public = 'public',
}

export interface Timeline {
  startDate: string;
  endDate: string;
  submissionDeadline: string;
}

export interface LandingPageContent {
  heroImage: string;
  aboutText: string;
}

export interface SubmissionQuestion {
  id: string;
  questionText: string;
  type: 'text' | 'textarea' | 'url';
  isRequired: boolean;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface JudgingRound {
  roundNumber: number;
  criteria: JudgingCriterion[];
}

export interface JudgeAssignment {
  judgeId: string; 
  roundNumber: number;
}

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
}

export interface HackathonEvent {
  id: string;
  title: string;
  description: string;
  rules: string;
  timeline: Timeline;
  landingPageContent: LandingPageContent;
  acceptingSubmissions: boolean;
  currentJudgingRound: number; // 0 if not started, 1 for Round 1, etc., -1 for completed/archived
  submissionQuestions: SubmissionQuestion[];
  judgingRounds: JudgingRound[];
  judges: JudgeAssignment[]; 
  problemStatements: ProblemStatement[];
  prizes: string[];
  creatorEmail?: string; // Optional: email of the admin who created it
}

export interface ParticipantInfo {
  name: string;
  email: string;
  teamName?: string;
}

export interface SubmissionAnswer {
  questionId: string;
  answer: string;
}

export type SubmissionStatus =
  | 'submitted'
  | 'round1_judging'
  | 'round2_judging'
  | 'round3_judging' // Added
  | 'round4_judging' // Added
  | 'round5_judging' // Added
  | 'rejected'
  | 'selected_for_next_round'
  | 'finalist'
  | 'runner_up'
  | 'second_runner_up'
  | 'winner'
  | 'disqualified'; // Explicit status for disqualification

export const ALL_SUBMISSION_STATUSES: SubmissionStatus[] = [
  'submitted',
  'round1_judging',
  'round2_judging',
  'round3_judging',
  'round4_judging',
  'round5_judging',
  'selected_for_next_round',
  'rejected',
  'disqualified',
  'finalist',
  'runner_up',
  'second_runner_up',
  'winner'
];

export const JUDGING_ROUND_STATUSES: SubmissionStatus[] = [
    'round1_judging',
    'round2_judging',
    'round3_judging',
    'round4_judging',
    'round5_judging',
];


export interface JudgementScore {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface Judgement {
  submissionId: string;
  judgeId: string; 
  roundNumber: number;
  scores: JudgementScore[];
  overallComment: string;
  totalScore: number;
  judgedAt: string; 
}

export interface ProjectSubmission {
  id: string;
  hackathonId: string;
  participantInfo: ParticipantInfo;
  problemStatementId?: string; 
  projectName: string;
  projectRepoUrl: string;
  projectDemoUrl: string;
  answers: SubmissionAnswer[];
  status: SubmissionStatus;
  submittedAt: string; 
  judgements: Judgement[]; 
}

export interface AIAssistanceTopic {
  id: string;
  title: string;
  prompt: string;
}

// For demo hackathon creation
export type DemoStageType = 
  | 'upcoming' 
  | 'acceptingSubmissions' 
  | 'judgingRound1' 
  | 'judgingRound2' 
  | 'winnersAnnounced' 
  | 'concluded';
