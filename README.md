
# Hackathon Management Platform

Welcome to the Hackathon Management Platform! This project is a comprehensive solution designed to streamline the organization, execution, and judging of hackathon events, whether virtual, physical, or ideathons. It integrates modern UI/UX principles with robust backend logic (simulated via `localStorage` for this version) and envisions a future where AI actively assists in designing and managing high-quality hackathon experiences.

## Motivation - A Word from Siva (Sivasubramanian Ramanathan)

Having been involved in numerous hackathons, both virtual and physical—many of which were closer to ideathons focused on sourcing innovative ideas—I often found myself envisioning a platform tailored to the nuanced needs of organizers, participants, and judges. I wanted to build a system that I, as an organizer or participant, would have loved to use.

The core idea was to create a platform that not only handles the logistical aspects of a hackathon but also elevates the experience. With the rapid advancements in Artificial Intelligence, I saw a unique opportunity: **How can AI be integrated to help design better hackathons?** This platform is my answer, aiming to leverage AI to assist in crafting engaging themes, fair judging criteria, well-structured problem statements, and effective communication strategies, ultimately leading to more impactful and successful events.

This platform is built with the organizer's challenges and the participant's journey in mind, striving for efficiency, transparency, and engagement.

## Overview

The Hackathon Management Platform provides a multi-faceted environment catering to different user roles:

*   **Super Administrators:** Oversee the entire platform, manage other administrators and judges, approve hackathon events, and have access to global settings.
*   **Administrators:** Create and manage specific hackathon events, define problem statements, configure stages and judging criteria, manage participant submissions, and oversee the event's public presence.
*   **Judges:** Review and score submissions based on predefined criteria for the stages they are assigned to, providing valuable feedback to participants.
*   **Participants:** Discover and register for hackathons, form teams, submit their projects, and track their progress through various judging stages.

The platform supports multi-stage hackathons, dynamic problem statements, configurable submission questions, and a detailed judging process. It also emphasizes a rich user experience with features like dark/light mode, responsive design, and extensive use of rich text editing for various content fields.

## Key Feature Highlights

*   **Role-Based Access Control:** Tailored dashboards and functionalities for each user type.
*   **Comprehensive Hackathon Configuration:** From general settings, rules, and timeline to intricate stage design and judging matrices.
*   **Rich Content Experience:** Widespread use of a Rich Text Editor for creating descriptions, rules, problem statements, stage details, Q&A, submission answers, and judge feedback, with a Rich Text Viewer for displaying this formatted content.
*   **Dynamic Public Pages:** Auto-generated public-facing pages for each hackathon, with customizable content, SEO (Open Graph & Schema.org), and Q&A sections.
*   **Team Management:** Participants can form teams, invite members, and collaborate on submissions.
*   **Multi-Stage Judging:** Support for hackathons with multiple rounds, each with unique criteria and assigned judges.
*   **Submission Workflow:** Clear process for participants to submit projects and for admins/judges to manage and evaluate them, including an edit lock system.
*   **AI-Assisted Features (Conceptual/Mocked):**
    *   Suggestions for best practices in hackathon design and management.
    *   Assistance in generating content like problem statements or judging criteria (currently mocked, planned for full AI integration).
    *   AI summary for judging submissions.

For a complete and detailed breakdown of all platform features, please see the [**FEATURES.md**](FEATURES.md) file.
To understand the operational flows, refer to the [**WORKFLOW.md**](WORKFLOW.md) file.

## Technology Stack (Frontend Focus)

*   **React:** For building the user interface.
*   **TypeScript:** For type safety and improved developer experience.
*   **Tailwind CSS:** For rapid UI development and styling.
*   **React Router:** For client-side routing.
*   **React Quill:** For rich text editing capabilities.
*   **`localStorage`:** For client-side data persistence (simulating a backend for this version).
*   **Gemini API (Conceptual/Mocked):** For AI-powered assistance features.

## Getting Started

*(This section would typically include setup and running instructions if it were a real distributable project)*

1.  Clone the repository.
2.  Install dependencies: `npm install` or `yarn install`.
3.  Set up your environment variables (e.g., `API_KEY` for Gemini, though it's mocked here and requires no key for mock functionality).
4.  Run the development server: `npm start` or `yarn start`.

## Deployed URL

You can access the live demo of the platform here:
[https://hackathon-management-platform-165522215192.us-west1.run.app/#/](https://hackathon-management-platform-165522215192.us-west1.run.app/#/)

Thank you for exploring the Hackathon Management Platform!
