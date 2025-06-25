export type UserRole = 'admin' | 'participant' | 'judge' | 'superadmin' | null;

export interface CurrentUser {
  role: UserRole;
  email: string | null;
  profile?: ParticipantProfile;
}

// Enhanced Question Types
export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'url' 
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'rating'
  | 'slider'
  | 'file'
  | 'image'
  | 'video'
  | 'code'
  | 'color'
  | 'location'
  | 'rich_text'
  | 'legal_acceptance';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: QuestionOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    fileTypes?: string[];
    maxFileSize?: number;
  };
  conditional?: {
    dependsOn: string;
    showWhen: string | string[];
  };
}

// Legal Document System
export interface LegalDocument {
  id: string;
  title: string;
  content: string; // Rich text content
  version: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  category: 'terms' | 'privacy' | 'conduct' | 'participation' | 'data_usage' | 'custom';
}

export interface LegalAcceptance {
  documentId: string;
  documentVersion: string;
  acceptedAt: string;
  participantEmail: string;
  ipAddress?: string;
}

// Hackathon Tags & Categorization
export interface HackathonTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  category: 'technology' | 'industry' | 'theme' | 'difficulty' | 'format';
  isPopular?: boolean;
  usageCount?: number;
}

// Enhanced Participant Profile
export type TechnicalLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ParticipantType = 'technical' | 'non_technical' | 'hybrid';

export interface ParticipantInterest {
  id: string;
  name: string;
  category: string;
  proficiencyLevel?: TechnicalLevel;
}

export interface ParticipantProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  
  // Technical Information
  participantType: ParticipantType;
  technicalLevel: TechnicalLevel;
  interests: ParticipantInterest[];
  skills: string[];
  
  // Portfolio Links
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  
  // Preferences
  preferredTeamSize?: number;
  preferredRoles?: string[];
  timezone?: string;
  availability?: string;
  
  // Gamification
  totalScore: number;
  achievements: Achievement[];
  badges: Badge[];
  level: number;
  
  // History
  hackathonsParticipated: number;
  teamsLed: number;
  submissionsCount: number;
  averageRating?: number;
  
  createdAt: string;
  updatedAt: string;
}

// Gamification System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  category: 'participation' | 'leadership' | 'quality' | 'community' | 'special';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface ScoreBreakdown {
  participationHistory: number;
  submissionQuality: number;
  teamLeadership: number;
  communityEngagement: number;
  achievements: number;
  bonusPoints: number;
  total: number;
}

// Private Hackathon System
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface HackathonInvitation {
  id: string;
  hackathonId: string;
  participantEmail: string;
  invitedBy: string;
  invitedAt: string;
  status: InvitationStatus;
  respondedAt?: string;
  expiresAt?: string;
  personalMessage?: string;
  magicLinkToken?: string;
}

// Magic Link Authentication
export interface MagicLink {
  id: string;
  email: string;
  token: string;
  purpose: 'login' | 'invitation' | 'verification' | 'password_reset';
  expiresAt: string;
  usedAt?: string;
  metadata?: Record<string, any>;
}

// Demo Mode System
export interface DemoConfig {
  isEnabled: boolean;
  features: {
    hackathonCreation: boolean;
    judging: boolean;
    teamManagement: boolean;
    submissions: boolean;
    gamification: boolean;
    privateHackathons: boolean;
  };
  sampleDataSets: {
    hackathons: string[];
    participants: string[];
    submissions: string[];
  };
  tutorialSteps: DemoStep[];
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: 'click' | 'type' | 'navigate' | 'wait';
  actionData?: any;
  order: number;
}

// Existing interfaces with enhancements
export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight?: number;
}

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  resources?: string[];
  tags?: string[];
}

export interface HackathonStage {
  id: string;
  name: string;
  order: number;
  description: string;
  judgingCriteria: MatrixCriterion[];
  assignedJudgeEmails: string[];
  minScore?: number;
  maxParticipants?: number;
  duration?: string;
}

export interface OpenGraphConfig {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
}

export interface EventSchemaLocation {
  '@type': 'Place' | 'VirtualLocation';
  name: string;
  address?: string;
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
  startDate?: string;
  endDate?: string;
  eventStatus?: 'EventScheduled' | 'EventRescheduled' | 'EventPostponed' | 'EventCancelled' | 'EventCompleted';
  eventAttendanceMode?: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
  location?: EventSchemaLocation;
  image?: string;
  organizer?: EventSchemaOrganizer;
  url?: string;
}

export interface HackathonQuestion {
  id: string;
  hackathonId: string;
  questionText: string;
  askedByParticipantName: string;
  askedByParticipantEmail?: string;
  askedAt: string;
  answerText?: string;
  answeredByAdminEmail?: string;
  answeredAt?: string;
}

export type HackathonApprovalStatus = 'pending_approval' | 'approved' | 'declined' | 'archived';
export type HackathonVisibility = 'public' | 'private' | 'invite_only';

export type WinnerScope = 'overall' | 'per_problem_statement';
export type AwardLevel = 'winner' | 'runner_up' | 'second_runner_up';

export interface AwardCategory {
  id: string;
  name: string;
  allowedLevels: AwardLevel[];
}

export interface WinnerConfiguration {
  scope: WinnerScope;
  awardCategories: AwardCategory[];
}

export interface Award {
  categoryId: string;
  categoryName: string;
  level: AwardLevel;
  awardedAt: string;
  awardedBy: string;
}

// Enhanced Hackathon Data
export interface HackathonData {
  title: string;
  description: string;
  rules: string;
  timeline: string;
  
  // Visibility and Access
  visibility: HackathonVisibility;
  isAcceptingSubmissions: boolean;
  requiresApproval: boolean;
  
  // Tags and Categorization
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: string;
  
  // Participant Requirements
  minParticipants?: number;
  maxParticipants?: number;
  minScore?: number;
  requiredInterests?: string[];
  technicalLevelRequired?: TechnicalLevel;
  
  // Public Page Content
  publicPageContent: {
    heroTitle: string;
    heroSubtitle: string;
    aboutSection: string;
    imageUrl: string;
  };
  
  // Form Configuration
  submissionQuestions: Question[];
  legalDocuments: LegalDocument[];
  
  // Hackathon Structure
  problemStatements: ProblemStatement[];
  stages: HackathonStage[];
  currentStageId: string | null;
  
  // SEO and Social
  ogConfig: OpenGraphConfig;
  schemaConfig?: EventSchema;
  
  // Q&A System
  questions: HackathonQuestion[];
  
  // Management
  adminEmails: string[];
  status: HackathonApprovalStatus;
  createdByAdminEmail?: string;
  approvedBySuperAdminEmail?: string;
  approvedAt?: string;
  declinedBySuperAdminEmail?: string;
  declinedAt?: string;
  declineReason?: string;
  
  // Awards
  winnerConfiguration: WinnerConfiguration;
  
  // Invitations (for private hackathons)
  invitations?: HackathonInvitation[];
}

export interface Hackathon {
  id: string;
  data: HackathonData;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string;
  files?: FileUpload[];
}

export interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export type SubmissionStatus = string;

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
  id: string;
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
  award?: Award | null;
  legalAcceptances?: LegalAcceptance[];
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
  status: string;
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

// Enhanced App Context
export interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (role: UserRole, email?: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Demo Mode
  demoConfig: DemoConfig;
  updateDemoConfig: (config: Partial<DemoConfig>) => void;
  
  // Tags Management
  hackathonTags: HackathonTag[];
  addHackathonTag: (tag: Omit<HackathonTag, 'id' | 'usageCount'>) => void;
  updateHackathonTag: (tagId: string, updates: Partial<HackathonTag>) => void;
  deleteHackathonTag: (tagId: string) => void;
  
  // Legal Documents
  legalDocuments: LegalDocument[];
  addLegalDocument: (document: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLegalDocument: (documentId: string, updates: Partial<LegalDocument>) => void;
  deleteLegalDocument: (documentId: string) => void;
  
  // Participant Profiles
  participantProfiles: ParticipantProfile[];
  getParticipantProfile: (email: string) => ParticipantProfile | undefined;
  updateParticipantProfile: (email: string, updates: Partial<ParticipantProfile>) => void;
  calculateParticipantScore: (email: string) => ScoreBreakdown;
  
  // Magic Links
  magicLinks: MagicLink[];
  createMagicLink: (email: string, purpose: MagicLink['purpose'], metadata?: Record<string, any>) => Promise<string>;
  validateMagicLink: (token: string) => Promise<MagicLink | null>;
  
  // Invitations
  hackathonInvitations: HackathonInvitation[];
  sendHackathonInvitation: (hackathonId: string, participantEmail: string, personalMessage?: string) => Promise<boolean>;
  respondToInvitation: (invitationId: string, status: 'accepted' | 'declined') => Promise<boolean>;
  
  // Existing context methods...
  adminUsers: AdminUser[];
  addAdminUser: (email: string) => void;
  removeAdminUser: (email: string) => void;
  getAdminAssignments: (adminEmail: string) => AdminAssignmentDetails[];

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
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'stageScores' | 'editHistory' | 'lockedBy' | 'award'>, hackathonId: string, teamId?: string) => Submission | null;
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

  acquireEditLock: (submissionId: string, userEmail: string) => Promise<boolean>;
  releaseEditLock: (submissionId: string, userEmail: string) => Promise<boolean>;

  getParticipantHackathonHistory: (participantEmail: string) => ParticipantHackathonHistoryEntry[];
}
