# Hifz Tracker

A dedicated Quran memorization and revision tracking application focused on memory "freshness" and spaced repetition.

## Features
- **Freshness Tracking**: Visual indicators (Green/Yellow/Red) based on a customizable revision cycle (e.g., 5, 10, or 30 days).
- **Linear Journey Bar**: A smooth, capsule-shaped progress bar showing the freshness of your memorization across the entire Quran.
- **No-Friction Logging**: Quickly log revisions by selecting Juz parts (1/4 Juz / 5 pages) in batches.
- **Persistent Settings**: Your preferred revision cycle and view timeframe are saved locally to your device.
- **Detailed History**: A complete log of all your revision sessions with the ability to delete entries.

## Pushing to GitHub

To push this project to your repository at `https://github.com/mubarakar95/Hifztracker`, please follow these steps from your local terminal:

1. **Download the Project**: Click the "Download" icon in the top toolbar of the Firebase Studio interface.
2. **Extract the Files**: Unzip the project folder on your local computer.
3. **Open Terminal**: Open your terminal (or Command Prompt/Git Bash) and navigate to the extracted folder.
4. **Initialize Git & Push**:
   ```bash
   # Initialize the local repository
   git init

   # Add all files
   git add .

   # Commit the changes
   git commit -m "feat: implement freshness tracking and persistent settings"

   # Add your GitHub repository as the remote (if not already added)
   git remote add origin https://github.com/mubarakar95/Hifztracker

   # Ensure you are on the 'main' branch
   git branch -M main

   # Push to GitHub
   git push -u origin main
   ```

## Deployment to Vercel

This project is ready to be deployed to Vercel.

1. Click the **Deploy** button in the top-right corner of the interface.
2. Follow the prompts to connect your Vercel account.

## Configuration
The Firebase configuration is included in `src/firebase/config.ts`. Security rules are automatically managed and deployed to protect your revision data.
