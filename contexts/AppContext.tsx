
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
    AppContextType, CurrentUser,
    Hackathon, HackathonData, Submission, UserRole, Question, MatrixCriterion, 
    ProblemStatement, HackathonStage, AdminUser, StageScore, Score, JudgeUser, OpenGraphConfig,
    HackathonQuestion, Team, TeamMember, EditHistoryEntry, ParticipantHackathonHistoryEntry, HackathonApprovalStatus,
    WinnerConfiguration, Award, AwardLevel, AwardDetail, EventSchema, JudgeAssignmentDetails, AdminAssignmentDetails
} from '../types';
import { DefaultHackathonData, DefaultHackathonData2, DefaultHackathonData3, LOCK_DURATION_MS, getStatusDisplayName, defaultEventSchemaConfig } from '../constants';
import { generateUniqueId } from '../utils/helpers';
import { sendEmail } from '../services/emailService';

type Theme = 'light' | 'dark';

// Seed Data
const createInitialHackathons = (): Hackathon[] => {
    const hackathon1Id = generateUniqueId();
    const hackathon2Id = generateUniqueId();
    const hackathon3Id = generateUniqueId();

    const h1Stages = DefaultHackathonData.stages.map(stage => ({
        ...stage,
        id: stage.id, 
        assignedJudgeEmails: stage.id === 'stage1_default_ideation' ? ['judge1@example.com'] : (stage.id === 'stage2_default_prototype' ? ['judge2@example.com'] : ['judge3@example.com']),
    }));
    
    let baseAppUrl = window.location.href.split('#')[0];
    if (baseAppUrl.endsWith('index.html')) {
        baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
    }
    // Ensure baseAppUrl doesn't end with a slash if it's not just the origin, to prevent double slashes with hash
    if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
        baseAppUrl = baseAppUrl.slice(0, -1);
    }


    return [
        { 
            id: hackathon1Id, 
            data: {
                ...DefaultHackathonData, 
                adminEmails: ['admin@example.com'], 
                stages: h1Stages,
                ogConfig: {
                    ...DefaultHackathonData.ogConfig,
                    ogTitle: DefaultHackathonData.title,
                    ogDescription: DefaultHackathonData.description.substring(0, 150) + "...",
                    ogUrl: `${baseAppUrl}#/public-events/${hackathon1Id}` 
                },
                 schemaConfig: {
                    ...DefaultHackathonData.schemaConfig,
                    name: DefaultHackathonData.title,
                    description: DefaultHackathonData.description.substring(0, 250) + "...",
                    url: `${baseAppUrl}#/public-events/${hackathon1Id}`,
                    image: DefaultHackathonData.publicPageContent.imageUrl,
                },
                questions: [
                    {
                        id: generateUniqueId(), hackathonId: hackathon1Id, 
                        questionText: "What is the maximum team size for the AI For Good Challenge?",
                        askedByParticipantName: "Curious Chris", askedByParticipantEmail: "chris@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                        answerText: "Teams can consist of 1 to 5 members. We encourage collaboration!",
                        answeredByAdminEmail: "admin@example.com",
                        answeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                    },
                    {
                        id: generateUniqueId(), hackathonId: hackathon1Id,
                        questionText: "Are we allowed to use pre-trained models from Hugging Face?",
                        askedByParticipantName: "Model Molly", askedByParticipantEmail: "molly@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
                        answerText: "Yes, use of pre-trained models is allowed and encouraged, provided you clearly document their use and focus on innovative application or fine-tuning for the hackathon's theme.", 
                        answeredByAdminEmail: "admin2@example.com",
                        answeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                    },
                    {
                        id: generateUniqueId(), hackathonId: hackathon1Id,
                        questionText: "Is there a specific tech stack required for Stage 1 proposal?",
                        askedByParticipantName: "Bob Builder", askedByParticipantEmail: "bob@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
                        answerText: undefined,
                        answeredByAdminEmail: undefined,
                        answeredAt: undefined,
                    }
                ],
                status: 'approved',
                approvedBySuperAdminEmail: 'superadmin@example.com',
                approvedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            }, 
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
        },
        { 
            id: hackathon2Id, 
            data: {
                ...DefaultHackathonData2,
                adminEmails: ['admin2@example.com'], 
                stages: DefaultHackathonData2.stages.map(stage => ({...stage, assignedJudgeEmails: [] })),
                 ogConfig: {
                    ...DefaultHackathonData2.ogConfig,
                    ogTitle: DefaultHackathonData2.title,
                    ogDescription: DefaultHackathonData2.description.substring(0, 150) + "...",
                    ogUrl: `${baseAppUrl}#/public-events/${hackathon2Id}`
                },
                schemaConfig: {
                    ...DefaultHackathonData2.schemaConfig,
                    name: DefaultHackathonData2.title,
                    description: DefaultHackathonData2.description.substring(0, 250) + "...",
                    url: `${baseAppUrl}#/public-events/${hackathon2Id}`,
                    image: DefaultHackathonData2.publicPageContent.imageUrl,
                },
                questions: [
                    {
                        id: generateUniqueId(), hackathonId: hackathon2Id,
                        questionText: "What are the key judging criteria for WebAssembly projects?",
                        askedByParticipantName: "WASM Wendy", askedByParticipantEmail: "wendy@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                        answerText: "For WebAssembly projects, we'll be looking at performance gains, innovative use of WASM for tasks not easily done with JS, and integration with browser APIs. Check the specific stage criteria for details!",
                        answeredByAdminEmail: "admin@example.com",
                        answeredAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
                    },
                     {
                        id: generateUniqueId(), hackathonId: hackathon2Id,
                        questionText: "Can we submit a PWA that also has a native companion app (not for judging, just for context)?",
                        askedByParticipantName: "Eve Green", askedByParticipantEmail: "eve@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
                        answerText: undefined,
                        answeredByAdminEmail: undefined,
                        answeredAt: undefined,
                    }
                ],
                status: 'approved',
                approvedBySuperAdminEmail: 'superadmin@example.com',
                approvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            }, 
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString() 
        },
        { 
            id: hackathon3Id, 
            data: {
                ...DefaultHackathonData3,
                adminEmails: [], 
                stages: DefaultHackathonData3.stages.map(stage => ({...stage, assignedJudgeEmails: [] })),
                 ogConfig: {
                    ...DefaultHackathonData3.ogConfig,
                    ogTitle: DefaultHackathonData3.title,
                    ogDescription: DefaultHackathonData3.description.substring(0, 150) + "...",
                    ogUrl: `${baseAppUrl}#/public-events/${hackathon3Id}`
                },
                 schemaConfig: {
                    ...DefaultHackathonData3.schemaConfig,
                    name: DefaultHackathonData3.title,
                    description: DefaultHackathonData3.description.substring(0, 250) + "...",
                    url: `${baseAppUrl}#/public-events/${hackathon3Id}`,
                    image: DefaultHackathonData3.publicPageContent.imageUrl,
                },
                questions: [
                     {
                        id: generateUniqueId(), hackathonId: hackathon3Id, 
                        questionText: "Can hardware components be part of the solution for the Sustainable Tech Challenge?",
                        askedByParticipantName: "Hardware Hank", askedByParticipantEmail: "hank@example.com",
                        askedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
                        answerText: "Yes, solutions can be software, hardware, or a combination. Please refer to the detailed rules for any specific hardware restrictions. Ensure your demo clearly shows the hardware's role.",
                        answeredByAdminEmail: "admin2@example.com",
                        answeredAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
                    },
                    {
                        id: generateUniqueId(), hackathonId: hackathon3Id,
                        questionText: "Are there specific APIs or datasets recommended for the Circular Economy problem statement?",
                        askedByParticipantName: "Resourceful Rita", askedByParticipantEmail: "rita@example.com",
                        askedAt: new Date().toISOString(),
                        answerText: undefined,
                        answeredByAdminEmail: undefined,
                        answeredAt: undefined,
                    }
                ],
                status: 'pending_approval', 
                createdByAdminEmail: 'admin@example.com',
            }, 
            createdAt: new Date().toISOString()
        },
    ];
};

const createInitialTeamsAndMembers = (initialSubmissions: Submission[], hackathons: Hackathon[]): { teams: Team[], teamMembers: TeamMember[] } => {
    const teams: Team[] = [];
    const teamMembers: TeamMember[] = [];

    // No need to filter hackathons by status here, as initialSubmissions should already be based on approved hackathons.
    // The logic in createInitialSubmissions ensures submissions are only for approved hackathons.

    const h1 = hackathons.find(h => h.data.title.includes("AI For Good Challenge"));
    // const h2 = hackathons.find(h => h.data.title.includes("Future Web")); // Not used directly, can remove if no specific h2 logic below

    const aliceSubmissionH1 = initialSubmissions.find(s => s.participantEmail === "alice@example.com" && s.projectName === "EcoGuardian AI" && s.hackathonId === h1?.id);
    if (aliceSubmissionH1) {
        const teamId = generateUniqueId();
        aliceSubmissionH1.teamId = teamId; 
        teams.push({
            id: teamId, hackathonId: aliceSubmissionH1.hackathonId, submissionId: aliceSubmissionH1.id,
            name: "Eco Guardians", leaderEmail: "alice@example.com", createdAt: new Date().toISOString(),
        });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "alice@example.com", status: 'accepted', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString(), role: 'leader' });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "bob@example.com", status: 'accepted', invitedAt: new Date(Date.now() - 86400000 * 2).toISOString(), joinedAt: new Date(Date.now() - 86400000 * 1).toISOString(), role: 'member' });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "charlie@example.com", status: 'accepted', invitedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), joinedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), role: 'member' });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "dave@example.com", status: 'invited', invitedAt: new Date(Date.now() - 86400000 * 1).toISOString(), role: 'member' });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "fiona@example.com", status: 'declined', invitedAt: new Date(Date.now() - 86400000 * 3).toISOString(), role: 'member' });
    }
    
    const charlieSubmissionH1 = initialSubmissions.find(s => s.participantEmail === "charlie@example.com" && s.projectName === "AI Sign Language Tutor" && s.hackathonId === h1?.id);
    if (charlieSubmissionH1) {
        const teamId = generateUniqueId();
        charlieSubmissionH1.teamId = teamId;
         teams.push({
            id: teamId, hackathonId: charlieSubmissionH1.hackathonId, submissionId: charlieSubmissionH1.id,
            name: "Sign Scholars", leaderEmail: "charlie@example.com", createdAt: new Date().toISOString(),
        });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "charlie@example.com", status: 'accepted', role: 'leader', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString() });
    }

    // Find H2 by its specific title to make it more robust
    const h2Hackathon = hackathons.find(h => h.data.title === "Future Web Innovators Hackathon");

    const daveSubmissionH2 = initialSubmissions.find(s => s.participantEmail === "dave@example.com" && s.projectName === "Decentralized Data Vault" && s.hackathonId === h2Hackathon?.id);
    if (daveSubmissionH2) {
        const teamId = generateUniqueId();
        daveSubmissionH2.teamId = teamId;
        teams.push({
            id: teamId, hackathonId: daveSubmissionH2.hackathonId, submissionId: daveSubmissionH2.id,
            name: "Web Wizards", leaderEmail: "dave@example.com", createdAt: new Date().toISOString(),
        });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "dave@example.com", status: 'accepted', role: 'leader', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString() });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "eve@example.com", status: 'accepted', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString(), role: 'member' });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "alice@example.com", status: 'invited', invitedAt: new Date().toISOString(), role: 'member' });
    }

    const charlieSubmissionH2 = initialSubmissions.find(s => s.participantEmail === "charlie@example.com" && s.projectName === "WASM Creative Suite" && s.hackathonId === h2Hackathon?.id);
    if (charlieSubmissionH2) {
        const teamId = generateUniqueId();
        charlieSubmissionH2.teamId = teamId;
        teams.push({
            id: teamId, hackathonId: charlieSubmissionH2.hackathonId, submissionId: charlieSubmissionH2.id,
            name: "Pixel Prowess", leaderEmail: "charlie@example.com", createdAt: new Date().toISOString(),
        });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "charlie@example.com", status: 'accepted', role: 'leader', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString() });
        teamMembers.push({ id: generateUniqueId(), teamId, participantEmail: "george@example.com", status: 'accepted', invitedAt: new Date().toISOString(), joinedAt: new Date().toISOString(), role: 'member' });
    }

    return { teams, teamMembers };
};


const createInitialSubmissions = (hackathons: Hackathon[]): Submission[] => {
    if (hackathons.length === 0) return [];
    
    const h1 = hackathons.find(h => h.data.title.includes("AI For Good Challenge") && h.data.status === 'approved');
    const h2 = hackathons.find(h => h.data.title.includes("Future Web") && h.data.status === 'approved'); 
    // const h3 = hackathons.find(h => h.data.title.includes("Sustainable Tech") && h.data.status === 'approved'); // Not used below

    let submissions: Submission[] = [];

    if (h1 && h1.data.problemStatements.length > 0 && h1.data.stages.length === 3) {
        const h1_ps1 = h1.data.problemStatements[0].id; 
        const h1_ps2 = h1.data.problemStatements[1].id; 
        const h1_s1 = h1.data.stages[0]; 
        const h1_s2 = h1.data.stages[1]; 
        const h1_s3 = h1.data.stages[2]; 

        submissions.push({
            id: generateUniqueId(), hackathonId: h1.id, participantName: "Alice Wonderland", participantEmail: "alice@example.com",
            projectName: "EcoGuardian AI", projectRepoUrl:"https://github.com/demo/ecoguardian", projectDemoUrl:"https://ecoguardian.example.dev", problemStatementId: h1_ps1,
            answers: [{ questionId: h1.data.submissionQuestions[0].id, value: "Addresses plastic waste in oceans using drone imagery and AI detection for real-time alerts and cleanup coordination." }],
            stageScores: [
                { stageId: h1_s1.id, scores: [{ criterionId: h1_s1.judgingCriteria[0].id, score: 28 }, { criterionId: h1_s1.judgingCriteria[1].id, score: 27 }], generalComment: "Excellent idea, very strong impact potential.", judgedAt: new Date(Date.now() - 86400000 * 7).toISOString(), judgeId: "judge1@example.com" },
                { stageId: h1_s2.id, scores: [{ criterionId: h1_s2.judgingCriteria[0].id, score: 33 }, { criterionId: h1_s2.judgingCriteria[1].id, score: 22 }], generalComment: "Impressive MVP and clear technical demo! UX is good.", judgedAt: new Date(Date.now() - 86400000 * 4).toISOString(), judgeId: "judge2@example.com" },
                { stageId: h1_s3.id, scores: [{ criterionId: h1_s3.judgingCriteria[0].id, score: 28 }, { criterionId: h1_s3.judgingCriteria[1].id, score: 29 }], generalComment: "Polished solution, strong pitch, clear scalability. Outstanding!", judgedAt: new Date(Date.now() - 86400000 * 1).toISOString(), judgeId: "judge3@example.com" }
            ],
            status: 'award_assigned', 
            award: { categoryId: 'overall', categoryName: 'Overall Event', level: 'winner', awardedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), awardedBy: 'superadmin@example.com' },
            submittedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
            editHistory: [
                { timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), userEmail: "alice@example.com", action: "Initial submission created."},
                { timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), userEmail: "superadmin@example.com", action: "Awarded 'Winner - Overall Event'."},
            ],
            lockedBy: null,
        });
        submissions.push({
            id: generateUniqueId(), hackathonId: h1.id, participantName: "Bob The Builder", participantEmail: "bob@example.com",
            projectName: "LearnBuddy AI", problemStatementId: h1_ps2,
            answers: [{ questionId: h1.data.submissionQuestions[0].id, value: "AI tutor for K-12 math, basic adaptive quizzes." }],
            stageScores: [
                 { stageId: h1_s1.id, scores: [{ criterionId: h1_s1.judgingCriteria[0].id, score: 10 }, { criterionId: h1_s1.judgingCriteria[1].id, score: 12 }], generalComment: "Idea is not very original for 'AI for Good', proposal lacks detail on unique AI application.", judgedAt: new Date(Date.now() - 86400000 * 7).toISOString(), judgeId: "judge1@example.com" }
            ], status: `s_${h1_s1.id}_rejected`, 
            submittedAt: new Date(Date.now() - 86400000 * 8).toISOString(), editHistory: [], lockedBy: null, award: null
        });
         submissions.push({
            id: generateUniqueId(), hackathonId: h1.id, participantName: "Charlie Brown", participantEmail: "charlie@example.com",
            projectName: "AI Sign Language Tutor", problemStatementId: h1_ps2,
            answers: [{ questionId: h1.data.submissionQuestions[0].id, value: "An interactive AI platform to teach sign language using webcam and pose estimation." }, { questionId: h1.data.submissionQuestions[1].id, value: "Uses MediaPipe for pose estimation and a custom gesture recognition model."}],
            stageScores: [
                 { stageId: h1_s1.id, scores: [{ criterionId: h1_s1.judgingCriteria[0].id, score: 20 }, { criterionId: h1_s1.judgingCriteria[1].id, score: 18 }], generalComment: "Promising concept, good proposal for inclusive learning.", judgedAt: new Date(Date.now() - 86400000 * 6).toISOString(), judgeId: "judge3@example.com" },
                 { stageId: h1_s2.id, scores: [{ criterionId: h1_s2.judgingCriteria[0].id, score: 25 }, { criterionId: h1_s2.judgingCriteria[1].id, score: 20 }], generalComment: "Good MVP, gesture recognition works for basic signs. Needs more content.", judgedAt: new Date(Date.now() - 86400000 * 3).toISOString(), judgeId: "judge1@example.com" }
            ], status: `s_${h1_s3.id}_pending_review`,
            submittedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            editHistory: [], lockedBy: null, award: null
        });
        submissions.push({
            id: generateUniqueId(), hackathonId: h1.id, participantName: "Fiona Future", participantEmail: "fiona@example.com",
            projectName: "AI Mental Wellness Chatbot", problemStatementId: h1_ps2,
            answers: [{questionId: h1.data.submissionQuestions[0].id, value: "Empathetic chatbot for daily mental wellness check-ins using NLP."}],
            stageScores: [ { stageId: h1_s1.id, scores: [{ criterionId: h1_s1.judgingCriteria[0].id, score: 23 }, { criterionId: h1_s1.judgingCriteria[1].id, score: 22 }], generalComment: "Good concept and initial plan for NLP.", judgedAt: new Date(Date.now() - 86400000 * 5.5).toISOString(), judgeId: "judge2@example.com" } ],
            status: `s_${h1_s1.id}_judged_selected`, // Assuming this means selected for next stage
            submittedAt: new Date(Date.now() - 86400000 * 6).toISOString(), editHistory: [], lockedBy: null, award: null
        });
        submissions.push({
            id: generateUniqueId(), hackathonId: h1.id, participantName: "Julia Jupiter", participantEmail: "julia@example.com",
            projectName: "AI for Early Disease Detection", problemStatementId: h1_ps2,
            answers: [{questionId: h1.data.submissionQuestions[0].id, value: "AI model analyzing medical images for early signs of common diseases, accessible via a low-cost platform."}],
            stageScores: [
                { stageId: h1_s1.id, scores: [{ criterionId: h1_s1.judgingCriteria[0].id, score: 26 }, { criterionId: h1_s1.judgingCriteria[1].id, score: 25 }], generalComment: "Highly impactful and innovative.", judgedAt: new Date(Date.now() - 86400000 * 4).toISOString(), judgeId: "judge1@example.com" },
                { stageId: h1_s2.id, scores: [{ criterionId: h1_s2.judgingCriteria[0].id, score: 28 }, { criterionId: h1_s2.judgingCriteria[1].id, score: 24 }], generalComment: "Strong MVP, clear AI application.", judgedAt: new Date(Date.now() - 86400000 * 2).toISOString(), judgeId: "judge2@example.com" },
                { stageId: h1_s3.id, scores: [{ criterionId: h1_s3.judgingCriteria[0].id, score: 27 }, { criterionId: h1_s3.judgingCriteria[1].id, score: 26 }], generalComment: "Excellent final presentation and robust solution. Very promising.", judgedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), judgeId: "judge3@example.com" }
            ], status: 'finalist_awaiting_award_decision',
            submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(), editHistory: [], lockedBy: null, award: null
        });
    }

    if (h2 && h2.data.problemStatements.length > 0 && h2.data.stages.length > 0) {
        const h2_ps1 = h2.data.problemStatements[0].id;
        // const h2_ps3 = h2.data.problemStatements[2].id; // Not used below
        const h2_s1 = h2.data.stages[0];
        
        submissions.push({ 
            id: generateUniqueId(), hackathonId: h2.id, participantName: "Dave Matrix", participantEmail: "dave@example.com",
            projectName: "Decentralized Data Vault", problemStatementId: h2_ps1,
            answers: [{ questionId: h2.data.submissionQuestions[0].id, value: "Secure, user-controlled data storage using IPFS and DIDs for enhanced privacy on the web." }],
            stageScores: [], status: `s_${h2_s1.id}_pending_review`,
            submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
            editHistory: [{timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), userEmail: "dave@example.com", action: "Submission created."}],
            lockedBy: { userEmail: "eve@example.com", expiresAt: new Date(Date.now() - LOCK_DURATION_MS).toISOString() }, // Example of an expired lock
            award: null
        });
        // Add more submissions for H2 if needed
         submissions.push({ 
            id: generateUniqueId(), hackathonId: h2.id, participantName: "Charlie Brown", participantEmail: "charlie@example.com",
            projectName: "WASM Creative Suite", problemStatementId: h2.data.problemStatements[2].id, // Assuming ps3 is WASM
            answers: [{ questionId: h2.data.submissionQuestions[0].id, value: "A suite of creative tools leveraging WebAssembly for high performance rendering and effects directly in the browser." }],
            stageScores: [], status: `s_${h2_s1.id}_pending_review`,
            submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(), 
            editHistory: [],
            lockedBy: null,
            award: null
        });
    }
    return submissions;
};


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserInternal] = useLocalStorage<CurrentUser | null>('hackathonCurrentUser_v3_multi_team_v3_award', null);
  const [theme, setTheme] = useLocalStorage<Theme>('hackathonTheme_v3_multi_team_v3_award', 'light');
  
  const [hackathons, setHackathons] = useLocalStorage<Hackathon[]>('hackathons_v3_multi_team_v3_award_schema', createInitialHackathons);
  const [currentHackathonId, setCurrentHackathonId] = useLocalStorage<string | null>('currentHackathonId_v3_multi_team_v3_award_schema', null);
  
  const initialSubmissions = useCallback(() => createInitialSubmissions(hackathons.filter(h => h.data.status === 'approved')), [hackathons]);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('hackathonSubmissions_v3_multi_team_v3_award_schema', initialSubmissions);
  
  const initialTeamsAndMembers = useCallback(() => createInitialTeamsAndMembers(submissions, hackathons), [submissions, hackathons]);
  const [teams, setTeams] = useLocalStorage<Team[]>('hackathonTeams_v3_multi_team_v3_award_schema', () => initialTeamsAndMembers().teams);
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('hackathonTeamMembers_v3_multi_team_v3_award_schema', () => initialTeamsAndMembers().teamMembers);

    useEffect(() => {
        const key = 'hackathonSubmissions_v3_multi_team_v3_award_schema_seeded_once_v2';
        const approvedHackathons = hackathons.filter(h => h.data.status === 'approved');
        if (approvedHackathons.length > 0 && submissions.length === 0 && !localStorage.getItem(key)) {
            const newSubs = createInitialSubmissions(approvedHackathons);
            setSubmissions(newSubs);
            const { teams: newTeams, teamMembers: newTeamMembers } = createInitialTeamsAndMembers(newSubs, approvedHackathons);
            setTeams(newTeams);
            setTeamMembers(newTeamMembers);
            localStorage.setItem(key, 'true');
        }
    }, [hackathons, submissions, setSubmissions, setTeams, setTeamMembers]);

    useEffect(() => {
        setSubmissions(prevSubs => {
            let subsChanged = false;
            const updatedSubs = prevSubs.map(sub => {
                if (!sub.teamId) { 
                    const teamForSub = teams.find(t => t.submissionId === sub.id);
                    if (teamForSub) {
                        subsChanged = true;
                        return { ...sub, teamId: teamForSub.id };
                    }
                }
                return sub;
            });
            return subsChanged ? updatedSubs : prevSubs;
        });
    }, [teams, setSubmissions]);


  const [adminUsers, setAdminUsers] = useLocalStorage<AdminUser[]>('hackathonAdminUsers_v3_multi_team_v3_award_schema', [
      {id: 'super', email: 'superadmin@example.com'}, 
      {id: 'admin1', email:'admin@example.com'},
      {id: 'admin2', email:'admin2@example.com'}
    ]);
  const [judges, setJudges] = useLocalStorage<JudgeUser[]>('hackathonJudges_v3_multi_team_v3_award_schema', [
      {id: 'judge1', email: 'judge1@example.com'}, 
      {id: 'judge2', email: 'judge2@example.com'},
      {id: 'judge3', email: 'judge3@example.com'}
    ]);

  const setCurrentUser = useCallback((role: UserRole, email?: string | null) => {
    if (role === null) {
        setCurrentUserInternal(null);
    } else {
        setCurrentUserInternal({ role, email: email || null });
    }
  }, [setCurrentUserInternal]);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const currentHackathonExists = hackathons.some(h => h.id === currentHackathonId);
    if ((!currentHackathonId || !currentHackathonExists) && hackathons.length > 0) {
      setCurrentHackathonId(hackathons[0].id);
    }
  }, [hackathons, currentHackathonId, setCurrentHackathonId]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const addAdminUser = useCallback((email: string) => {
    const emailLower = email.toLowerCase();
    if (adminUsers.find(au => au.email.toLowerCase() === emailLower)) { return; }
    const newAdmin: AdminUser = { id: generateUniqueId(), email };
    setAdminUsers(prev => [...prev, newAdmin]);
  }, [adminUsers, setAdminUsers]);

  const removeAdminUser = useCallback((emailToRemove: string) => {
    const emailLowerToRemove = emailToRemove.toLowerCase();
    setAdminUsers(prevAdmins => prevAdmins.filter(admin => admin.email.toLowerCase() !== emailLowerToRemove));
    // Also remove this admin from all hackathons they might be managing
    setHackathons(prevHackathons => 
      prevHackathons.map(h => ({
        ...h,
        data: {
          ...h.data,
          adminEmails: h.data.adminEmails.filter(ae => ae.toLowerCase() !== emailLowerToRemove)
        }
      }))
    );
  }, [setAdminUsers, setHackathons]);

  const getAdminAssignments = useCallback((adminEmail: string): AdminAssignmentDetails[] => {
    const assignments: AdminAssignmentDetails[] = [];
    const adminEmailLower = adminEmail.toLowerCase();
    hackathons.forEach(hackathon => {
        // Check if explicitly assigned
        if (hackathon.data.adminEmails.map(ae => ae.toLowerCase()).includes(adminEmailLower)) {
            assignments.push({
                hackathonId: hackathon.id,
                hackathonTitle: hackathon.data.title,
                role: 'Managing',
                status: hackathon.data.status
            });
        } 
        // Check if created by this admin and is pending approval
        else if (hackathon.data.createdByAdminEmail?.toLowerCase() === adminEmailLower && hackathon.data.status === 'pending_approval') {
            assignments.push({
                hackathonId: hackathon.id,
                hackathonTitle: hackathon.data.title,
                role: 'Created (Pending Approval)',
                status: hackathon.data.status
            });
        }
    });
    return assignments;
  }, [hackathons]);


  const addJudge = useCallback((email: string) => {
    const emailLower = email.toLowerCase();
    if (judges.find(j => j.email.toLowerCase() === emailLower)) { return; }
    const newJudge: JudgeUser = { id: generateUniqueId(), email };
    setJudges(prev => [...prev, newJudge]);
  }, [judges, setJudges]);
  
  const removeJudgeUser = useCallback((emailToRemove: string) => {
    const emailLowerToRemove = emailToRemove.toLowerCase();
    setJudges(prevJudges => prevJudges.filter(judge => judge.email.toLowerCase() !== emailLowerToRemove));
    // Also remove this judge from all stages they might be assigned to
    setHackathons(prevHackathons => 
      prevHackathons.map(h => ({
        ...h,
        data: {
          ...h.data,
          stages: h.data.stages.map(stage => ({
            ...stage,
            assignedJudgeEmails: stage.assignedJudgeEmails.filter(je => je.toLowerCase() !== emailLowerToRemove)
          }))
        }
      }))
    );
  }, [setJudges, setHackathons]);

  const getJudgeAssignments = useCallback((judgeEmail: string): JudgeAssignmentDetails[] => {
    const assignments: JudgeAssignmentDetails[] = [];
    const judgeEmailLower = judgeEmail.toLowerCase();
    hackathons.forEach(hackathon => {
        if(hackathon.data.status === 'approved') { // Only consider approved hackathons for active assignments
            hackathon.data.stages.forEach(stage => {
                if (stage.assignedJudgeEmails.map(sje => sje.toLowerCase()).includes(judgeEmailLower)) {
                    assignments.push({
                        hackathonId: hackathon.id,
                        hackathonTitle: hackathon.data.title,
                        stageId: stage.id,
                        stageName: stage.name
                    });
                }
            });
        }
    });
    return assignments;
  }, [hackathons]);


  const addHackathon = useCallback((hackathonDetails: Pick<HackathonData, 'title' | 'description'>, creatorRole: UserRole, creatorEmail?: string) => {
    const newId = generateUniqueId();
    let initialStatus: HackathonApprovalStatus = 'pending_approval';
    let createdByEmailField: Partial<HackathonData> = {};

    if (creatorRole === 'superadmin') {
        initialStatus = 'approved';
        createdByEmailField.approvedBySuperAdminEmail = creatorEmail || 'superadmin@example.com';
        createdByEmailField.approvedAt = new Date().toISOString();
    } else if (creatorRole === 'admin' && creatorEmail) {
        initialStatus = 'pending_approval';
        createdByEmailField.createdByAdminEmail = creatorEmail;
    }

    const defaultWinnerConfig: WinnerConfiguration = {
        scope: 'overall',
        awardCategories: [{ id: 'overall', name: 'Overall Event', allowedLevels: ['winner', 'runner_up', 'second_runner_up'] }]
    };
    
    let baseAppUrl = window.location.href.split('#')[0];
    if (baseAppUrl.endsWith('index.html')) {
        baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
    }
    if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
        baseAppUrl = baseAppUrl.slice(0, -1);
    }
    const publicPageUrl = `${baseAppUrl}#/public-events/${newId}`;

    const newHackathon: Hackathon = {
        id: newId,
        data: {
            ...DefaultHackathonData, 
            title: hackathonDetails.title,
            description: hackathonDetails.description,
            adminEmails: creatorRole === 'superadmin' && creatorEmail ? [creatorEmail] : (creatorRole === 'admin' && creatorEmail ? [creatorEmail] : []), 
            stages: DefaultHackathonData.stages.map(s => ({
                ...s, 
                id: generateUniqueId(), 
                judgingCriteria: s.judgingCriteria.map(jc => ({...jc, id: generateUniqueId()})),
                assignedJudgeEmails: [] 
            })),
            submissionQuestions: DefaultHackathonData.submissionQuestions.map(q => ({...q, id: generateUniqueId()})),
            problemStatements: DefaultHackathonData.problemStatements.map(ps => ({...ps, id: generateUniqueId()})),
            questions: [], 
            ogConfig: { 
                ...DefaultHackathonData.ogConfig,
                ogTitle: hackathonDetails.title,
                ogDescription: hackathonDetails.description.substring(0,150) + "...",
                ogUrl: publicPageUrl
            },
            schemaConfig: {
                ...defaultEventSchemaConfig,
                name: hackathonDetails.title,
                description: hackathonDetails.description.substring(0, 250) + "...",
                url: publicPageUrl,
                image: DefaultHackathonData.publicPageContent.imageUrl, // Use a default or allow admin to set
            },
            status: initialStatus,
            ...createdByEmailField,
            winnerConfiguration: defaultWinnerConfig 
        },
        createdAt: new Date().toISOString(),
    };
    setHackathons(prev => [...prev, newHackathon]);
    if (!currentHackathonId || !hackathons.find(h => h.id === currentHackathonId)) { 
        setCurrentHackathonId(newHackathon.id);
    }
    return newHackathon.id;
  }, [hackathons, setHackathons, currentHackathonId, setCurrentHackathonId]);

  const assignAdminToHackathon = useCallback((hackathonId: string, adminEmail: string) => {
    setHackathons(prevHackathons => prevHackathons.map(h => {
        if (h.id === hackathonId) {
            const adminEmailLower = adminEmail.toLowerCase();
            if (!h.data.adminEmails.map(ae => ae.toLowerCase()).includes(adminEmailLower)) {
                return { ...h, data: { ...h.data, adminEmails: [...h.data.adminEmails, adminEmail] } };
            }
        }
        return h;
    }));
  }, [setHackathons]);

  const removeAdminFromHackathon = useCallback((hackathonId: string, adminEmail: string) => {
    setHackathons(prevHackathons => prevHackathons.map(h => {
        if (h.id === hackathonId) {
             const adminEmailLower = adminEmail.toLowerCase();
            return { ...h, data: { ...h.data, adminEmails: h.data.adminEmails.filter(ae => ae.toLowerCase() !== adminEmailLower) } };
        }
        return h;
    }));
  }, [setHackathons]);

  const assignJudgeToStage = useCallback((hackathonId: string, stageId: string, judgeEmail: string) => {
    const hackathon = hackathons.find(h => h.id === hackathonId);
    if (!hackathon || hackathon.data.status !== 'approved') {
        alert("Judges can only be assigned to approved hackathons.");
        return;
    }
    setHackathons(prevHackathons => prevHackathons.map(h => {
        if (h.id === hackathonId) {
            const updatedStages = h.data.stages.map(stage => {
                if (stage.id === stageId) {
                    const judgeEmailLower = judgeEmail.toLowerCase();
                    if (!stage.assignedJudgeEmails.map(je => je.toLowerCase()).includes(judgeEmailLower)) {
                        return { ...stage, assignedJudgeEmails: [...stage.assignedJudgeEmails, judgeEmail] };
                    }
                }
                return stage;
            });
            return { ...h, data: { ...h.data, stages: updatedStages } };
        }
        return h;
    }));
  }, [setHackathons, hackathons]);

  const removeJudgeFromStage = useCallback((hackathonId: string, stageId: string, judgeEmail: string) => {
     setHackathons(prevHackathons => prevHackathons.map(h => {
        if (h.id === hackathonId) {
            const updatedStages = h.data.stages.map(stage => {
                if (stage.id === stageId) {
                    const judgeEmailLower = judgeEmail.toLowerCase();
                    return { ...stage, assignedJudgeEmails: stage.assignedJudgeEmails.filter(je => je.toLowerCase() !== judgeEmailLower) };
                }
                return stage;
            });
            return { ...h, data: { ...h.data, stages: updatedStages } };
        }
        return h;
    }));
  }, [setHackathons]);

  const approveHackathon = useCallback((hackathonId: string, superAdminEmail: string) => {
    setHackathons(prev => prev.map(h => {
        if (h.id === hackathonId && h.data.status === 'pending_approval') {
            return { ...h, data: { ...h.data, status: 'approved', approvedBySuperAdminEmail: superAdminEmail, approvedAt: new Date().toISOString() }};
        }
        return h;
    }));
  }, [setHackathons]);

  const declineHackathon = useCallback((hackathonId: string, superAdminEmail: string, reason: string) => {
    setHackathons(prev => prev.map(h => {
        if (h.id === hackathonId && h.data.status === 'pending_approval') {
            return { ...h, data: { ...h.data, status: 'declined', declinedBySuperAdminEmail: superAdminEmail, declinedAt: new Date().toISOString(), declineReason: reason }};
        }
        return h;
    }));
  }, [setHackathons]);
  
  const archiveHackathon = useCallback((hackathonId: string) => {
     setHackathons(prev => prev.map(h => {
        if (h.id === hackathonId) {
            return { ...h, data: { ...h.data, status: 'archived', isAcceptingSubmissions: false }};
        }
        return h;
    }));
  }, [setHackathons]);


  const selectHackathon = useCallback((hackathonId: string | null) => {
    setCurrentHackathonId(hackathonId);
  }, [setCurrentHackathonId]);

  const getHackathonById = useCallback((hackathonId: string | null) => {
    if (!hackathonId) return undefined;
    return hackathons.find(h => h.id === hackathonId);
  }, [hackathons]);

  const getCurrentHackathon = useCallback(() => {
    return hackathons.find(h => h.id === currentHackathonId);
  }, [hackathons, currentHackathonId]);

  const deleteHackathon = useCallback((hackathonId: string) => {
    const remainingHackathons = hackathons.filter(h => h.id !== hackathonId);
    setHackathons(remainingHackathons);
    setSubmissions(prevSubs => prevSubs.filter(s => s.hackathonId !== hackathonId));
    setTeams(prevTeams => prevTeams.filter(t => t.hackathonId !== hackathonId)); 
    if (currentHackathonId === hackathonId) {
        setCurrentHackathonId(remainingHackathons.length > 0 ? remainingHackathons[0].id : null);
    }
  }, [hackathons, setHackathons, currentHackathonId, setCurrentHackathonId, setSubmissions, setTeams]);
  
  const _addEditHistoryEntry = useCallback((submissionId: string, userEmail: string, action: string) => {
    setSubmissions(prevSubs => prevSubs.map(sub => {
        if (sub.id === submissionId) {
            const newEntry: EditHistoryEntry = { timestamp: new Date().toISOString(), userEmail, action };
            const updatedHistory = Array.isArray(sub.editHistory) ? [...sub.editHistory, newEntry] : [newEntry];
            return { ...sub, editHistory: updatedHistory };
        }
        return sub;
    }));
  }, [setSubmissions]);

  const updateCurrentHackathonData = useCallback((updates: Partial<HackathonData>) => {
    setHackathons(prevHackathons => 
        prevHackathons.map(h => 
            h.id === currentHackathonId 
            ? { ...h, data: { ...h.data, ...updates } }
            : h
        )
    );
  }, [currentHackathonId, setHackathons]);

  const updateCurrentPublicPageContent = useCallback((updates: Partial<HackathonData['publicPageContent']>) => {
    setHackathons(prevHackathons => 
        prevHackathons.map(h => 
            h.id === currentHackathonId 
            ? { ...h, data: { ...h.data, publicPageContent: { ...h.data.publicPageContent, ...updates } } }
            : h
        )
    );
  }, [currentHackathonId, setHackathons]);

  const updateCurrentOgConfig = useCallback((updates: Partial<OpenGraphConfig>) => {
    setHackathons(prevHackathons =>
        prevHackathons.map(h => {
            if (h.id === currentHackathonId) {
                // Ensure the URL is always the derived one if updates include it or if it's being initialized
                let baseAppUrl = window.location.href.split('#')[0];
                if (baseAppUrl.endsWith('index.html')) {
                    baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
                }
                if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
                    baseAppUrl = baseAppUrl.slice(0, -1);
                }
                const derivedOgUrl = `${baseAppUrl}#/public-events/${h.id}`;
                
                const newOgConfig = { 
                    ...(h.data.ogConfig || DefaultHackathonData.ogConfig), 
                    ...updates,
                    ogUrl: derivedOgUrl // Always use the derived URL
                };
                return { ...h, data: { ...h.data, ogConfig: newOgConfig } };
            }
            return h;
        })
    );
  }, [currentHackathonId, setHackathons]);
  
  const updateCurrentSchemaConfig = useCallback((updates: Partial<EventSchema>) => {
    setHackathons(prevHackathons =>
        prevHackathons.map(h => {
            if (h.id === currentHackathonId) {
                let baseAppUrl = window.location.href.split('#')[0];
                if (baseAppUrl.endsWith('index.html')) {
                    baseAppUrl = baseAppUrl.substring(0, baseAppUrl.length - 'index.html'.length);
                }
                 if (baseAppUrl.endsWith('/') && baseAppUrl !== `${window.location.protocol}//${window.location.host}/`) {
                    baseAppUrl = baseAppUrl.slice(0, -1);
                }
                const derivedSchemaUrl = `${baseAppUrl}#/public-events/${h.id}`;

                 const currentSchema = h.data.schemaConfig || defaultEventSchemaConfig;
                 const newSchema: EventSchema = { 
                    ...currentSchema, 
                    ...updates,
                    '@context': 'https://schema.org', // Ensure fixed fields
                    '@type': 'Event',                // Ensure fixed fields
                    url: derivedSchemaUrl             // Always use the derived URL
                };
                return { ...h, data: { ...h.data, schemaConfig: newSchema } };
            }
            return h;
        })
    );
  }, [currentHackathonId, setHackathons]);


  const updateCurrentWinnerConfiguration = useCallback((config: WinnerConfiguration) => {
    modifyCurrentHackathon(data => ({ ...data, winnerConfiguration: config }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons to dependency array for modifyCurrentHackathon


  const modifyCurrentHackathon = (modifier: (hackathonData: HackathonData) => HackathonData) => {
    setHackathons(prevHackathons =>
      prevHackathons.map(h =>
        h.id === currentHackathonId ? { ...h, data: modifier(h.data) } : h
      )
    );
  };

  const addQuestionToCurrentHackathon = useCallback((question: Omit<Question, 'id'>) => {
    modifyCurrentHackathon(data => ({
      ...data,
      submissionQuestions: [...data.submissionQuestions, { ...question, id: generateUniqueId() }]
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const updateQuestionInCurrentHackathon = useCallback((updatedQuestion: Question) => {
    modifyCurrentHackathon(data => ({
      ...data,
      submissionQuestions: data.submissionQuestions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const deleteQuestionInCurrentHackathon = useCallback((questionId: string) => {
    modifyCurrentHackathon(data => ({
      ...data,
      submissionQuestions: data.submissionQuestions.filter(q => q.id !== questionId)
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const addProblemStatementToCurrentHackathon = useCallback((ps: Omit<ProblemStatement, 'id'>) => {
    modifyCurrentHackathon(data => {
        const newPs = { ...ps, id: generateUniqueId() };
        let updatedWinnerConfig = data.winnerConfiguration;
        // If scope is per problem statement, add this new PS to award categories
        if (data.winnerConfiguration.scope === 'per_problem_statement') {
            updatedWinnerConfig = {
                ...data.winnerConfiguration,
                awardCategories: [
                    ...data.winnerConfiguration.awardCategories,
                    { id: newPs.id, name: newPs.title, allowedLevels: ['winner'] } // Default to 'winner'
                ]
            };
        }
        return {
            ...data,
            problemStatements: [...data.problemStatements, newPs],
            winnerConfiguration: updatedWinnerConfig
        };
    });
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const updateProblemStatementInCurrentHackathon = useCallback((updatedPs: ProblemStatement) => {
     modifyCurrentHackathon(data => {
        let updatedWinnerConfig = data.winnerConfiguration;
        if (data.winnerConfiguration.scope === 'per_problem_statement') {
            updatedWinnerConfig = {
                ...data.winnerConfiguration,
                awardCategories: data.winnerConfiguration.awardCategories.map(ac => 
                    ac.id === updatedPs.id ? { ...ac, name: updatedPs.title } : ac
                )
            };
        }
        return {
            ...data,
            problemStatements: data.problemStatements.map(p => p.id === updatedPs.id ? updatedPs : p),
            winnerConfiguration: updatedWinnerConfig
        };
    });
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const deleteProblemStatementInCurrentHackathon = useCallback((psId: string) => {
    modifyCurrentHackathon(data => {
         let updatedWinnerConfig = data.winnerConfiguration;
        if (data.winnerConfiguration.scope === 'per_problem_statement') {
            updatedWinnerConfig = {
                ...data.winnerConfiguration,
                awardCategories: data.winnerConfiguration.awardCategories.filter(ac => ac.id !== psId)
            };
        }
        return {
            ...data,
            problemStatements: data.problemStatements.filter(p => p.id !== psId),
            winnerConfiguration: updatedWinnerConfig
        };
    });
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const addStageToCurrentHackathon = useCallback((stageData: Omit<HackathonStage, 'id' | 'judgingCriteria' | 'assignedJudgeEmails'> & { judgingCriteria?: Omit<MatrixCriterion, 'id'>[] }) => {
    modifyCurrentHackathon(data => {
      const newStage: HackathonStage = {
        ...stageData,
        id: generateUniqueId(),
        judgingCriteria: (stageData.judgingCriteria || []).map(jc => ({ ...jc, id: generateUniqueId() })),
        assignedJudgeEmails: [] 
      };
      const stagesArr = [...data.stages, newStage].sort((a,b) => a.order - b.order);
      return { ...data, stages: stagesArr };
    });
  }, [currentHackathonId, setHackathons]); // Added setHackathons
  
  const updateStageInCurrentHackathon = useCallback((updatedStage: HackathonStage) => {
    modifyCurrentHackathon(data => ({
      ...data,
      stages: data.stages.map(s => s.id === updatedStage.id ? updatedStage : s).sort((a,b) => a.order - b.order)
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const deleteStageInCurrentHackathon = useCallback((stageId: string) => {
    modifyCurrentHackathon(data => ({
      ...data,
      stages: data.stages.filter(s => s.id !== stageId)
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const addCriterionToStageInCurrentHackathon = useCallback((stageId: string, criterion: Omit<MatrixCriterion, 'id'>) => {
    modifyCurrentHackathon(data => ({
        ...data,
        stages: data.stages.map(s => 
            s.id === stageId 
            ? { ...s, judgingCriteria: [...s.judgingCriteria, { ...criterion, id: generateUniqueId() }] }
            : s
        )
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const updateCriterionInStageInCurrentHackathon = useCallback((stageId: string, updatedCriterion: MatrixCriterion) => {
    modifyCurrentHackathon(data => ({
        ...data,
        stages: data.stages.map(s => 
            s.id === stageId 
            ? { ...s, judgingCriteria: s.judgingCriteria.map(jc => jc.id === updatedCriterion.id ? updatedCriterion : jc) }
            : s
        )
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const deleteCriterionInStageInCurrentHackathon = useCallback((stageId: string, criterionId: string) => {
    modifyCurrentHackathon(data => ({
        ...data,
        stages: data.stages.map(s => 
            s.id === stageId 
            ? { ...s, judgingCriteria: s.judgingCriteria.filter(jc => jc.id !== criterionId) }
            : s
        )
    }));
  }, [currentHackathonId, setHackathons]); // Added setHackathons

  const setCurrentStageForCurrentHackathon = useCallback((stageId: string | null) => {
    updateCurrentHackathonData({ currentStageId: stageId });
  }, [updateCurrentHackathonData]);

  const addSubmission = useCallback((submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'stageScores' | 'editHistory' | 'lockedBy' | 'award'>, hackathonId: string, teamId?: string): Submission | null => {
    const targetHackathon = hackathons.find(h => h.id === hackathonId);
    if (!targetHackathon || targetHackathon.data.status !== 'approved') {
        console.error("Cannot add submission: Hackathon not found or not approved.");
        alert("Error: Could not find the hackathon to submit to, or it is not currently approved for submissions.");
        return null;
    }
    
    const firstStage = targetHackathon.data.stages.sort((a,b) => a.order - b.order)[0];
    const initialStatus = firstStage ? `s_${firstStage.id}_pending_review` : 'submitted_pending_stage_assignment';
    const userEmail = currentUser?.email || "unknown@example.com";

    const newSubmission: Submission = {
      ...submissionData, 
      teamId,
      hackathonId, 
      id: generateUniqueId(),
      submittedAt: new Date().toISOString(),
      status: initialStatus,
      stageScores: [],
      editHistory: [{ timestamp: new Date().toISOString(), userEmail , action: `Submission created by ${userEmail}.` }],
      lockedBy: null,
      award: null,
    };
    setSubmissions(prev => [...prev, newSubmission]);
    return newSubmission;
  }, [setSubmissions, hackathons, currentUser]);

  const updateSubmission = useCallback((submissionId: string, updates: Partial<Omit<Submission, 'stageScores' | 'hackathonId' | 'editHistory' | 'lockedBy' | 'award'>> & { stageScoresUpdates?: Partial<StageScore> }) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        if (s.lockedBy && s.lockedBy.userEmail !== currentUser?.email && new Date(s.lockedBy.expiresAt) > new Date()) {
            alert(`This submission is currently locked for editing by ${s.lockedBy.userEmail}. Please try again later.`);
            return s; 
        }

        let updatedSubmission = { ...s, ...updates };
        if (updates.stageScoresUpdates && updates.stageScoresUpdates.stageId) {
          const stageIdToUpdate = updates.stageScoresUpdates.stageId;
          const existingStageScoreIndex = s.stageScores.findIndex(ss => ss.stageId === stageIdToUpdate);
          if (existingStageScoreIndex > -1) {
            updatedSubmission.stageScores = s.stageScores.map((ss, index) => 
              index === existingStageScoreIndex ? { ...ss, ...updates.stageScoresUpdates } : ss
            );
          } else {
            updatedSubmission.stageScores = [...s.stageScores, updates.stageScoresUpdates as StageScore];
          }
        }
        delete (updatedSubmission as any).stageScoresUpdates; 
        
        const userEmail = currentUser?.email || "unknown@example.com";
        let action = `Submission details updated by ${userEmail}.`;
        if (updates.status && updates.status !== s.status) {
             action = `Status changed from ${getStatusDisplayName(s.status, getHackathonById(s.hackathonId)?.data.stages || [], s.award)} to ${getStatusDisplayName(updates.status, getHackathonById(s.hackathonId)?.data.stages || [], updatedSubmission.award)} by ${userEmail}.`;
        } else if (updates.stageScoresUpdates) {
            const stageName = getHackathonById(s.hackathonId)?.data.stages.find(stg => stg.id === updates.stageScoresUpdates!.stageId)?.name || `Stage ${updates.stageScoresUpdates!.stageId}`;
            action = `Scores updated for ${stageName} by ${userEmail}.`;
        }
        
        const newEntry: EditHistoryEntry = { timestamp: new Date().toISOString(), userEmail, action };
        updatedSubmission.editHistory = Array.isArray(s.editHistory) ? [...s.editHistory, newEntry] : [newEntry];

        return updatedSubmission;
      }
      return s;
    }));
  }, [setSubmissions, currentUser, getHackathonById]);
  
  const scoreSubmissionAndMakeDecision = useCallback((
    submissionId: string, 
    stageId: string, 
    scores: Score[], 
    generalComment: string, 
    judgeId: string, 
    decision: 'approve' | 'reject'
  ) => {
    setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId) {
            const hackathon = getHackathonById(s.hackathonId);
            if (!hackathon) return s; 

            const newStageScore: StageScore = {
                stageId, scores, generalComment,
                judgedAt: new Date().toISOString(),
                judgeId 
            };
            const existingStageScoreIndex = s.stageScores.findIndex(ss => ss.stageId === stageId);
            let updatedStageScores = [...s.stageScores];
            if (existingStageScoreIndex > -1) {
                updatedStageScores[existingStageScoreIndex] = newStageScore;
            } else {
                updatedStageScores.push(newStageScore);
            }
            
            let newStatus = s.status;
            let emailSubject = '';
            let emailBody = '';
            const currentStageDetails = hackathon.data.stages.find(st => st.id === stageId);

            if (decision === 'approve') {
                const currentStageOrder = currentStageDetails?.order || 0;
                const nextStage = hackathon.data.stages
                    .filter(st => st.order > currentStageOrder)
                    .sort((a,b) => a.order - b.order)[0];
                
                if (nextStage) {
                    newStatus = `s_${nextStage.id}_pending_review`;
                    emailSubject = `Congratulations! You've Advanced to ${nextStage.name} in ${hackathon.data.title}`;
                    emailBody = `Dear ${s.participantName},\n\nWe are thrilled to inform you that your submission "${s.projectName}" has successfully passed "${currentStageDetails?.name}" and has advanced to the "${nextStage.name}" stage of ${hackathon.data.title}!\n\nFurther instructions for this new stage will follow. Keep up the great work!\n\nBest regards,\nThe ${hackathon.data.title} Team`;
                } else { 
                    newStatus = 'finalist_awaiting_award_decision';
                    emailSubject = `You're a Finalist in ${hackathon.data.title}!`;
                    emailBody = `Dear ${s.participantName},\n\nCongratulations! Your submission "${s.projectName}" has successfully passed all judging stages and is now a finalist in ${hackathon.data.title}!\n\nAward decisions will be announced soon. Well done!\n\nBest regards,\nThe ${hackathon.data.title} Team`;
                }
            } else { 
                newStatus = `s_${stageId}_rejected`;
                emailSubject = `Update on Your Submission to ${hackathon.data.title}`;
                emailBody = `Dear ${s.participantName},\n\nThank you for your participation in ${hackathon.data.title} with your project "${s.projectName}". After careful review for the "${currentStageDetails?.name}" stage, your submission was not selected to advance further at this time.\n\nWe appreciate your effort and encourage you to continue developing your ideas. You can view specific feedback if provided by the judges in your submission details.\n\nBest regards,\nThe ${hackathon.data.title} Team`;
            }

            sendEmail({ to: s.participantEmail, subject: emailSubject, body: emailBody });
            
            const stageName = currentStageDetails?.name || `Stage ${stageId}`;
            const action = `Scores submitted for ${stageName} by ${judgeId}. Decision: ${decision}. New status: ${getStatusDisplayName(newStatus, hackathon.data.stages, null)}.`;
            const newEntry: EditHistoryEntry = { timestamp: new Date().toISOString(), userEmail: judgeId, action };
            const updatedHistory = Array.isArray(s.editHistory) ? [...s.editHistory, newEntry] : [newEntry];

            return { ...s, stageScores: updatedStageScores, status: newStatus, editHistory: updatedHistory };
        }
        return s;
    }));
  }, [setSubmissions, getHackathonById]);

  const advanceSubmissionStatus = useCallback((submissionId: string, newStatus: string, adminEmail?: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if(submission) {
        const hackathon = getHackathonById(submission.hackathonId);
        const effectiveAdminEmail = adminEmail || currentUser?.email || "admin@example.com";
        let emailSubject = '';
        let emailBody = '';

        if (newStatus.startsWith('s_') && newStatus.endsWith('_pending_review') && submission.status === 'submitted_pending_stage_assignment') {
            const stageId = newStatus.split('_')[1];
            const stage = hackathon?.data.stages.find(st => st.id === stageId);
            emailSubject = `Your Submission to ${hackathon?.data.title} is Under Review for ${stage?.name}`;
            emailBody = `Dear ${submission.participantName},\n\nYour submission "${submission.projectName}" for ${hackathon?.data.title} has been assigned to the "${stage?.name}" stage and is now pending review.\n\nGood luck!\n\nThe ${hackathon?.data.title} Team`;
        } else if (newStatus === 'eliminated') {
            emailSubject = `Update on Your Submission to ${hackathon?.data.title}`;
            emailBody = `Dear ${submission.participantName},\n\nThank you for your participation in ${hackathon?.data.title} with your project "${submission.projectName}". After further review, your submission will not be advancing in the competition.\n\nWe appreciate your effort and encourage you to continue developing your ideas.\n\nBest regards,\nThe ${hackathon?.data.title} Team`;
        }
        
        if(emailSubject && emailBody){
            sendEmail({ to: submission.participantEmail, subject: emailSubject, body: emailBody });
        }

        updateSubmission(submissionId, { status: newStatus }); 
    }
  }, [submissions, updateSubmission, currentUser, getHackathonById]);

  const assignAwardToSubmission = useCallback((submissionId: string, awardDetail: AwardDetail, adminEmail: string) => {
    setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId) {
            const newAward: Award = { 
                ...awardDetail, 
                awardedAt: new Date().toISOString(), 
                awardedBy: adminEmail 
            };
            const hackathon = getHackathonById(s.hackathonId);
            const awardLevelDisplay = awardDetail.level.replace('_',' ');
            const emailSubject = `🏆 Congratulations! You've Received an Award in ${hackathon?.data.title}!`;
            const emailBody = `Dear ${s.participantName},\n\nWe are thrilled to announce that your project "${s.projectName}" has been awarded "${awardLevelDisplay} - ${awardDetail.categoryName}" in ${hackathon?.data.title}!\n\nYour hard work and innovation have truly impressed everyone. Congratulations on this fantastic achievement!\n\nBest regards,\nThe ${hackathon?.data.title} Team`;
            sendEmail({ to: s.participantEmail, subject: emailSubject, body: emailBody });

            const action = `Awarded "${awardLevelDisplay} - ${awardDetail.categoryName}" by ${adminEmail}.`;
            _addEditHistoryEntry(submissionId, adminEmail, action);
            return { ...s, award: newAward, status: 'award_assigned' };
        }
        return s;
    }));
  }, [setSubmissions, getHackathonById, _addEditHistoryEntry]);

  const recindAwardFromSubmission = useCallback((submissionId: string, adminEmail: string) => {
    setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId && s.award) {
            const hackathon = getHackathonById(s.hackathonId);
            const awardLevelDisplay = s.award.level.replace('_',' ');
            const emailSubject = `Important Update Regarding Your Award in ${hackathon?.data.title}`;
            const emailBody = `Dear ${s.participantName},\n\nThis email is to inform you of an update regarding the awards for ${hackathon?.data.title}. The previously communicated award for your project "${s.projectName}" ("${awardLevelDisplay} - ${s.award.categoryName}") has been recinded due to an administrative review.\n\nWe understand this may be disappointing and apologize for any confusion. Please contact the hackathon organizers if you have questions.\n\nBest regards,\nThe ${hackathon?.data.title} Team`;
            sendEmail({ to: s.participantEmail, subject: emailSubject, body: emailBody });
            
            const action = `Award "${awardLevelDisplay} - ${s.award.categoryName}" recinded by ${adminEmail}.`;
            _addEditHistoryEntry(submissionId, adminEmail, action);
            return { ...s, award: null, status: 'finalist_awaiting_award_decision' };
        }
        return s;
    }));
  }, [setSubmissions, getHackathonById, _addEditHistoryEntry]);
  
  const revertSubmissionStage = useCallback((submissionId: string, targetStageId: string, adminEmail: string) => {
    setSubmissions(prev => prev.map(s => {
        if (s.id === submissionId) {
            const hackathon = getHackathonById(s.hackathonId);
            if (!hackathon) return s;

            const targetStage = hackathon.data.stages.find(st => st.id === targetStageId);
            if (!targetStage) return s;

            // Clear scores for the target stage and any subsequent stages
            const updatedStageScores = s.stageScores.filter(ss => {
                const scoreStage = hackathon.data.stages.find(hst => hst.id === ss.stageId);
                return scoreStage && scoreStage.order < targetStage.order;
            });
            
            const newStatus = `s_${targetStageId}_pending_review`;
            const action = `Submission stage reverted to "${targetStage.name}" by ${adminEmail}. Scores for this and subsequent stages cleared.`;
            _addEditHistoryEntry(submissionId, adminEmail, action);

            const emailSubject = `Update: Submission Reverted to Previous Stage in ${hackathon.data.title}`;
            const emailBody = `Dear ${s.participantName},\n\nYour submission "${s.projectName}" for ${hackathon.data.title} has been reverted to the stage: "${targetStage.name}" by an administrator.\n\nYou may need to resubmit or await further review for this stage. Please check your submission details or contact the organizers for more information.\n\nBest regards,\nThe ${hackathon.data.title} Team`;
            sendEmail({ to: s.participantEmail, subject: emailSubject, body: emailBody });

            return { ...s, status: newStatus, stageScores: updatedStageScores, award: null }; // Also clear award if any
        }
        return s;
    }));
  }, [setSubmissions, getHackathonById, _addEditHistoryEntry]);


  const getSubmissionById = useCallback((submissionId: string) => {
    return submissions.find(s => s.id === submissionId);
  }, [submissions]);

  const getSubmissionsByHackathonId = useCallback((hackathonId: string) => {
    return submissions.filter(s => s.hackathonId === hackathonId);
  }, [submissions]);

  const addQuestionForHackathon = useCallback((hackathonId: string, questionText: string, participantName: string, participantEmail?: string) => {
    setHackathons(prevHackathons =>
      prevHackathons.map(h => {
        if (h.id === hackathonId) {
          const newQ: HackathonQuestion = {
            id: generateUniqueId(), hackathonId, questionText,
            askedByParticipantName: participantName, askedByParticipantEmail: participantEmail,
            askedAt: new Date().toISOString(),
            answerText: undefined, answeredByAdminEmail: undefined, answeredAt: undefined,
          };
          const existingQuestions = Array.isArray(h.data.questions) ? h.data.questions : [];
          const updatedQuestions = [...existingQuestions, newQ];
          return { ...h, data: { ...h.data, questions: updatedQuestions } };
        }
        return h;
      })
    );
  }, [setHackathons]);

  const answerHackathonQuestion = useCallback((hackathonId: string, questionId: string, answerText: string, adminEmail: string) => {
    setHackathons(prevHackathons =>
      prevHackathons.map(h => {
        if (h.id === hackathonId) {
          const existingQuestions = Array.isArray(h.data.questions) ? h.data.questions : [];
          return {
            ...h,
            data: {
              ...h.data,
              questions: existingQuestions.map(q =>
                q.id === questionId
                  ? { ...q, answerText, answeredByAdminEmail: adminEmail, answeredAt: new Date().toISOString() }
                  : q
              ),
            },
          };
        }
        return h;
      })
    );
  }, [setHackathons]);

  const createTeamForSubmission = useCallback(async (submissionId: string, hackathonId: string, teamName: string, leaderEmail: string): Promise<Team | null> => {
    const teamId = generateUniqueId();
    const newTeam: Team = {
        id: teamId, hackathonId, submissionId, name: teamName,
        leaderEmail, createdAt: new Date().toISOString(),
    };
    setTeams(prev => [...prev, newTeam]);
    setTeamMembers(prev => [...prev, {
        id: generateUniqueId(), teamId, participantEmail: leaderEmail,
        status: 'accepted', invitedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(), role: 'leader',
    }]);
    setSubmissions(prevSubs => prevSubs.map(sub => 
        sub.id === submissionId ? { ...sub, teamId: newTeam.id } : sub
    ));
    _addEditHistoryEntry(submissionId, leaderEmail, `Team "${teamName}" created by leader.`);
    return newTeam;
  }, [setTeams, setTeamMembers, setSubmissions, _addEditHistoryEntry]);

  const inviteTeamMember = useCallback(async (teamId: string, inviteeEmail: string, inviterEmail: string): Promise<boolean> => {
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      alert("Team not found.");
      return false;
    }
    if (teamMembers.find(tm => tm.teamId === teamId && tm.participantEmail.toLowerCase() === inviteeEmail.toLowerCase())) {
      alert(`${inviteeEmail} is already part of this team or has a pending invitation.`);
      return false;
    }
    const newInvite: TeamMember = {
      id: generateUniqueId(), teamId, participantEmail: inviteeEmail, status: 'invited',
      invitedAt: new Date().toISOString(), role: 'member'
    };
    setTeamMembers(prev => [...prev, newInvite]);
    _addEditHistoryEntry(team.submissionId, inviterEmail, `Invited ${inviteeEmail} to team "${team.name}".`);
    return true;
  }, [teams, teamMembers, setTeamMembers, _addEditHistoryEntry]);

  const respondToTeamInvitation = useCallback(async (invitationId: string, status: 'accepted' | 'declined', participantEmail: string): Promise<boolean> => {
    const invitation = teamMembers.find(tm => tm.id === invitationId && tm.participantEmail.toLowerCase() === participantEmail.toLowerCase() && tm.status === 'invited');
    if (!invitation) {
      alert("Invitation not found or already responded to.");
      return false;
    }
    setTeamMembers(prev => prev.map(tm => 
        tm.id === invitationId ? { ...tm, status, joinedAt: status === 'accepted' ? new Date().toISOString() : undefined } : tm
    ));
    const team = teams.find(t => t.id === invitation.teamId);
    if(team) {
        _addEditHistoryEntry(team.submissionId, participantEmail, `${participantEmail} ${status} invitation to team "${team.name}".`);
    }
    return true;
  }, [teamMembers, setTeamMembers, teams, _addEditHistoryEntry]);

  const removeTeamMember = useCallback(async (teamId: string, memberEmailToRemove: string, removerEmail: string): Promise<boolean> => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.leaderEmail !== removerEmail) {
      alert("Only team leader can remove members.");
      return false;
    }
    if (memberEmailToRemove === team.leaderEmail) {
      alert("Leader cannot remove themselves. Consider transferring leadership or deleting the team.");
      return false;
    }
    const memberExists = teamMembers.find(tm => tm.teamId === teamId && tm.participantEmail === memberEmailToRemove && tm.status === 'accepted');
    if (!memberExists) {
      alert("Member not found or not an accepted member of this team.");
      return false;
    }
    setTeamMembers(prev => prev.filter(tm => !(tm.teamId === teamId && tm.participantEmail === memberEmailToRemove)));
     _addEditHistoryEntry(team.submissionId, removerEmail, `Removed ${memberEmailToRemove} from team "${team.name}".`);
    return true;
  }, [teams, teamMembers, setTeamMembers, _addEditHistoryEntry]);

  const leaveTeam = useCallback(async (teamId: string, participantEmail: string): Promise<boolean> => {
    const team = teams.find(t => t.id === teamId);
    if (!team) {
        alert("Team not found.");
        return false;
    }
    if (team.leaderEmail.toLowerCase() === participantEmail.toLowerCase()) {
        alert("Team leaders cannot leave their team using this option. They may need to delete the team or transfer leadership (functionality not yet implemented).");
        return false;
    }
    const memberIndex = teamMembers.findIndex(tm => 
        tm.teamId === teamId && 
        tm.participantEmail.toLowerCase() === participantEmail.toLowerCase() && 
        tm.status === 'accepted'
    );

    if (memberIndex === -1) {
        alert("You are not an active member of this team or an error occurred.");
        return false;
    }

    setTeamMembers(prev => prev.map((tm, index) => 
        index === memberIndex ? { ...tm, status: 'left' } : tm
    ));

    _addEditHistoryEntry(team.submissionId, participantEmail, `Participant ${participantEmail} left team "${team.name}".`);
    return true;
  }, [teams, teamMembers, setTeamMembers, _addEditHistoryEntry]);

  const deleteTeamSubmission = useCallback(async (submissionId: string, userEmail: string): Promise<boolean> => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
        alert("Submission not found.");
        return false;
    }
    if (!submission.teamId) { // If it's a solo submission
        if (submission.participantEmail.toLowerCase() !== userEmail.toLowerCase()) {
            alert("Only the submitter can delete this solo submission.");
            return false;
        }
    } else { // If it's a team submission
        const team = teams.find(t => t.id === submission.teamId);
        if (!team) {
            alert("Associated team not found. Data inconsistency detected.");
            return false; // Should ideally not happen if teamId exists
        }
        if (team.leaderEmail.toLowerCase() !== userEmail.toLowerCase()) {
            alert("Only the team leader can delete this team submission.");
            return false;
        }
        setTeams(prev => prev.filter(t => t.id !== submission.teamId));
        setTeamMembers(prev => prev.filter(tm => tm.teamId !== submission.teamId));
    }
    
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    _addEditHistoryEntry(submissionId, userEmail, `Submission "${submission.projectName}" deleted by ${userEmail}.`);
    return true;
  }, [submissions, teams, teamMembers, setSubmissions, setTeams, setTeamMembers, _addEditHistoryEntry]);


  const getTeamById = useCallback((teamId: string) => teams.find(t => t.id === teamId), [teams]);
  const getTeamMembersByTeamId = useCallback((teamId: string) => teamMembers.filter(tm => tm.teamId === teamId), [teamMembers]);
  const getInvitationsForParticipant = useCallback((participantEmail: string) => 
    teamMembers.filter(tm => tm.participantEmail.toLowerCase() === participantEmail.toLowerCase() && tm.status === 'invited'), 
  [teamMembers]);

  const getSubmissionsForParticipant = useCallback((participantEmail: string): Submission[] => {
    const lowerEmail = participantEmail.toLowerCase();
    return submissions.filter(sub => {
        const hackathon = getHackathonById(sub.hackathonId);
        if(!hackathon || hackathon.data.status !== 'approved') return false; 

        if (sub.participantEmail.toLowerCase() === lowerEmail) return true; 
        if (sub.teamId) {
            const team = teams.find(t => t.id === sub.teamId);
            if (team) {
                return teamMembers.some(tm => tm.teamId === team.id && tm.participantEmail.toLowerCase() === lowerEmail && tm.status === 'accepted');
            }
        }
        return false;
    });
  }, [submissions, teams, teamMembers, getHackathonById]);

  const getTeamsForParticipant = useCallback((participantEmail: string): Team[] => {
    const lowerEmail = participantEmail.toLowerCase();
    const teamIds = new Set<string>();
    teamMembers.forEach(tm => {
        if (tm.participantEmail.toLowerCase() === lowerEmail && tm.status === 'accepted') {
            const team = teams.find(t => t.id === tm.teamId);
            if(team) {
                 const hackathon = getHackathonById(team.hackathonId);
                 if(hackathon && hackathon.data.status === 'approved') { 
                    teamIds.add(tm.teamId);
                 }
            }
        }
    });
    return teams.filter(t => teamIds.has(t.id));
  }, [teams, teamMembers, getHackathonById]);

  const acquireEditLock = useCallback(async (submissionId: string, userEmail: string): Promise<boolean> => {
    let success = false;
    setSubmissions(prevSubs => prevSubs.map(sub => {
        if (sub.id === submissionId) {
            if (!sub.lockedBy || new Date(sub.lockedBy.expiresAt) < new Date() || sub.lockedBy.userEmail === userEmail) {
                success = true;
                _addEditHistoryEntry(submissionId, userEmail, `Acquired edit lock.`);
                return { ...sub, lockedBy: { userEmail, expiresAt: new Date(Date.now() + LOCK_DURATION_MS).toISOString() } };
            }
        }
        return sub;
    }));
    return success;
  }, [setSubmissions, _addEditHistoryEntry]);

  const releaseEditLock = useCallback(async (submissionId: string, userEmail: string): Promise<boolean> => {
    let success = false;
    setSubmissions(prevSubs => prevSubs.map(sub => {
        if (sub.id === submissionId && sub.lockedBy && sub.lockedBy.userEmail === userEmail) {
            success = true;
            _addEditHistoryEntry(submissionId, userEmail, `Released edit lock.`);
            return { ...sub, lockedBy: null };
        }
        return sub;
    }));
    return success;
  }, [setSubmissions, _addEditHistoryEntry]);
  
  const getParticipantHackathonHistory = useCallback((participantEmail: string): ParticipantHackathonHistoryEntry[] => {
    const history: ParticipantHackathonHistoryEntry[] = [];
    const lowerEmail = participantEmail.toLowerCase();

    submissions.forEach(sub => {
        const hackathon = hackathons.find(h => h.id === sub.hackathonId);
        if (!hackathon) return; 

        let roleInTeam = "Solo";
        let teamName: string | undefined = undefined;

        if (sub.teamId) {
            const team = teams.find(t => t.id === sub.teamId);
            if (team) {
                teamName = team.name;
                if (team.leaderEmail.toLowerCase() === lowerEmail) {
                    roleInTeam = "Leader";
                } else {
                    const memberEntry = teamMembers.find(tm => tm.teamId === team.id && tm.participantEmail.toLowerCase() === lowerEmail && tm.status === 'accepted');
                    if (memberEntry) {
                        roleInTeam = "Member";
                    } else { 
                       if(sub.participantEmail.toLowerCase() !== lowerEmail) return; 
                       roleInTeam = "Submitter (Team context)"; 
                    }
                }
            }
        } else { 
             if (sub.participantEmail.toLowerCase() !== lowerEmail) return; 
        }
        
        history.push({
            hackathonId: hackathon.id,
            hackathonTitle: hackathon.data.title,
            submissionId: sub.id,
            submissionProjectName: sub.projectName,
            teamId: sub.teamId,
            teamName,
            roleInTeam,
            submittedAt: sub.submittedAt,
            status: getStatusDisplayName(sub.status, hackathon.data.stages, sub.award),
        });
    });
    return history.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [submissions, hackathons, teams, teamMembers]);


  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      theme, toggleTheme,
      adminUsers, addAdminUser, removeAdminUser, getAdminAssignments,
      judges, addJudge, removeJudgeUser, getJudgeAssignments,
      hackathons, currentHackathonId, addHackathon, selectHackathon, getHackathonById, getCurrentHackathon, deleteHackathon,
      assignAdminToHackathon, removeAdminFromHackathon, 
      approveHackathon, declineHackathon, archiveHackathon,
      updateCurrentHackathonData, updateCurrentPublicPageContent, updateCurrentOgConfig, updateCurrentSchemaConfig, updateCurrentWinnerConfiguration,
      addQuestionToCurrentHackathon, updateQuestionInCurrentHackathon, deleteQuestionInCurrentHackathon,
      addProblemStatementToCurrentHackathon, updateProblemStatementInCurrentHackathon, deleteProblemStatementInCurrentHackathon,
      addStageToCurrentHackathon, updateStageInCurrentHackathon, deleteStageInCurrentHackathon,
      addCriterionToStageInCurrentHackathon, updateCriterionInStageInCurrentHackathon, deleteCriterionInStageInCurrentHackathon,
      setCurrentStageForCurrentHackathon,
      assignJudgeToStage, removeJudgeFromStage, 
      submissions, addSubmission, updateSubmission, getSubmissionById, getSubmissionsByHackathonId,
      scoreSubmissionAndMakeDecision, 
      advanceSubmissionStatus, deleteTeamSubmission,
      assignAwardToSubmission, recindAwardFromSubmission, revertSubmissionStage,
      addQuestionForHackathon, answerHackathonQuestion,
      teams, teamMembers, createTeamForSubmission, inviteTeamMember, respondToTeamInvitation, removeTeamMember, leaveTeam,
      getTeamById, getTeamMembersByTeamId, getInvitationsForParticipant, getSubmissionsForParticipant, getTeamsForParticipant,
      acquireEditLock, releaseEditLock,
      getParticipantHackathonHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};