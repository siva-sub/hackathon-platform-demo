
# Hackathon Management Platform - Feature List

This document provides a comprehensive list of features available in the Hackathon Management Platform.

## I. General Platform Features

*   **User Authentication & Role Management:**
    *   Secure login/logout for all user roles (simulated with email input for demo).
    *   Distinct dashboards and functionalities based on user role (Super Admin, Admin, Participant, Judge).
*   **Dark/Light Mode Theme:**
    *   User-selectable theme preference, persisted via `localStorage`.
    *   Consistent application of theme across all components and pages.
*   **Responsive Design:**
    *   UI adapts to various screen sizes (desktop, tablet, mobile).
*   **Rich Text Editing & Viewing:**
    *   Utilizes **React Quill** for creating formatted content in various sections:
        *   Hackathon: Description, Rules, Timeline, Public Page About Section.
        *   Problem Statements: Description.
        *   Hackathon Stages: Description.
        *   Judging Criteria: Description.
        *   Submission Questions: Participant answers of type 'textarea'.
        *   Participant Q&A: Questions and Answers.
        *   Judge Feedback: General comments and per-criterion comments.
        *   Admin Settings: Open Graph Description, Schema.org Event Description.
    *   Supports common formatting options (headers, bold, italic, lists, links).
    *   A dedicated **RichTextViewer** component is used to safely render this HTML content across the platform.
*   **Client-Side Data Persistence:**
    *   All application data (hackathons, users, submissions, etc.) is stored and managed using `localStorage`, simulating a backend for demo purposes.
*   **AI-Assisted Features (Conceptual/Mocked):**
    *   **Best Practice Tips:** Admins can request AI-generated (mocked) tips for various aspects of hackathon management (e.g., event settings, problem statements, judging).
    *   **Content Generation Aid:** Placeholder prompts within forms suggest where AI could assist in drafting content (e.g., descriptions, rules).
    *   **AI Summary for Judging:** Judges can request an AI-generated (mocked) summary of a submission to aid in their review process.
*   **Navigation & Routing:**
    *   Client-side routing using React Router (HashRouter).
    *   Clear navigation bar with role-specific links.
    *   Mobile-friendly navigation menu.
*   **Notifications/Alerts:**
    *   User-friendly alerts for success messages, errors, and warnings.
    *   (Mocked) Email notifications for key events (e.g., submission status changes, team invitations, hackathon approval/decline).
*   **Accessibility:**
    *   Semantic HTML and ARIA attributes used where appropriate (e.g., buttons, modals).
    *   Keyboard navigation support for interactive elements.
    *   Focus management in modals and forms.

## II. Super Administrator Features (`/superadmin`)

*   **Platform User Management:**
    *   **Admin Users:**
        *   Add new platform administrators by email.
        *   View list of existing platform administrators.
        *   Remove platform administrators (cannot remove the main superadmin@example.com).
        *   View hackathons managed by or created by a specific admin.
        *   (Mock) Resend invitation to admins.
    *   **Judge Users:**
        *   Add new platform judges by email.
        *   View list of existing platform judges.
        *   Remove platform judges.
        *   View stages/hackathons a specific judge is assigned to.
        *   (Mock) Resend invitation to judges.
*   **Hackathon Event Management (Global):**
    *   **Create New Hackathons:**
        *   Define title and description for new hackathons.
        *   Hackathons created by Super Admin are auto-approved.
    *   **View All Hackathons:**
        *   List all hackathons on the platform, regardless of status.
        *   Filter hackathons by status (Pending Approval, Approved, Declined, Archived).
        *   Sort hackathons by creation date or title.
    *   **Hackathon Approval Workflow:**
        *   Approve hackathons submitted by Admins.
        *   Decline hackathons submitted by Admins, with a mandatory reason (Super Admin receives mock email).
        *   Archive approved hackathons (makes them inactive and closes submissions).
    *   **Assign/Remove Admins to/from Hackathons:**
        *   Manage which administrators are responsible for specific hackathon events via a modal interface.
    *   **Delete Hackathons:**
        *   Permanently remove a hackathon and all its associated data (submissions, teams, etc.).
*   **Participant Activity Monitoring:**
    *   Lookup a participant by email to view their complete hackathon history across the platform (submissions, teams, roles, statuses, awards).

## III. Administrator Features (`/admin`)

*   **Admin Dashboard:**
    *   Overview of the currently selected managed hackathon (status, total submissions, problem statements, stages).
    *   Access to AI-powered best practice tips for effective hackathon management.
*   **Hackathon Creation (Admin-Specific):**
    *   Admins can create new hackathons (defining title and brief description), which are then submitted to Super Admins for approval.
*   **Hackathon Selection:**
    *   Dropdown to select which managed/created hackathon to configure.
*   **Hackathon Configuration (for selected hackathon):**
    *   **General Settings:**
        *   Edit title.
        *   Edit description, rules, timeline using a Rich Text Editor.
        *   Toggle "Accepting Submissions" status.
        *   Set the "Current Active Stage" for the hackathon from a dropdown of defined stages.
    *   **Public Page Content:**
        *   Customize Hero Title, Hero Subtitle.
        *   Customize "About Section" using a Rich Text Editor.
        *   Set Image URL for the public-facing event page.
    *   **Social Sharing (Open Graph):**
        *   Configure OG tags: title, description (Rich Text Editor), image URL, type.
        *   View an approximate preview of how the page will look when shared.
        *   OG URL is auto-generated and displayed (read-only).
    *   **Schema Markup (SEO):**
        *   Configure `Event` schema.org properties: name, description (Rich Text Editor), start/end dates, status, attendance mode, location (virtual/physical with address), image, organizer (name, URL).
        *   Schema URL is auto-generated and displayed (read-only).
    *   **Problem Statements:**
        *   Add new problem statements with title and description (Rich Text Editor).
        *   Edit existing problem statements.
        *   Delete problem statements.
    *   **Hackathon Stages:**
        *   Add new stages with name, order, and description (Rich Text Editor).
        *   Edit existing stages.
        *   Delete stages.
        *   Reorder stages (implicitly through 'order' field).
        *   **Judging Criteria per Stage:**
            *   Add new criteria with name, description (Rich Text Editor), and max score.
            *   Edit existing criteria.
            *   Delete criteria.
        *   **Assign/Remove Judges to/from Stages:**
            *   Assign registered platform judges to specific stages of an *approved* hackathon.
            *   View and remove assigned judges per stage. Disabled if hackathon is not approved.
    *   **Submission Questions:**
        *   Define custom questions (text input, textarea - implies rich text answers from participants, URL) that participants must answer during submission.
        *   Add, edit, and delete submission questions.
    *   **Participant Q&A Management:**
        *   View questions asked by participants (displayed using Rich Text Viewer).
        *   Provide answers using a Rich Text Editor.
        *   Edit previously submitted answers.
    *   **Winner Configuration:**
        *   Define winner scope: Overall Event or Per Problem Statement.
        *   Configure award categories (e.g., "Overall Event", or dynamically based on Problem Statement titles).
        *   Specify allowed award levels (Winner, Runner-up, Second Runner-up) for each category.
*   **Submission Management:**
    *   View a table of all submissions for the selected hackathon.
    *   Filter submissions by stage and status keyword.
    *   View detailed submission information (answers - rich text displayed via viewer, project links, team details, scores, award).
    *   Manually advance submission status (e.g., assign to initial stage, mark as eliminated - triggers mock email).
    *   Assign awards to submissions based on the configured winner settings (triggers mock email).
    *   Recind awards from submissions (triggers mock email).
    *   Revert a submission to a previous stage (clears scores for target and subsequent stages, triggers mock email).

## IV. Participant Features (`/participant`)

*   **Participant Hub:**
    *   Central navigation for hackathon listings, submissions, and team management.
*   **Hackathon Discovery:**
    *   View a list of all *approved* hackathons.
    *   Cards display title, image (with fallback), description, submission status, and current stage.
    *   Links to the detailed public page for each hackathon.
*   **Project Submission (`/participant/submit` or `/participant/submit/:submissionId`):**
    *   Select an active and approved hackathon to submit to (if creating new).
    *   Enter personal information (name, email - prefilled).
    *   Specify project name and select a problem statement.
    *   Provide project repository URL and demo URL (optional).
    *   Answer hackathon-specific submission questions. Questions of type 'textarea' use a Rich Text Editor for answers.
    *   **Edit Submissions:**
        *   Edit existing submissions they have created or are part of (if hackathon is accepting submissions and they hold the lock).
        *   **Edit Lock System:** Acquire an exclusive lock (5 min duration) to edit a submission, preventing concurrent edits. Lock status is displayed. Ability to take over an expired lock. Automatic release on save (or manual release on navigating away if held).
    *   **Team Creation (during initial submission - optional):**
        *   Option to mark submission as a team project and provide a team name.
        *   The submitter automatically becomes the team leader.
*   **My Submissions Page:**
    *   View a list of all projects submitted by the participant or teams they are part of (for approved hackathons).
    *   See current status, hackathon, problem statement, submission date, and lock status.
    *   Links to view detailed submission information (including rich text answers via viewer and scores) and edit submissions.
    *   Team Leaders can delete their team's submission (and the team).
*   **Team Management (`/participant/teams`):**
    *   View teams they are a member or leader of (for projects in approved hackathons).
    *   See team members and their status (leader, member, invited, declined).
    *   **Team Leaders:**
        *   Invite new members to their team by email (triggers mock email).
        *   Remove accepted members from their team (cannot remove self).
    *   **Team Members:**
        *   Leave a team they are part of (leaders cannot leave this way).
    *   **Invitations:**
        *   View pending invitations to join other teams.
        *   Accept or decline team invitations.
*   **Public Q&A Interaction:**
    *   View Q&A for a specific hackathon.
    *   Ask questions using a Rich Text Editor on a hackathon's Q&A page if they have a submission for that hackathon.

## V. Judge Features (`/judge`)

*   **Judge Dashboard:**
    *   Select an *approved* hackathon they are assigned to judge from a dropdown.
    *   View submissions assigned for review based on the hackathon's current active stage and their assignment to that stage. Submissions must be in 'pending_review' or 'judging' status for the assigned stage.
    *   Overview of the current stage and its judging criteria (descriptions displayed via Rich Text Viewer).
*   **Judging Interface (`/judge/submission/:submissionId`):**
    *   View detailed information of the submission to be judged (including rich text answers via viewer).
    *   Access AI-generated (mocked) summary of the submission.
    *   Score the submission against each criterion defined for the current stage.
        *   Input numerical score.
        *   Provide per-criterion feedback/comments using a Rich Text Editor.
    *   Provide overall general feedback/comments for the submission at that stage using a Rich Text Editor.
    *   Submit scores and make a decision:
        *   **Approve for Next Stage / Recommend as Finalist:** Advances the submission (triggers mock email).
        *   **Reject from this Stage:** Marks the submission as rejected for the current stage (triggers mock email).

## VI. Public-Facing Hackathon Pages

*   **Public Hackathon List (`/public-events`):**
    *   Displays cards for all *approved* hackathons.
    *   Each card shows title, image (with fallback), short description (plain text from rich text), submission status, and current stage.
    *   Links to the detailed public page for each hackathon.
*   **Public Hackathon Detail Page (`/public-events/:hackathonId`):**
    *   Dynamically generated page for each *approved* hackathon.
    *   **Content:**
        *   Customizable Hero section (title, subtitle (Rich Text display), background image with fallback).
        *   "About" section (Rich Text display).
        *   List of Problem Statements with titles and descriptions (Rich Text display).
        *   Timeline (Rich Text display).
        *   Rules & Guidelines (Rich Text display).
        *   Current active stage display.
        *   Call to action to submit (if open and user is participant) or log in/register.
        *   Link to the Q&A page.
    *   **SEO & Social Sharing:**
        *   Populates Open Graph (OG) meta tags for social media sharing (title, description (plain text from rich text), image, type, URL).
        *   Implements `Event` Schema.org structured data (description is plain text from rich text).
*   **Public Hackathon Q&A Page (`/public-events/:hackathonId/qanda`):**
    *   Displays all questions (Rich Text display) asked by participants for that hackathon and their corresponding answers (Rich Text display) from administrators.
    *   Questions are sorted with answered ones first, then by date.
    *   Logged-in participants who have submitted to *this* hackathon can ask new questions using a Rich Text Editor.

## VII. Data Structures & Models (Implicit)

*   Comprehensive TypeScript types define the structure for:
    *   Users (CurrentUser, AdminUser, JudgeUser)
    *   Hackathons (Hackathon, HackathonData including rich text fields for description, rules, timeline, publicPageContent.aboutSection; HackathonStage including rich text description; ProblemStatement including rich text description; Question; MatrixCriterion including rich text description; OpenGraphConfig including rich text ogDescription; EventSchema including rich text description; WinnerConfiguration; HackathonQuestion including rich text questionText and answerText)
    *   Submissions (Submission; Answer including rich text value if question type is textarea; Score including rich text comment; StageScore including rich text generalComment; EditHistoryEntry; Award)
    *   Teams (Team, TeamMember)
    *   And various configuration and status types.
