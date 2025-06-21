
# Hackathon Management Platform - Workflows

This document outlines the typical operational flows for different user roles and key system interactions within the Hackathon Management Platform.

## I. General Platform Workflows

*   **User "Login" (Demo):**
    1.  User navigates to the HomePage.
    2.  User selects a role (Super Admin, Admin, Participant, Judge).
    3.  If Admin, Participant, or Judge, a modal prompts for an email address.
        *   Admin/Judge emails are validated against a pre-configured list (see Demo Credentials).
        *   Participant emails can be any valid format.
    4.  Upon successful "login", the user is redirected to their respective role-based dashboard.
    5.  Super Admin role selection directly logs in as `superadmin@example.com`.
*   **Theme Toggle:**
    1.  User clicks the Sun/Moon icon in the Navbar.
    2.  The platform theme switches between light and dark mode.
    3.  The preference is saved in `localStorage` and persists across sessions.
*   **Viewing Public Hackathon Information:**
    1.  Any user (logged in or not) can navigate to `/public-events`.
    2.  A list of *approved* hackathons is displayed.
    3.  User clicks on a hackathon card to view its detailed public page (`/public-events/:hackathonId`).
    4.  User can navigate to the Q&A section for that hackathon (`/public-events/:hackathonId/qanda`).

## II. Super Administrator Workflows (`/superadmin`)

1.  **Platform Setup & User Management:**
    *   **Adding Platform Admins/Judges:**
        1.  Navigate to the "Manage Platform Administrators" or "Manage Platform Judges" section.
        2.  Enter the email of the new admin/judge and submit.
        3.  User is added to the platform's list of admins/judges.
        4.  (Mock) Invitation email is "sent".
    *   **Removing Platform Admins/Judges:**
        1.  Find the admin/judge in the respective list.
        2.  Click "Remove". User is removed from the platform and unassigned from any hackathons/stages.
2.  **Hackathon Lifecycle Management:**
    *   **Creating a Hackathon (Super Admin):**
        1.  In "Manage Hackathon Events", fill in the title and optional description.
        2.  Submit the form. The hackathon is created with "Approved" status and assigned to the Super Admin.
    *   **Reviewing Admin-Created Hackathons:**
        1.  View hackathons with "Pending Approval" status in the "Manage Hackathon Events" table.
        2.  **Approve:** Click "Approve". Hackathon status changes to "Approved". (Mock) Email sent to creating admin.
        3.  **Decline:** Click "Decline". A modal appears requiring a reason. Submit reason. Hackathon status changes to "Declined". (Mock) Email sent to creating admin.
    *   **Managing Admins for a Hackathon:**
        1.  Click "Manage Admins" for a specific hackathon.
        2.  In the modal, select an available platform admin from the dropdown and click "Assign".
        3.  Click "Remove" next to an already assigned admin to unassign them.
    *   **Archiving a Hackathon:**
        1.  For an "Approved" hackathon, click "Archive". Status changes to "Archived", and `isAcceptingSubmissions` is set to `false`.
    *   **Deleting a Hackathon:**
        1.  Click "Delete" for any hackathon. Confirm action. Hackathon and all related data are removed.
3.  **Monitoring Participant Activity:**
    1.  Enter a participant's email in the "View Participant Hackathon History" section.
    2.  Submit. A table displays all hackathons the participant has engaged with, their project, team role, and status.

## III. Administrator Workflows (`/admin`)

1.  **Hackathon Creation & Initial Setup:**
    *   **Creating a Hackathon (Admin):**
        1.  On the Admin Dashboard, fill in the "Create New Hackathon" form (title, description).
        2.  Submit. The hackathon is created with "Pending Approval" status and the creator as an admin. Super Admin is notified (mock).
    *   **Selecting a Hackathon to Manage:**
        1.  Use the dropdown at the top of the AdminPage to select a hackathon they manage or created (if pending/declined).
2.  **Configuring the Selected Hackathon (once approved, some settings can be pre-configured):**
    *   Navigate through the side menu (Settings, Problem Statements, Stages, etc.).
    *   **Event Settings:** Update title, description (rich text), rules (rich text), timeline (rich text). Toggle submission status. Set current active stage.
    *   **Public Page Content:** Customize hero title, subtitle, about section (rich text), image URL.
    *   **Social Sharing (OG):** Configure OG meta tags (title, description (rich text), image, type). URL is auto-generated.
    *   **Schema Markup (SEO):** Configure Event schema.org details. URL is auto-generated.
    *   **Problem Statements:** Add, edit (rich text description), delete problem statements.
    *   **Hackathon Stages:**
        *   Add/edit stages (name, order, rich text description).
        *   For each stage, add/edit judging criteria (name, rich text description, max score).
        *   If hackathon is "Approved", assign/remove platform judges to specific stages.
    *   **Submission Questions:** Define questions participants answer upon submission.
    *   **Winner Configuration:** Set scope (overall/per-problem statement) and define award levels for categories.
3.  **Managing Participant Q&A:**
    *   Navigate to "Participant Q&A".
    *   View questions asked by participants (questions displayed via Rich Text Viewer).
    *   Provide or edit answers using a Rich Text Editor. Answers are public.
4.  **Managing Submissions & Progression:**
    *   Navigate to "Manage Submissions".
    *   View all submissions for the selected hackathon. Filter by stage/status.
    *   **Actions (if hackathon is "Approved"):**
        *   **Assign Initial Stage:** If a submission is "Submitted - Pending Stage Assignment", assign it to the first stage. (Mock) Email notification.
        *   **Assign/Change Award:** For finalists or already awarded submissions, assign or modify the award. (Mock) Email notification.
        *   **Recind Award:** Remove an assigned award. (Mock) Email notification.
        *   **Confirm Elimination:** If a submission is rejected by judges from a stage, confirm its "Eliminated" status. (Mock) Email notification.
        *   **Revert Stage:** Move a submission back to a previous stage (clears relevant scores). (Mock) Email notification.
    *   View submission details, including scores and judge feedback if available.

## IV. Participant Workflows (`/participant`)

1.  **Exploring Hackathons:**
    1.  Navigate to the "Hackathons List" (Participant Hub index).
    2.  Browse available *approved* hackathons.
    3.  Click on a hackathon to view its public detail page.
    4.  From the detail page, navigate to its Q&A page.
2.  **Submitting a Project:**
    1.  Navigate to "Submit New Project".
    2.  If not pre-selected via navigation state, choose an *approved and open* hackathon from the dropdown.
    3.  Fill in project name, select a problem statement for the chosen hackathon.
    4.  Optionally provide repo/demo URLs.
    5.  Answer defined submission questions (using Rich Text Editor for 'textarea' types).
    6.  Optionally, mark as a team project and enter a team name (becomes team leader).
    7.  Submit. The submission is created with an initial status (e.g., "Pending Review" for the first stage).
3.  **Managing Submissions ("My Submissions"):**
    1.  View a list of their submissions.
    2.  Click "View Details" to see full submission info, including scores and feedback from judges (if any).
    3.  **Editing:**
        *   Click "Edit Submission".
        *   If not locked, or lock expired, or locked by current user:
            *   User acquires an edit lock (5 mins).
            *   Edit form fields (answers can be rich text).
            *   Save changes (lock is released).
        *   If locked by another user, editing is disabled until lock expires or is released.
    4.  **Deleting (Team Leaders Only):**
        *   Team leader can delete their team's submission (also deletes the team and memberships).
4.  **Team Management ("My Teams & Invites"):**
    *   **Viewing Teams:** See teams they are part of (leader or member). View member list and project details.
    *   **Inviting Members (Leaders Only):** Enter invitee's email and send invitation. (Mock) Email sent.
    *   **Removing Members (Leaders Only):** Remove an *accepted* member from the team (cannot remove self).
    *   **Leaving a Team (Members Only):** Non-leader members can leave a team.
    *   **Managing Invitations:** View pending invitations from other teams. Accept or decline. (Mock) Email notification to leader.
5.  **Interacting with Q&A:**
    1.  Navigate to a specific hackathon's public Q&A page.
    2.  If the participant has a submission for *that specific hackathon*, they can ask a new question using a Rich Text Editor.
    3.  View all public questions and admin answers (displayed via Rich Text Viewer).

## V. Judge Workflows (`/judge`)

1.  **Judge Dashboard & Hackathon Selection:**
    1.  Judges are directed to their dashboard.
    2.  Select an *approved* hackathon they are assigned to from a dropdown.
    3.  The dashboard displays submissions for the hackathon's *current active stage* that are assigned to this judge and are "Pending Review" or "Judging".
    4.  Criteria for the active stage are displayed.
2.  **Judging a Submission:**
    1.  Click "Judge Submission" for a specific project.
    2.  The Judging Interface opens (`/judge/submission/:submissionId`).
    3.  View submission details (answers displayed via Rich Text Viewer).
    4.  Optionally, request an AI-generated (mocked) summary of the submission.
    5.  For each criterion of the current stage:
        *   Enter a numerical score.
        *   Provide specific feedback/comments using a Rich Text Editor.
    6.  Provide an overall general comment for the submission using a Rich Text Editor.
    7.  Make a decision:
        *   "Approve for Next Stage" (or "Recommend as Finalist" if last stage).
        *   "Reject from this Stage".
    8.  Submit. Scores and decision are recorded. (Mock) Email sent to participant. Judge is redirected back to their dashboard.

## VI. System Workflows (Automated/Implicit)

*   **Edit Lock Management (Submissions):**
    *   When a participant starts editing a submission, a lock is acquired with their email and an expiry time (5 mins).
    *   Other users attempting to edit a locked submission are blocked until the lock expires or the holder saves/navigates away.
    *   Locks are automatically released when the holder saves their changes.
    *   Locks can be "taken over" if expired.
*   **Data Persistence:**
    *   All changes to application state (new hackathons, submissions, user details, theme changes) are persisted to `localStorage`.
    *   Initial data (default hackathons, users) is seeded if `localStorage` is empty or for specific keys.
*   **OG Tag & Schema.org Markup Generation:**
    *   When viewing a public hackathon detail page, OG meta tags and Schema.org JSON-LD script are dynamically injected into the `<head>` of `index.html` based on the hackathon's configuration. These are removed when navigating away. Descriptions are converted to plain text for these tags if originally rich text.
*   **Image Fallbacks:**
    *   For hackathon card images and public detail page hero images, if a custom URL fails to load, the system attempts a Picsum placeholder, and then a Placehold.co placeholder.
*   **Notifications (Mock Email Service):**
    *   Various actions (hackathon approval/decline, submission status changes, team invites/responses, award assignments) trigger calls to a mock `sendEmail` service, which logs the attempt and shows an `alert()` in the demo.
*   **Rich Text Sanitization (Basic):**
    *   The `RichTextViewer` component performs basic sanitization by removing `<script>` tags from HTML content before rendering. More robust sanitization would be needed for production environments with less controlled HTML input.

This details the primary workflows. Specific edge cases or minor interactions may exist but are covered by the general logic of the components and context.
