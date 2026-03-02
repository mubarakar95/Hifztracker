# Hifz Tracker

A dedicated Quran memorization and revision tracking application focused on memory "freshness" and spaced repetition.

## Features
- **Freshness Tracking**: Visual indicators (Green/Yellow/Red) based on a customizable revision cycle.
- **Detailed Log**: Track revisions down to the 1/4 Juz (5 pages) level.
- **Revision Calendar**: A month-view grid of your activity.
- **Progress Overview**: A bird's-eye view of all 30 Juz.

## Deployment to Vercel

This project is ready to be deployed to Vercel.

### Option 1: Using the Firebase Studio UI
1. Click the **Deploy** button in the top-right corner of the Firebase Studio interface.
2. Follow the prompts to connect your Vercel account and project.

### Option 2: Manual Deployment via Vercel CLI
If you have the project files locally:
1. Install the Vercel CLI: `npm i -g vercel`
2. Run the deployment command: `vercel --prod`

### Configuration
The Firebase configuration is already included in `src/firebase/config.ts`. Ensure your Firestore security rules (provided in `firestore.rules`) are deployed to your Firebase project to allow the application to read and write data.
