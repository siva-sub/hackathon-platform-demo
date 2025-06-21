export type UserRole = 'admin' | 'participant' | 'judge' | 'superadmin' | null;

export interface CurrentUser {
  role: UserRole;
  email: string | null;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'url';
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
}

export interface HackathonStage {
  id: string;
  name: string;
  order: number; // For sequencing stages
  description: string;
  judgingCriteria: MatrixCriterion[];
  assignedJudgeEmails: string[]; 
}

export interface OpenGraphConfig {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string; // URL to the image
  ogType?: string; // e.g., 'website', 'article'
  ogUrl?: string; // Canonical URL for the page
}

export interface EventSchemaLocation {
  '@type': 'Place' | 'VirtualLocation';
  name: string;
  address?: string; // Optional for Place, can be simple text like "123 Main St, Anytown, USA"
}

export interface EventSchemaOrganizer {
  '@type': 'Organization' | 'Person';
  name: string;
  url?: string;
}

export interface EventSchema {
  '@context': 'https://schema.org';
  '@type': 'Event'; 
  name?: string;
  description?: string;
  startDate?: string; // ISO 8601 YYYY-MM-DDTHH:mm
  endDate?: string;   // ISO 8601 YYYY-MM-DDTHH:mm
  eventStatus?: 'EventScheduled' | 'EventRescheduled' | 'EventPostponed' | 'EventCancelled' | 'EventCompleted';
  eventAttendanceMode?: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
  location?: EventSchemaLocation;
  image?: string; // Single image URL, can use ogImage
  organizer?: EventSchemaOrganizer;
  url?: string; // URL of the event page, can use ogUrl
}


export interface HackathonQuestion {
  id: string;
  hackathonId: string; 
  questionText: string;
  askedByParticipantName: string;
  askedByParticipantEmail?: string; 
  askedAt: string; // ISO date string
  answerText?: string;
  answeredByAdminEmail?: string;
  answeredAt?: string; // ISO date string
}

export type HackathonApprovalStatus = 'pending_approval' | 'approved' | 'declined' | 'archived';

// Winner Configuration Types
export type WinnerScope = 'overall' | 'per_problem_statement';
export type AwardLevel = 'winner' | 'runner_up' | 'second_runner_up';

export interface AwardCategory {
  id: string; // 'overall' or ProblemStatement.id
  name: string; // 'Overall Event' or ProblemStatement.title
  allowedLevels: AwardLevel[]; 
}

export interface WinnerConfiguration {
  scope: WinnerScope;
  awardCategories: AwardCategory[];
}

export interface Award {
  categoryId: string; // 'overall' or ProblemStatement.id
  categoryName: string; // 'Overall Event' or ProblemStatement.title at the time of award
  level: AwardLevel;
  awardedAt: string; // ISO date string
  awardedBy: string; // Admin/SuperAdmin email
}

export interface HackathonData {
  title: string;
  description: string;
  rules: string;
  timeline: string;
  publicPageContent: {
    heroTitle: string;
    heroSubtitle: string;
    aboutSection: string;
    imageUrl: string;
  };
  submissionQuestions: Question[];
  problemStatements: ProblemStatement[];
  stages: HackathonStage[];
  currentStageId: string | null;
  isAcceptingSubmissions: boolean;
  ogConfig: OpenGraphConfig; 
  schemaConfig?: EventSchema; // New field for Schema.org Event data
  questions: HackathonQuestion[];
  adminEmails: string[]; 
  status: HackathonApprovalStatus;
  createdByAdminEmail?: string; 
  approvedBySuperAdminEmail?: string;
  approvedAt?: string; 
  declinedBySuperAdminEmail?: string;
  declinedAt?: string; 
  declineReason?: string;
  winnerConfiguration: WinnerConfiguration; // New field
}

export interface Hackathon {
  id: string;
  data: HackathonData;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string;
}

export type SubmissionStatus = string; // e.g. "s_stageId_pending_review", "finalist_awaiting_award_decision", "award_assigned", "eliminated"

export interface Score {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface StageScore {
  stageId: string;
  scores: Score[];
  generalComment?: string;
  judgedAt: string;
  judgeId?: string;
}

export interface EditHistoryEntry {
  timestamp: string;
  userEmail: string;
  action: string; 
}

export interface Submission {
  id:string;
  hackathonId: string;
  participantName: string; 
  participantEmail: string; 
  teamId?: string; 
  projectName: string;
  problemStatementId: string;
  projectRepoUrl?: string;
  projectDemoUrl?: string;
  answers: Answer[];
  stageScores: StageScore[];
  status: SubmissionStatus;
  submittedAt: string;
  lockedBy?: { userEmail: string, expiresAt: string } | null;
  editHistory?: EditHistoryEntry[];
  award?: Award | null; // New field for specific awards
}

export interface Team {
  id: string;
  hackathonId: string;
  submissionId: string; 
  name: string;
  leaderEmail: string; 
  createdAt: string;
}

export interface TeamMember {
  id: string; 
  teamId: string;
  participantEmail: string; 
  status: 'invited' | 'accepted' | 'declined' | 'removed' | 'left'; 
  invitedAt: string;
  joinedAt?: string;
  role?: 'leader' | 'member'; 
}


export interface AdminUser {
  id: string;
  email: string;
}

export interface JudgeUser {
  id: string;
  email: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}

export interface ParticipantHackathonHistoryEntry {
    hackathonId: string;
    hackathonTitle: string;
    submissionId: string;
    submissionProjectName: string;
    teamId?: string;
    teamName?: string;
    roleInTeam: string; 
    submittedAt: string;
    status: string; // Display status, including award if any
}

export interface AwardDetail {
  categoryId: string;
  categoryName: string;
  level: AwardLevel;
}

export interface JudgeAssignmentDetails {
  hackathonId: string;
  hackathonTitle: string;
  stageId: string;
  stageName: string;
}

export interface AdminAssignmentDetails {
  hackathonId: string;
  hackathonTitle: string;
  role: 'Managing' | 'Created (Pending Approval)';
  status: HackathonApprovalStatus;
}


export interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (role: UserRole, email?: string | null) => void; 
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  adminUsers: AdminUser[];
  addAdminUser: (email: string) => void; 
  removeAdminUser: (email: string) => void; 
  getAdminAssignments: (adminEmail: string) => AdminAssignmentDetails[]; // New

  judges: JudgeUser[];
  addJudge: (email: string) => void; 
  removeJudgeUser: (email: string) => void; 
  getJudgeAssignments: (judgeEmail: string) => JudgeAssignmentDetails[]; 

  hackathons: Hackathon[];
  currentHackathonId: string | null;
  addHackathon: (hackathonDetails: Pick<HackathonData, 'title' | 'description'>, creatorRole: UserRole, creatorEmail?: string) => string; 
  selectHackathon: (hackathonId: string | null) => void;
  getHackathonById: (hackathonId: string | null) => Hackathon | undefined; 
  getCurrentHackathon: () => Hackathon | undefined;
  deleteHackathon: (hackathonId: string) => void; 
  assignAdminToHackathon: (hackathonId: string, adminEmail: string) => void; 
  removeAdminFromHackathon: (hackathonId: string, adminEmail: string) => void; 
  
  approveHackathon: (hackathonId: string, superAdminEmail: string) => void;
  declineHackathon: (hackathonId: string, superAdminEmail: string, reason: string) => void;
  archiveHackathon: (hackathonId: string) => void;


  updateCurrentHackathonData: (updates: Partial<HackathonData>) => void;
  updateCurrentPublicPageContent: (updates: Partial<HackathonData['publicPageContent']>) => void;
  updateCurrentOgConfig: (updates: Partial<OpenGraphConfig>) => void; 
  updateCurrentSchemaConfig: (updates: Partial<EventSchema>) => void; 
  updateCurrentWinnerConfiguration: (config: WinnerConfiguration) => void;
  
  addQuestionToCurrentHackathon: (question: Omit<Question, 'id'>) => void;
  updateQuestionInCurrentHackathon: (updatedQuestion: Question) => void;
  deleteQuestionInCurrentHackathon: (questionId: string) => void;
  
  addProblemStatementToCurrentHackathon: (ps: Omit<ProblemStatement, 'id'>) => void;
  updateProblemStatementInCurrentHackathon: (updatedPs: ProblemStatement) => void;
  deleteProblemStatementInCurrentHackathon: (psId: string) => void;

  addStageToCurrentHackathon: (stage: Omit<HackathonStage, 'id' | 'judgingCriteria' | 'assignedJudgeEmails'> & { judgingCriteria?: Omit<MatrixCriterion, 'id'>[] }) => void;
  updateStageInCurrentHackathon: (updatedStage: HackathonStage) => void;
  deleteStageInCurrentHackathon: (stageId: string) => void;
  addCriterionToStageInCurrentHackathon: (stageId: string, criterion: Omit<MatrixCriterion, 'id'>) => void;
  updateCriterionInStageInCurrentHackathon: (stageId: string, updatedCriterion: MatrixCriterion) => void;
  deleteCriterionInStageInCurrentHackathon: (stageId: string, criterionId: string) => void;
  setCurrentStageForCurrentHackathon: (stageId: string | null) => void;
  assignJudgeToStage: (hackathonId: string, stageId: string, judgeEmail: string) => void; 
  removeJudgeFromStage: (hackathonId: string, stageId: string, judgeEmail: string) => void; 

  submissions: Submission[]; 
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'stageScores' | 'editHistory' | 'lockedBy' | 'award'>, hackathonId: string, teamId?: string) => Submission | null; // Return new submission or null
  updateSubmission: (submissionId: string, updates: Partial<Omit<Submission, 'stageScores' | 'hackathonId' | 'editHistory' | 'lockedBy' | 'award'>> & { stageScoresUpdates?: Partial<StageScore> }) => void;
  getSubmissionById: (submissionId: string) => Submission | undefined;
  getSubmissionsByHackathonId: (hackathonId: string) => Submission[];
  
  scoreSubmissionAndMakeDecision: (
    submissionId: string, 
    stageId: string, 
    scores: Score[], 
    generalComment: string, 
    judgeId: string, 
    decision: 'approve' | 'reject'
  ) => void;
  advanceSubmissionStatus: (submissionId: string, newStatus: string, adminEmail?: string) => void; 
  deleteTeamSubmission: (submissionId: string, userEmail: string) => Promise<boolean>;
  assignAwardToSubmission: (submissionId: string, awardDetail: AwardDetail, adminEmail: string) => void;
  recindAwardFromSubmission: (submissionId: string, adminEmail: string) => void;
  revertSubmissionStage: (submissionId: string, targetStageId: string, adminEmail: string) => void;


  addQuestionForHackathon: (hackathonId: string, questionText: string, participantName: string, participantEmail?: string) => void;
  answerHackathonQuestion: (hackathonId: string, questionId: string, answerText: string, adminEmail: string) => void;

  // Team Management
  teams: Team[];
  teamMembers: TeamMember[];
  createTeamForSubmission: (submissionId: string, hackathonId: string, teamName: string, leaderEmail: string) => Promise<Team | null>;
  inviteTeamMember: (teamId: string, inviteeEmail: string, inviterEmail: string) => Promise<boolean>;
  respondToTeamInvitation: (invitationId: string, status: 'accepted' | 'declined', participantEmail: string) => Promise<boolean>;
  removeTeamMember: (teamId: string, memberEmail: string, removerEmail: string) => Promise<boolean>; 
  leaveTeam: (teamId: string, participantEmail: string) => Promise<boolean>; 
  getTeamById: (teamId: string) => Team | undefined;
  getTeamMembersByTeamId: (teamId: string) => TeamMember[];
  getInvitationsForParticipant: (participantEmail: string) => TeamMember[];
  getSubmissionsForParticipant: (participantEmail: string) => Submission[]; 
  getTeamsForParticipant: (participantEmail: string) => Team[];

  // Submission Editing & History
  acquireEditLock: (submissionId: string, userEmail: string) => Promise<boolean>;
  releaseEditLock: (submissionId: string, userEmail: string) => Promise<boolean>;

  // Participant History (Super Admin)
  getParticipantHackathonHistory: (participantEmail: string) => ParticipantHackathonHistoryEntry[];
}